/**
 * Exposure Validation Schemas
 * Joi validation schemas for exposure-related API endpoints
 */

const Joi = require('joi');

// Common schemas
const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  elevation: Joi.number().min(-1000).max(10000).default(0),
  address: Joi.object({
    street: Joi.string().trim().max(200),
    city: Joi.string().trim().max(100),
    state: Joi.string().trim().max(100),
    postalCode: Joi.string().trim().max(20),
    country: Joi.string().trim().max(100).required(),
    region: Joi.string().valid(
      'North America', 'Europe', 'Asia Pacific', 
      'Latin America', 'Middle East', 'Africa'
    ).required()
  }).required()
});

const perilExposureSchema = Joi.object({
  peril: Joi.string().valid(
    'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
    'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
    'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm'
  ).required(),
  exposureValue: Joi.number().min(0).required(),
  deductible: Joi.number().min(0).default(0),
  limit: Joi.number().min(0),
  attachmentPoint: Joi.number().min(0).default(0),
  premium: Joi.number().min(0).default(0),
  lastUpdated: Joi.date().default(Date.now)
});

const assetCharacteristicsSchema = Joi.object({
  occupancyType: Joi.string().valid(
    'Residential', 'Commercial', 'Industrial', 
    'Agricultural', 'Mixed Use', 'Other'
  ),
  constructionType: Joi.string().valid(
    'Wood Frame', 'Steel Frame', 'Concrete', 
    'Masonry', 'Mixed', 'Other'
  ),
  yearBuilt: Joi.number().integer().min(1800).max(2100),
  numberOfStories: Joi.number().integer().min(0).max(200),
  totalArea: Joi.number().min(0),
  areaUnit: Joi.string().valid('sqft', 'sqm').default('sqft'),
  basementPresent: Joi.boolean().default(false),
  roofType: Joi.string().valid('Flat', 'Pitched', 'Gabled', 'Hip', 'Other'),
  foundationType: Joi.string().valid('Slab', 'Crawlspace', 'Basement', 'Pier', 'Other')
});

const coverageDetailsSchema = Joi.object({
  policyNumber: Joi.string().trim(),
  coverageType: Joi.string().valid(
    'Named Peril', 'All Risk', 'Catastrophe', 'Multi-Peril'
  ),
  deductible: Joi.number().min(0).default(0),
  deductibleType: Joi.string().valid(
    'Flat', 'Percentage', 'Per Occurrence', 'Annual Aggregate'
  ),
  limit: Joi.number().min(0),
  sublimits: Joi.array().items(Joi.object({
    coverageType: Joi.string().required(),
    limit: Joi.number().min(0).required()
  })),
  coinsurance: Joi.number().min(0).max(100).default(100),
  attachmentPoint: Joi.number().min(0).default(0)
});

// Create Exposure Schema
const createExposureSchema = Joi.object({
  exposureId: Joi.string().pattern(/^EXP-\d{8}$/),
  exposureName: Joi.string().trim().max(200).required(),
  exposureType: Joi.string().valid(
    'Property', 'Casualty', 'Business Interruption', 
    'Liability', 'Multi-Line'
  ).required(),
  accountId: Joi.string().required(),
  policyId: Joi.string(),
  locationId: Joi.string(),
  location: locationSchema.required(),
  totalInsuredValue: Joi.number().min(0).required(),
  buildingValue: Joi.number().min(0).default(0),
  contentsValue: Joi.number().min(0).default(0),
  businessInterruptionValue: Joi.number().min(0).default(0),
  otherValue: Joi.number().min(0).default(0),
  currency: Joi.string().valid(
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'
  ).default('USD'),
  perilExposures: Joi.array().items(perilExposureSchema).default([]),
  assetCharacteristics: assetCharacteristicsSchema,
  coverageDetails: coverageDetailsSchema,
  effectiveDate: Joi.date().required(),
  expiryDate: Joi.date().greater(Joi.ref('effectiveDate')).required(),
  status: Joi.string().valid(
    'Active', 'Inactive', 'Expired', 'Pending', 'Cancelled'
  ).default('Active'),
  riskScore: Joi.number().min(0).max(10).default(5),
  riskGrade: Joi.string().valid('A', 'B', 'C', 'D', 'E', 'F').default('C'),
  vulnerabilityScore: Joi.number().min(0).max(1).default(0.5),
  metadata: Joi.object(),
  dataSource: Joi.string().max(200).default('Manual Entry'),
  dataQuality: Joi.string().valid('High', 'Medium', 'Low', 'Unknown').default('Medium'),
  lastValidated: Joi.date().default(Date.now)
}).custom((value, helpers) => {
  // Custom validation: sum of components should approximately equal total
  const componentSum = (value.buildingValue || 0) + 
                       (value.contentsValue || 0) + 
                       (value.businessInterruptionValue || 0) + 
                       (value.otherValue || 0);
  
  if (componentSum > 0 && Math.abs(componentSum - value.totalInsuredValue) / value.totalInsuredValue > 0.1) {
    return helpers.error('any.custom', {
      message: 'Sum of component values should approximately equal total insured value (within 10%)'
    });
  }
  
  return value;
});

