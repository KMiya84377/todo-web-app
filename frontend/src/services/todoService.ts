import axios from 'axios';
import { Todo, TodoStatus, TodoResponse, TodosResponse, BatchDeleteResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const todoService = {
  // Get all todos with optional status filter
  async getTodos(status?: TodoStatus): Promise<TodosResponse> {
    const url = status ? `/todos?status=${status}` : '/todos';
    const response = await api.get(url);
    return response.data;
  },

  // Get a specific todo by ID
  async getTodoById(id: string): Promise<TodoResponse> {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // Create a new todo
  async createTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoResponse> {
    const response = await api.post('/todos', todoData);
    return response.data;
  },

  // Update an existing todo
  async updateTodo(
    id: string,
    todoData: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<TodoResponse> {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  // Delete a todo
  async deleteTodo(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },

  // Batch delete multiple todos
  async batchDeleteTodos(ids: string[]): Promise<BatchDeleteResponse> {
    const response = await api.post('/todos/batch-delete', { ids });
    return response.data;
  },
};

export default todoService;