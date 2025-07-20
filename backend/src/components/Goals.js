import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Add, Flag } from '@mui/icons-material';
import { useExpense } from '../contexts/ExpenseContext';
import Layout from './Layout';

const Goals = () => {
  const { goals, addGoal } = useExpense();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    deadline: ''
  });

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', target: '', deadline: '' });
  };

  const handleSubmit = async () => {
    if (formData.name && formData.target && formData.deadline) {
      await addGoal({
        name: formData.name,
        target: parseFloat(formData.target),
        deadline: new Date(formData.deadline)
      });
      handleCloseDialog();
    }
  };

  const getGoalProgress = (goal) => {
    const percentage = (goal.current / goal.target) * 100;
    const remaining = goal.target - goal.current;
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    return { percentage, remaining, daysLeft };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Financial Goals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set and track your financial goals
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049, #4CAF50)'
              }
            }}
          >
            Add Goal
          </Button>
        </Box>

        <Grid container spacing={3}>
          {goals.map((goal) => {
            const progress = getGoalProgress(goal);
            return (
              <Grid item xs={12} md={6} lg={4} key={goal.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Flag sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {goal.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress: ${goal.current.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Target: ${goal.target.toFixed(2)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress.percentage, 100)}
                        color={getProgressColor(progress.percentage)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={`${progress.percentage.toFixed(1)}%`}
                        color={getProgressColor(progress.percentage)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        ${progress.remaining.toFixed(2)} remaining
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                      {progress.daysLeft > 0 && ` (${progress.daysLeft} days left)`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Add Goal Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Financial Goal</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Goal Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              label="Target Amount ($)"
              type="number"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Add Goal
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Goals; 