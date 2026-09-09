const db = require('../config/db');

/**
 * Helper: get task assignees
 */
const getTaskAssignees = async (taskId) => {
  return db.all(
    `SELECT u.id, u.name, u.email FROM task_assignments ta
     JOIN users u ON ta.user_id = u.id
     WHERE ta.task_id = ?`,
    [taskId]
  );
};

/**
 * Helper: sync task assignees (replace with provided list)
 */
const syncAssignees = async (taskId, assigneeIds) => {
  if (!Array.isArray(assigneeIds)) return;
  // Remove old, insert new
  await db.run('DELETE FROM task_assignments WHERE task_id = ?', [taskId]);
  for (const uid of assigneeIds) {
    await db.run(
      'INSERT OR IGNORE INTO task_assignments (task_id, user_id) VALUES (?, ?)',
      [taskId, uid]
    );
  }
};

/**
 * Create a new task under a project
 * POST /api/projects/:id/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { title, description, deadline, priority, assignee_ids } = req.body;

    // Verify requester is a member of the project (owner or contributor)
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (!membership) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const result = await db.run(
      'INSERT INTO tasks (project_id, title, description, status, deadline, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [
        projectId,
        title.trim(),
        description ? description.trim() : '',
        'TODO',
        deadline ? deadline.trim() : null,
        priority || 'MEDIUM',
      ]
    );

    const taskId = result.lastID;

    // Handle assignees — validate they are actually project members
    if (Array.isArray(assignee_ids) && assignee_ids.length > 0) {
      const members = await db.all(
        'SELECT user_id FROM project_members WHERE project_id = ?',
        [projectId]
      );
      const memberIds = new Set(members.map((m) => m.user_id));
      const validIds = assignee_ids.filter((id) => memberIds.has(id));
      await syncAssignees(taskId, validIds);
    }

    const newTask = await db.get(
      'SELECT id, project_id, title, description, status, deadline, priority, created_at, updated_at FROM tasks WHERE id = ?',
      [taskId]
    );

    const assignees = await getTaskAssignees(taskId);

    res.status(201).json({ ...newTask, assignees });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing task (status, title, description, deadline, priority, assignees)
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { status, title, description, deadline, priority, assignee_ids } = req.body;

    // Get task and verify user is a project member
    const task = await db.get(
      `SELECT t.id, t.project_id
       FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = ?
       WHERE t.id = ?`,
      [req.user.id, taskId]
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Get requester's role
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [task.project_id, req.user.id]
    );

    // Contributors can only update status; owners can update everything
    const isOwner = membership && membership.role === 'OWNER';

    // Build update
    if (isOwner) {
      await db.run(
        `UPDATE tasks
         SET status = COALESCE(?, status),
             title = COALESCE(?, title),
             description = COALESCE(?, description),
             deadline = CASE WHEN ? = 1 THEN ? ELSE deadline END,
             priority = COALESCE(?, priority),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          status !== undefined ? status : null,
          title !== undefined ? title.trim() : null,
          description !== undefined ? description.trim() : null,
          deadline !== undefined ? 1 : 0,
          deadline !== undefined ? (deadline ? deadline.trim() : null) : null,
          priority !== undefined ? priority : null,
          taskId,
        ]
      );

      // Sync assignees if provided (owner only)
      if (Array.isArray(assignee_ids)) {
        const members = await db.all(
          'SELECT user_id FROM project_members WHERE project_id = ?',
          [task.project_id]
        );
        const memberIds = new Set(members.map((m) => m.user_id));
        const validIds = assignee_ids.filter((id) => memberIds.has(id));
        await syncAssignees(taskId, validIds);
      }
    } else {
      // Contributor: only status update allowed
      if (status !== undefined) {
        // Contributors can only move their assigned tasks
        const isAssigned = await db.get(
          'SELECT 1 FROM task_assignments WHERE task_id = ? AND user_id = ?',
          [taskId, req.user.id]
        );
        if (!isAssigned) {
          return res.status(403).json({ error: 'You can only update tasks assigned to you.' });
        }
        await db.run(
          'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, taskId]
        );
      }
    }

    const updatedTask = await db.get(
      'SELECT id, project_id, title, description, status, deadline, priority, created_at, updated_at FROM tasks WHERE id = ?',
      [taskId]
    );

    const assignees = await getTaskAssignees(taskId);

    res.json({ ...updatedTask, assignees });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await db.get(
      `SELECT t.id, t.project_id, t.title, t.description, t.status, t.deadline, t.priority, t.created_at, t.updated_at
       FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = ?
       WHERE t.id = ?`,
      [req.user.id, taskId]
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const assignees = await getTaskAssignees(taskId);

    res.json({ ...task, assignees });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a task (OWNER only)
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await db.get(
      `SELECT t.id, t.project_id
       FROM tasks t
       JOIN project_members pm ON t.project_id = pm.project_id AND pm.user_id = ? AND pm.role = 'OWNER'
       WHERE t.id = ?`,
      [req.user.id, taskId]
    );
    if (!task) {
      return res.status(403).json({ error: 'Only the project owner can delete tasks.' });
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  updateTask,
  getTaskById,
  deleteTask,
};
