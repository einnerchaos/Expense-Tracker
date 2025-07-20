import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useExpense } from '../contexts/ExpenseContext';
import Layout from './Layout';

const Budgets = () => {
  const { budgets, expenses } = useExpense();

  const getBudgetProgress = (budget) => {
    const spent = expenses
      .filter(exp => exp.category === budget.category && exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const percentage = (spent / budget.amount) * 100;
    const remaining = budget.amount - spent;
    
    return { spent, percentage, remaining };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Budgets
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your spending against monthly budgets
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #4CAF50)'
              }
            }}
          >
            Add Budget
          </Button>
        </Box>

        <Grid container spacing={3}>
          {budgets.map((budget) => {
            const progress = getBudgetProgress(budget);
            return (
              <Grid item xs={12} md={6} key={budget.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {budget.category}
                      </Typography>
                      <Chip
                        label={`${progress.percentage.toFixed(1)}%`}
                        color={getProgressColor(progress.percentage)}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Spent: ${progress.spent.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Budget: ${budget.amount.toFixed(2)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress.percentage, 100)}
                        color={getProgressColor(progress.percentage)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining: ${progress.remaining.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {budget.period}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Layout>
  );
};

export default Budgets; 