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
    const skills = dbAll(db, 'SELECT * FROM skills ORDER BY category, name');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const skill = dbGet(db, 'SELECT * FROM skills WHERE id = ?', [req.params.id]);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name, category, proficiency, icon } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });
    const result = dbRun(db, 'INSERT INTO skills (name, category, proficiency, icon) VALUES (?, ?, ?, ?)', [name, category, proficiency || 1, icon || null]);
    saveDatabase();
    const skill = dbGet(db, 'SELECT * FROM skills WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(skill);
  } catch (error) {
    if (error.message?.includes('UNIQUE')) return res.status(400).json({ error: 'A skill with this name already exists' });
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name, category, proficiency, icon } = req.body;
    const existing = dbGet(db, 'SELECT * FROM skills WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Skill not found' });
    db.run('UPDATE skills SET name=?, category=?, proficiency=?, icon=? WHERE id=?',
      [name||existing.name, category||existing.category, proficiency!==undefined?proficiency:existing.proficiency, icon!==undefined?icon:existing.icon, req.params.id]);
    saveDatabase();
    const skill = dbGet(db, 'SELECT * FROM skills WHERE id = ?', [req.params.id]);
    res.json(skill);
  } catch (error) {
    if (error.message?.includes('UNIQUE')) return res.status(400).json({ error: 'A skill with this name already exists' });
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const existing = dbGet(db, 'SELECT * FROM skills WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Skill not found' });
    db.run('DELETE FROM skills WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

export default router;