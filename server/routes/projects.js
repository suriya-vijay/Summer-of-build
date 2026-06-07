import express from 'express';
import { getDb } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { rows: projects } = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    const projectsWithSkills = await Promise.all(projects.map(async project => {
      const { rows: skills } = await db.query(
        `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = $1`,
        [project.id]
      );
      return { ...project, featured: Boolean(project.featured), skills };
    }));
    res.json(projectsWithSkills);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    const project = rows[0];
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { rows: skills } = await db.query(
      `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = $1`,
      [project.id]
    );
    res.json({ ...project, featured: Boolean(project.featured), skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured, skill_ids } = req.body;
    if (!title || !description || !start_date) return res.status(400).json({ error: 'Title, description, and start_date are required' });
    const { rows } = await db.query(
      `INSERT INTO projects (title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, status || 'in-progress', start_date, end_date || null, github_url || null, live_url || null, cover_image_url || null, featured ? 1 : 0]
    );
    const project = rows[0];
    if (skill_ids && Array.isArray(skill_ids)) {
      for (const skillId of skill_ids) {
        await db.query('INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2)', [project.id, skillId]);
      }
    }
    const { rows: skills } = await db.query(
      `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = $1`,
      [project.id]
    );
    res.status(201).json({ ...project, featured: Boolean(project.featured), skills });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { title, description, status, start_date, end_date, github_url, live_url, cover_image_url, featured, skill_ids } = req.body;
    const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    await db.query(
      `UPDATE projects SET title=$1, description=$2, status=$3, start_date=$4, end_date=$5, github_url=$6, live_url=$7, cover_image_url=$8, featured=$9 WHERE id=$10`,
      [title||existing.title, description||existing.description, status||existing.status, start_date||existing.start_date,
       end_date!==undefined?end_date:existing.end_date, github_url!==undefined?github_url:existing.github_url,
       live_url!==undefined?live_url:existing.live_url, cover_image_url!==undefined?cover_image_url:existing.cover_image_url,
       featured!==undefined?(featured?1:0):existing.featured, req.params.id]
    );
    if (skill_ids && Array.isArray(skill_ids)) {
      await db.query('DELETE FROM project_skills WHERE project_id = $1', [req.params.id]);
      for (const skillId of skill_ids) {
        await db.query('INSERT INTO project_skills (project_id, skill_id) VALUES ($1, $2)', [req.params.id, skillId]);
      }
    }
    const { rows: updatedRows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    const { rows: skills } = await db.query(
      `SELECT s.* FROM skills s INNER JOIN project_skills ps ON s.id = ps.skill_id WHERE ps.project_id = $1`,
      [req.params.id]
    );
    res.json({ ...updatedRows[0], featured: Boolean(updatedRows[0].featured), skills });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;