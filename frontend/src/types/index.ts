// Todo Status Types
export enum TodoStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

// Todo Types
export interface Todo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: number;
  updatedAt: number;
}

// User Authentication Types
export interface User {
  userId: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  expiresIn: number | null;
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  token?: string;
  userId?: string;
  expiresIn?: number;
  message?: string;
}

export interface TodoResponse {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  createdAt: number;
  updatedAt: number;
}

export interface TodosResponse {
  todos: TodoResponse[];
}

export interface BatchDeleteResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}