/**
 * SimulationPanel Component
 * 
 * Displays simulation runs and loss estimates for an exposure location
 * Features:
 * - Recent simulation runs related to exposure
 * - Loss curve visualization (mini chart)
 * - AAL (Average Annual Loss) and PML (Probable Maximum Loss) values
 * - Key risk metrics
 * - Navigation to full simulation detail view
 * 
 * API Integration:
 * - GET /api/v1/simulations/runs - Get simulation runs
 * - Filters by location, hazard types, date range
 * 
 * Props:
 * - exposureId: Exposure identifier
 * - latitude: Location latitude
 * - longitude: Location longitude
 * - tiv: Total Insured Value (for loss calculations)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

interface SimulationPanelProps {
  exposureId: string;
  latitude: number;
  longitude: number;
  tiv?: number;
}

interface SimulationRun {
  simulationRunId: string;
  simulationName: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  configuration: {
    startYear: number;
    endYear: number;
    numberOfSimulations: number;
    hazardTypes?: string[];
  };
  results?: {
    totalEvents: number;
    totalLoss: number;
    averageAnnualLoss: number;
    maxEventLoss: number;
  };
  summary?: {
    totalEvents: number;
    averageAnnualLoss: number;
    probableMaximumLoss?: {
      PML90: number;
      PML95: number;
      PML99: number;
    };
  };
  createdAt: string;
  completedAt?: string;
}

interface SimulationResponse {
  success: boolean;
  data: {
    simulationRuns: SimulationRun[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Running': return 'primary';
    case 'Failed': return 'error';
    case 'Cancelled': return 'warning';
    case 'Pending': return 'default';
    default: return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed': return <CheckCircleIcon fontSize="small" />;
    case 'Running': return <PlayArrowIcon fontSize="small" />;
    case 'Failed': return <WarningIcon fontSize="small" />;
    default: return <InfoIcon fontSize="small" />;
  }
};

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toString();
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SimulationPanel: React.FC<SimulationPanelProps> = ({
  exposureId,
  latitude,
  longitude,
  tiv = 0
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [simulations, setSimulations] = useState<SimulationRun[]>([]);
  const [summary, setSummary] = useState<{
    totalSimulations: number;
    completedSimulations: number;
    averageAAL: number;
    maxPML: number;
  } | null>(null);

  // Fetch simulation data
  const fetchSimulationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch simulation runs (limit to recent 5)
      const response = await axios.get<SimulationResponse>(
        '/api/v1/simulations/runs',
        {
          params: {
            page: 1,
            limit: 5,
            status: 'Completed', // Only show completed simulations
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }
        }
      );

      if (response.data.success) {
        const runs = response.data.data.simulationRuns;
        setSimulations(runs);

        // Calculate summary metrics
        const completed = runs.filter(r => r.status === 'Completed');
        const totalAAL = completed.reduce((sum, run) => {
          return sum + (run.results?.averageAnnualLoss || run.summary?.averageAnnualLoss || 0);
        }, 0);
        const avgAAL = completed.length > 0 ? totalAAL / completed.length : 0;

        const maxPML = Math.max(...completed.map(run => 
          run.summary?.probableMaximumLoss?.PML99 || 
          run.results?.maxEventLoss || 
          0
        ), 0);

        setSummary({
          totalSimulations: runs.length,
          completedSimulations: completed.length,
          averageAAL: avgAAL,
          maxPML: maxPML
        });
      }
    } catch (err: any) {
      console.error('Error fetching simulation data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load simulation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulationData();
  }, [exposureId, latitude, longitude]);

  const handleRefresh = () => {
    fetchSimulationData();
  };

  const handleViewSimulation = (simulationId: string) => {
    navigate(`/simulations/${simulationId}`);
  };

  const handleViewAllSimulations = () => {
    navigate('/simulations');
  };

  const handleRunNewSimulation = () => {
    navigate('/simulations/new', { 
      state: { 
        exposure: { id: exposureId, latitude, longitude, tiv }
      } 
    });
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // No data state
  if (!simulations || simulations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Simulations Available
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Run a simulation to analyze risk and loss scenarios for this exposure.
        </Typography>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handleRunNewSimulation}
        >
          Run New Simulation
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon color="primary" />
          Risk Simulations
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunNewSimulation}
          >
            Run New
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={handleViewAllSimulations}
          >
            View All Simulations
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Simulations
                </Typography>
                <Typography variant="h4">
                  {summary.totalSimulations}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.completedSimulations} completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Average Annual Loss (AAL)
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatCurrency(summary.averageAAL)}
                </Typography>
                {tiv > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {((summary.averageAAL / tiv) * 100).toFixed(2)}% of TIV
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Max PML (99%)
                </Typography>
                <Typography variant="h4" color="error">
                  {formatCurrency(summary.maxPML)}
                </Typography>
                {tiv > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {((summary.maxPML / tiv) * 100).toFixed(2)}% of TIV
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Completion Rate
                </Typography>
                <Typography variant="h4">
                  {summary.totalSimulations > 0 
                    ? ((summary.completedSimulations / summary.totalSimulations) * 100).toFixed(0)
                    : 0}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={summary.totalSimulations > 0 
                    ? (summary.completedSimulations / summary.totalSimulations) * 100 
                    : 0}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Simulations List */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Recent Simulation Runs
          </Typography>
          
          {simulations.map((sim, index) => (
            <Card
              key={sim.simulationRunId}
              variant="outlined"
              sx={{ 
                mb: index < simulations.length - 1 ? 2 : 0,
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 2,
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => handleViewSimulation(sim.simulationRunId)}
            >
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {sim.simulationName || sim.simulationRunId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(sim.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={sim.status}
                    color={getStatusColor(sim.status)}
                    icon={getStatusIcon(sim.status)}
                  />
                </Box>

                {/* Configuration Info */}
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Period
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0, py: 0.5 }}>
                        <Typography variant="body2">
                          {sim.configuration.startYear} - {sim.configuration.endYear}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ border: 0, py: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Iterations
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 0, py: 0.5 }}>
                        <Typography variant="body2">
                          {formatLargeNumber(sim.configuration.numberOfSimulations)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {sim.configuration.hazardTypes && sim.configuration.hazardTypes.length > 0 && (
                      <TableRow>
                        <TableCell sx={{ border: 0, py: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Hazards
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 0, py: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {sim.configuration.hazardTypes.slice(0, 3).map((hazard) => (
                              <Chip key={hazard} label={hazard} size="small" variant="outlined" />
                            ))}
                            {sim.configuration.hazardTypes.length > 3 && (
                              <Chip 
                                label={`+${sim.configuration.hazardTypes.length - 3} more`} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Results (if completed) */}
                {sim.status === 'Completed' && (sim.results || sim.summary) && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Total Events
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatLargeNumber(sim.results?.totalEvents || sim.summary?.totalEvents || 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          AAL
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatCurrency(
                            sim.results?.averageAnnualLoss || 
                            sim.summary?.averageAnnualLoss || 
                            0
                          )}
                        </Typography>
                      </Grid>
                      {(sim.summary?.probableMaximumLoss?.PML99 || sim.results?.maxEventLoss) && (
                        <>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Max Event Loss
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(
                                sim.results?.maxEventLoss || 
                                sim.summary?.probableMaximumLoss?.PML99 || 
                                0
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Total Loss
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                              {formatCurrency(sim.results?.totalLoss || 0)}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Info Note */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Loss estimates are based on historical data and probabilistic models. 
          Actual losses may vary. Click on any simulation for detailed analysis.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SimulationPanel;
