import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useExpense } from '../contexts/ExpenseContext';
import Layout from './Layout';

const Analytics = () => {
  const { expenses, categories } = useExpense();

  // Monthly spending data
  const monthlyData = [
    { month: 'Jan', expenses: 1200, income: 2500 },
    { month: 'Feb', expenses: 1400, income: 2500 },
    { month: 'Mar', expenses: 1100, income: 2500 },
    { month: 'Apr', expenses: 1600, income: 2500 },
    { month: 'May', expenses: 1300, income: 2500 },
    { month: 'Jun', expenses: 1800, income: 2500 }
  ];

  // Category breakdown
  const categoryData = categories.map(cat => {
    const amount = expenses
      .filter(exp => exp.category === cat.name && exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: cat.name,
      value: amount,
      color: cat.color
    };
  }).filter(item => item.value > 0);

  // Spending trends
  const spendingTrends = [
    { day: 'Mon', amount: 45 },
    { day: 'Tue', amount: 32 },
    { day: 'Wed', amount: 67 },
    { day: 'Thu', amount: 23 },
    { day: 'Fri', amount: 89 },
    { day: 'Sat', amount: 120 },
    { day: 'Sun', amount: 78 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Detailed insights into your spending patterns and financial trends
        </Typography>

        <Grid container spacing={3}>
          {/* Monthly Overview */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Income vs Expenses
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#4facfe" />
                  <Bar dataKey="expenses" fill="#f5576c" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Weekly Spending Trend */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Spending Pattern
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Analytics; 