import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Demo data
  const demoCategories = [
    { id: '1', name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
    { id: '2', name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
    { id: '3', name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
    { id: '4', name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
    { id: '5', name: 'Healthcare', color: '#FFEAA7', icon: '🏥' },
    { id: '6', name: 'Utilities', color: '#DDA0DD', icon: '⚡' },
    { id: '7', name: 'Education', color: '#98D8C8', icon: '📚' },
    { id: '8', name: 'Travel', color: '#F7DC6F', icon: '✈️' }
  ];

  const demoExpenses = [
    {
      id: '1',
      amount: 45.50,
      description: 'Grocery shopping at Walmart',
      category: 'Food & Dining',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'expense'
    },
    {
      id: '2',
      amount: 25.00,
      description: 'Uber ride to work',
      category: 'Transportation',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'expense'
    },
    {
      id: '3',
      amount: 120.00,
      description: 'New headphones',
      category: 'Shopping',
      date: new Date(),
      type: 'expense'
    },
    {
      id: '4',
      amount: 15.00,
      description: 'Movie tickets',
      category: 'Entertainment',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      type: 'expense'
    },
    {
      id: '5',
      amount: 80.00,
      description: 'Doctor appointment',
      category: 'Healthcare',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      type: 'expense'
    },
    {
      id: '6',
      amount: 2500.00,
      description: 'Salary deposit',
      category: 'Income',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      type: 'income'
    }
  ];

  const demoBudgets = [
    { id: '1', category: 'Food & Dining', amount: 500, spent: 245.50, period: 'monthly' },
    { id: '2', category: 'Transportation', amount: 300, spent: 125.00, period: 'monthly' },
    { id: '3', category: 'Shopping', amount: 400, spent: 320.00, period: 'monthly' },
    { id: '4', category: 'Entertainment', amount: 200, spent: 115.00, period: 'monthly' }
  ];

  const demoGoals = [
    { id: '1', name: 'Emergency Fund', target: 10000, current: 6500, deadline: new Date(2024, 11, 31) },
    { id: '2', name: 'Vacation Fund', target: 3000, current: 1200, deadline: new Date(2024, 7, 31) },
    { id: '3', name: 'New Car', target: 25000, current: 8000, deadline: new Date(2025, 5, 31) }
  ];

  useEffect(() => {
    // Load demo data
    setCategories(demoCategories);
    setExpenses(demoExpenses);
    setBudgets(demoBudgets);
    setGoals(demoGoals);
  }, []);

  const addExpense = async (expenseData) => {
    try {
      const newExpense = {
        id: Date.now().toString(),
        ...expenseData,
        date: new Date(expenseData.date)
      };
      setExpenses(prev => [newExpense, ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      setExpenses(prev => prev.map(exp => 
        exp.id === id ? { ...exp, ...expenseData } : exp
      ));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteExpense = async (id) => {
    try {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addBudget = async (budgetData) => {
    try {
      const newBudget = {
        id: Date.now().toString(),
        ...budgetData,
        spent: 0
      };
      setBudgets(prev => [...prev, newBudget]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addGoal = async (goalData) => {
    try {
      const newGoal = {
        id: Date.now().toString(),
        ...goalData,
        current: 0
      };
      setGoals(prev => [...prev, newGoal]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const newCategory = {
        id: Date.now().toString(),
        ...categoryData
      };
      setCategories(prev => [...prev, newCategory]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...categoryData } : cat
      ));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteCategory = async (id) => {
    try {
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    expenses,
    categories,
    budgets,
    goals,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    addBudget,
    addGoal,
    addCategory,
    updateCategory,
    deleteCategory
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}; 