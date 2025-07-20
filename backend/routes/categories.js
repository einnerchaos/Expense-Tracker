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

// Get all categories for user (and global)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await dbAll(
      'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY name',
      [req.userId]
    );
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Add a new category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await dbRun(
      'INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
      [req.userId, name, color || '#4CAF50', icon || '💰']
    );
    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [result.id]);
    res.status(201).json({ category });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// Update a category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name = ?'); params.push(name); }
    if (color) { updates.push('color = ?'); params.push(color); }
    if (icon) { updates.push('icon = ?'); params.push(icon); }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id, req.userId);
    await dbRun(`UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
    const category = await dbGet('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router; 