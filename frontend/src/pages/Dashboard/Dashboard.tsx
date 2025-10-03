import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';

import apiService from '../../services/api';
import StatCard from '../../components/Dashboard/StatCard';
import RecentSimulations from '../../components/Dashboard/RecentSimulations';
import RiskOverview from '../../components/Dashboard/RiskOverview';
import HazardMap from '../../components/Dashboard/HazardMap';
import QuickActions from '../../components/Dashboard/QuickActions';

const Dashboard: React.FC = () => {
  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery(
    'dashboard',
    () => apiService.getSimulationDashboard(),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: riskData } = useQuery(
    'riskDashboard',
    () => apiService.getRiskDashboard(),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  const handleRefresh = () => {
    refetch();
  };

  const stats = [
    {
      title: 'Active Hazards',
      value: dashboardData?.data?.summary?.hazardCount || riskData?.data?.hazardCount || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: <WarningIcon />,
      color: '#ff9800',
    },
    {
      title: 'Vulnerabilities',
      value: dashboardData?.data?.summary?.vulnerabilityCount || riskData?.data?.vulnerabilityCount || 0,
      change: '+5%',
      changeType: 'negative' as const,
      icon: <SecurityIcon />,
      color: '#f44336',
    },
    {
      title: 'Simulations',
      value: dashboardData?.data?.summary?.totalRuns || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: <PlayIcon />,
      color: '#9c27b0',
    },
    {
      title: 'Risk Score',
      value: riskData?.data?.averageRiskScore || 0,
      change: '-2%',
      changeType: 'positive' as const,
      icon: <AssessmentIcon />,
      color: '#4caf50',
      suffix: '/100',
    },
  ];

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
            Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Catastrophe modeling overview and system status
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ textTransform: 'none' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Risk Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <RiskOverview />
          </motion.div>

          {/* Hazard Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{ marginTop: 24 }}
          >
            <HazardMap />
          </motion.div>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <QuickActions />
          </motion.div>

          {/* Recent Simulations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            style={{ marginTop: 24 }}
          >
            <RecentSimulations />
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            style={{ marginTop: 24 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  System Status
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">API Health</Typography>
                    <Chip label="Healthy" color="success" size="small" />
                  </Box>
                  <LinearProgress variant="determinate" value={100} color="success" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Database</Typography>
                    <Chip label="Connected" color="success" size="small" />
                  </Box>
                  <LinearProgress variant="determinate" value={100} color="success" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Simulation Engine</Typography>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                  <LinearProgress variant="determinate" value={85} color="primary" />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Memory Usage</Typography>
                    <Chip label="67%" color="warning" size="small" />
                  </Box>
                  <LinearProgress variant="determinate" value={67} color="warning" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

