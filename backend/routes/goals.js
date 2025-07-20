const express = require('express');
const jwt = require('jsonwebtoken');
const { dbAll, dbGet, dbRun } = require('../database');

const router = express.Router();

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await dbGet('SELECT id FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all goals for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const goals = await dbAll(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY deadline ASC',
      [req.userId]
    );
    res.json({ goals });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
});

// Add a new goal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, target_amount, deadline } = req.body;
    if (!name || !target_amount) return res.status(400).json({ error: 'Name and target amount are required' });
    const result = await dbRun(
      'INSERT INTO goals (user_id, name, target_amount, deadline) VALUES (?, ?, ?, ?)',
      [req.userId, name, target_amount, deadline]
    );
    const goal = await dbGet('SELECT * FROM goals WHERE id = ?', [result.id]);
    res.status(201).json({ goal });
  } catch (error) {
    console.error('Add goal error:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

// Update a goal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target_amount, current_amount, deadline } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name = ?'); params.push(name); }
    if (target_amount) { updates.push('target_amount = ?'); params.push(target_amount); }
    if (current_amount) { updates.push('current_amount = ?'); params.push(current_amount); }
    if (deadline) { updates.push('deadline = ?'); params.push(deadline); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id, req.userId);
    await dbRun(`UPDATE goals SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
    const goal = await dbGet('SELECT * FROM goals WHERE id = ?', [id]);
    res.json({ goal });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete a goal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router; 