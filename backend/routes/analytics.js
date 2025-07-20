const express = require('express');
const jwt = require('jsonwebtoken');
const { dbAll, dbGet } = require('../database');

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

// Monthly analytics
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    // Example: Return last 6 months summary
    const data = await dbAll(`
      SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
      FROM expenses
      WHERE user_id = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `, [req.userId]);
    res.json({ monthly: data });
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    res.status(500).json({ error: 'Failed to get monthly analytics' });
  }
});

// Category analytics
router.get('/category', authenticateToken, async (req, res) => {
  try {
    const data = await dbAll(`
      SELECT c.name as category, SUM(e.amount) as total
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ? AND e.type = 'expense'
      GROUP BY c.id, c.name
      ORDER BY total DESC
    `, [req.userId]);
    res.json({ category: data });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({ error: 'Failed to get category analytics' });
  }
});

module.exports = router; 