// Update Exposure Schema
const updateExposureSchema = Joi.object({
  exposureName: Joi.string().trim().max(200),
  exposureType: Joi.string().valid(
    'Property', 'Casualty', 'Business Interruption', 
    'Liability', 'Multi-Line'
  ),
  accountId: Joi.string(),
  policyId: Joi.string(),
  locationId: Joi.string(),
  location: locationSchema,
  totalInsuredValue: Joi.number().min(0),
  buildingValue: Joi.number().min(0),
  contentsValue: Joi.number().min(0),
  businessInterruptionValue: Joi.number().min(0),
  otherValue: Joi.number().min(0),
  currency: Joi.string().valid(
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'
  ),
  perilExposures: Joi.array().items(perilExposureSchema),
  assetCharacteristics: assetCharacteristicsSchema,
  coverageDetails: coverageDetailsSchema,
  effectiveDate: Joi.date(),
  expiryDate: Joi.date(),
  status: Joi.string().valid(
    'Active', 'Inactive', 'Expired', 'Pending', 'Cancelled'
  ),
  riskScore: Joi.number().min(0).max(10),
  riskGrade: Joi.string().valid('A', 'B', 'C', 'D', 'E', 'F'),
  vulnerabilityScore: Joi.number().min(0).max(1),
  metadata: Joi.object(),
  dataSource: Joi.string().max(200),
  dataQuality: Joi.string().valid('High', 'Medium', 'Low', 'Unknown'),
  lastValidated: Joi.date()
}).min(1); // At least one field must be updated

// Get Exposures Query Schema
const getExposuresQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  accountId: Joi.string(),
  policyId: Joi.string(),
  exposureType: Joi.string().valid(
    'Property', 'Casualty', 'Business Interruption', 
    'Liability', 'Multi-Line'
  ),
  status: Joi.string().valid(
    'Active', 'Inactive', 'Expired', 'Pending', 'Cancelled'
  ),
  currency: Joi.string().valid(
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'
  ),
  region: Joi.string().valid(
    'North America', 'Europe', 'Asia Pacific', 
    'Latin America', 'Middle East', 'Africa'
  ),
  country: Joi.string(),
  search: Joi.string(),
  minValue: Joi.number().min(0),
  maxValue: Joi.number().min(0),
  sortBy: Joi.string().valid(
    'createdAt', 'updatedAt', 'totalInsuredValue', 
    'exposureName', 'effectiveDate', 'expiryDate'
  ).default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
}).custom((value, helpers) => {
  // Validate minValue is less than maxValue
  if (value.minValue !== undefined && value.maxValue !== undefined) {
    if (value.minValue > value.maxValue) {
      return helpers.error('any.custom', {
        message: 'minValue must be less than or equal to maxValue'
      });
    }
  }
  return value;
});

// Get Exposures Near Location Schema
const getExposuresNearLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radiusKm: Joi.number().min(0).max(10000).default(50),
  status: Joi.string().valid(
    'Active', 'Inactive', 'Expired', 'Pending', 'Cancelled'
  ).default('Active'),
  exposureTypes: Joi.array().items(Joi.string().valid(
    'Property', 'Casualty', 'Business Interruption', 
    'Liability', 'Multi-Line'
  )).default([]),
  perils: Joi.array().items(Joi.string()).default([])
});

// Get Account Exposure Summary Schema
const getAccountExposureSummarySchema = Joi.object({
  accountId: Joi.string().required(),
  currency: Joi.string().valid(
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'
  ).default('USD'),
  includeInactive: Joi.boolean().default(false),
  groupBy: Joi.string().valid('type', 'region', 'country', 'currency')
});

// Get Exposures for Perils Schema
const getExposuresForPerilsSchema = Joi.object({
  perils: Joi.array().items(Joi.string().valid(
    'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
    'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
    'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm'
  )).min(1).required(),
  status: Joi.string().valid(
    'Active', 'Inactive', 'Expired', 'Pending', 'Cancelled'
  ).default('Active'),
  currency: Joi.string().valid(
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'
  )
});

// Bulk Import Exposures Schema
const bulkImportExposuresSchema = Joi.object({
  exposures: Joi.array().items(createExposureSchema).min(1).max(1000).required()
}).custom((value, helpers) => {
  // Check for duplicate exposure IDs
  const exposureIds = value.exposures
    .filter(exp => exp.exposureId)
    .map(exp => exp.exposureId);
  
  const uniqueIds = new Set(exposureIds);
  if (exposureIds.length !== uniqueIds.size) {
    return helpers.error('any.custom', {
      message: 'Duplicate exposure IDs found in bulk import'
    });
  }
  
  return value;
});

// Calculate Portfolio Metrics Schema
const calculatePortfolioMetricsSchema = Joi.object({
  accountId: Joi.string(),
  exposureType: Joi.string().valid(
    'Property', 'Casualty', 'Business Interruption', 
    'Liability', 'Multi-Line'
  ),
  status: Joi.string().valid(
    'Active', 'Inactive', 'Expired', 'Pending', 'Cancelled'
  ),
  currency: Joi.string().valid(
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'
  ),
  region: Joi.string().valid(
    'North America', 'Europe', 'Asia Pacific', 
    'Latin America', 'Middle East', 'Africa'
  )
});

module.exports = {
  createExposureSchema,
  updateExposureSchema,
  getExposuresQuerySchema,
  getExposuresNearLocationSchema,
  getAccountExposureSummarySchema,
  getExposuresForPerilsSchema,
  bulkImportExposuresSchema,
  calculatePortfolioMetricsSchema,
  
  // Export component schemas for reuse
  locationSchema,
  perilExposureSchema,
  assetCharacteristicsSchema,
  coverageDetailsSchema
};
