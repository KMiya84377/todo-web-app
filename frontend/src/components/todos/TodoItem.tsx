import React, { useState } from 'react';
import { 
  ListItem, 
  ListItemText,
  ListItemIcon, 
  IconButton, 
  Checkbox,
  Typography,
  Box,
  Tooltip,
  Divider 
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon 
} from '@mui/icons-material';
import { Todo } from '../../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit }) => {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <>
      <ListItem
        disablePadding
        sx={{ 
          py: 2, 
          px: 1,
          display: 'flex', 
          alignItems: 'flex-start',
          backgroundColor: todo.completed ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
        }}
        secondaryAction={
          <Box>
            <Tooltip title="Edit">
              <IconButton 
                edge="end" 
                aria-label="edit" 
                onClick={() => onEdit(todo)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                edge="end" 
                aria-label="delete" 
                onClick={() => onDelete(todo.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            tabIndex={-1}
            disableRipple
            sx={{ mt: 1 }}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="h6"
              sx={{ 
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.secondary' : 'text.primary',
              }}
            >
              {todo.title}
            </Typography>
          }
          secondary={
            <Box sx={{ mt: 1 }}>
              {todo.description && (
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                    mb: 1
                  }}
                >
                  {todo.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {formatDate(todo.createdAt)}
              </Typography>
              {todo.updatedAt && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Updated: {formatDate(todo.updatedAt)}
                </Typography>
              )}
            </Box>
          }
        />
      </ListItem>
      <Divider component="li" />
    </>
  );
};

export default TodoItem;