import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';

import apiService from '../../services/api';

const RiskOverview: React.FC = () => {
  const { data: riskData, isLoading } = useQuery(
    'riskOverview',
    () => apiService.getRiskDashboard(),
    {
      refetchInterval: 60000,
    }
  );

  const riskMetrics = [
    {
      title: 'High Risk Locations',
      value: riskData?.data?.highRiskLocations || 0,
      total: riskData?.data?.totalLocations || 0,
      color: '#f44336',
      icon: <WarningIcon />,
    },
    {
      title: 'Critical Vulnerabilities',
      value: riskData?.data?.criticalVulnerabilities || 0,
      total: riskData?.data?.totalVulnerabilities || 0,
      color: '#ff9800',
      icon: <SecurityIcon />,
    },
    {
      title: 'Active Hazards',
      value: riskData?.data?.activeHazards || 0,
      total: riskData?.data?.totalHazards || 0,
      color: '#9c27b0',
      icon: <AssessmentIcon />,
    },
  ];

  const riskTrends = [
    {
      region: 'North America',
      riskLevel: 'High',
      change: '+5%',
      changeType: 'increase' as const,
      color: '#f44336',
    },
    {
      region: 'Europe',
      riskLevel: 'Medium',
      change: '-2%',
      changeType: 'decrease' as const,
      color: '#ff9800',
    },
    {
      region: 'Asia Pacific',
      riskLevel: 'Very High',
      change: '+8%',
      changeType: 'increase' as const,
      color: '#d32f2f',
    },
    {
      region: 'Latin America',
      riskLevel: 'Medium',
      change: '+1%',
      changeType: 'increase' as const,
      color: '#ff9800',
    },
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Very High':
        return '#d32f2f';
      case 'High':
        return '#f44336';
      case 'Medium':
        return '#ff9800';
      case 'Low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  return (
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
          sx={{
            mb: 3,
            fontWeight: 600,
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <TrendingUpIcon />
          Risk Overview
        </Typography>

        {isLoading ? (
          <Box sx={{ py: 4 }}>
            <LinearProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Risk Metrics */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Risk Metrics
              </Typography>
              <Grid container spacing={2}>
                {riskMetrics.map((metric, index) => (
                  <Grid item xs={12} sm={4} key={metric.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: `${metric.color}05`,
                          border: `1px solid ${metric.color}20`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: 1,
                              backgroundColor: metric.color,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {metric.icon}
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {metric.title}
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: metric.color, mb: 1 }}>
                          {metric.value}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(metric.value / metric.total) * 100}
                            sx={{
                              flexGrow: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: `${metric.color}20`,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: metric.color,
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            of {metric.total}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Regional Risk Trends */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Regional Trends
              </Typography>
              <List sx={{ p: 0 }}>
                {riskTrends.map((trend, index) => (
                  <motion.div
                    key={trend.region}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <LocationIcon sx={{ color: getRiskLevelColor(trend.riskLevel) }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {trend.region}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={trend.riskLevel}
                                size="small"
                                sx={{
                                  backgroundColor: `${getRiskLevelColor(trend.riskLevel)}15`,
                                  color: getRiskLevelColor(trend.riskLevel),
                                  fontWeight: 600,
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: trend.changeType === 'increase' ? '#f44336' : '#4caf50',
                                  fontWeight: 600,
                                }}
                              >
                                {trend.change}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < riskTrends.length - 1 && <Divider sx={{ my: 0.5 }} />}
                  </motion.div>
                ))}
              </List>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskOverview;

