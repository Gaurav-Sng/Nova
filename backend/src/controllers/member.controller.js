const db = require('../config/db');

/**
 * Get all members of a project (owner + contributors)
 * GET /api/projects/:id/members
 */
const getMembers = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Verify the requester is a member of this project
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (!membership) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const members = await db.all(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.role ASC, pm.joined_at ASC`,
      [projectId]
    );

    res.json(members);
  } catch (err) {
    next(err);
  }
};

/**
 * Add a contributor to a project by email (owner only)
 * POST /api/projects/:id/members
 * Body: { email }
 */
const addMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { email } = req.body;

    // Only the OWNER can invite members
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (!membership || membership.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only the project owner can invite members.' });
    }

    // Look up the user to invite
    const invitee = await db.get(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (!invitee) {
      return res.status(404).json({ error: 'No user found with that email address. They must register first.' });
    }

    // Prevent inviting self
    if (invitee.id === req.user.id) {
      return res.status(400).json({ error: 'You are already the project owner.' });
    }

    // Add as contributor (ignore if already a member)
    try {
      await db.run(
        `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'CONTRIBUTOR')`,
        [projectId, invitee.id]
      );
    } catch (uniqueErr) {
      if (uniqueErr.message && uniqueErr.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'This user is already a member of the project.' });
      }
      throw uniqueErr;
    }

    res.status(201).json({
      message: `${invitee.name} has been added as a contributor.`,
      member: {
        id: invitee.id,
        name: invitee.name,
        email: invitee.email,
        role: 'CONTRIBUTOR',
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a contributor from a project (owner only, cannot remove self)
 * DELETE /api/projects/:id/members/:userId
 */
const removeMember = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const targetUserId = parseInt(req.params.userId, 10);

    // Only the OWNER can remove members
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (!membership || membership.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only the project owner can remove members.' });
    }

    // Cannot remove self (the owner)
    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Project owner cannot remove themselves.' });
    }

    // Verify the target is actually a member
    const targetMembership = await db.get(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUserId]
    );
    if (!targetMembership) {
      return res.status(404).json({ error: 'User is not a member of this project.' });
    }

    await db.run(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, targetUserId]
    );

    // Also remove their task assignments within this project
    await db.run(
      `DELETE FROM task_assignments WHERE user_id = ? AND task_id IN (
         SELECT id FROM tasks WHERE project_id = ?
       )`,
      [targetUserId, projectId]
    );

    res.json({ message: 'Member removed from the project.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMembers,
  addMember,
  removeMember,
};
