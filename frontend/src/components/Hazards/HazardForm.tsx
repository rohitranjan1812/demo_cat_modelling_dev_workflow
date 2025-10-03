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
  'Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading'
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
  hazardDescription: yup.string().required('Description is required'),
  severity: yup.string().required('Severity is required'),
  probability: yup.number().min(0).max(1).required('Probability is required'),
  affectedRegions: yup.array().min(1, 'At least one region is required'),
  affectedCountries: yup.array().min(1, 'At least one country is required'),
  economicImpact: yup.array().of(
    yup.object({
      estimatedLoss: yup.number().min(0),
      currency: yup.string(),
    })
  ),
  isHistorical: yup.boolean(),
  isSimulated: yup.boolean(),
  // Geographic footprint fields
  footprint: yup.object({
    centerLatitude: yup.number().min(-90).max(90).required('Latitude is required'),
    centerLongitude: yup.number().min(-180).max(180).required('Longitude is required'),
    radius: yup.number().min(0).required('Radius is required'),
    unit: yup.string().required('Unit is required'),
    affectedArea: yup.number().min(0),
  }),
  // Temporal fields
  temporal: yup.object({
    startTime: yup.date().required('Start time is required'),
    endTime: yup.date().optional(),
    duration: yup.number().min(0).optional(),
    durationUnit: yup.string().optional(),
  }),
});

const HazardForm: React.FC<HazardFormProps> = ({ hazard, open, onClose, onSave }) => {
  const isEdit = Boolean(hazard);
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      hazardName: hazard?.hazardName || '',
      hazardType: hazard?.hazardType || '',
      hazardCategory: hazard?.hazardCategory || '',
      hazardDescription: hazard?.hazardDescription || '',
      severity: hazard?.severity || '',
      probability: hazard?.probability || 0,
      affectedRegions: hazard?.affectedRegions || [],
      affectedCountries: hazard?.affectedCountries || [],
      economicImpact: hazard?.economicImpact || [{ estimatedLoss: 0, currency: 'USD' }],
      isHistorical: hazard?.isHistorical || false,
      isSimulated: hazard?.isSimulated || false,
      footprint: {
        centerLatitude: hazard?.footprint?.centerLatitude || 0,
        centerLongitude: hazard?.footprint?.centerLongitude || 0,
        radius: hazard?.footprint?.radius || 10,
        unit: hazard?.footprint?.unit || 'km',
        affectedArea: hazard?.footprint?.affectedArea || 0,
      },
      temporal: {
        startTime: hazard?.temporal?.startTime ? new Date(hazard.temporal.startTime) : new Date(),
        endTime: hazard?.temporal?.endTime ? new Date(hazard.temporal.endTime) : undefined,
        duration: hazard?.temporal?.duration || 0,
        durationUnit: hazard?.temporal?.durationUnit || 'hours',
      },
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
                  name="hazardDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      error={!!errors.hazardDescription}
                      helperText={errors.hazardDescription?.message}
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

              {/* Geographic Footprint */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Geographic Footprint
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="footprint.centerLatitude"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Center Latitude"
                      inputProps={{ min: -90, max: 90, step: 0.000001 }}
                      error={!!errors.footprint?.centerLatitude}
                      helperText={errors.footprint?.centerLatitude?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="footprint.centerLongitude"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Center Longitude"
                      inputProps={{ min: -180, max: 180, step: 0.000001 }}
                      error={!!errors.footprint?.centerLongitude}
                      helperText={errors.footprint?.centerLongitude?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="footprint.radius"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Radius"
                      inputProps={{ min: 0, step: 0.1 }}
                      error={!!errors.footprint?.radius}
                      helperText={errors.footprint?.radius?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="footprint.unit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.footprint?.unit}>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        {...field}
                        label="Unit"
                      >
                        <MenuItem value="km">Kilometers</MenuItem>
                        <MenuItem value="miles">Miles</MenuItem>
                        <MenuItem value="degrees">Degrees</MenuItem>
                      </Select>
                      {errors.footprint?.unit && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.footprint.unit.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="footprint.affectedArea"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Affected Area (km²)"
                      inputProps={{ min: 0, step: 0.1 }}
                      error={!!errors.footprint?.affectedArea}
                      helperText={errors.footprint?.affectedArea?.message}
                    />
                  )}
                />
              </Grid>

              {/* Temporal Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Temporal Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="temporal.startTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="datetime-local"
                      label="Start Time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.temporal?.startTime}
                      helperText={errors.temporal?.startTime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="temporal.endTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="datetime-local"
                      label="End Time (Optional)"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.temporal?.endTime}
                      helperText={errors.temporal?.endTime?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="temporal.duration"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Duration"
                      inputProps={{ min: 0, step: 0.1 }}
                      error={!!errors.temporal?.duration}
                      helperText={errors.temporal?.duration?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="temporal.durationUnit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.temporal?.durationUnit}>
                      <InputLabel>Duration Unit</InputLabel>
                      <Select
                        {...field}
                        label="Duration Unit"
                      >
                        <MenuItem value="seconds">Seconds</MenuItem>
                        <MenuItem value="minutes">Minutes</MenuItem>
                        <MenuItem value="hours">Hours</MenuItem>
                        <MenuItem value="days">Days</MenuItem>
                        <MenuItem value="weeks">Weeks</MenuItem>
                        <MenuItem value="months">Months</MenuItem>
                      </Select>
                      {errors.temporal?.durationUnit && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.temporal.durationUnit.message}
                        </Typography>
                      )}
                    </FormControl>
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
                  name="economicImpact.0.estimatedLoss"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Estimated Loss"
                      inputProps={{ min: 0 }}
                      error={!!errors.economicImpact?.[0]?.estimatedLoss}
                      helperText={errors.economicImpact?.[0]?.estimatedLoss?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="economicImpact.0.currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.economicImpact?.[0]?.currency}>
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

