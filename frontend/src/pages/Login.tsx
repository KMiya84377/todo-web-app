import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  LinearProgress,
} from '@mui/material';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { isAuthenticated, error, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If already authenticated, redirect to todos page
    if (isAuthenticated) {
      navigate('/todos');
    }

    // Clear previous errors on component mount
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = 'メールアドレスは必須です';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = '有効なメールアドレスを入力してください';
      isValid = false;
    }

    if (!password) {
      errors.password = 'パスワードは必須です';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      dispatch(login({ email, password }));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1">
              TODOアプリ
            </Typography>
            <Typography variant="h5" component="h2">
              ログイン
            </Typography>
          </Box>
          
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              ログイン
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/signup">
                  <Typography variant="body2" color="primary">
                    アカウントをお持ちではありませんか？登録する
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;