import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Fab,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  TextField,
  Divider,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { fetchTodos, deleteTodo, batchDeleteTodos, clearError } from '../store/slices/todoSlice';
import { logout } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { TodoStatus, Todo } from '../types';

const statusLabels: Record<TodoStatus, string> = {
  [TodoStatus.NOT_STARTED]: '未着手',
  [TodoStatus.IN_PROGRESS]: '進行中',
  [TodoStatus.COMPLETED]: '完了',
};

const statusColors: Record<TodoStatus, 'default' | 'primary' | 'success'> = {
  [TodoStatus.NOT_STARTED]: 'default',
  [TodoStatus.IN_PROGRESS]: 'primary',
  [TodoStatus.COMPLETED]: 'success',
};

const TodoList: React.FC = () => {
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<TodoStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { todos, loading, error } = useSelector((state: RootState) => state.todos);

  // Load todos on component mount
  useEffect(() => {
    const params = statusFilter ? { status: statusFilter } : undefined;
    dispatch(fetchTodos(params));
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, statusFilter]);

  // Filter todos based on search query
  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    todo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateTodo = () => {
    navigate('/todos/new');
  };

  const handleEditTodo = (id: string) => {
    navigate(`/todos/${id}/edit`);
  };

  const handleDeleteTodo = (id: string) => {
    setSelectedTodos([id]);
    setDeletingMultiple(false);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedTodos.length > 0) {
      setDeletingMultiple(true);
      setConfirmDeleteOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingMultiple) {
      dispatch(batchDeleteTodos(selectedTodos))
        .unwrap()
        .then(() => {
          setSelectedTodos([]);
        });
    } else if (selectedTodos.length === 1) {
      dispatch(deleteTodo(selectedTodos[0]))
        .unwrap()
        .then(() => {
          setSelectedTodos([]);
        });
    }
    setConfirmDeleteOpen(false);
  };

  const handleSelectTodo = (id: string) => {
    if (selectedTodos.includes(id)) {
      setSelectedTodos(selectedTodos.filter((todoId) => todoId !== id));
    } else {
      setSelectedTodos([...selectedTodos, id]);
    }
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  const applyStatusFilter = (status: TodoStatus | null) => {
    setStatusFilter(status);
    handleFilterMenuClose();
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setSearchQuery('');
    handleFilterMenuClose();
  };

  return (
    <Box sx={{ pb: 7 }}>
      {/* App Bar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TODOリスト {statusFilter && `- ${statusLabels[statusFilter]}`}
          </Typography>
          <IconButton color="inherit" onClick={handleFilterMenuOpen}>
            <FilterListIcon />
          </IconButton>
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterMenuClose}
          >
            <MenuItem onClick={() => applyStatusFilter(null)}>すべて</MenuItem>
            <MenuItem onClick={() => applyStatusFilter(TodoStatus.NOT_STARTED)}>未着手</MenuItem>
            <MenuItem onClick={() => applyStatusFilter(TodoStatus.IN_PROGRESS)}>進行中</MenuItem>
            <MenuItem onClick={() => applyStatusFilter(TodoStatus.COMPLETED)}>完了</MenuItem>
            <Divider />
            <MenuItem onClick={clearFilters}>フィルターをクリア</MenuItem>
          </Menu>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Search Box */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="検索"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
          />
        </Paper>

        {/* Loading and Error states */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Selected Actions */}
        {selectedTodos.length > 0 && (
          <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              {selectedTodos.length} 件選択中
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteSelected}
            >
              選択したTODOを削除
            </Button>
          </Paper>
        )}

        {/* Todo List */}
        <Paper>
          {filteredTodos.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                TODOがありません。新しいTODOを作成しましょう。
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredTodos.map((todo) => (
                <React.Fragment key={todo.id}>
                  <ListItem
                    button
                    onClick={() => handleEditTodo(todo.id)}
                    selected={selectedTodos.includes(todo.id)}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedTodos.includes(todo.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTodo(todo.id);
                      }}
                    />
                    <ListItemText
                      primary={todo.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                            sx={{ display: 'block', mb: 1 }}
                          >
                            {todo.description.length > 100
                              ? `${todo.description.substring(0, 100)}...`
                              : todo.description}
                          </Typography>
                          <Chip 
                            label={statusLabels[todo.status]} 
                            size="small" 
                            color={statusColors[todo.status]}
                            sx={{ mr: 1 }}
                          />
                          <Typography component="span" variant="body2" color="textSecondary">
                            {new Date(todo.updatedAt).toLocaleString('ja-JP')}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={(e) => {
                        e.stopPropagation();
                        handleEditTodo(todo.id);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTodo(todo.id);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateTodo}
        >
          <AddIcon />
        </Fab>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>
          {deletingMultiple
            ? "複数のTODOを削除"
            : "TODOを削除"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deletingMultiple
              ? `${selectedTodos.length}件のTODOを削除しますか？この操作は元に戻せません。`
              : "このTODOを削除しますか？この操作は元に戻せません。"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoList;