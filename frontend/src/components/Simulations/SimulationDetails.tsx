import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  Cancel as CancelledIcon,
  Schedule as PendingIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { SimulationRun } from '../../types';

interface SimulationDetailsProps {
  simulation: SimulationRun;
  open: boolean;
  onClose: () => void;
  onViewFullResults?: (simulation: SimulationRun) => void;
}

const SimulationDetails: React.FC<SimulationDetailsProps> = ({ simulation, open, onClose, onViewFullResults }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CompletedIcon color="success" />;
      case 'Running':
        return <PlayIcon color="primary" />;
      case 'Failed':
        return <ErrorIcon color="error" />;
      case 'Cancelled':
        return <CancelledIcon color="warning" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Running':
        return 'primary';
      case 'Failed':
        return 'error';
      case 'Cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                backgroundColor: '#9c27b0',
                width: 48,
                height: 48,
              }}
            >
              <AssessmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {simulation.simulationName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {simulation.simulationRunId}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* Status and Progress */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    Status & Progress
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getStatusIcon(simulation.status)}
                      <Chip
                        label={simulation.status}
                        color={getStatusColor(simulation.status) as any}
                        variant="outlined"
                      />
                    </Box>
                    
                    {simulation.status === 'Running' && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Progress</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {Math.round(simulation.progress || 0)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={simulation.progress || 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#1976d2',
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Start Time"
                        secondary={formatDate(simulation.startTime)}
                      />
                    </ListItem>
                    
                    {simulation.endTime && (
                      <ListItem>
                        <ListItemIcon>
                          <CalendarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="End Time"
                          secondary={formatDate(simulation.endTime)}
                        />
                      </ListItem>
                    )}
                    
                    {simulation.duration && (
                      <ListItem>
                        <ListItemIcon>
                          <TimerIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Duration"
                          secondary={formatDuration(simulation.duration)}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Configuration Summary */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon />
                    Configuration
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Time Period"
                        secondary={`${simulation.configuration.startYear} - ${simulation.configuration.endYear}`}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="Time Horizon"
                        secondary={`${simulation.configuration.timeHorizon} ${simulation.configuration.timeHorizonUnit}`}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="Hazard Types"
                        secondary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {simulation.configuration.hazardTypes.map((hazardType) => (
                              <Chip
                                key={hazardType}
                                label={hazardType}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText
                        primary="Regions"
                        secondary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {simulation.configuration.geographicScope.regions.map((region) => (
                              <Chip
                                key={region}
                                label={region}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Exposure Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon />
                    Exposure Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
                          {formatCurrency(simulation.configuration.exposureScope?.totalExposure || 0, simulation.configuration.exposureScope?.currency || 'USD')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Total Exposure
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                          {formatCurrency(simulation.configuration.exposureScope.categories?.residential || 0, simulation.configuration.exposureScope?.currency || 'USD')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Residential
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                          {formatCurrency(simulation.configuration.exposureScope.categories?.commercial || 0, simulation.configuration.exposureScope?.currency || 'USD')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Commercial
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
                          {formatCurrency(simulation.configuration.exposureScope.categories?.industrial || 0, simulation.configuration.exposureScope?.currency || 'USD')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Industrial
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Modeling Configuration */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon />
                    Modeling Configuration
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
                          {simulation.configuration.modelingConfig.numberOfSimulations.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Simulations
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                          {simulation.configuration.modelingConfig.modelProvider || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Model Provider
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                          {simulation.configuration.modelingConfig.modelType || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Model Type
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
                          {simulation.configuration.modelingConfig.resolution || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Resolution
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Results Preview */}
            {simulation.results && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon />
                      Results Summary
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', mb: 1 }}>
                            {simulation.results?.summary?.totalEvents?.toLocaleString() || '0'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Total Events
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                            {formatCurrency(simulation.results?.summary?.totalLoss || 0, 'USD')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Total Loss
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                            {formatCurrency(simulation.results?.summary?.averageLoss || 0, 'USD')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Average Loss
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
                            {formatCurrency(simulation.results?.summary?.maximumLoss || 0, 'USD')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Maximum Loss
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Close
          </Button>
          {simulation.status === 'Completed' && (
            <Button
              variant="contained"
              onClick={() => onViewFullResults?.(simulation)}
              sx={{ textTransform: 'none' }}
            >
              View Full Results
            </Button>
          )}
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default SimulationDetails;

