import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Button, 
  CircularProgress 
} from '@mui/material';
import { TodoFormData, Todo } from '../../types/todo';

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TodoFormData) => Promise<void>;
  initialData?: Todo;
  isSubmitting: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  isSubmitting 
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setTitleError('');
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    
    try {
      await onSubmit({ 
        title: title.trim(), 
        description: description.trim() || undefined 
      });
      onClose();
    } catch (error) {
      console.error('Error submitting todo:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Todo' : 'Create New Todo'}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="todo-form">
          <TextField
            autoFocus
            margin="normal"
            id="title"
            label="Title"
            type="text"
            fullWidth
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError('');
            }}
            error={!!titleError}
            helperText={titleError}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            id="description"
            label="Description (optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="todo-form" 
          color="primary"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : initialData ? (
            'Save'
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoForm;