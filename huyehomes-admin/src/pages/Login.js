import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Home,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: 'auto',
  boxShadow: theme.shadows[8],
  borderRadius: 16,
}));

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      setLoginError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.identifier || !formData.password) {
      setLoginError('Please fill in all fields');
      return;
    }

    const result = await login(formData.identifier, formData.password);
    
    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {/* Logo and Title */}
        <Box textAlign="center" mb={4}>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Home sx={{ fontSize: 48, color: 'primary.main', mr: 1 }} />
            <Typography variant="h4" color="primary" fontWeight="bold">
              Huye Homes
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Admin Portal
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Manage your real estate listings and inquiries
          </Typography>
        </Box>

        {/* Login Card */}
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Enter your credentials to access the admin panel
            </Typography>

            {loginError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email or Username"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                autoComplete="username"
                autoFocus
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                variant="outlined"
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                Sign In
              </Button>
            </form>

            <Box mt={3}>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                By signing in, you agree to the terms and conditions of Huye Homes Admin Portal.
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>

        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            © 2026 Huye Homes. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
