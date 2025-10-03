import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import HazardsPage from './pages/Hazards/HazardsPage';
import VulnerabilitiesPage from './pages/Vulnerabilities/VulnerabilitiesPage';
import SimulationsPage from './pages/Simulations/SimulationsPage';
import IntegrationPage from './pages/Integration/IntegrationPage';
import AccountsPage from './pages/Accounts/AccountsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import LoginPage from './pages/Auth/LoginPage';

// Protected Routes Component
const ProtectedApp: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Loading CAT Modeling Platform...
        </Typography>
      </Box>
    );
  }

  // Not authenticated - show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated - show main application
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hazards" element={<HazardsPage />} />
          <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/integration" element={<IntegrationPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Box>
  );
};

// Main App Component with Auth Provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
};

export default App;

