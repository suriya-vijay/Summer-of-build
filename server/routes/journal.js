import express from 'express';
import { getDb } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { tag, project_id } = req.query;
    let query = `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id`;
    const params = [];
    const conditions = [];
    if (tag) { conditions.push(`j.tags LIKE $${params.length + 1}`); params.push(`%${tag}%`); }
    if (project_id) { conditions.push(`j.project_id = $${params.length + 1}`); params.push(project_id); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY j.date DESC, j.created_at DESC';
    const { rows } = await db.query(query, params);
    res.json(rows.map(e => ({ ...e, tags: e.tags ? e.tags.split(',').map(t => t.trim()) : [] })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query(
      `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id WHERE j.id = $1`,
      [req.params.id]
    );
    const entry = rows[0];
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
    res.json({ ...entry, tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { title, body, date, project_id, tags } = req.body;
    if (!title || !body || !date) return res.status(400).json({ error: 'Title, body, and date are required' });
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags;
    const { rows } = await db.query(
      'INSERT INTO journal_entries (title, body, date, project_id, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, body, date, project_id || null, tagsString || null]
    );
    const entry = rows[0];
    const { rows: withProject } = await db.query(
      `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id WHERE j.id = $1`,
      [entry.id]
    );
    res.status(201).json({ ...withProject[0], tags: withProject[0].tags ? withProject[0].tags.split(',').map(t => t.trim()) : [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { title, body, date, project_id, tags } = req.body;
    const { rows } = await db.query('SELECT * FROM journal_entries WHERE id = $1', [req.params.id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ error: 'Journal entry not found' });
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags;
    await db.query(
      'UPDATE journal_entries SET title=$1, body=$2, date=$3, project_id=$4, tags=$5 WHERE id=$6',
      [title||existing.title, body||existing.body, date||existing.date,
       project_id!==undefined?project_id:existing.project_id,
       tagsString!==undefined?tagsString:existing.tags, req.params.id]
    );
    const { rows: updated } = await db.query(
      `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id WHERE j.id = $1`,
      [req.params.id]
    );
    res.json({ ...updated[0], tags: updated[0].tags ? updated[0].tags.split(',').map(t => t.trim()) : [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query('SELECT * FROM journal_entries WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Journal entry not found' });
    await db.query('DELETE FROM journal_entries WHERE id = $1', [req.params.id]);
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;