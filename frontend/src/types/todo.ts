export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

export interface TodoFormData {
  title: string;
  description?: string;
}

export interface TodoContextType {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  createTodo: (todoData: TodoFormData) => Promise<void>;
  updateTodo: (id: string, todoData: Partial<TodoFormData>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodoStatus: (id: string) => Promise<void>;
  deleteCompletedTodos: () => Promise<void>;
  clearError: () => void;
}