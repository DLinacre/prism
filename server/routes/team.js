import { Router } from 'express';
import db from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all team members (for user's projects)
router.get('/', authMiddleware, (req, res) => {
  try {
    const members = db.prepare(`
      SELECT DISTINCT u.id, u.name, u.email, u.avatar, u.role, u.timezone, u.created_at,
        (SELECT MAX(created_at) FROM activity_log WHERE user_id = u.id) as last_activity
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = ?
      )
      ORDER BY u.name ASC
    `).all(req.userId);

    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get team' }
    });
  }
});

// Get single team member
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const member = db.prepare(`
      SELECT u.id, u.name, u.email, u.avatar, u.role, u.timezone, u.created_at
      FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE u.id = ? AND pm.project_id IN (
        SELECT project_id FROM project_members WHERE user_id = ?
      )
    `).get(req.params.id, req.userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Team member not found' }
      });
    }

    // Get their tasks
    const tasks = db.prepare(`
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
      WHERE t.assignee_id = ?
      ORDER BY t.updated_at DESC
      LIMIT 10
    `).all(req.userId, req.params.id);

    res.json({ success: true, data: { ...member, tasks } });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get team member' }
    });
  }
});

// Invite team member to project
router.post('/invite', authMiddleware, (req, res) => {
  try {
    const { email, project_id, role } = req.body;

    if (!email || !project_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and project_id are required' }
      });
    }

    // Verify inviter is owner of the project
    const project = db.prepare(`
      SELECT * FROM projects WHERE id = ? AND owner_id = ?
    `).get(project_id, req.userId);

    if (!project) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owner can invite members' }
      });
    }

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found with this email' }
      });
    }

    // Check if already a member
    const existing = db.prepare(`
      SELECT * FROM project_members WHERE project_id = ? AND user_id = ?
    `).get(project_id, user.id);

    if (existing) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_MEMBER', message: 'User is already a member of this project' }
      });
    }

    // Add to project
    db.prepare(`
      INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)
    `).run(project_id, user.id, role || 'member');

    // Create notification for the invited user
    db.prepare(`
      INSERT INTO notifications (user_id, type, message, data) VALUES (?, ?, ?, ?)
    `).run(
      user.id,
      'invitation',
      `You've been invited to ${project.name}`,
      JSON.stringify({ project_id, project_name: project.name })
    );

    const { password_hash, ...safeUser } = user;
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to invite team member' }
    });
  }
});

// Remove team member from project
router.delete('/:userId/project/:projectId', authMiddleware, (req, res) => {
  try {
    const { userId, projectId } = req.params;

    // Verify requester is owner
    const project = db.prepare(`
      SELECT * FROM projects WHERE id = ? AND owner_id = ?
    `).get(projectId, req.userId);

    if (!project) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project owner can remove members' }
      });
    }

    // Can't remove owner
    const member = db.prepare(`
      SELECT * FROM project_members WHERE project_id = ? AND user_id = ?
    `).get(projectId, userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found in this project' }
      });
    }

    if (member.role === 'owner') {
      return res.status(400).json({
        success: false,
        error: { code: 'CANNOT_REMOVE_OWNER', message: 'Cannot remove the project owner' }
      });
    }

    db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(projectId, userId);

    res.json({ success: true, data: { message: 'Member removed' } });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to remove team member' }
    });
  }
});

export default router;
