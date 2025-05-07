import React from 'react';
import { List, Typography, Box, Paper, CircularProgress } from '@mui/material';
import TodoItem from './TodoItem';
import { Todo } from '../../types/todo';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  filter: string; // "all", "active", "completed"
}

const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  isLoading, 
  onToggle, 
  onDelete, 
  onEdit,
  filter 
}) => {
  // Filter todos based on selected filter
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true; // 'all'
  });

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (filteredTodos.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }} elevation={0}>
        <Typography variant="subtitle1" color="text.secondary">
          {filter === 'all' 
            ? 'No todos yet. Create one to get started!' 
            : filter === 'active'
            ? 'No active todos!'
            : 'No completed todos!'}
        </Typography>
      </Paper>
    );
  }

  // Sort todos: active first, then by creation date (newest first)
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // If one is completed and the other isn't, put the active one first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Otherwise sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Paper sx={{ width: '100%', mb: 2 }} elevation={1}>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {sortedTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </List>
    </Paper>
  );
};

export default TodoList;