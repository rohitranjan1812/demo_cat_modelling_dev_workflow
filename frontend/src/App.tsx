import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import HazardsPage from './pages/Hazards/HazardsPage';
import VulnerabilitiesPage from './pages/Vulnerabilities/VulnerabilitiesPage';
import SimulationsPage from './pages/Simulations/SimulationsPage';
import IntegrationPage from './pages/Integration/IntegrationPage';
import AccountsPage from './pages/Accounts/AccountsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

const App: React.FC = () => {
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

export default App;

