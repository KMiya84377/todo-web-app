import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import {
  createTodo,
  fetchTodoById,
  updateTodo,
  clearSelectedTodo,
  clearError,
} from '../store/slices/todoSlice';
import { AppDispatch, RootState } from '../store';
import { TodoStatus } from '../types';

const TodoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TodoStatus>(TodoStatus.NOT_STARTED);
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { selectedTodo, loading, error } = useSelector((state: RootState) => state.todos);

  // Load todo data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchTodoById(id));
    }

    return () => {
      dispatch(clearSelectedTodo());
      dispatch(clearError());
    };
  }, [dispatch, isEditMode, id]);

  // Update form when selectedTodo changes
  useEffect(() => {
    if (selectedTodo && isEditMode) {
      setTitle(selectedTodo.title);
      setDescription(selectedTodo.description);
      setStatus(selectedTodo.status);
      setHasChanges(false);
    }
  }, [selectedTodo, isEditMode]);

  // Track form changes
  useEffect(() => {
    if (isEditMode && selectedTodo) {
      setHasChanges(
        title !== selectedTodo.title ||
        description !== selectedTodo.description ||
        status !== selectedTodo.status
      );
    } else if (!isEditMode) {
      setHasChanges(title !== '' || description !== '' || status !== TodoStatus.NOT_STARTED);
    }
  }, [title, description, status, selectedTodo, isEditMode]);

  const validateForm = (): boolean => {
    const errors: { title?: string; description?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      errors.title = 'タイトルは必須です';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && id) {
        await dispatch(
          updateTodo({
            id,
            title,
            description,
            status,
          })
        ).unwrap();
      } else {
        await dispatch(
          createTodo({
            title,
            description,
            status,
          })
        ).unwrap();
      }
      navigate('/todos');
    } catch (error) {
      // Error is handled by the reducer
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setDiscardDialogOpen(true);
    } else {
      navigate('/todos');
    }
  };

  const handleDiscard = () => {
    setDiscardDialogOpen(false);
    navigate('/todos');
  };

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleBack}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {isEditMode ? 'TODO編集' : 'TODO新規作成'}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleSubmit}
            disabled={loading || (!hasChanges && isEditMode)}
          >
            保存
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Loading and Error states */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Todo Form */}
        <Paper sx={{ p: 3 }}>
          <Box component="form" noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="タイトル"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!formErrors.title}
              helperText={formErrors.title}
              disabled={loading}
              autoFocus
            />
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="説明"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">ステータス</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TodoStatus)}
                label="ステータス"
                disabled={loading}
              >
                <MenuItem value={TodoStatus.NOT_STARTED}>未着手</MenuItem>
                <MenuItem value={TodoStatus.IN_PROGRESS}>進行中</MenuItem>
                <MenuItem value={TodoStatus.COMPLETED}>完了</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Mobile Save Button */}
        <Box sx={{ mt: 3, display: { sm: 'none' } }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || (!hasChanges && isEditMode)}
          >
            保存
          </Button>
        </Box>
      </Container>

      {/* Discard Changes Dialog */}
      <Dialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
      >
        <DialogTitle>変更を破棄しますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            保存されていない変更があります。このページを離れると変更内容は失われます。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDiscard} color="error">
            破棄
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TodoForm;