import { Router } from 'express';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Update task
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, description, status, priority, assignee_id, due_date } = req.body;

    // Get task and verify membership
    const task = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE t.id = ? AND pm.user_id = ?
    `).get(req.params.id, req.userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    db.prepare(`
      UPDATE tasks SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        assignee_id = ?,
        due_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      description,
      status,
      priority,
      assignee_id !== undefined ? assignee_id : task.assignee_id,
      due_date !== undefined ? due_date : task.due_date,
      req.params.id
    );

    // Log activity
    if (status && status !== task.status) {
      db.prepare(`
        INSERT INTO activity_log (user_id, project_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)
      `).run(req.userId, task.project_id, 'moved', 'task', req.params.id);
    }

    // Update project timestamp
    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(task.project_id);

    const updatedTask = db.prepare(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update task' }
    });
  }
});

// Move task (change status and position)
router.patch('/:id/move', authMiddleware, (req, res) => {
  try {
    const { status, position } = req.body;

    // Get task and verify membership
    const task = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE t.id = ? AND pm.user_id = ?
    `).get(req.params.id, req.userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    const newStatus = status || task.status;
    const newPosition = position !== undefined ? position : task.position;

    // Reorder tasks in the target status column
    if (newStatus !== task.status) {
      // Increase positions of tasks after the insertion point
      db.prepare(`
        UPDATE tasks SET position = position + 1
        WHERE project_id = ? AND status = ? AND position >= ?
      `).run(task.project_id, newStatus, newPosition);
    } else {
      // Just reorder within the same column
      if (newPosition > task.position) {
        db.prepare(`
          UPDATE tasks SET position = position - 1
          WHERE project_id = ? AND status = ? AND position > ? AND position <= ?
        `).run(task.project_id, newStatus, task.position, newPosition);
      } else if (newPosition < task.position) {
        db.prepare(`
          UPDATE tasks SET position = position + 1
          WHERE project_id = ? AND status = ? AND position >= ? AND position < ?
        `).run(task.project_id, newStatus, newPosition, task.position);
      }
    }

    // Update the task
    db.prepare(`
      UPDATE tasks SET status = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(newStatus, newPosition, req.params.id);

    // Log activity
    if (newStatus !== task.status) {
      db.prepare(`
        INSERT INTO activity_log (user_id, project_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)
      `).run(req.userId, task.project_id, 'moved', 'task', req.params.id);
    }

    // Update project timestamp
    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(task.project_id);

    const updatedTask = db.prepare(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to move task' }
    });
  }
});

// Delete task
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    // Get task and verify membership
    const task = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE t.id = ? AND pm.user_id = ?
    `).get(req.params.id, req.userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    // Delete the task
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);

    // Reorder remaining tasks
    db.prepare(`
      UPDATE tasks SET position = position - 1
      WHERE project_id = ? AND status = ? AND position > ?
    `).run(task.project_id, task.status, task.position);

    // Update project timestamp
    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(task.project_id);

    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete task' }
    });
  }
});

export default router;
