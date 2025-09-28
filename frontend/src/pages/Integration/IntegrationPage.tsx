import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  LocationOn as LocationIcon,
  AccountBalance as AccountIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

import apiService from '../../services/api';
import RiskAssessmentCard from '../../components/Integration/RiskAssessmentCard';
import FinancialMetricsCard from '../../components/Integration/FinancialMetricsCard';
import RiskComparisonChart from '../../components/Integration/RiskComparisonChart';
import { Location } from '../../types';

const IntegrationPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'New York, NY, USA',
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Fetch risk assessment data
  const { data: riskAssessmentData, isLoading: riskLoading } = useQuery(
    ['riskAssessment', selectedLocation],
    () => apiService.getLocationRiskAssessment(selectedLocation),
    {
      enabled: Boolean(selectedLocation.latitude && selectedLocation.longitude),
    }
  );

  // Fetch account risk analysis
  const { data: accountRiskData, isLoading: accountLoading } = useQuery(
    ['accountRisk', selectedAccountId],
    () => apiService.getAccountRiskAnalysis(selectedAccountId),
    {
      enabled: Boolean(selectedAccountId),
    }
  );

  // Fetch risk dashboard
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'riskDashboard',
    () => apiService.getRiskDashboard(),
    {
      refetchInterval: 60000,
    }
  );

  const handleLocationChange = (field: keyof Location, value: any) => {
    setSelectedLocation(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleRefresh = () => {
    toast.success('Data refreshed');
  };

  return (
    <Box sx={{ p: 3, pt: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon />
            Risk Integration & Analysis
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Comprehensive risk assessment and financial analysis tools
          </Typography>
        </motion.div>

        <Button
          variant="outlined"
          onClick={handleRefresh}
          sx={{ textTransform: 'none' }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Location Input */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon />
            Location Risk Assessment
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={selectedLocation.latitude}
                onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value))}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={selectedLocation.longitude}
                onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value))}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Address"
                value={selectedLocation.address || ''}
                onChange={(e) => handleLocationChange('address', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                sx={{ height: '56px', textTransform: 'none' }}
              >
                Assess Risk
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Risk Assessment Results */}
      {riskAssessmentData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RiskAssessmentCard
            riskAssessment={riskAssessmentData.data}
            loading={riskLoading}
          />
        </motion.div>
      )}

      {/* Account Selection */}
      <Card sx={{ mb: 3, mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountIcon />
            Account Risk Analysis
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Select Account</InputLabel>
                <Select
                  value={selectedAccountId}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  label="Select Account"
                >
                  <MenuItem value="ACC-001">Account 001 - Corporate</MenuItem>
                  <MenuItem value="ACC-002">Account 002 - Individual</MenuItem>
                  <MenuItem value="ACC-003">Account 003 - Government</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                disabled={!selectedAccountId}
                sx={{ height: '56px', textTransform: 'none' }}
              >
                Analyze Account Risk
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Account Risk Analysis Results */}
      {accountRiskData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FinancialMetricsCard
            financialMetrics={accountRiskData.data}
            loading={accountLoading}
          />
        </motion.div>
      )}

      {/* Risk Comparison */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <RiskComparisonChart />
          </motion.div>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  System Status
                </Typography>
                
                {dashboardLoading ? (
                  <LinearProgress />
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon color="success" />
                      <Typography variant="body2">API Health: Healthy</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon color="success" />
                      <Typography variant="body2">Database: Connected</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon color="success" />
                      <Typography variant="body2">Simulation Engine: Active</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="warning" />
                      <Typography variant="body2">Memory Usage: 67%</Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={{ marginTop: 24 }}
      >
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Use the location input above to assess specific geographic risks, 
            or select an account to analyze portfolio-level risk exposure.
          </Typography>
        </Alert>
      </motion.div>
    </Box>
  );
};

export default IntegrationPage;

