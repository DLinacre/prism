import { Router } from 'express';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all projects for user
router.get('/', authMiddleware, (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_count,
        u.name as owner_name
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      JOIN users u ON p.owner_id = u.id
      WHERE pm.user_id = ?
      ORDER BY p.updated_at DESC
    `).all(req.userId);

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get projects' }
    });
  }
});

// Get single project
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const project = db.prepare(`
      SELECT p.*, u.name as owner_name
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      JOIN project_members pm ON p.id = pm.project_id
      WHERE p.id = ? AND pm.user_id = ?
    `).get(req.params.id, req.userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    // Get members
    const members = db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar, pm.role
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = ?
    `).all(req.params.id);

    res.json({ success: true, data: { ...project, members } });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get project' }
    });
  }
});

// Create project
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project name is required' }
      });
    }

    const result = db.prepare(`
      INSERT INTO projects (name, description, color, owner_id) VALUES (?, ?, ?, ?)
    `).run(name, description || '', color || '#6366f1', req.userId);

    const projectId = result.lastInsertRowid;

    // Add creator as owner member
    db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(
      projectId, req.userId, 'owner'
    );

    // Log activity
    db.prepare(`
      INSERT INTO activity_log (user_id, project_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)
    `).run(req.userId, projectId, 'created', 'project', projectId);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create project' }
    });
  }
});

// Update project
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Check ownership or membership
    const membership = db.prepare(`
      SELECT * FROM project_members WHERE project_id = ? AND user_id = ? AND role = 'owner'
    `).get(req.params.id, req.userId);

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owner can update' }
      });
    }

    db.prepare(`
      UPDATE projects SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        color = COALESCE(?, color),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, color, req.params.id);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update project' }
    });
  }
});

// Delete project
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ? AND owner_id = ?').get(
      req.params.id, req.userId
    );

    if (!project) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owner can delete' }
      });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true, data: { message: 'Project deleted' } });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete project' }
    });
  }
});

// Get project tasks
router.get('/:id/tasks', authMiddleware, (req, res) => {
  try {
    // Verify membership
    const membership = db.prepare(`
      SELECT * FROM project_members WHERE project_id = ? AND user_id = ?
    `).get(req.params.id, req.userId);

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this project' }
      });
    }

    const tasks = db.prepare(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = ?
      ORDER BY t.position ASC
    `).all(req.params.id);

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get tasks' }
    });
  }
});

// Create task
router.post('/:id/tasks', authMiddleware, (req, res) => {
  try {
    const { title, description, status, priority, assignee_id, due_date } = req.body;

    // Verify membership
    const membership = db.prepare(`
      SELECT * FROM project_members WHERE project_id = ? AND user_id = ?
    `).get(req.params.id, req.userId);

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this project' }
      });
    }

    // Get max position for the status
    const maxPos = db.prepare(`
      SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM tasks WHERE project_id = ? AND status = ?
    `).get(req.params.id, status || 'backlog');

    const result = db.prepare(`
      INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, due_date, position)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      title,
      description || '',
      status || 'backlog',
      priority || 'medium',
      assignee_id || null,
      due_date || null,
      maxPos.next_pos
    );

    // Log activity
    db.prepare(`
      INSERT INTO activity_log (user_id, project_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)
    `).run(req.userId, req.params.id, 'created', 'task', result.lastInsertRowid);

    // Update project timestamp
    db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

    const task = db.prepare(`
      SELECT t.*, u.name as assignee_name, u.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create task' }
    });
  }
});

// Get task comments
router.get('/tasks/:id/comments', authMiddleware, (req, res) => {
  try {
    const comments = db.prepare(`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.id);

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get comments' }
    });
  }
});

// Add comment
router.post('/tasks/:id/comments', authMiddleware, (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Comment content is required' }
      });
    }

    const result = db.prepare(`
      INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)
    `).run(req.params.id, req.userId, content);

    const comment = db.prepare(`
      SELECT c.*, u.name as user_name, u.avatar as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    // Log activity
    const task = db.prepare('SELECT project_id FROM tasks WHERE id = ?').get(req.params.id);
    if (task) {
      db.prepare(`
        INSERT INTO activity_log (user_id, project_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)
      `).run(req.userId, task.project_id, 'commented', 'task', req.params.id);
    }

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to add comment' }
    });
  }
});

export default router;
