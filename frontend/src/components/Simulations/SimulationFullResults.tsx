import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { SimulationRun, SimulationResults, SimulationEvent } from '../../types';
import apiService from '../../services/api';

interface SimulationFullResultsProps {
  simulation: SimulationRun;
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simulation-tabpanel-${index}`}
      aria-labelledby={`simulation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SimulationFullResults: React.FC<SimulationFullResultsProps> = ({ simulation, open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && simulation.status === 'Completed') {
      loadFullResults();
    }
  }, [open, simulation]);

  const loadFullResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load detailed results
      const resultsResponse = await apiService.getSimulationResults(simulation.simulationRunId);
      console.log('Results response:', resultsResponse);
      if (resultsResponse.success && resultsResponse.data) {
        setResults(resultsResponse.data);
      }

      // Load simulation events
      const eventsResponse = await apiService.getSimulationEvents(simulation.simulationRunId);
      console.log('Events response:', eventsResponse);
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }
    } catch (err: any) {
      console.error('Error loading full results:', err);
      // If there's an error, still show the basic results from the simulation object
      if (simulation.results) {
        setResults(simulation.results);
      }
      setError('Some data could not be loaded, showing available information');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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

  const tabs = [
    { label: 'Summary', value: 0 },
    { label: 'Events', value: 1 },
    { label: 'Statistics', value: 2 },
    { label: 'Charts', value: 3 },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon color="primary" />
              <Box>
                <Typography variant="h5" component="div">
                  Full Simulation Results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {simulation.simulationName} - {simulation.simulationRunId}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={onClose}
              size="small"
              startIcon={<CloseIcon />}
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading full results...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  {tabs.map((tab) => (
                    <Tab key={tab.value} label={tab.label} />
                  ))}
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                {/* Summary Tab */}
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon />
                          Financial Summary
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(244, 67, 54, 0.04)', borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', mb: 1 }}>
                                {formatCurrency(results?.summary?.totalLoss || 0)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Total Loss
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(76, 175, 80, 0.04)', borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                                {formatCurrency(results?.summary?.averageLoss || 0)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Average Loss
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(156, 39, 176, 0.04)', borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
                                {formatCurrency(results?.summary?.maximumLoss || 0)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Maximum Loss
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(33, 150, 243, 0.04)', borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3', mb: 1 }}>
                                {results?.summary?.totalEvents?.toLocaleString() || '0'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Total Events
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {/* Events Tab */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Simulation Events ({events.length})
                    </Typography>
                    
                    {events.length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 2
                      }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          No individual events recorded for this simulation.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This simulation used aggregate modeling approach. Check the Summary tab for overall results.
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Event ID</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Loss</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {events.map((event, index) => (
                              <TableRow key={event.eventId || index}>
                                <TableCell>{event.eventId || `EVT-${index + 1}`}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={event.hazardType || 'Unknown'} 
                                    size="small" 
                                    color="primary" 
                                  />
                                </TableCell>
                                <TableCell>{formatDate(new Date(event.eventYear, event.eventMonth - 1, event.eventDay).toISOString())}</TableCell>
                                <TableCell>
                                  {event.affectedArea?.coordinates ? 
                                    `Area: ${event.affectedArea.type}` : 
                                    'N/A'
                                  }
                                </TableCell>
                                <TableCell>{formatCurrency(event.financialImpact?.totalLoss || 0)}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={event.severity || 'Unknown'} 
                                    size="small" 
                                    color={event.severity === 'Major' ? 'success' : 'default'} 
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                {/* Statistics Tab */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Risk Metrics
                        </Typography>
                        <Box sx={{ space: 2 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Value at Risk (95%)
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(results?.summary?.returnPeriods?.['100'] || 0)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Expected Loss
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(results?.summary?.averageLoss || 0)}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Maximum Loss
                            </Typography>
                            <Typography variant="h6">
                              {formatCurrency(results?.summary?.maximumLoss || 0)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Simulation Statistics
                        </Typography>
                        <Box sx={{ space: 2 }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total Events
                            </Typography>
                            <Typography variant="h6">
                              {results?.summary?.totalEvents?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Hazard Types
                            </Typography>
                            <Typography variant="h6">
                              {results?.statistics?.byHazardType ? Object.keys(results.statistics.byHazardType).length : 0}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Severity Levels
                            </Typography>
                            <Typography variant="h6">
                              {results?.statistics?.bySeverity ? Object.keys(results.statistics.bySeverity).length : 0}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                {/* Charts Tab */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Visualization Charts
                    </Typography>
                    <Box sx={{ 
                      height: 400, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      border: '2px dashed #ccc'
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        Charts and visualizations will be implemented here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>
            </>
          )}
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default SimulationFullResults;
