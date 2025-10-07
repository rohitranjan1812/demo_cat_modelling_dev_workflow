/**
 * HazardAssessmentPanel Component
 * 
 * Displays hazard assessment data for a specific exposure location.
 * Integrates with the Hazard module's location analysis API.
 * 
 * Features:
 * - Fetches hazards affecting the exposure location
 * - Displays hazard types, severity levels, and risk scores
 * - Shows geographic risk factors and exposure metrics
 * - Links to full Hazard Assessment page
 * - Real-time data from backend Hazard API
 * - Loading and error states
 * - Responsive card layout
 * 
 * Architecture:
 * - Uses /api/v1/analysis/location endpoint
 * - Receives exposure location coordinates as props
 * - Displays risk metrics and hazard summary
 * - Provides navigation to detailed hazard view
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  LinearProgress,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

interface HazardAssessmentPanelProps {
  latitude: number;
  longitude: number;
  exposureId: string;
  bufferKm?: number;
}

interface HazardData {
  hazardId: string;
  hazardName: string;
  hazardType: string;
  severity: string;
  probability: number;
  status: string;
}

interface RiskMetrics {
  totalHazards: number;
  totalEvents: number;
  totalZones: number;
  maxSeverity: string;
  avgProbability: number;
  totalEconomicImpact: number;
  totalCasualties: number;
}

interface LocationAnalysisResponse {
  success: boolean;
  data: {
    location: {
      latitude: number;
      longitude: number;
      bufferKm: number;
    };
    hazards: HazardData[];
    events: any[];
    zones: any[];
    riskMetrics: RiskMetrics;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSeverityColor = (severity: string): 'default' | 'info' | 'warning' | 'error' => {
  switch (severity) {
    case 'Minor': return 'info';
    case 'Moderate': return 'info';
    case 'Major': return 'warning';
    case 'Severe': return 'warning';
    case 'Catastrophic': return 'error';
    case 'Extreme': return 'error';
    default: return 'default';
  }
};

const getRiskLevelColor = (level: string): 'success' | 'info' | 'warning' | 'error' => {
  switch (level) {
    case 'Very Low': return 'success';
    case 'Low': return 'success';
    case 'Medium': return 'info';
    case 'High': return 'warning';
    case 'Very High': return 'error';
    default: return 'info';
  }
};

const getRiskLevel = (avgProbability: number, maxSeverity: string): string => {
  const severityScore = {
    'Minor': 1,
    'Moderate': 2,
    'Major': 3,
    'Severe': 4,
    'Catastrophic': 5,
    'Extreme': 6,
  }[maxSeverity] || 0;

  const riskScore = avgProbability * severityScore;

  if (riskScore >= 4) return 'Very High';
  if (riskScore >= 3) return 'High';
  if (riskScore >= 2) return 'Medium';
  if (riskScore >= 1) return 'Low';
  return 'Very Low';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HazardAssessmentPanel: React.FC<HazardAssessmentPanelProps> = ({
  latitude,
  longitude,
  exposureId,
  bufferKm = 50,
}) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<LocationAnalysisResponse['data'] | null>(null);

  // Fetch hazard analysis data
  const fetchHazardAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<LocationAnalysisResponse>(
        `${process.env.REACT_APP_API_BASE_URL || '/api/v1'}/analysis/location`,
        {
          params: {
            latitude,
            longitude,
            bufferKm,
          },
        }
      );

      if (response.data.success) {
        setAnalysisData(response.data.data);
      } else {
        setError('Failed to fetch hazard analysis');
      }
    } catch (err: any) {
      console.error('Error fetching hazard analysis:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch hazard analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchHazardAnalysis();
    }
  }, [latitude, longitude, bufferKm]);

  // Loading state
  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading hazard assessment...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert 
            severity="error"
            action={
              <Button size="small" onClick={fetchHazardAnalysis} startIcon={<RefreshIcon />}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!analysisData) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="info">
            No hazard assessment data available for this location.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { hazards, riskMetrics, location } = analysisData;
  const riskLevel = getRiskLevel(riskMetrics.avgProbability, riskMetrics.maxSeverity);

  return (
    <Box>
      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Hazard Assessment
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton size="small" onClick={fetchHazardAnalysis}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            onClick={() => navigate('/hazards')}
            sx={{ textTransform: 'none' }}
          >
            View Full Analysis
          </Button>
        </Box>
      </Box>

      {/* Risk Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">Risk Level</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={riskLevel}
                  color={getRiskLevelColor(riskLevel)}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Hazards</Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {riskMetrics.totalHazards}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">Max Severity</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={riskMetrics.maxSeverity}
                  color={getSeverityColor(riskMetrics.maxSeverity)}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary">Avg Probability</Typography>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={riskMetrics.avgProbability * 100}
                  sx={{ flex: 1, height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {(riskMetrics.avgProbability * 100).toFixed(0)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Location Info */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon fontSize="small" color="action" />
            Analysis Location
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Latitude</Typography>
              <Typography variant="body2" fontWeight={600}>{location.latitude.toFixed(6)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Longitude</Typography>
              <Typography variant="body2" fontWeight={600}>{location.longitude.toFixed(6)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">Buffer Radius</Typography>
              <Typography variant="body2" fontWeight={600}>{location.bufferKm} km</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Hazards List */}
      {hazards.length > 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Identified Hazards ({hazards.length})
            </Typography>
            <Divider sx={{ my: 1 }} />
            <List dense>
              {hazards.slice(0, 5).map((hazard, index) => (
                <ListItem
                  key={hazard.hazardId || index}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'grey.50',
                  }}
                >
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {hazard.hazardName || 'Unnamed Hazard'}
                        </Typography>
                        <Chip
                          label={hazard.hazardType}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={hazard.severity}
                          size="small"
                          color={getSeverityColor(hazard.severity)}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Probability: {(hazard.probability * 100).toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: {hazard.status}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            {hazards.length > 5 && (
              <Button
                fullWidth
                size="small"
                onClick={() => navigate('/hazards')}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                View All {hazards.length} Hazards
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert severity="success" icon={<InfoIcon />}>
          No active hazards detected within {location.bufferKm} km of this exposure location.
        </Alert>
      )}

      {/* Additional Metrics */}
      {(riskMetrics.totalEvents > 0 || riskMetrics.totalZones > 0) && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {riskMetrics.totalEvents > 0 && (
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Active Events</Typography>
                  <Typography variant="h5" color="warning.main" fontWeight={700}>
                    {riskMetrics.totalEvents}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ongoing hazard events in the area
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {riskMetrics.totalZones > 0 && (
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Hazard Zones</Typography>
                  <Typography variant="h5" color="info.main" fontWeight={700}>
                    {riskMetrics.totalZones}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Designated hazard zones containing this location
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default HazardAssessmentPanel;
