/**
 * ExposureDetail Component
 * 
 * Comprehensive detail view for a single exposure with:
 * - 5 tabs: Overview, Hazard Assessment, Vulnerability Analysis, Risk Simulation, Peril Exposures
 * - Breadcrumb navigation
 * - Edit mode toggle
 * - Integration touchpoints for related modules
 * - Animated transitions
 * - Responsive layout
 * 
 * Architecture:
 * - Fetches exposure by ID from Redux
 * - Tab state management with Material-UI Tabs
 * - Conditional rendering of integration panels
 * - Action buttons (Edit, Delete, Export)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Redux
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchExposureById,
  deleteExposure,
  selectExposureById,
  selectLoading,
  selectError,
} from '../../../store/slices/exposureSlice';

// Types
import { Exposure } from '../../../types/models';

// Integration Components
import HazardAssessmentPanel from './HazardAssessmentPanel';
import VulnerabilityPanel from './VulnerabilityPanel';
import SimulationPanel from './SimulationPanel';

// ============================================================================
// TAB PANEL COMPONENT
// ============================================================================

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
      id={`exposure-tabpanel-${index}`}
      aria-labelledby={`exposure-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `exposure-tab-${index}`,
    'aria-controls': `exposure-tabpanel-${index}`,
  };
}

// ============================================================================
// OVERVIEW TAB CONTENT
// ============================================================================

interface OverviewTabProps {
  exposure: Exposure;
}

function OverviewTab({ exposure }: OverviewTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'default';
      case 'PENDING': return 'warning';
      case 'EXPIRED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Basic Information */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeIcon color="primary" />
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Exposure ID</Typography>
                <Typography variant="body1" fontWeight={600}>{exposure.exposureId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box>
                  <Chip
                    label={exposure.status}
                    color={getStatusColor(exposure.status) as any}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Account ID</Typography>
                <Typography variant="body1">{exposure.accountId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Policy ID</Typography>
                <Typography variant="body1">{exposure.policyId || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Exposure Type</Typography>
                <Typography variant="body1">{exposure.exposureType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Occupancy Type</Typography>
                <Typography variant="body1">{exposure.occupancyType}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Construction Type</Typography>
                <Typography variant="body1">{exposure.constructionType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Year Built</Typography>
                <Typography variant="body1">{exposure.yearBuilt || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Number of Stories</Typography>
                <Typography variant="body1">{exposure.numberOfStories || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Square Footage</Typography>
                <Typography variant="body1">{exposure.squareFootage ? `${exposure.squareFootage.toLocaleString()} sq ft` : 'N/A'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Location Information */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="primary" />
              Location Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Location ID</Typography>
                <Typography variant="body1">{exposure.locationId || 'N/A'}</Typography>
              </Grid>
              
              {exposure.location && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Latitude</Typography>
                    <Typography variant="body1">{exposure.location.latitude?.toFixed(6)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Longitude</Typography>
                    <Typography variant="body1">{exposure.location.longitude?.toFixed(6)}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Financial Information */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon color="primary" />
              Financial Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Total Insured Value (TIV)</Typography>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {formatCurrency(exposure.totalInsuredValue || 0)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Replacement Value</Typography>
                <Typography variant="body1">{formatCurrency(exposure.replacementValue || 0)}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Metadata */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Metadata
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Created At</Typography>
                <Typography variant="body1">{exposure.createdAt ? formatDate(exposure.createdAt) : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Updated At</Typography>
                <Typography variant="body1">{exposure.updatedAt ? formatDate(exposure.updatedAt) : 'N/A'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// ============================================================================
// INTEGRATION TABS
// ============================================================================

interface HazardAssessmentTabProps {
  exposure: Exposure;
}

function HazardAssessmentTab({ exposure }: HazardAssessmentTabProps) {
  // Check if location data is available
  if (!exposure.location || typeof exposure.location.latitude !== 'number' || typeof exposure.location.longitude !== 'number') {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="warning">
            Location data is required for hazard assessment. Please ensure the exposure has valid latitude and longitude coordinates.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <HazardAssessmentPanel
      latitude={exposure.location.latitude}
      longitude={exposure.location.longitude}
      exposureId={exposure.exposureId}
      bufferKm={50}
    />
  );
}

function VulnerabilityAnalysisTab({ exposure }: { exposure: Exposure }) {
  // Check if location data is available
  if (!exposure.location || typeof exposure.location.latitude !== 'number' || typeof exposure.location.longitude !== 'number') {
    return (
      <Card variant="outlined">
        <CardContent>
          <Alert severity="warning">
            Location data is required for vulnerability analysis. Please ensure the exposure has valid latitude and longitude coordinates.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <VulnerabilityPanel
      latitude={exposure.location.latitude}
      longitude={exposure.location.longitude}
      exposureId={exposure.exposureId}
      constructionType={exposure.constructionType}
      occupancyType={exposure.occupancyType}
    />
  );
}

function RiskSimulationTab({ exposure }: { exposure: Exposure }) {
  // Extract necessary data
  const latitude = exposure.location?.latitude;
  const longitude = exposure.location?.longitude;
  const exposureId = exposure.exposureId || exposure._id;
  const tiv = exposure.totalInsuredValue;

  // Validate location data
  if (!latitude || !longitude) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Location coordinates are required to load simulation data. Please ensure latitude and longitude are set for this exposure.
        </Typography>
      </Alert>
    );
  }

  return (
    <SimulationPanel
      exposureId={exposureId}
      latitude={latitude}
      longitude={longitude}
      tiv={tiv}
    />
  );
}

function PerilExposuresTab({ exposure }: { exposure: Exposure }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Peril Exposures
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {exposure.perilExposures && exposure.perilExposures.length > 0 ? (
          <Grid container spacing={2}>
            {exposure.perilExposures.map((peril, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {peril.peril}
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight={700}>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(peril.exposureAmount || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Deductible: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(peril.deductible || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            No peril exposure data available for this exposure.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ExposureDetailProps {
  exposureId?: string;
}

const ExposureDetail: React.FC<ExposureDetailProps> = ({ exposureId: propExposureId }) => {
  const { id: urlId } = useParams<{ id: string }>();
  const id = propExposureId || urlId;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [currentTab, setCurrentTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const exposure = useAppSelector(state => selectExposureById(state, id || ''));
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  // Fetch exposure on mount
  useEffect(() => {
    if (id) {
      (dispatch as any)(fetchExposureById(id));
    }
  }, [dispatch, id]);

  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleEdit = () => {
    navigate(`/exposures/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await (dispatch as any)(deleteExposure(id)).unwrap();
      toast.success('Exposure deleted successfully');
      navigate('/exposures');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete exposure');
    }
  };

  const handleExport = () => {
    if (!exposure) return;
    
    const dataStr = JSON.stringify(exposure, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exposure-${exposure.exposureId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Exposure data exported');
  };

  // Loading state
  if (loading && !exposure) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && !exposure) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // Not found state
  if (!exposure) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Exposure not found
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/exposures')}
          sx={{ mt: 2 }}
        >
          Back to Exposures
        </Button>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ mb: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Home
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/exposures')}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Exposures
          </Link>
          <Typography variant="body2" color="text.primary">
            {exposure.exposureId}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Exposure Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {exposure.exposureId} • {exposure.exposureType}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Back to list">
              <IconButton onClick={() => navigate('/exposures')}>
                <BackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit exposure">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export exposure">
              <IconButton onClick={handleExport}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete exposure">
              <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          }}
        >
          <Tab label="Overview" icon={<HomeIcon />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="Hazard Assessment" icon={<WarningIcon />} iconPosition="start" {...a11yProps(1)} />
          <Tab label="Vulnerability" icon={<ShieldIcon />} iconPosition="start" {...a11yProps(2)} />
          <Tab label="Simulation" icon={<TrendingUpIcon />} iconPosition="start" {...a11yProps(3)} />
          <Tab label="Peril Exposures" icon={<AssessmentIcon />} iconPosition="start" {...a11yProps(4)} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={currentTab} index={0}>
            <OverviewTab exposure={exposure} />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <HazardAssessmentTab exposure={exposure} />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <VulnerabilityAnalysisTab exposure={exposure} />
          </TabPanel>
          <TabPanel value={currentTab} index={3}>
            <RiskSimulationTab exposure={exposure} />
          </TabPanel>
          <TabPanel value={currentTab} index={4}>
            <PerilExposuresTab exposure={exposure} />
          </TabPanel>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog - will be implemented if needed */}
      {deleteDialogOpen && (
        <Alert severity="warning" onClose={() => setDeleteDialogOpen(false)}>
          Delete confirmation dialog will be implemented with the delete functionality
        </Alert>
      )}
    </motion.div>
  );
};

export default ExposureDetail;
