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
  Card,
  CardContent,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';

import { SimulationRun, SimulationConfiguration, HazardType } from '../../types';

interface SimulationFormProps {
  simulation?: SimulationRun | null;
  open: boolean;
  onClose: () => void;
  onSave: (config: SimulationConfiguration) => void;
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

const regions = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'
];

const countries = [
  'United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil', 'Australia'
];

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'];

const modelProviders = ['RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'JBA', 'Custom', 'Multiple'];

const modelTypes = ['Probabilistic', 'Deterministic', 'Scenario', 'Hybrid'];

const resolutions = ['High', 'Medium', 'Low', 'Variable'];

const schema = yup.object({
  simulationName: yup.string().required('Simulation name is required'),
  simulationDescription: yup.string(),
  configuration: yup.object({
    startYear: yup.number().min(1900).max(3000).required('Start year is required'),
    endYear: yup.number().min(1900).max(3000).required('End year is required'),
    timeHorizon: yup.number().min(1).required('Time horizon is required'),
    timeHorizonUnit: yup.string().oneOf(['years', 'months', 'days']).required('Time horizon unit is required'),
    hazardTypes: yup.array().min(1, 'At least one hazard type is required'),
    geographicScope: yup.object({
      regions: yup.array().min(1, 'At least one region is required'),
      countries: yup.array().min(1, 'At least one country is required'),
    }),
    exposureScope: yup.object({
      currency: yup.string().required('Currency is required'),
      totalExposure: yup.number().min(0).required('Total exposure is required'),
      categories: yup.object({
        residential: yup.number().min(0).required('Residential exposure is required'),
        commercial: yup.number().min(0).required('Commercial exposure is required'),
        industrial: yup.number().min(0).required('Industrial exposure is required'),
        infrastructure: yup.number().min(0).required('Infrastructure exposure is required'),
      }),
    }),
    modelingConfig: yup.object({
      numberOfSimulations: yup.number().min(1).max(1000000).required('Number of simulations is required'),
      modelProvider: yup.string(),
      modelType: yup.string(),
      resolution: yup.string(),
      randomSeed: yup.number().min(0),
    }),
  }),
});

const SimulationForm: React.FC<SimulationFormProps> = ({ simulation, open, onClose, onSave }) => {
  const isEdit = Boolean(simulation);
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      simulationName: simulation?.simulationName || '',
      simulationDescription: simulation?.simulationDescription || '',
      configuration: {
        startYear: simulation?.configuration?.startYear || new Date().getFullYear(),
        endYear: simulation?.configuration?.endYear || new Date().getFullYear() + 1,
        timeHorizon: simulation?.configuration?.timeHorizon || 1,
        timeHorizonUnit: simulation?.configuration?.timeHorizonUnit || 'years',
        hazardTypes: simulation?.configuration?.hazardTypes || [],
        geographicScope: {
          regions: simulation?.configuration?.geographicScope?.regions || [],
          countries: simulation?.configuration?.geographicScope?.countries || [],
        },
        exposureScope: {
          currency: simulation?.configuration?.exposureScope?.currency || 'USD',
          totalExposure: simulation?.configuration?.exposureScope?.totalExposure || 0,
          categories: {
            residential: simulation?.configuration?.exposureScope?.categories?.residential || 0,
            commercial: simulation?.configuration?.exposureScope?.categories?.commercial || 0,
            industrial: simulation?.configuration?.exposureScope?.categories?.industrial || 0,
            infrastructure: simulation?.configuration?.exposureScope?.categories?.infrastructure || 0,
          },
        },
        modelingConfig: {
          numberOfSimulations: simulation?.configuration?.modelingConfig?.numberOfSimulations || 1000,
          modelProvider: simulation?.configuration?.modelingConfig?.modelProvider || '',
          modelType: simulation?.configuration?.modelingConfig?.modelType || '',
          resolution: simulation?.configuration?.modelingConfig?.resolution || '',
          randomSeed: simulation?.configuration?.modelingConfig?.randomSeed || undefined,
        },
      },
    },
  });

  const watchedExposure = watch('configuration.exposureScope.categories');
  const totalExposure = Object.values(watchedExposure || {}).reduce((sum, value) => sum + (value || 0), 0);

  const onSubmit = (data: any) => {
    onSave(data.configuration);
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
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            {isEdit ? 'Edit Simulation' : 'Create New Simulation'}
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
                  name="simulationName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Simulation Name"
                      error={!!errors.simulationName}
                      helperText={errors.simulationName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="simulationDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description (Optional)"
                      error={!!errors.simulationDescription}
                      helperText={errors.simulationDescription?.message}
                    />
                  )}
                />
              </Grid>

              {/* Time Configuration */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Time Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.startYear"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Start Year"
                      error={!!errors.configuration?.startYear}
                      helperText={errors.configuration?.startYear?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.endYear"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="End Year"
                      error={!!errors.configuration?.endYear}
                      helperText={errors.configuration?.endYear?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.timeHorizon"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Time Horizon"
                      error={!!errors.configuration?.timeHorizon}
                      helperText={errors.configuration?.timeHorizon?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.timeHorizonUnit"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.configuration?.timeHorizonUnit}>
                      <InputLabel>Time Unit</InputLabel>
                      <Select {...field} label="Time Unit">
                        <MenuItem value="years">Years</MenuItem>
                        <MenuItem value="months">Months</MenuItem>
                        <MenuItem value="days">Days</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Hazard Types */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Hazard Configuration
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="configuration.hazardTypes"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={hazardTypes}
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
                          label="Hazard Types"
                          error={!!errors.configuration?.hazardTypes}
                          helperText={errors.configuration?.hazardTypes?.message}
                        />
                      )}
                    />
                  )}
                />
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
                  name="configuration.geographicScope.regions"
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
                          label="Regions"
                          error={!!errors.configuration?.geographicScope?.regions}
                          helperText={errors.configuration?.geographicScope?.regions?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="configuration.geographicScope.countries"
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
                          label="Countries"
                          error={!!errors.configuration?.geographicScope?.countries}
                          helperText={errors.configuration?.geographicScope?.countries?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Exposure Configuration */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Exposure Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="configuration.exposureScope.currency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.configuration?.exposureScope?.currency}>
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
                  name="configuration.exposureScope.totalExposure"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Total Exposure"
                      error={!!errors.configuration?.exposureScope?.totalExposure}
                      helperText={errors.configuration?.exposureScope?.totalExposure?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.exposureScope.categories.residential"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Residential"
                      error={!!errors.configuration?.exposureScope?.categories?.residential}
                      helperText={errors.configuration?.exposureScope?.categories?.residential?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.exposureScope.categories.commercial"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Commercial"
                      error={!!errors.configuration?.exposureScope?.categories?.commercial}
                      helperText={errors.configuration?.exposureScope?.categories?.commercial?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.exposureScope.categories.industrial"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Industrial"
                      error={!!errors.configuration?.exposureScope?.categories?.industrial}
                      helperText={errors.configuration?.exposureScope?.categories?.industrial?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Controller
                  name="configuration.exposureScope.categories.infrastructure"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Infrastructure"
                      error={!!errors.configuration?.exposureScope?.categories?.infrastructure}
                      helperText={errors.configuration?.exposureScope?.categories?.infrastructure?.message}
                    />
                  )}
                />
              </Grid>

              {/* Exposure Summary */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Exposure Summary
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Total Calculated: {totalExposure.toLocaleString()} | 
                      Configured: {watch('configuration.exposureScope.totalExposure')?.toLocaleString() || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Modeling Configuration */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Modeling Configuration
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="configuration.modelingConfig.numberOfSimulations"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Number of Simulations"
                      error={!!errors.configuration?.modelingConfig?.numberOfSimulations}
                      helperText={errors.configuration?.modelingConfig?.numberOfSimulations?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="configuration.modelingConfig.modelProvider"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.configuration?.modelingConfig?.modelProvider}>
                      <InputLabel>Model Provider</InputLabel>
                      <Select {...field} label="Model Provider">
                        {modelProviders.map((provider) => (
                          <MenuItem key={provider} value={provider}>
                            {provider}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <Controller
                  name="configuration.modelingConfig.modelType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.configuration?.modelingConfig?.modelType}>
                      <InputLabel>Model Type</InputLabel>
                      <Select {...field} label="Model Type">
                        {modelTypes.map((type) => (
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
                  name="configuration.modelingConfig.resolution"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.configuration?.modelingConfig?.resolution}>
                      <InputLabel>Resolution</InputLabel>
                      <Select {...field} label="Resolution">
                        {resolutions.map((resolution) => (
                          <MenuItem key={resolution} value={resolution}>
                            {resolution}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="configuration.modelingConfig.randomSeed"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Random Seed (Optional)"
                      error={!!errors.configuration?.modelingConfig?.randomSeed}
                      helperText={errors.configuration?.modelingConfig?.randomSeed?.message}
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
            {isEdit ? 'Update Simulation' : 'Start Simulation'}
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default SimulationForm;

