import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'prism.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT DEFAULT 'member',
    timezone TEXT DEFAULT 'UTC',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    owner_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member',
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'backlog',
    priority TEXT DEFAULT 'medium',
    assignee_id INTEGER,
    due_date DATE,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
`);

// Seed demo data
const seedDemoData = () => {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Database already seeded');
    return;
  }

  const passwordHash = bcrypt.hashSync('demo123', 10);

  // Create demo users
  const users = [
    { email: 'alex@prism.io', name: 'Alex Chen', role: 'admin', timezone: 'America/Los_Angeles' },
    { email: 'sarah@prism.io', name: 'Sarah Miller', role: 'member', timezone: 'America/New_York' },
    { email: 'james@prism.io', name: 'James Wilson', role: 'member', timezone: 'Europe/London' },
    { email: 'maya@prism.io', name: 'Maya Patel', role: 'member', timezone: 'Asia/Tokyo' },
    { email: 'demo@prism.io', name: 'Demo User', role: 'admin', timezone: 'UTC' },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, role, timezone) 
    VALUES (?, ?, ?, ?, ?)
  `);

  const userIds = [];
  for (const user of users) {
    const result = insertUser.run(user.email, passwordHash, user.name, user.role, user.timezone);
    userIds.push(result.lastInsertRowid);
  }

  // Create demo projects
  const projects = [
    { name: 'Website Redesign', description: 'Complete overhaul of the marketing website with new branding', color: '#6366f1' },
    { name: 'Mobile App v2.0', description: 'Major feature release with new onboarding flow', color: '#22c55e' },
    { name: 'API Integration', description: 'Third-party integrations and webhook support', color: '#f59e0b' },
    { name: 'Data Pipeline', description: 'Real-time analytics and reporting infrastructure', color: '#ef4444' },
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (name, description, color, owner_id) VALUES (?, ?, ?, ?)
  `);

  const projectIds = [];
  for (let i = 0; i < projects.length; i++) {
    const result = insertProject.run(
      projects[i].name,
      projects[i].description,
      projects[i].color,
      userIds[0]
    );
    projectIds.push(result.lastInsertRowid);

    // Add members to project
    db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(
      result.lastInsertRowid,
      userIds[0],
      'owner'
    );
    db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(
      result.lastInsertRowid,
      userIds[1],
      'member'
    );
    if (i < 2) {
      db.prepare('INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)').run(
        result.lastInsertRowid,
        userIds[2],
        'member'
      );
    }
  }

  // Create demo tasks
  const tasks = [
    { project: 0, title: 'Design homepage hero section', status: 'completed', priority: 'high', assignee: 0, daysAgo: 14 },
    { project: 0, title: 'Implement responsive navigation', status: 'completed', priority: 'high', assignee: 2, daysAgo: 12 },
    { project: 0, title: 'Create color system documentation', status: 'completed', priority: 'medium', assignee: 1, daysAgo: 10 },
    { project: 0, title: 'Build contact form component', status: 'review', priority: 'medium', assignee: 0, daysAgo: 5 },
    { project: 0, title: 'Implement dark mode toggle', status: 'in-progress', priority: 'high', assignee: 2, daysAgo: 3 },
    { project: 0, title: 'SEO optimization and meta tags', status: 'in-progress', priority: 'medium', assignee: 1, daysAgo: 2 },
    { project: 0, title: 'Performance audit and optimization', status: 'backlog', priority: 'low', assignee: null, daysAgo: 0 },
    { project: 0, title: 'Accessibility review (WCAG 2.1)', status: 'backlog', priority: 'medium', assignee: 3, daysAgo: 0 },

    { project: 1, title: 'Redesign onboarding flow', status: 'in-progress', priority: 'high', assignee: 1, daysAgo: 7 },
    { project: 1, title: 'Implement biometric authentication', status: 'review', priority: 'high', assignee: 3, daysAgo: 4 },
    { project: 1, title: 'Push notification system', status: 'backlog', priority: 'medium', assignee: 2, daysAgo: 0 },
    { project: 1, title: 'Offline mode support', status: 'backlog', priority: 'low', assignee: null, daysAgo: 0 },
    { project: 1, title: 'App store screenshots and assets', status: 'backlog', priority: 'medium', assignee: 0, daysAgo: 0 },

    { project: 2, title: 'Stripe payment integration', status: 'completed', priority: 'high', assignee: 2, daysAgo: 21 },
    { project: 2, title: 'Slack webhook notifications', status: 'completed', priority: 'medium', assignee: 3, daysAgo: 18 },
    { project: 2, title: 'Zapier connector', status: 'in-progress', priority: 'medium', assignee: 0, daysAgo: 5 },
    { project: 2, title: 'GraphQL API endpoint', status: 'review', priority: 'high', assignee: 1, daysAgo: 3 },

    { project: 3, title: 'Design data schema', status: 'completed', priority: 'high', assignee: 3, daysAgo: 30 },
    { project: 3, title: 'Set up Kafka cluster', status: 'completed', priority: 'high', assignee: 0, daysAgo: 25 },
    { project: 3, title: 'Build real-time dashboard', status: 'in-progress', priority: 'high', assignee: 2, daysAgo: 7 },
    { project: 3, title: 'Implement alerting system', status: 'backlog', priority: 'medium', assignee: 1, daysAgo: 0 },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (project_id, title, status, priority, assignee_id, due_date, position, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
  `);

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14) - 3);
    insertTask.run(
      projectIds[task.project],
      task.title,
      task.status,
      task.priority,
      task.assignee !== null ? userIds[task.assignee] : null,
      dueDate.toISOString().split('T')[0],
      i,
      task.daysAgo
    );
  }

  // Create activity log
  const activities = [
    { user: 0, project: 0, action: 'created', entity: 'project', id: projectIds[0] },
    { user: 0, project: 0, action: 'created', entity: 'task', id: 1 },
    { user: 2, project: 0, action: 'completed', entity: 'task', id: 2 },
    { user: 1, project: 0, action: 'commented', entity: 'task', id: 4 },
    { user: 3, project: 3, action: 'created', entity: 'project', id: projectIds[3] },
    { user: 0, project: 2, action: 'created', entity: 'project', id: projectIds[2] },
    { user: 1, project: 1, action: 'started', entity: 'task', id: 9 },
    { user: 2, project: 0, action: 'moved', entity: 'task', id: 5 },
  ];

  const insertActivity = db.prepare(`
    INSERT INTO activity_log (user_id, project_id, action, entity_type, entity_id, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    insertActivity.run(
      userIds[act.user],
      projectIds[act.project],
      act.action,
      act.entity,
      act.id,
      Math.floor(Math.random() * 72) + 1
    );
  }

  console.log('✅ Demo data seeded successfully');
};

seedDemoData();

export default db;
