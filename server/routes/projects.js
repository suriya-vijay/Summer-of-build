import express from 'express';
import { getDb, saveDatabase } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

function dbAll(db, query, params = []) {
  const result = db.exec(query.replace(/\?/g, () => '?'), params);
  if (!result[0]) return [];
  const { columns, values } = result[0];
  return values.map(row => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
}

function dbGet(db, query, params = []) {
  const rows = dbAll(db, query, params);
  return rows[0] || null;
}

function dbRun(db, query, params = []) {
  db.run(query, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: result[0]?.values[0][0] };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const projects = dbAll(db, 'SELECT * FROM projects ORDER BY created_at DESC');
    const projectsWithSkills = projects.map(project => {
      const skills = dbAll(db, `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = ?`, [project.id]);
      return { ...project, featured: Boolean(project.featured), skills };
    });
    res.json(projectsWithSkills);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const project = dbGet(db, 'SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const skills = dbAll(db, `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = ?`, [project.id]);
    res.json({ ...project, featured: Boolean(project.featured), skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured, skill_ids } = req.body;
    if (!title || !description || !start_date) return res.status(400).json({ error: 'Title, description, and start_date are required' });
    const result = dbRun(db, `INSERT INTO projects (title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, status || 'in-progress', start_date, end_date || null, github_url || null, live_url || null, cover_image_url || null, featured ? 1 : 0]);
    if (skill_ids && Array.isArray(skill_ids)) {
      for (const skillId of skill_ids) dbRun(db, 'INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)', [result.lastInsertRowid, skillId]);
    }
    saveDatabase();
    const project = dbGet(db, 'SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);
    const skills = dbAll(db, `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = ?`, [result.lastInsertRowid]);
    res.status(201).json({ ...project, featured: Boolean(project.featured), skills });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured, skill_ids } = req.body;
    const existing = dbGet(db, 'SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    db.run(`UPDATE projects SET title=?, description=?, status=?, start_date=?, end_date=?, github_url=?, live_url=?, cover_image_url=?, featured=? WHERE id=?`,
      [title||existing.title, description||existing.description, status||existing.status, start_date||existing.start_date,
       end_date!==undefined?end_date:existing.end_date, github_url!==undefined?github_url:existing.github_url,
       live_url!==undefined?live_url:existing.live_url, cover_image_url!==undefined?cover_image_url:existing.cover_image_url,
       featured!==undefined?(featured?1:0):existing.featured, req.params.id]);
    if (skill_ids && Array.isArray(skill_ids)) {
      db.run('DELETE FROM project_skills WHERE project_id = ?', [req.params.id]);
      for (const skillId of skill_ids) db.run('INSERT INTO project_skills (project_id, skill_id) VALUES (?, ?)', [req.params.id, skillId]);
    }
    saveDatabase();
    const project = dbGet(db, 'SELECT * FROM projects WHERE id = ?', [req.params.id]);
    const skills = dbAll(db, `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = ?`, [req.params.id]);
    res.json({ ...project, featured: Boolean(project.featured), skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const existing = dbGet(db, 'SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;