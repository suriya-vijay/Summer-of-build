import express from 'express';
import { getDb, saveDatabase } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

function dbAll(db, query, params = []) {
  const result = db.exec(query, params);
  if (!result[0]) return [];
  const { columns, values } = result[0];
  return values.map(row => Object.fromEntries(columns.map((col, i) => [col, row[i]])));
}

function dbGet(db, query, params = []) {
  return dbAll(db, query, params)[0] || null;
}

function dbRun(db, query, params = []) {
  db.run(query, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: result[0]?.values[0][0] };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { tag, project_id } = req.query;
    let query = `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id`;
    const params = [];
    const conditions = [];
    if (tag) { conditions.push("j.tags LIKE ?"); params.push(`%${tag}%`); }
    if (project_id) { conditions.push("j.project_id = ?"); params.push(project_id); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY j.date DESC, j.created_at DESC';
    const entries = dbAll(db, query, params);
    res.json(entries.map(e => ({ ...e, tags: e.tags ? e.tags.split(',').map(t => t.trim()) : [] })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const entry = dbGet(db, `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id WHERE j.id = ?`, [req.params.id]);
    if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
    res.json({ ...entry, tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { title, body, date, project_id, tags } = req.body;
    if (!title || !body || !date) return res.status(400).json({ error: 'Title, body, and date are required' });
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags;
    const result = dbRun(db, 'INSERT INTO journal_entries (title, body, date, project_id, tags) VALUES (?, ?, ?, ?, ?)',
      [title, body, date, project_id || null, tagsString || null]);
    saveDatabase();
    const entry = dbGet(db, `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id WHERE j.id = ?`, [result.lastInsertRowid]);
    res.status(201).json({ ...entry, tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { title, body, date, project_id, tags } = req.body;
    const existing = dbGet(db, 'SELECT * FROM journal_entries WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Journal entry not found' });
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags;
    db.run('UPDATE journal_entries SET title=?, body=?, date=?, project_id=?, tags=? WHERE id=?',
      [title||existing.title, body||existing.body, date||existing.date, project_id!==undefined?project_id:existing.project_id, tagsString!==undefined?tagsString:existing.tags, req.params.id]);
    saveDatabase();
    const entry = dbGet(db, `SELECT j.*, p.title as project_title FROM journal_entries j LEFT JOIN projects p ON j.project_id = p.id WHERE j.id = ?`, [req.params.id]);
    res.json({ ...entry, tags: entry.tags ? entry.tags.split(',').map(t => t.trim()) : [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const existing = dbGet(db, 'SELECT * FROM journal_entries WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Journal entry not found' });
    db.run('DELETE FROM journal_entries WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;