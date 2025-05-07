import axios from 'axios';
import { AuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

const authService = {
  // Login user
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  },

  // Sign up a new user
  async signup(userData: { email: string; password: string }): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
  },

  // Verify token
  async verifyToken(token: string): Promise<{ valid: boolean }> {
    try {
      const response = await axios.post(
        `${API_URL}/auth/verify-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
  },

  // Logout - client-side only, no API call needed
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authService;