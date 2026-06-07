import express from 'express';
import { getDb } from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query('SELECT * FROM skills ORDER BY category, name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Skill not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { name, category, proficiency, icon } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });
    const { rows } = await db.query(
      'INSERT INTO skills (name, category, proficiency, icon) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, category, proficiency || 1, icon || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.message?.includes('unique')) return res.status(400).json({ error: 'A skill with this name already exists' });
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { name, category, proficiency, icon } = req.body;
    const { rows } = await db.query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
    const existing = rows[0];
    if (!existing) return res.status(404).json({ error: 'Skill not found' });
    const { rows: updated } = await db.query(
      'UPDATE skills SET name=$1, category=$2, proficiency=$3, icon=$4 WHERE id=$5 RETURNING *',
      [name||existing.name, category||existing.category, proficiency!==undefined?proficiency:existing.proficiency, icon!==undefined?icon:existing.icon, req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    if (error.message?.includes('unique')) return res.status(400).json({ error: 'A skill with this name already exists' });
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query('SELECT * FROM skills WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Skill not found' });
    await db.query('DELETE FROM skills WHERE id = $1', [req.params.id]);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

export default router;