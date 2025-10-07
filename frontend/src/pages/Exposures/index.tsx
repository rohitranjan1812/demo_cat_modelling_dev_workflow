/**
 * Exposures Page - Main Entry Point
 * 
 * Architecture:
 * - List view with DataGrid (ExposureList)
 * - Advanced filtering (ExposureFilters)
 * - Detail view with integrated tabs (ExposureDetail)
 * - Create form (ExposureCreate)
 * - Full Redux integration for state management
 * 
 * Integration Touchpoints:
 * - Hazard Assessment (shows hazards affecting exposure)
 * - Vulnerability Analysis (vulnerability scores and factors)
 * - Risk Simulation (simulation results and quick assessment)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Redux
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchExposures,
  selectLoading,
  selectError,
  selectPagination,
  selectFilters,
  clearError,
} from '../../store/slices/exposureSlice';

// Components
import ExposureList from './components/ExposureList';
import ExposureFilters from './components/ExposureFilters';
import ExposureDetail from './components/ExposureDetail';
import ExposureCreate from './components/ExposureCreate';

const ExposuresPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const pagination = useAppSelector(selectPagination);
  const filters = useAppSelector(selectFilters);

  // Local state
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedExposureId, setSelectedExposureId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch exposures on mount
  useEffect(() => {
    (dispatch as any)(fetchExposures({ 
      ...filters, 
      page: pagination.page, 
      limit: pagination.limit 
    }));
  }, [dispatch, pagination.page, pagination.limit, filters]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handlers
  const handleCreateNew = () => {
    setView('create');
  };

  const handleViewDetail = (exposureId: string) => {
    setSelectedExposureId(exposureId);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedExposureId(null);
    setView('list');
  };

  const handleFilterToggle = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleRefresh = () => {
    (dispatch as any)(fetchExposures({ 
      ...filters, 
      page: pagination.page, 
      limit: pagination.limit 
    }));
    toast.success('Data refreshed');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 10, pb: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              <HomeIcon sx={{ fontSize: 20 }} />
              Dashboard
            </Link>
            {view === 'detail' && (
              <Link
                component="button"
                variant="body2"
                onClick={handleBackToList}
                sx={{ 
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Exposures
              </Link>
            )}
            <Typography variant="body2" color="text.primary">
              {view === 'list' && 'Exposures'}
              {view === 'detail' && 'Exposure Detail'}
              {view === 'create' && 'Create New Exposure'}
            </Typography>
          </Breadcrumbs>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {view === 'list' && 'Exposure Management'}
                    {view === 'detail' && 'Exposure Details'}
                    {view === 'create' && 'Create New Exposure'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {view === 'list' && `${pagination.total} exposures • ${pagination.pages} pages`}
                    {view === 'detail' && 'View comprehensive risk analysis'}
                    {view === 'create' && 'Add new exposure with location and asset details'}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {view === 'list' && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleFilterToggle}
                      sx={{ textTransform: 'none' }}
                    >
                      {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleRefresh}
                      disabled={loading}
                      sx={{ textTransform: 'none' }}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateNew}
                      sx={{ textTransform: 'none' }}
                    >
                      Create Exposure
                    </Button>
                  </>
                )}
                {(view === 'detail' || view === 'create') && (
                  <Button
                    variant="outlined"
                    onClick={handleBackToList}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to List
                  </Button>
                )}
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {view === 'list' && (
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {/* Filters Section */}
              {filtersOpen && (
                <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <ExposureFilters />
                </Box>
              )}

              {/* List Section */}
              <Box>
                <ExposureList 
                  onViewDetail={handleViewDetail}
                  onEdit={(id) => {
                    setSelectedExposureId(id);
                    setView('detail');
                  }}
                />
              </Box>
            </Paper>
          )}

          {view === 'detail' && selectedExposureId && (
            <ExposureDetail exposureId={selectedExposureId} />
          )}

          {view === 'create' && (
            <ExposureCreate />
          )}
        </motion.div>

        {/* Stats Footer */}
        {view === 'list' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Exposures
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {pagination.total}
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Current Page
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {pagination.page} / {pagination.pages}
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Items per Page
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {pagination.limit}
                </Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Active Filters
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: filters && Object.keys(filters).length > 0 ? 'secondary.main' : 'text.primary' }}>
                  {filters ? Object.keys(filters).length : 0}
                </Typography>
              </Paper>
            </Box>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default ExposuresPage;
