import { Router } from 'express';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get notifications
router.get('/', authMiddleware, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.userId);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0
    `).get(req.userId);

    res.json({
      success: true,
      data: {
        notifications: notifications.map(n => ({
          ...n,
          read: Boolean(n.read),
          data: n.data ? JSON.parse(n.data) : null
        })),
        unreadCount: unreadCount.count
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get notifications' }
    });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare(`
      UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.userId);

    res.json({ success: true, data: { message: 'Notification marked as read' } });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark notification as read' }
    });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, (req, res) => {
  try {
    db.prepare(`
      UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0
    `).run(req.userId);

    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to mark notifications as read' }
    });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(
      req.params.id,
      req.userId
    );

    res.json({ success: true, data: { message: 'Notification deleted' } });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete notification' }
    });
  }
});

// Get activity feed
router.get('/activity', authMiddleware, (req, res) => {
  try {
    const activity = db.prepare(`
      SELECT 
        a.*,
        u.name as user_name,
        u.avatar as user_avatar,
        p.name as project_name,
        p.color as project_color
      FROM activity_log a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN projects p ON a.project_id = p.id
      WHERE a.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = ?
      )
      ORDER BY a.created_at DESC
      LIMIT 50
    `).all(req.userId);

    res.json({ success: true, data: activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get activity feed' }
    });
  }
});

export default router;
