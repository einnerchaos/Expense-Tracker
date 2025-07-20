const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { dbGet, dbAll, dbRun } = require('../database');

const router = express.Router();

// Middleware to verify JWT token
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

// Get all expenses for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50 } = req.query;
    
    let sql = `
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
    `;
    const params = [req.userId];

    if (type) {
      sql += ' AND e.type = ?';
      params.push(type);
    }
    if (category) {
      sql += ' AND c.name = ?';
      params.push(category);
    }
    if (startDate) {
      sql += ' AND e.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND e.date <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY e.date DESC, e.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const expenses = await dbAll(sql, params);
    res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to get expenses' });
  }
});

// Get expense by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await dbGet(`
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ? AND e.user_id = ?
    `, [id, req.userId]);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Failed to get expense' });
  }
});

// Create new expense
router.post('/', authenticateToken, [
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').optional().trim().isLength({ max: 255 }),
  body('category').optional().isString(),
  body('type').optional().isIn(['expense', 'income']),
  body('date').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, category, type = 'expense', date } = req.body;

    // Get or create category
    let categoryId = null;
    if (category) {
      let categoryRow = await dbGet('SELECT id FROM categories WHERE name = ?', [category]);
      if (!categoryRow) {
        const result = await dbRun('INSERT INTO categories (name, user_id) VALUES (?, ?)', [category, req.userId]);
        categoryId = result.id;
      } else {
        categoryId = categoryRow.id;
      }
    }

    // Create expense
    const result = await dbRun(`
      INSERT INTO expenses (user_id, amount, description, category_id, type, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.userId, amount, description, categoryId, type, date]);

    // Get created expense
    const expense = await dbGet(`
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [result.id]);

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', authenticateToken, [
  body('amount').optional().isFloat({ min: 0 }),
  body('description').optional().trim().isLength({ max: 255 }),
  body('category').optional().isString(),
  body('type').optional().isIn(['expense', 'income']),
  body('date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, description, category, type, date } = req.body;

    // Check if expense exists and belongs to user
    const existingExpense = await dbGet('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Get or create category
    let categoryId = null;
    if (category) {
      let categoryRow = await dbGet('SELECT id FROM categories WHERE name = ?', [category]);
      if (!categoryRow) {
        const result = await dbRun('INSERT INTO categories (name, user_id) VALUES (?, ?)', [category, req.userId]);
        categoryId = result.id;
      } else {
        categoryId = categoryRow.id;
      }
    }

    // Build update query
    const updates = [];
    const params = [];
    
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(categoryId);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (date !== undefined) {
      updates.push('date = ?');
      params.push(date);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, req.userId);

    // Update expense
    await dbRun(`
      UPDATE expenses 
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `, params);

    // Get updated expense
    const expense = await dbGet(`
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `, [id]);

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if expense exists and belongs to user
    const existingExpense = await dbGet('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete expense
    await dbRun('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, req.userId]);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get categories
router.get('/categories/all', authenticateToken, async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [req.userId];
    
    if (startDate && endDate) {
      dateFilter = 'AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Total expenses
    const totalExpenses = await dbGet(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses 
      WHERE user_id = ? AND type = 'expense' ${dateFilter}
    `, params);

    // Total income
    const totalIncome = await dbGet(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses 
      WHERE user_id = ? AND type = 'income' ${dateFilter}
    `, params);

    // Category breakdown
    const categoryBreakdown = await dbAll(`
      SELECT c.name, c.color, c.icon, COALESCE(SUM(e.amount), 0) as total
      FROM categories c
      LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ? AND e.type = 'expense' ${dateFilter}
      GROUP BY c.id, c.name, c.color, c.icon
      ORDER BY total DESC
    `, params);

    // Recent transactions
    const recentTransactions = await dbAll(`
      SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.date DESC, e.created_at DESC
      LIMIT 10
    `, [req.userId]);

    res.json({
      totalExpenses: totalExpenses.total,
      totalIncome: totalIncome.total,
      balance: totalIncome.total - totalExpenses.total,
      categoryBreakdown,
      recentTransactions
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

module.exports = router; 