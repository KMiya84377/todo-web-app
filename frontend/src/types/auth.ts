export interface User {
  username: string;
  email: string;
  sub: string;  // Cognito user ID
  attributes?: {
    email: string;
    email_verified: boolean;
    sub: string;
    [key: string]: any;
  };
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}