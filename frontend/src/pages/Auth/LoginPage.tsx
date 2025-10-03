import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.username, data.password);
      // Navigation will be handled by the auth context
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          maxWidth: 450, 
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 4, 
            textAlign: 'center' 
          }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <SecurityIcon sx={{ fontSize: 48, mb: 2 }} />
            </motion.div>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              CAT Modeling Platform
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Secure Access Portal
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Welcome Message */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Sign in to access catastrophe modeling tools and analytics
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Username or Email"
                    margin="normal"
                    autoComplete="username"
                    autoFocus
                    disabled={isLoading}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    margin="normal"
                    autoComplete="current-password"
                    disabled={isLoading}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePassword}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Controller
                name="rememberMe"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={value} 
                        onChange={onChange}
                        disabled={isLoading}
                        color="primary"
                      />
                    }
                    label="Remember me"
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  mt: 2, 
                  mb: 3,
                  height: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  OR
                </Typography>
              </Divider>

              {/* Demo Accounts */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Demo Accounts:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Risk Manager: <strong>riskmanager</strong> / RiskManager2025!
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Analyst: <strong>analyst</strong> / DataAnalyst2025!
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Viewer: <strong>viewer</strong> / Viewer2025!
                  </Typography>
                </Box>
              </Box>

              {/* Footer Links */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Don't have an account?{' '}
                  <Link 
                    href="#" 
                    sx={{ fontWeight: 600, textDecoration: 'none' }}
                    onClick={() => {/* TODO: Implement registration */}}
                  >
                    Contact Administrator
                  </Link>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <Link 
                    href="#" 
                    sx={{ textDecoration: 'none' }}
                    onClick={() => {/* TODO: Implement forgot password */}}
                  >
                    Forgot your password?
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>

          {/* Platform Info */}
          <Box sx={{ 
            bgcolor: 'grey.50', 
            p: 2, 
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <AnalyticsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Catastrophe Risk Modeling & Analytics
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Powered by MongoDB, React, and Express • v1.0.0
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Box>
  );
};

export default LoginPage;
