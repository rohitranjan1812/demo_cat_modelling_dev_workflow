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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { Hazard } from '../../types';

interface HazardDetailsProps {
  hazard: Hazard;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const HazardDetails: React.FC<HazardDetailsProps> = ({ hazard, open, onClose, onEdit }) => {
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'Minor': '#4caf50',
      'Moderate': '#ff9800',
      'Major': '#ff5722',
      'Severe': '#f44336',
      'Catastrophic': '#d32f2f',
      'Extreme': '#b71c1c',
    };
    return colors[severity] || '#9e9e9e';
  };

  const getHazardTypeColor = (hazardType: string) => {
    const colors: Record<string, string> = {
      'Earthquake': '#f44336',
      'Hurricane': '#ff9800',
      'Flood': '#2196f3',
      'Wildfire': '#ff5722',
      'Tornado': '#9c27b0',
      'Tsunami': '#00bcd4',
    };
    return colors[hazardType] || '#9e9e9e';
  };

  const getHazardTypeIcon = (hazardType: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Earthquake': <WarningIcon />,
      'Hurricane': <TrendingUpIcon />,
      'Flood': <LocationIcon />,
      'Wildfire': <WarningIcon />,
      'Tornado': <TrendingUpIcon />,
      'Tsunami': <LocationIcon />,
    };
    return icons[hazardType] || <WarningIcon />;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
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
                backgroundColor: getHazardTypeColor(hazard.hazardType),
                width: 48,
                height: 48,
              }}
            >
              {getHazardTypeIcon(hazard.hazardType)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {hazard.hazardName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {hazard.hazardId}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon />
                    Basic Information
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Hazard Type"
                        secondary={
                          <Chip
                            label={hazard.hazardType}
                            size="small"
                            sx={{
                              backgroundColor: `${getHazardTypeColor(hazard.hazardType)}15`,
                              color: getHazardTypeColor(hazard.hazardType),
                              fontWeight: 600,
                            }}
                          />
                        }
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Category"
                        secondary={hazard.hazardCategory}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Severity"
                        secondary={
                          <Chip
                            label={hazard.severity}
                            size="small"
                            sx={{
                              backgroundColor: `${getSeverityColor(hazard.severity)}15`,
                              color: getSeverityColor(hazard.severity),
                              fontWeight: 600,
                            }}
                          />
                        }
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={hazard.status}
                            size="small"
                            color={hazard.status === 'Active' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        }
                      />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {hazard.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Risk Assessment */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    Risk Assessment
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Probability</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {(hazard.probability * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={hazard.probability * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getSeverityColor(hazard.severity),
                        },
                      }}
                    />
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Affected Regions"
                        secondary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {hazard.affectedRegions.map((region) => (
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
                    
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Affected Countries"
                        secondary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {hazard.affectedCountries.map((country) => (
                              <Chip
                                key={country}
                                label={country}
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

            {/* Impact Metrics */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon />
                    Impact Metrics
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', mb: 1 }}>
                          {formatCurrency(hazard.impactMetrics.potentialLoss, hazard.impactMetrics.currency)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Potential Loss
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                          {hazard.impactMetrics.affectedPopulation.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Affected Population
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 2 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                          {formatCurrency(hazard.impactMetrics.economicImpact, hazard.impactMetrics.currency)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Economic Impact
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Metadata */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon />
                    Metadata
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Created"
                            secondary={formatDate(hazard.createdAt)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Last Updated"
                            secondary={formatDate(hazard.updatedAt)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Source"
                            secondary={hazard.metadata.source}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Version"
                            secondary={hazard.metadata.version}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Historical Event"
                            secondary={hazard.isHistorical ? 'Yes' : 'No'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Simulated Event"
                            secondary={hazard.isSimulated ? 'Yes' : 'No'}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                  
                  {hazard.metadata.tags.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {hazard.metadata.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Close
          </Button>
          <Button
            onClick={onEdit}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Edit Hazard
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default HazardDetails;

