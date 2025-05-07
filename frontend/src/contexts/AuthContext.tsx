import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Auth } from 'aws-amplify';
import { User, AuthContextType } from '../types/auth';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  error: null,
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      setUser({
        username: userData.username,
        email: userData.attributes.email,
        sub: userData.attributes.sub,
        attributes: userData.attributes,
      });
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      await Auth.signUp({
        username,
        password,
        attributes: { email },
      });
      // After signup, user needs to confirm their account
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error during sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await Auth.signIn(username, password);
      setUser({
        username: userData.username,
        email: userData.attributes?.email || '',
        sub: userData.attributes?.sub || '',
        attributes: userData.attributes,
      });
      setIsAuthenticated(true);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error during sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error during sign out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signUp,
        signIn,
        signOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;