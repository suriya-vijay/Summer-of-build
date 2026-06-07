import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'in-progress',
      start_date TEXT NOT NULL,
      end_date TEXT,
      github_url TEXT,
      live_url TEXT,
      cover_image_url TEXT,
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      proficiency INTEGER DEFAULT 1,
      icon TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_skills (
      project_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      PRIMARY KEY (project_id, skill_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      date TEXT NOT NULL,
      project_id INTEGER,
      tags TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES journal_entries(id) ON DELETE SET NULL
    )
  `);

  console.log('✅ Database schema initialized successfully');
}

export function getDb() {
  return pool;
}

export function saveDatabase() {
  // no-op for PostgreSQL, data is saved automatically
}

export default pool;