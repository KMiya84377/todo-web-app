export interface Todo {
  todoId: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface APIGatewayResponseType {
  statusCode: number;
  headers: {
    [header: string]: string;
  };
  body: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  username: string;
}

export interface ErrorResponse {
  message: string;
  code: string;
}