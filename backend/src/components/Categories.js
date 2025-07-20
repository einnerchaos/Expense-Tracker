import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Add, Edit, Delete, MoreVert } from '@mui/icons-material';
import { useExpense } from '../contexts/ExpenseContext';
import Layout from './Layout';

const Categories = () => {
  const { categories, expenses, addCategory, updateCategory, deleteCategory } = useExpense();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#4CAF50',
    icon: '📁'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        color: category.color,
        icon: category.icon
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        color: '#4CAF50',
        icon: '📁'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (formData.name) {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      handleCloseDialog();
    }
  };

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleDelete = async () => {
    if (selectedCategory && window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(selectedCategory.id);
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    handleMenuClose();
    handleOpenDialog(selectedCategory);
  };

  const getCategoryStats = (categoryName) => {
    const categoryExpenses = expenses.filter(exp => exp.category === categoryName && exp.type === 'expense');
    const totalAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const transactionCount = categoryExpenses.length;
    
    return { totalAmount, transactionCount };
  };

  const iconOptions = ['📁', '🍽️', '🚗', '🛍️', '🎬', '🏥', '⚡', '📚', '✈️', '🏠', '🎮', '💊', '🎵', '📱', '💻', '👕'];

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Categories
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your expense categories and track spending patterns
        </Typography>

        <Grid container spacing={3}>
          {categories.map((category) => {
            const stats = getCategoryStats(category.name);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3, position: 'relative' }}>
                    <IconButton
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={(e) => handleMenuOpen(e, category)}
                    >
                      <MoreVert />
                    </IconButton>
                    
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        fontSize: '24px',
                        bgcolor: category.color
                      }}
                    >
                      {category.icon}
                    </Avatar>
                    
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {category.name}
                    </Typography>
                    
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${stats.totalAmount.toFixed(2)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {stats.transactionCount} transactions
                    </Typography>
                    
                    <Chip
                      label={`${((stats.totalAmount / expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)) * 100).toFixed(1)}%`}
                      color="primary"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Add Category FAB */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenDialog()}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
            '&:hover': {
              background: 'linear-gradient(45deg, #45a049, #4CAF50)'
            }
          }}
        >
          <Add />
        </Fab>

        {/* Category Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2, mt: 1 }}
            />
            <TextField
              fullWidth
              label="Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Icon"
              select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              InputLabelProps={{ shrink: true }}
            >
              {iconOptions.map((icon) => (
                <MenuItem key={icon} value={icon}>
                  {icon}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingCategory ? 'Update' : 'Add'} Category
            </Button>
          </DialogActions>
        </Dialog>

        {/* Category Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Layout>
  );
};

export default Categories; 