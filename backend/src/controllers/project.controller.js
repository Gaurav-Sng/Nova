const db = require('../config/db');

/**
 * Get all projects for authenticated user (owned + member of)
 * GET /api/projects
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await db.all(
      `SELECT p.id, p.user_id, p.name, p.description, p.status, p.created_at, p.updated_at,
              pm.role AS user_role,
              COUNT(DISTINCT t.id) AS task_count,
              SUM(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END) AS completed_task_count,
              COUNT(DISTINCT pm2.user_id) AS member_count
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
       LEFT JOIN tasks t ON p.id = t.project_id
       LEFT JOIN project_members pm2 ON p.id = pm2.project_id
       GROUP BY p.id
       ORDER BY pm.role ASC, p.created_at DESC`,
      [req.user.id]
    );

    res.json(projects);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single project by ID with tasks, members, and task assignees
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Check user is a member of this project
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (!membership) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = await db.get(
      'SELECT id, user_id, name, description, status, created_at, updated_at FROM projects WHERE id = ?',
      [projectId]
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Fetch tasks
    const tasks = await db.all(
      `SELECT id, project_id, title, description, status, deadline, priority, created_at, updated_at
       FROM tasks WHERE project_id = ? ORDER BY id ASC`,
      [projectId]
    );

    // Fetch assignees for each task
    const taskIds = tasks.map((t) => t.id);
    let assigneeMap = {};
    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',');
      const assignees = await db.all(
        `SELECT ta.task_id, u.id, u.name, u.email
         FROM task_assignments ta
         JOIN users u ON ta.user_id = u.id
         WHERE ta.task_id IN (${placeholders})`,
        taskIds
      );
      for (const a of assignees) {
        if (!assigneeMap[a.task_id]) assigneeMap[a.task_id] = [];
        assigneeMap[a.task_id].push({ id: a.id, name: a.name, email: a.email });
      }
    }

    const tasksWithAssignees = tasks.map((t) => ({
      ...t,
      assignees: assigneeMap[t.id] || [],
    }));

    // Fetch members
    const members = await db.all(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.role ASC, pm.joined_at ASC`,
      [projectId]
    );

    res.json({
      ...project,
      user_role: membership.role,
      tasks: tasksWithAssignees,
      members,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new project and auto-assign creator as OWNER
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const result = await db.run(
      "INSERT INTO projects (user_id, name, description, status) VALUES (?, ?, ?, 'IN_PROGRESS')",
      [req.user.id, name.trim(), description ? description.trim() : '']
    );

    const projectId = result.lastID;

    // Auto-assign creator as OWNER in project_members
    await db.run(
      `INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, 'OWNER')`,
      [projectId, req.user.id]
    );

    const newProject = await db.get(
      `SELECT p.id, p.user_id, p.name, p.description, p.status, p.created_at, p.updated_at,
              pm.role AS user_role
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
       WHERE p.id = ?`,
      [req.user.id, projectId]
    );

    res.status(201).json({ ...newProject, tasks: [], members: [] });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing project (OWNER only)
 * PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { name, description, status } = req.body;

    // Verify OWNER role
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (!membership || membership.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only the project owner can update this project.' });
    }

    await db.run(
      `UPDATE projects
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           status = COALESCE(?, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : null,
        description !== undefined ? description.trim() : null,
        status !== undefined ? status : null,
        projectId,
      ]
    );

    const updatedProject = await db.get(
      'SELECT id, user_id, name, description, status, created_at, updated_at FROM projects WHERE id = ?',
      [projectId]
    );

    res.json(updatedProject);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a project and cascading tasks (OWNER only)
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Verify OWNER role
    const membership = await db.get(
      'SELECT role FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );
    if (!membership || membership.role !== 'OWNER') {
      return res.status(403).json({ error: 'Only the project owner can delete this project.' });
    }

    await db.run('DELETE FROM projects WHERE id = ?', [projectId]);

    res.json({ message: 'Project and all associated tasks deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
