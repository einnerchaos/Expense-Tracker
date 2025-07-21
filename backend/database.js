const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path - use memory for Vercel deployment
const dbPath = process.env.NODE_ENV === 'production' ? ':memory:' : path.join(__dirname, 'expense_tracker.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        currency TEXT DEFAULT 'USD',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Categories table
      db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#4CAF50',
        icon TEXT DEFAULT '💰',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Expenses table
      db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        category_id INTEGER,
        type TEXT DEFAULT 'expense',
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`);

      // Budgets table
      db.run(`CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        period TEXT DEFAULT 'monthly',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`);

      // Goals table
      db.run(`CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        deadline DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Insert default categories
      db.run(`INSERT OR IGNORE INTO categories (name, color, icon) VALUES 
        ('Food & Dining', '#FF6B6B', '🍽️'),
        ('Transportation', '#4ECDC4', '🚗'),
        ('Shopping', '#45B7D1', '🛍️'),
        ('Entertainment', '#96CEB4', '🎬'),
        ('Healthcare', '#FFEAA7', '🏥'),
        ('Utilities', '#DDA0DD', '⚡'),
        ('Education', '#98D8C8', '📚'),
        ('Travel', '#F7DC6F', '✈️'),
        ('Income', '#4CAF50', '💰')
      `);

      // Create demo user if not exists
      db.get("SELECT id FROM users WHERE email = 'demo@expensetracker.com'", (err, row) => {
        if (err) {
          console.error('Error checking demo user:', err);
        } else if (!row) {
          const hashedPassword = bcrypt.hashSync('demo123', 10);
          db.run(`INSERT INTO users (name, email, password, currency) VALUES 
            ('Demo User', 'demo@expensetracker.com', ?, 'USD')`, [hashedPassword], function(err) {
            if (err) {
              console.error('Error creating demo user:', err);
            } else {
              console.log('✅ Demo user created with ID:', this.lastID);
              
              // Add demo expenses
              const demoExpenses = [
                [this.lastID, 45.50, 'Grocery shopping at Walmart', 1, 'expense', '2024-01-15'],
                [this.lastID, 25.00, 'Uber ride to work', 2, 'expense', '2024-01-16'],
                [this.lastID, 120.00, 'New headphones', 3, 'expense', '2024-01-17'],
                [this.lastID, 15.00, 'Movie tickets', 4, 'expense', '2024-01-14'],
                [this.lastID, 80.00, 'Doctor appointment', 5, 'expense', '2024-01-13'],
                [this.lastID, 2500.00, 'Salary deposit', 9, 'income', '2024-01-10']
              ];
              
              const stmt = db.prepare(`INSERT INTO expenses (user_id, amount, description, category_id, type, date) VALUES (?, ?, ?, ?, ?, ?)`);
              demoExpenses.forEach(expense => {
                stmt.run(expense);
              });
              stmt.finalize();
              
              console.log('✅ Demo expenses added');
            }
          });
        }
      });

      console.log('✅ Database initialized successfully');
      resolve();
    });
  });
};

// Helper functions for database operations
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  db,
  initDatabase,
  dbGet,
  dbAll,
  dbRun
}; 