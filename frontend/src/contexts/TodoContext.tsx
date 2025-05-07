import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Todo, TodoFormData, TodoContextType } from '../types/todo';
import { useAuth } from './AuthContext';
import { API } from 'aws-amplify';

const TodoContext = createContext<TodoContextType>({
  todos: [],
  isLoading: false,
  error: null,
  fetchTodos: async () => {},
  createTodo: async () => {},
  updateTodo: async () => {},
  deleteTodo: async () => {},
  toggleTodoStatus: async () => {},
  deleteCompletedTodos: async () => {},
  clearError: () => {},
});

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTodos = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await API.get('api', '/todos', {});
      setTodos(response);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch todos');
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTodo = async (todoData: TodoFormData) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await API.post('api', '/todos', {
        body: todoData,
      });
      setTodos(prevTodos => [...prevTodos, response]);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to create todo');
      console.error('Error creating todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTodo = async (id: string, todoData: Partial<TodoFormData>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await API.put('api', `/todos/${id}`, {
        body: todoData,
      });
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? { ...todo, ...response } : todo)
      );
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to update todo');
      console.error('Error updating todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await API.del('api', `/todos/${id}`, {});
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to delete todo');
      console.error('Error deleting todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodoStatus = async (id: string) => {
    if (!user) return;
    
    // Find the todo to toggle
    const todoToToggle = todos.find(todo => todo.id === id);
    if (!todoToToggle) return;

    try {
      setIsLoading(true);
      const response = await API.put('api', `/todos/${id}/status`, {
        body: { completed: !todoToToggle.completed },
      });
      setTodos(prevTodos => 
        prevTodos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
      );
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to toggle todo status');
      console.error('Error toggling todo status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCompletedTodos = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await API.del('api', '/todos/completed', {});
      setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to delete completed todos');
      console.error('Error deleting completed todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <TodoContext.Provider
      value={{
        todos,
        isLoading,
        error,
        fetchTodos,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleTodoStatus,
        deleteCompletedTodos,
        clearError,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => useContext(TodoContext);

export default TodoContext;