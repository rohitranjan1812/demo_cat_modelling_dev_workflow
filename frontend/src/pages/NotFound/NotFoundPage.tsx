import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SearchIcon
                sx={{
                  fontSize: 120,
                  color: '#1976d2',
                  mb: 3,
                  opacity: 0.7,
                }}
              />
            </motion.div>

            <Typography
              variant="h1"
              sx={{
                fontSize: '6rem',
                fontWeight: 700,
                color: '#1976d2',
                mb: 2,
                lineHeight: 1,
              }}
            >
              404
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#333',
                mb: 2,
              }}
            >
              Page Not Found
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: 400,
                mx: 'auto',
              }}
            >
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                size="large"
                sx={{ textTransform: 'none', px: 4 }}
              >
                Go to Dashboard
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                size="large"
                sx={{ textTransform: 'none', px: 4 }}
              >
                Go Back
              </Button>
            </Box>

            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                If you believe this is an error, please contact support.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default NotFoundPage;

