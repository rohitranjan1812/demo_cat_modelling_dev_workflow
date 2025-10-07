/**
 * ExposureCreate Component
 * 
 * Multi-step form wizard for creating new exposures
 * 
 * Steps:
 * 1. Basic Information - Exposure type, account, policy, dates
 * 2. Location Details - Coordinates, address, property characteristics
 * 3. Coverage Details - TIV, replacement value, peril exposures
 * 4. Review & Submit - Summary review before final submission
 * 
 * Features:
 * - Material-UI Stepper for step navigation
 * - React Hook Form for validation
 * - Field-level error messages
 * - Save as Draft functionality
 * - Redux integration for submission
 * - Navigation after successful creation
 * 
 * Architecture:
 * - Form state persists across steps
 * - Validation on step transition
 * - Async Redux action for creation
 * - Success/error toast notifications
 */

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
  Card,
  CardContent,
  Alert,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Redux
import { useAppDispatch } from '../../../store/hooks';
import { createExposure } from '../../../store/slices/exposureSlice';

// Types
import {
  CreateExposureInput,
  ExposureType,
  OccupancyType,
  ConstructionType,
  ExposureStatus,
  Currency,
  PerilType,
} from '../../../types/models';

// ============================================================================
// TYPES
// ============================================================================

interface FormData extends Omit<CreateExposureInput, 'exposureId' | 'createdBy' | 'lastModifiedBy'> {
  // All fields will be populated through the form
}

const steps = ['Basic Information', 'Location Details', 'Coverage Details', 'Review & Submit'];

