import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Slider,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { HazardFilters as HazardFiltersType, HazardType, HazardCategory, SeverityLevel } from '../../types';

interface HazardFiltersProps {
  filters: HazardFiltersType;
  onFilterChange: (filters: Partial<HazardFiltersType>) => void;
}

const hazardTypes: HazardType[] = [
  'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
  'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
  'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
  'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
  'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
  'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
  'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
  'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
];

const hazardCategories: HazardCategory[] = [
  'Natural', 'Technological', 'Biological', 'Climate', 'Geological', 'Meteorological', 'Hydrological'
];

const severityLevels: SeverityLevel[] = [
  'Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme'
];

const regions = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'
];

const countries = [
  'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil', 'Australia'
];

const HazardFilters: React.FC<HazardFiltersProps> = ({ filters, onFilterChange }) => {
  const handleClearFilters = () => {
    onFilterChange({
      hazardType: undefined,
      hazardCategory: undefined,
      severity: undefined,
      region: undefined,
      country: undefined,
      minProbability: undefined,
      maxProbability: undefined,
      isHistorical: undefined,
      isSimulated: undefined,
      status: 'Active',
    });
  };

  const handleProbabilityChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    onFilterChange({
      minProbability: min / 100,
      maxProbability: max / 100,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Hazard Type */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Hazard Type</InputLabel>
              <Select
                value={filters.hazardType || ''}
                label="Hazard Type"
                onChange={(e) => onFilterChange({ hazardType: e.target.value as HazardType })}
              >
                <MenuItem value="">All Types</MenuItem>
                {hazardTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Hazard Category */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.hazardCategory || ''}
                label="Category"
                onChange={(e) => onFilterChange({ hazardCategory: e.target.value as HazardCategory })}
              >
                <MenuItem value="">All Categories</MenuItem>
                {hazardCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Severity */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity || ''}
                label="Severity"
                onChange={(e) => onFilterChange({ severity: e.target.value as SeverityLevel })}
              >
                <MenuItem value="">All Severities</MenuItem>
                {severityLevels.map((severity) => (
                  <MenuItem key={severity} value={severity}>
                    {severity}
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
                value={filters.status || 'Active'}
                label="Status"
                onChange={(e) => onFilterChange({ status: e.target.value as any })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Region */}
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={regions}
              value={filters.region || null}
              onChange={(_, value) => onFilterChange({ region: value || undefined })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Region"
                  size="small"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          {/* Country */}
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={countries}
              value={filters.country || null}
              onChange={(_, value) => onFilterChange({ country: value || undefined })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  size="small"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          {/* Probability Range */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Probability Range
              </Typography>
              <Slider
                value={[
                  (filters.minProbability || 0) * 100,
                  (filters.maxProbability || 1) * 100
                ]}
                onChange={handleProbabilityChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                min={0}
                max={100}
                step={1}
                sx={{ mt: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption">
                  {((filters.minProbability || 0) * 100).toFixed(0)}%
                </Typography>
                <Typography variant="caption">
                  {((filters.maxProbability || 1) * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Flags */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isHistorical || false}
                    onChange={(e) => onFilterChange({ isHistorical: e.target.checked })}
                    size="small"
                  />
                }
                label="Historical Only"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isSimulated || false}
                    onChange={(e) => onFilterChange({ isSimulated: e.target.checked })}
                    size="small"
                  />
                }
                label="Simulated Only"
              />
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                sx={{ textTransform: 'none' }}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => onFilterChange({})}
                sx={{ textTransform: 'none' }}
              >
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default HazardFilters;

