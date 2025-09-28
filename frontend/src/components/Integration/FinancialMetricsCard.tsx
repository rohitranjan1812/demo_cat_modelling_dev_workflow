import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { FinancialMetrics } from '../../types';

interface FinancialMetricsCardProps {
  financialMetrics: FinancialMetrics;
  loading: boolean;
}

const FinancialMetricsCard: React.FC<FinancialMetricsCardProps> = ({ financialMetrics, loading }) => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskLevelColor = (value: number, maxValue: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return '#d32f2f';
    if (percentage >= 60) return '#f44336';
    if (percentage >= 40) return '#ff9800';
    if (percentage >= 20) return '#4caf50';
    return '#8bc34a';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading financial metrics...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{ mb: 3, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <MoneyIcon />
            Financial Risk Metrics
          </Typography>

          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  Key Financial Metrics
                </Typography>
                
                <List dense>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      <MoneyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Exposure"
                      secondary={formatCurrency(financialMetrics.totalExposure, financialMetrics.currency)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'h6', color: '#1976d2' }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      <TrendingUpIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Expected Loss"
                      secondary={formatCurrency(financialMetrics.expectedLoss, financialMetrics.currency)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'h6', color: '#ff9800' }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      <WarningIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Probable Maximum Loss"
                      secondary={formatCurrency(financialMetrics.probableMaximumLoss, financialMetrics.currency)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'h6', color: '#f44336' }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Average Annual Loss"
                      secondary={formatCurrency(financialMetrics.averageAnnualLoss, financialMetrics.currency)}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'h6', color: '#4caf50' }}
                    />
                  </ListItem>
                </List>
              </Box>
            </Grid>

            {/* Risk Visualization */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Risk Visualization
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Expected Loss vs Total Exposure</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {((financialMetrics.expectedLoss / financialMetrics.totalExposure) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(financialMetrics.expectedLoss / financialMetrics.totalExposure) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskLevelColor(financialMetrics.expectedLoss, financialMetrics.totalExposure),
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">PML vs Total Exposure</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {((financialMetrics.probableMaximumLoss / financialMetrics.totalExposure) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(financialMetrics.probableMaximumLoss / financialMetrics.totalExposure) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskLevelColor(financialMetrics.probableMaximumLoss, financialMetrics.totalExposure),
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">AAL vs Total Exposure</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {((financialMetrics.averageAnnualLoss / financialMetrics.totalExposure) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(financialMetrics.averageAnnualLoss / financialMetrics.totalExposure) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskLevelColor(financialMetrics.averageAnnualLoss, financialMetrics.totalExposure),
                      },
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Return Periods */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="primary" />
                  Return Periods
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.entries(financialMetrics.returnPeriods).map(([period, value]) => (
                    <Grid item xs={12} sm={6} md={2} key={period}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
                          {formatCurrency(value, financialMetrics.currency)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {period}-Year Return
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Last Updated */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Last Updated: {new Date(financialMetrics.lastUpdated).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FinancialMetricsCard;

