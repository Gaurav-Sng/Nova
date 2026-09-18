const { createClient } = require('@libsql/client');
const path = require('path');
const config = require('./env');

const dbPath = path.resolve(config.dbPath);

// Check if Turso Cloud credentials are provided
const isTurso = Boolean(config.tursoUrl && config.tursoToken);

const client = createClient(
  isTurso
    ? {
        url: config.tursoUrl,
        authToken: config.tursoToken,
      }
    : {
        url: `file:${dbPath}`,
      }
);

if (isTurso) {
  console.log(`Connected to Turso Cloud Database: ${config.tursoUrl}`);
} else {
  console.log(`Connected to local SQLite database at: ${dbPath}`);
}

// Promisified database interface compatible with all controllers
const dbAsync = {
  // Execute a query that returns a single row
  get: async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return res.rows[0] || null;
  },

  // Execute a query that returns multiple rows
  all: async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return res.rows;
  },

  // Execute an INSERT, UPDATE, or DELETE query
  run: async (sql, params = []) => {
    const res = await client.execute({ sql, args: params });
    return {
      lastID: Number(res.lastInsertRowid),
      changes: res.rowsAffected,
    };
  },

  // Execute raw multi-statement SQL
  exec: async (sql) => {
    await client.executeMultiple(sql);
  },

  // Close database connection
  close: async () => {
    client.close();
  },

  // Initialize database schema and enable PRAGMAs
  initDb: async () => {
    // Enable Foreign Key constraints and Write-Ahead Logging (for local files)
    try {
      await dbAsync.run('PRAGMA foreign_keys = ON');
      if (!isTurso) {
        await dbAsync.run('PRAGMA journal_mode = WAL');
      }
    } catch (e) {
      // Ignored for cloud environments where PRAGMAs are handled automatically
    }

    // ── Core Tables ──────────────────────────────────────────────────────────

    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS', 'COMPLETED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'TODO' CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
        deadline TEXT DEFAULT NULL,
        priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    // ── Collaboration Tables ─────────────────────────────────────────────────

    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS project_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'CONTRIBUTOR' CHECK(role IN ('OWNER', 'CONTRIBUTOR')),
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(project_id, user_id)
      )
    `);

    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(task_id, user_id)
      )
    `);

    // ── Dynamic Migrations for Existing Databases ────────────────────────────
    try {
      const projectCols = await dbAsync.all('PRAGMA table_info(projects)');
      const hasProjectStatus = projectCols.some((col) => col.name === 'status');
      if (!hasProjectStatus) {
        await dbAsync.run("ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'IN_PROGRESS'");
        console.log('Migrated projects table: added status column.');
      }

      const taskCols = await dbAsync.all('PRAGMA table_info(tasks)');
      const hasTaskDeadline = taskCols.some((col) => col.name === 'deadline');
      if (!hasTaskDeadline) {
        await dbAsync.run('ALTER TABLE tasks ADD COLUMN deadline TEXT DEFAULT NULL');
        console.log('Migrated tasks table: added deadline column.');
      }

      const hasTaskPriority = taskCols.some((col) => col.name === 'priority');
      if (!hasTaskPriority) {
        await dbAsync.run("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'MEDIUM'");
        console.log('Migrated tasks table: added priority column.');
      }

      // Auto-populate project_members for all existing projects (set creators as OWNER)
      const unpopulatedProjects = await dbAsync.all(`
        SELECT p.id, p.user_id FROM projects p
        WHERE NOT EXISTS (
          SELECT 1 FROM project_members pm WHERE pm.project_id = p.id
        )
      `);
      for (const proj of unpopulatedProjects) {
        await dbAsync.run(
          `INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, 'OWNER')`,
          [proj.id, proj.user_id]
        );
      }
      if (unpopulatedProjects.length > 0) {
        console.log(`Migrated ${unpopulatedProjects.length} existing projects: assigned owners to project_members.`);
      }
    } catch (migErr) {
      console.error('Error checking or applying database migrations:', migErr.message);
    }

    // ── Indexes ──────────────────────────────────────────────────────────────
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(task_id)');
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON task_assignments(user_id)');

    console.log('Database schema verified and loaded.');
  },
};

module.exports = dbAsync;