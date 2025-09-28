import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';

import { Hazard, HazardType, HazardCategory, SeverityLevel } from '../../types';

interface HazardFormProps {
  hazard?: Hazard | null;
  open: boolean;
  onClose: () => void;
  onSave: (hazard: Partial<Hazard>) => void;
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

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'];

const schema = yup.object({
  hazardName: yup.string().required('Hazard name is required'),
  hazardType: yup.string().required('Hazard type is required'),
  hazardCategory: yup.string().required('Hazard category is required'),
  description: yup.string().required('Description is required'),
  severity: yup.string().required('Severity is required'),
  probability: yup.number().min(0).max(1).required('Probability is required'),
  affectedRegions: yup.array().min(1, 'At least one region is required'),
  affectedCountries: yup.array().min(1, 'At least one country is required'),
  impactMetrics: yup.object({
    potentialLoss: yup.number().min(0).required('Potential loss is required'),
    affectedPopulation: yup.number().min(0).required('Affected population is required'),
    economicImpact: yup.number().min(0).required('Economic impact is required'),
    currency: yup.string().required('Currency is required'),
  }),
  isHistorical: yup.boolean(),
  isSimulated: yup.boolean(),
});

const HazardForm: React.FC<HazardFormProps> = ({ hazard, open, onClose, onSave }) => {
  const isEdit = Boolean(hazard);
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      hazardName: hazard?.hazardName || '',
      hazardType: hazard?.hazardType || '',
      hazardCategory: hazard?.hazardCategory || '',
      description: hazard?.description || '',
      severity: hazard?.severity || '',
      probability: hazard?.probability || 0,
      affectedRegions: hazard?.affectedRegions || [],
      affectedCountries: hazard?.affectedCountries || [],
      impactMetrics: {
        potentialLoss: hazard?.impactMetrics?.potentialLoss || 0,
        affectedPopulation: hazard?.impactMetrics?.affectedPopulation || 0,
        economicImpact: hazard?.impactMetrics?.economicImpact || 0,
        currency: hazard?.impactMetrics?.currency || 'USD',
      },
      isHistorical: hazard?.isHistorical || false,
      isSimulated: hazard?.isSimulated || false,
    },
  });

  const watchedProbability = watch('probability');

  const onSubmit = (data: any) => {
    onSave(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            {isEdit ? 'Edit Hazard' : 'Create New Hazard'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="hazardName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Hazard Name"
                      error={!!errors.hazardName}
                      helperText={errors.hazardName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="hazardType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.hazardType}>
                      <InputLabel>Hazard Type</InputLabel>
                      <Select {...field} label="Hazard Type">
                        {hazardTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="hazardCategory"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.hazardCategory}>
                      <InputLabel>Hazard Category</InputLabel>
                      <Select {...field} label="Hazard Category">
                        {hazardCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.severity}>
                      <InputLabel>Severity Level</InputLabel>
                      <Select {...field} label="Severity Level">
                        {severityLevels.map((severity) => (
                          <MenuItem key={severity} value={severity}>
                            {severity}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              {/* Probability and Risk */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Risk Assessment
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="probability"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Probability"
                      inputProps={{ min: 0, max: 1, step: 0.01 }}
                      error={!!errors.probability}
                      helperText={errors.probability?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Probability: {(watchedProbability * 100).toFixed(1)}%
                  </Typography>
                  <Box sx={{ width: '100%', height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4 }}>
                    <Box
                      sx={{
                        width: `${watchedProbability * 100}%`,
                        height: '100%',
                        backgroundColor: watchedProbability > 0.7 ? '#f44336' : watchedProbability > 0.4 ? '#ff9800' : '#4caf50',
                        borderRadius: 4,
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              {/* Geographic Scope */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Geographic Scope
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="affectedRegions"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={regions}
                      value={field.value || []}
                      onChange={(_, value) => field.onChange(value)}
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Affected Regions"
                          error={!!errors.affectedRegions}
                          helperText={errors.affectedRegions?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="affectedCountries"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={countries}
                      value={field.value || []}
                      onChange={(_, value) => field.onChange(value)}
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Affected Countries"
                          error={!!errors.affectedCountries}
                          helperText={errors.affectedCountries?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Impact Metrics */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Impact Metrics
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="impactMetrics.potentialLoss"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Potential Loss"
                      inputProps={{ min: 0 }}
                      error={!!errors.impactMetrics?.potentialLoss}
                      helperText={errors.impactMetrics?.potentialLoss?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="impactMetrics.currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.impactMetrics?.currency}>
                      <InputLabel>Currency</InputLabel>
                      <Select {...field} label="Currency">
                        {currencies.map((currency) => (
                          <MenuItem key={currency} value={currency}>
                            {currency}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="impactMetrics.affectedPopulation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Affected Population"
                      inputProps={{ min: 0 }}
                      error={!!errors.impactMetrics?.affectedPopulation}
                      helperText={errors.impactMetrics?.affectedPopulation?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="impactMetrics.economicImpact"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Economic Impact"
                      inputProps={{ min: 0 }}
                      error={!!errors.impactMetrics?.economicImpact}
                      helperText={errors.impactMetrics?.economicImpact?.message}
                    />
                  )}
                />
              </Grid>

              {/* Flags */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Classification
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="isHistorical"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Historical Event"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="isSimulated"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Simulated Event"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            {isEdit ? 'Update Hazard' : 'Create Hazard'}
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default HazardForm;

