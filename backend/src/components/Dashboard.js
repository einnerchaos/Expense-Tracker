import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Timeline,
  Add
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useExpense } from '../contexts/ExpenseContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

const Dashboard = () => {
  const { expenses, categories, budgets, goals } = useExpense();
  const { user } = useAuth();

  // Calculate totals
  const totalExpenses = expenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalIncome = expenses
    .filter(exp => exp.type === 'income')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Category breakdown for pie chart
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

  // Monthly trend data
  const monthlyData = [
    { month: 'Jan', expenses: 1200, income: 2500 },
    { month: 'Feb', expenses: 1400, income: 2500 },
    { month: 'Mar', expenses: 1100, income: 2500 },
    { month: 'Apr', expenses: 1600, income: 2500 },
    { month: 'May', expenses: 1300, income: 2500 },
    { month: 'Jun', expenses: 1800, income: 2500 }
  ];

  // Recent transactions
  const recentTransactions = expenses.slice(0, 5);

  // Budget progress
  const budgetProgress = budgets.map(budget => {
    const spent = expenses
      .filter(exp => exp.category === budget.category && exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    return { ...budget, spent, percentage };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your financial overview for this month
          </Typography>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Total Balance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${balance.toFixed(2)}
                    </Typography>
                  </Box>
                  <AccountBalance sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${totalExpenses.toFixed(2)}
                    </Typography>
                  </Box>
                  <TrendingDown sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Total Income
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      ${totalIncome.toFixed(2)}
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Savings Rate
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                  <Savings sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Expense by Category
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

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Trend
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="expenses" stroke="#f5576c" strokeWidth={2} />
                  <Line type="monotone" dataKey="income" stroke="#4facfe" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Budget Progress and Recent Transactions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Budget Progress
              </Typography>
              <List>
                {budgetProgress.map((budget, index) => (
                  <React.Fragment key={budget.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: categories.find(c => c.name === budget.category)?.color }}>
                          {categories.find(c => c.name === budget.category)?.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={budget.category}
                        secondary={`$${budget.spent.toFixed(2)} / $${budget.amount.toFixed(2)}`}
                      />
                      <Chip
                        label={`${budget.percentage.toFixed(1)}%`}
                        color={budget.percentage > 90 ? 'error' : budget.percentage > 70 ? 'warning' : 'success'}
                        size="small"
                      />
                    </ListItem>
                    {index < budgetProgress.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <List>
                {recentTransactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: transaction.type === 'income' ? '#4facfe' : '#f5576c' }}>
                          {transaction.type === 'income' ? '💰' : '💸'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={transaction.description}
                        secondary={transaction.category}
                      />
                      <Typography
                        variant="body2"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </Typography>
                    </ListItem>
                    {index < recentTransactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard; 