import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import TodoList from './pages/TodoList';
import TodoForm from './pages/TodoForm';

// Auth protection HOC
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/todos" 
            element={
              <ProtectedRoute>
                <TodoList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/todos/new" 
            element={
              <ProtectedRoute>
                <TodoForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/todos/:id/edit" 
            element={
              <ProtectedRoute>
                <TodoForm />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/todos" replace />} />
        </Routes>
      </ThemeProvider>
    </Provider>
  );
};

export default App;