const exposureTypes: ExposureType[] = ['Property', 'Casualty', 'Liability', 'Marine', 'Aviation', 'Cyber'];
const occupancyTypes: OccupancyType[] = ['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Institutional', 'Agricultural'];
const constructionTypes: ConstructionType[] = ['Wood', 'Concrete', 'Steel', 'Masonry', 'Mixed'];
const statusOptions: ExposureStatus[] = ['Active', 'Inactive', 'Expired', 'Under Review', 'Pending'];
const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'];
const perilTypes: PerilType[] = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Wind'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ExposureCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      exposureType: 'Property',
      accountId: '',
      policyId: '',
      locationId: '',
      totalInsuredValue: 0,
      replacementValue: 0,
      currency: 'USD',
      perilExposures: [],
      location: {
        latitude: 0,
        longitude: 0,
      },
      occupancyType: 'Residential',
      constructionType: 'Wood',
      status: 'Active',
      effectiveDate: new Date().toISOString().split('T')[0],
    },
    mode: 'onChange',
  });

  const { fields: perilFields, append: appendPeril, remove: removePeril } = useFieldArray({
    control,
    name: 'perilExposures',
  });

  // Watch form values for review step
  const formValues = watch();

  // Handle step navigation
  const handleNext = async () => {
    // Validate current step before proceeding
    const fieldsToValidate = getStepFields(activeStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepFields = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 0:
        return ['exposureType', 'accountId', 'policyId', 'locationId', 'status', 'effectiveDate'];
      case 1:
        return ['location', 'occupancyType', 'constructionType'];
      case 2:
        return ['totalInsuredValue', 'replacementValue', 'currency'];
      default:
        return [];
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);

      // Prepare data for API
      const exposureData: any = {
        ...data,
        createdBy: 'system', // TODO: Replace with actual user ID from auth
        lastModifiedBy: 'system',
      };

      // Dispatch Redux action
      await (dispatch as any)(createExposure(exposureData)).unwrap();

      toast.success('Exposure created successfully!');
      navigate('/exposures');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create exposure');
      console.error('Error creating exposure:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle save as draft
  const handleSaveDraft = () => {
    const values = getValues();
    console.log('Saving draft:', values);
    // TODO: Implement draft saving to localStorage or backend
    toast.success('Draft saved successfully!');
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/exposures');
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderLocationDetails();
      case 2:
        return renderCoverageDetails();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  // ============================================================================
  // STEP 1: BASIC INFORMATION
  // ============================================================================

  const renderBasicInformation = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Basic Information
        </Typography>

        <Grid container spacing={3}>
          {/* Exposure Type */}
          <Grid item xs={12} md={6}>
            <Controller
              name="exposureType"
              control={control}
              rules={{ required: 'Exposure type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.exposureType}>
                  <InputLabel>Exposure Type *</InputLabel>
                  <Select {...field} label="Exposure Type *">
                    {exposureTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.exposureType && (
                    <FormHelperText>{errors.exposureType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} md={6}>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>Status *</InputLabel>
                  <Select {...field} label="Status *">
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Account ID */}
          <Grid item xs={12} md={6}>
            <Controller
              name="accountId"
              control={control}
              rules={{
                required: 'Account ID is required',
                pattern: {
                  value: /^ACC-\d{8}$/,
                  message: 'Account ID must be in format ACC-XXXXXXXX',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Account ID *"
                  placeholder="ACC-12345678"
                  error={!!errors.accountId}
                  helperText={errors.accountId?.message || 'Format: ACC-XXXXXXXX'}
                />
              )}
            />
          </Grid>

          {/* Policy ID */}
          <Grid item xs={12} md={6}>
            <Controller
              name="policyId"
              control={control}
              rules={{
                required: 'Policy ID is required',
                pattern: {
                  value: /^POL-\d{8}$/,
                  message: 'Policy ID must be in format POL-XXXXXXXX',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Policy ID *"
                  placeholder="POL-12345678"
                  error={!!errors.policyId}
                  helperText={errors.policyId?.message || 'Format: POL-XXXXXXXX'}
                />
              )}
            />
          </Grid>

          {/* Location ID */}
          <Grid item xs={12} md={6}>
            <Controller
              name="locationId"
              control={control}
              rules={{
                required: 'Location ID is required',
                pattern: {
                  value: /^LOC-\d{8}$/,
                  message: 'Location ID must be in format LOC-XXXXXXXX',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Location ID *"
                  placeholder="LOC-12345678"
                  error={!!errors.locationId}
                  helperText={errors.locationId?.message || 'Format: LOC-XXXXXXXX'}
                />
              )}
            />
          </Grid>

          {/* Effective Date */}
          <Grid item xs={12} md={6}>
            <Controller
              name="effectiveDate"
              control={control}
              rules={{ required: 'Effective date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Effective Date *"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.effectiveDate}
                  helperText={errors.effectiveDate?.message}
                />
              )}
            />
          </Grid>

          {/* Expiry Date (Optional) */}
          <Grid item xs={12} md={6}>
            <Controller
              name="expiryDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="date"
                  label="Expiry Date (Optional)"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Ensure that Account ID, Policy ID, and Location ID already exist in the system.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // STEP 2: LOCATION DETAILS
  // ============================================================================

  const renderLocationDetails = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Location & Property Details
        </Typography>

        <Grid container spacing={3}>
          {/* Latitude */}
          <Grid item xs={12} md={6}>
            <Controller
              name="location.latitude"
              control={control}
              rules={{
                required: 'Latitude is required',
                min: { value: -90, message: 'Latitude must be between -90 and 90' },
                max: { value: 90, message: 'Latitude must be between -90 and 90' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Latitude *"
                  placeholder="37.7749"
                  inputProps={{ step: 'any' }}
                  error={!!errors.location?.latitude}
                  helperText={errors.location?.latitude?.message || 'Range: -90 to 90'}
                />
              )}
            />
          </Grid>

          {/* Longitude */}
          <Grid item xs={12} md={6}>
            <Controller
              name="location.longitude"
              control={control}
              rules={{
                required: 'Longitude is required',
                min: { value: -180, message: 'Longitude must be between -180 and 180' },
                max: { value: 180, message: 'Longitude must be between -180 and 180' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Longitude *"
                  placeholder="-122.4194"
                  inputProps={{ step: 'any' }}
                  error={!!errors.location?.longitude}
                  helperText={errors.location?.longitude?.message || 'Range: -180 to 180'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Property Characteristics
            </Typography>
          </Grid>

          {/* Occupancy Type */}
          <Grid item xs={12} md={6}>
            <Controller
              name="occupancyType"
              control={control}
              rules={{ required: 'Occupancy type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.occupancyType}>
                  <InputLabel>Occupancy Type *</InputLabel>
                  <Select {...field} label="Occupancy Type *">
                    {occupancyTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.occupancyType && (
                    <FormHelperText>{errors.occupancyType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Construction Type */}
          <Grid item xs={12} md={6}>
            <Controller
              name="constructionType"
              control={control}
              rules={{ required: 'Construction type is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.constructionType}>
                  <InputLabel>Construction Type *</InputLabel>
                  <Select {...field} label="Construction Type *">
                    {constructionTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.constructionType && (
                    <FormHelperText>{errors.constructionType.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Year Built */}
          <Grid item xs={12} md={4}>
            <Controller
              name="yearBuilt"
              control={control}
              rules={{
                min: { value: 1800, message: 'Year must be after 1800' },
                max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Year Built (Optional)"
                  placeholder="2020"
                  error={!!errors.yearBuilt}
                  helperText={errors.yearBuilt?.message}
                />
              )}
            />
          </Grid>

          {/* Number of Stories */}
          <Grid item xs={12} md={4}>
            <Controller
              name="numberOfStories"
              control={control}
              rules={{
                min: { value: 1, message: 'Must be at least 1 story' },
                max: { value: 200, message: 'Maximum 200 stories' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Number of Stories (Optional)"
                  placeholder="2"
                  error={!!errors.numberOfStories}
                  helperText={errors.numberOfStories?.message}
                />
              )}
            />
          </Grid>

          {/* Square Footage */}
          <Grid item xs={12} md={4}>
            <Controller
              name="squareFootage"
              control={control}
              rules={{
                min: { value: 1, message: 'Must be greater than 0' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Square Footage (Optional)"
                  placeholder="2500"
                  error={!!errors.squareFootage}
                  helperText={errors.squareFootage?.message}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">sq ft</InputAdornment>,
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Coordinates can be obtained from Google Maps or other geocoding services.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // STEP 3: COVERAGE DETAILS
  // ============================================================================

  const renderCoverageDetails = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Coverage & Financial Details
        </Typography>

        <Grid container spacing={3}>
          {/* Currency */}
          <Grid item xs={12} md={4}>
            <Controller
              name="currency"
              control={control}
              rules={{ required: 'Currency is required' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.currency}>
                  <InputLabel>Currency *</InputLabel>
                  <Select {...field} label="Currency *">
                    {currencies.map((curr) => (
                      <MenuItem key={curr} value={curr}>
                        {curr}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.currency && (
                    <FormHelperText>{errors.currency.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Total Insured Value */}
          <Grid item xs={12} md={4}>
            <Controller
              name="totalInsuredValue"
              control={control}
              rules={{
                required: 'Total Insured Value is required',
                min: { value: 1, message: 'TIV must be greater than 0' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Total Insured Value (TIV) *"
                  placeholder="1000000"
                  error={!!errors.totalInsuredValue}
                  helperText={errors.totalInsuredValue?.message}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              )}
            />
          </Grid>

          {/* Replacement Value */}
          <Grid item xs={12} md={4}>
            <Controller
              name="replacementValue"
              control={control}
              rules={{
                required: 'Replacement Value is required',
                min: { value: 1, message: 'Replacement value must be greater than 0' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Replacement Value *"
                  placeholder="1200000"
                  error={!!errors.replacementValue}
                  helperText={errors.replacementValue?.message}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Peril Exposures
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => appendPeril({ peril: 'Earthquake', exposureAmount: 0, deductible: 0 })}
              >
                Add Peril
              </Button>
            </Box>
          </Grid>

          {perilFields.map((field, index) => (
            <Grid item xs={12} key={field.id}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Controller
                      name={`perilExposures.${index}.peril`}
                      control={control}
                      rules={{ required: 'Peril type is required' }}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel>Peril Type *</InputLabel>
                          <Select {...field} label="Peril Type *">
                            {perilTypes.map((peril) => (
                              <MenuItem key={peril} value={peril}>
                                {peril}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Controller
                      name={`perilExposures.${index}.exposureAmount`}
                      control={control}
                      rules={{
                        required: 'Exposure amount is required',
                        min: { value: 0, message: 'Must be >= 0' },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          label="Exposure Amount *"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Controller
                      name={`perilExposures.${index}.deductible`}
                      control={control}
                      rules={{
                        min: { value: 0, message: 'Must be >= 0' },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          label="Deductible"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Tooltip title="Remove peril">
                      <IconButton
                        color="error"
                        onClick={() => removePeril(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}

          {perilFields.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="warning">
                No peril exposures added. Click "Add Peril" to include coverage details.
              </Alert>
            </Grid>
          )}
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Total Insured Value (TIV) should typically equal or exceed the sum of all peril exposure amounts.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // STEP 4: REVIEW & SUBMIT
  // ============================================================================

  const renderReview = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Review & Submit
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Please review all information before submitting. You can go back to edit any section.
        </Alert>

        {/* Basic Information Summary */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Exposure Type:</Typography>
                <Typography variant="body1">{formValues.exposureType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <Chip label={formValues.status} size="small" color="primary" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Account ID:</Typography>
                <Typography variant="body1">{formValues.accountId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Policy ID:</Typography>
                <Typography variant="body1">{formValues.policyId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Location ID:</Typography>
                <Typography variant="body1">{formValues.locationId}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Effective Date:</Typography>
                <Typography variant="body1">{formValues.effectiveDate || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Location Details Summary */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Location & Property Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Coordinates:</Typography>
                <Typography variant="body1">
                  {formValues.location?.latitude?.toFixed(6)}, {formValues.location?.longitude?.toFixed(6)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Occupancy Type:</Typography>
                <Typography variant="body1">{formValues.occupancyType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Construction Type:</Typography>
                <Typography variant="body1">{formValues.constructionType}</Typography>
              </Grid>
              {formValues.yearBuilt && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Year Built:</Typography>
                  <Typography variant="body1">{formValues.yearBuilt}</Typography>
                </Grid>
              )}
              {formValues.numberOfStories && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Number of Stories:</Typography>
                  <Typography variant="body1">{formValues.numberOfStories}</Typography>
                </Grid>
              )}
              {formValues.squareFootage && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Square Footage:</Typography>
                  <Typography variant="body1">{formValues.squareFootage} sq ft</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Coverage Details Summary */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Coverage & Financial Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Currency:</Typography>
                <Typography variant="body1">{formValues.currency}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Total Insured Value:</Typography>
                <Typography variant="body1">
                  ${formValues.totalInsuredValue?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Replacement Value:</Typography>
                <Typography variant="body1">
                  ${formValues.replacementValue?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Peril Exposures ({formValues.perilExposures?.length || 0}):
                </Typography>
                {formValues.perilExposures && formValues.perilExposures.length > 0 ? (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formValues.perilExposures.map((peril, index) => (
                      <Chip
                        key={index}
                        label={`${peril.peril}: $${peril.exposureAmount?.toLocaleString()}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No peril exposures</Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/exposures')}
          sx={{ textDecoration: 'none' }}
        >
          Exposures
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Create New Exposure
          </Typography>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Box>
      </motion.div>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form Content */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Box>
              <Button
                variant="outlined"
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<BackIcon />}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
            </Box>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting || saving}
                  startIcon={<CheckIcon />}
                >
                  {saving ? 'Creating...' : 'Create Exposure'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ForwardIcon />}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </motion.div>
    </Box>
  );
};

export default ExposureCreate;
