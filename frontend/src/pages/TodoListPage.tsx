import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  Alert,
  Stack,
  Snackbar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Add as AddIcon,
  Menu as MenuIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import TodoList from '../components/todos/TodoList';
import TodoForm from '../components/todos/TodoForm';
import TodoFilter from '../components/todos/TodoFilter';
import { useAuth } from '../contexts/AuthContext';
import { useTodo } from '../contexts/TodoContext';
import { Todo } from '../types/todo';

const TodoListPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    todos, 
    isLoading, 
    error, 
    fetchTodos, 
    createTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoStatus, 
    deleteCompletedTodos,
    clearError
  } = useTodo();
  
  // Local state
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>(undefined);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Handle notification closing
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Handler for opening the menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handler for closing the menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Create new todo handler
  const handleCreateTodo = () => {
    setEditingTodo(undefined);
    setFormOpen(true);
  };

  // Edit todo handler
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setFormOpen(true);
  };

  // Todo form submit handler
  const handleFormSubmit = async (data: { title: string; description?: string }) => {
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, data);
        setNotification({ 
          message: 'Todo updated successfully', 
          type: 'success'
        });
      } else {
        await createTodo(data);
        setNotification({ 
          message: 'Todo created successfully', 
          type: 'success'
        });
      }
    } catch (error: any) {
      setNotification({ 
        message: error.message || 'An error occurred', 
        type: 'error'
      });
    }
  };

  // Delete todo handler
  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setNotification({ 
        message: 'Todo deleted successfully', 
        type: 'success'
      });
    } catch (error: any) {
      setNotification({ 
        message: error.message || 'An error occurred', 
        type: 'error'
      });
    }
  };

  // Delete completed todos handler
  const handleDeleteCompleted = async () => {
    try {
      await deleteCompletedTodos();
      handleMenuClose();
      setNotification({ 
        message: 'Completed todos deleted successfully', 
        type: 'success'
      });
    } catch (error: any) {
      setNotification({ 
        message: error.message || 'An error occurred', 
        type: 'error'
      });
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      setNotification({ 
        message: error.message || 'An error occurred while signing out', 
        type: 'error'
      });
    }
  };

  // Count of completed todos
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo List
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.username}
              </Typography>
              <Button color="inherit" onClick={handleSignOut} startIcon={<LogoutIcon />}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteCompleted} disabled={completedCount === 0}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Completed Todos</ListItemText>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Todo Filter */}
        <TodoFilter filter={filter} onFilterChange={setFilter} />
        
        {/* Todo List */}
        <TodoList
          todos={todos}
          isLoading={isLoading}
          onToggle={toggleTodoStatus}
          onDelete={handleDeleteTodo}
          onEdit={handleEditTodo}
          filter={filter}
        />

        {/* Todo Summary */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {todos.length > 0 
              ? `${todos.length} total, ${completedCount} completed` 
              : 'No todos yet'}
          </Typography>
        </Box>

        {/* Add Todo Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreateTodo}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>

        {/* Todo Form Dialog */}
        <TodoForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingTodo}
          isSubmitting={isLoading}
        />

        {/* Notification */}
        <Snackbar
          open={Boolean(notification)}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {notification && (
            <Alert
              onClose={handleCloseNotification}
              severity={notification.type}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          )}
        </Snackbar>
      </Container>
    </>
  );
};

export default TodoListPage;