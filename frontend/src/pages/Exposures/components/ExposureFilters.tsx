/**
 * ExposureFilters Component
 * 
 * Advanced filtering panel for exposures with:
 * - 8 filter types (exposureType, occupancyType, constructionType, value range, IDs, status)
 * - Material-UI form controls (Select, TextField, Autocomplete)
 * - Redux integration for filter state management
 * - Clear and Apply actions
 * - Responsive grid layout
 * - Type-safe with enum values
 * 
 * Architecture:
 * - Connects to Redux exposureSlice for filter state
 * - Dispatches setFilters and clearFilters actions
 * - Triggers fetchExposures on Apply
 * - Uses enums from types/models for dropdown options
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

// Redux
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setFilters,
  clearFilters,
  fetchExposures,
  selectFilters,
  selectPagination,
} from '../../../store/slices/exposureSlice';

// Types
import {
  ExposureType,
  OccupancyType,
  ConstructionType,
  ExposureStatus,
  type ExposureQueryParams,
} from '../../../types/models';

const ExposureFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const currentFilters = useAppSelector(selectFilters);
  const pagination = useAppSelector(selectPagination);

  // Local state for form
  const [formFilters, setFormFilters] = useState<ExposureQueryParams>({});

  // Sync with Redux state on mount
  useEffect(() => {
    if (currentFilters) {
      setFormFilters(currentFilters);
    }
  }, [currentFilters]);

  // Exposure Type options (union types, not enums)
  const exposureTypes: ExposureType[] = [
    'Property',
    'Casualty',
    'Liability',
    'Marine',
    'Aviation',
    'Cyber'
  ];
  
  // Occupancy Type options
  const occupancyTypes: OccupancyType[] = [
    'Residential',
    'Commercial',
    'Industrial',
    'Mixed Use',
    'Institutional',
    'Agricultural'
  ];
  
  // Construction Type options
  const constructionTypes: ConstructionType[] = [
    'Wood',
    'Concrete',
    'Steel',
    'Masonry',
    'Mixed'
  ];
  
  // Status options
  const statusOptions: ExposureStatus[] = [
    'Active',
    'Inactive',
    'Expired',
    'Under Review',
    'Pending'
  ];

  // Handlers
  const handleFilterChange = (field: keyof ExposureQueryParams, value: any) => {
    setFormFilters(prev => ({
      ...prev,
      [field]: value || undefined, // Remove field if empty
    }));
  };

  const handleApply = () => {
    // Clean up empty values
    const cleanedFilters: ExposureQueryParams = {};
    Object.entries(formFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanedFilters[key as keyof ExposureQueryParams] = value;
      }
    });

    // Dispatch to Redux
    dispatch(setFilters(cleanedFilters));
    
    // Fetch with new filters (reset to page 1)
    (dispatch as any)(fetchExposures({
      ...cleanedFilters,
      page: 1,
      limit: pagination.limit,
    }));

    const filterCount = Object.keys(cleanedFilters).length;
    toast.success(`Applied ${filterCount} filter(s)`);
  };

  const handleClear = () => {
    setFormFilters({});
    dispatch(clearFilters());
    (dispatch as any)(fetchExposures({
      page: 1,
      limit: pagination.limit,
    }));
    toast.success('Filters cleared');
  };

  const activeFilterCount = currentFilters ? Object.keys(currentFilters).length : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Filter Exposures
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} active`}
              size="small"
              color="primary"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={activeFilterCount === 0}
            sx={{ textTransform: 'none' }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<SearchIcon />}
            onClick={handleApply}
            sx={{ textTransform: 'none' }}
          >
            Apply
          </Button>
        </Box>
      </Box>

      {/* Filter Form */}
      <Grid container spacing={2}>
        {/* Exposure Type */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Exposure Type</InputLabel>
            <Select
              value={formFilters.exposureType || ''}
              label="Exposure Type"
              onChange={(e) => handleFilterChange('exposureType', e.target.value)}
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              {exposureTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Occupancy Type */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Occupancy Type</InputLabel>
            <Select
              value={formFilters.occupancyType || ''}
              label="Occupancy Type"
              onChange={(e) => handleFilterChange('occupancyType', e.target.value)}
            >
              <MenuItem value="">
                <em>All Occupancies</em>
              </MenuItem>
              {occupancyTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Construction Type */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Construction Type</InputLabel>
            <Select
              value={formFilters.constructionType || ''}
              label="Construction Type"
              onChange={(e) => handleFilterChange('constructionType', e.target.value)}
            >
              <MenuItem value="">
                <em>All Construction</em>
              </MenuItem>
              {constructionTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={formFilters.status || ''}
              label="Status"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Min Value */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Min Value"
            type="number"
            value={formFilters.minValue || ''}
            onChange={(e) => handleFilterChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            placeholder="0"
          />
        </Grid>

        {/* Max Value */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Max Value"
            type="number"
            value={formFilters.maxValue || ''}
            onChange={(e) => handleFilterChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            placeholder="999999999"
          />
        </Grid>

        {/* Account ID */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Account ID"
            value={formFilters.accountId || ''}
            onChange={(e) => handleFilterChange('accountId', e.target.value)}
            placeholder="ACC-000001"
            helperText="Format: ACC-XXXXXX"
          />
        </Grid>

        {/* Policy ID */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Policy ID"
            value={formFilters.policyId || ''}
            onChange={(e) => handleFilterChange('policyId', e.target.value)}
            placeholder="POL-000001"
            helperText="Format: POL-XXXXXX"
          />
        </Grid>

        {/* Location ID */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Location ID"
            value={formFilters.locationId || ''}
            onChange={(e) => handleFilterChange('locationId', e.target.value)}
            placeholder="LOC-000001"
            helperText="Format: LOC-XXXXXX"
          />
        </Grid>
      </Grid>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentFilters && Object.entries(currentFilters).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                size="small"
                onDelete={() => {
                  const newFilters = { ...currentFilters };
                  delete newFilters[key as keyof ExposureQueryParams];
                  setFormFilters(newFilters);
                  dispatch(setFilters(newFilters));
                  (dispatch as any)(fetchExposures({
                    ...newFilters,
                    page: 1,
                    limit: pagination.limit,
                  }));
                }}
                sx={{ bgcolor: 'primary.50', fontFamily: 'monospace', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ExposureFilters;
