import { Router } from 'express';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get overview analytics
router.get('/overview', authMiddleware, (req, res) => {
  try {
    // Total tasks
    const taskStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as in_review,
        SUM(CASE WHEN status = 'backlog' THEN 1 ELSE 0 END) as backlog
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = ?
    `).get(req.userId);

    // Active projects
    const projectCount = db.prepare(`
      SELECT COUNT(*) as count FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
    `).get(req.userId);

    // Tasks due this week
    const dueThisWeek = db.prepare(`
      SELECT COUNT(*) as count FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = ?
        AND t.due_date IS NOT NULL
        AND t.due_date <= date('now', '+7 days')
        AND t.status != 'completed'
    `).get(req.userId);

    // Overdue tasks
    const overdueTasks = db.prepare(`
      SELECT COUNT(*) as count FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = ?
        AND t.due_date < date('now')
        AND t.status != 'completed'
    `).get(req.userId);

    // Team velocity (completed tasks in last 7 days)
    const velocity = db.prepare(`
      SELECT COUNT(*) as count FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = ?
        AND t.status = 'completed'
        AND t.updated_at >= datetime('now', '-7 days')
    `).get(req.userId);

    // Sparkline data (tasks completed per day for last 7 days)
    const sparklineData = db.prepare(`
      SELECT 
        date(t.updated_at) as date,
        COUNT(*) as count
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = ?
        AND t.status = 'completed'
        AND t.updated_at >= datetime('now', '-7 days')
      GROUP BY date(t.updated_at)
      ORDER BY date ASC
    `).all(req.userId);

    res.json({
      success: true,
      data: {
        tasks: taskStats,
        projects: projectCount.count,
        dueThisWeek: dueThisWeek.count,
        overdueTasks: overdueTasks.count,
        velocity: velocity.count,
        sparkline: sparklineData
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get analytics' }
    });
  }
});

// Get velocity data (last 6 weeks)
router.get('/velocity', authMiddleware, (req, res) => {
  try {
    const velocity = db.prepare(`
      SELECT 
        strftime('%Y-%W', t.updated_at) as week,
        COUNT(*) as completed
      FROM tasks t
      JOIN project_members pm ON t.project_id = pm.project_id
      WHERE pm.user_id = ?
        AND t.status = 'completed'
        AND t.updated_at >= datetime('now', '-6 weeks')
      GROUP BY week
      ORDER BY week ASC
    `).all(req.userId);

    res.json({ success: true, data: velocity });
  } catch (error) {
    console.error('Get velocity error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get velocity data' }
    });
  }
});

// Get burndown data for a project
router.get('/burndown/:projectId', authMiddleware, (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify membership
    const membership = db.prepare(`
      SELECT * FROM project_members WHERE project_id = ? AND user_id = ?
    `).get(projectId, req.userId);

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this project' }
      });
    }

    // Get total tasks
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE project_id = ?').get(projectId);

    // Get completed tasks per day (last 14 days)
    const burndown = db.prepare(`
      SELECT 
        date(t.updated_at) as date,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed,
        (SELECT COUNT(*) FROM tasks WHERE project_id = ? AND date(created_at) <= date(t.updated_at)) as remaining
      FROM tasks t
      WHERE t.project_id = ?
        AND t.updated_at >= datetime('now', '-14 days')
      GROUP BY date(t.updated_at)
      ORDER BY date ASC
    `).all(projectId, projectId);

    res.json({
      success: true,
      data: {
        total: totalTasks.count,
        burndown
      }
    });
  } catch (error) {
    console.error('Get burndown error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get burndown data' }
    });
  }
});

// Get team performance
router.get('/team', authMiddleware, (req, res) => {
  try {
    const performance = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.avatar,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      LEFT JOIN tasks t ON u.id = t.assignee_id
      WHERE pm.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = ?
      )
      GROUP BY u.id
      ORDER BY completed DESC
    `).all(req.userId);

    res.json({ success: true, data: performance });
  } catch (error) {
    console.error('Get team performance error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get team performance' }
    });
  }
});

export default router;
