import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthResponse, User } from '../../types';
import authService from '../../services/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: Boolean(localStorage.getItem('token')),
  loading: false,
  error: null,
  expiresIn: null,
};

// Async thunks
export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string }
>('auth/login', async (credentials, thunkAPI) => {
  try {
    const response = await authService.login(credentials);
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    return thunkAPI.rejectWithValue({ message });
  }
});

export const signup = createAsyncThunk<
  AuthResponse,
  { email: string; password: string }
>('auth/signup', async (userData, thunkAPI) => {
  try {
    const response = await authService.signup(userData);
    return response;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Signup failed';
    return thunkAPI.rejectWithValue({ message });
  }
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.expiresIn = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.token && action.payload.userId) {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.expiresIn = action.payload.expiresIn || null;
        state.user = {
          userId: action.payload.userId,
          email: action.meta.arg.email,
        };
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify({
          userId: action.payload.userId,
          email: action.meta.arg.email,
        }));
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });

    // Signup cases
    builder.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string | null;
    });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;

export default authSlice.reducer;