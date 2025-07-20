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

// Get all budgets for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const budgets = await dbAll(
      `SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.id DESC`,
      [req.userId]
    );
    res.json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Failed to get budgets' });
  }
});

// Add a new budget
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    if (!category || !amount) return res.status(400).json({ error: 'Category and amount are required' });
    // Get or create category
    let categoryId = null;
    let categoryRow = await dbGet('SELECT id FROM categories WHERE name = ?', [category]);
    if (!categoryRow) {
      const result = await dbRun('INSERT INTO categories (name, user_id) VALUES (?, ?)', [category, req.userId]);
      categoryId = result.id;
    } else {
      categoryId = categoryRow.id;
    }
    const result = await dbRun(
      'INSERT INTO budgets (user_id, category_id, amount, period) VALUES (?, ?, ?, ?)',
      [req.userId, categoryId, amount, period || 'monthly']
    );
    const budget = await dbGet('SELECT * FROM budgets WHERE id = ?', [result.id]);
    res.status(201).json({ budget });
  } catch (error) {
    console.error('Add budget error:', error);
    res.status(500).json({ error: 'Failed to add budget' });
  }
});

// Update a budget
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, period } = req.body;
    const updates = [];
    const params = [];
    if (amount) { updates.push('amount = ?'); params.push(amount); }
    if (period) { updates.push('period = ?'); params.push(period); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id, req.userId);
    await dbRun(`UPDATE budgets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
    const budget = await dbGet('SELECT * FROM budgets WHERE id = ?', [id]);
    res.json({ budget });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete a budget
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router; 