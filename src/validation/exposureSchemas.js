const Joi = require('joi');

/**
 * Validation schemas for Exposure model
 * Implements Task 1.1 validation requirements from ACTION_PLAN_2025-10-03.md
 */

// Common validation patterns
const exposureIdPattern = /^EXP-\d{10}$/;
const accountIdPattern = /^ACC-\d{6}$/;
const policyIdPattern = /^POL-\d{8}$/;
const locationIdPattern = /^LOC-\d{8}$/;

// Allowed enum values
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'];
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
const occupancyTypes = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use', 'Institutional'];
const constructionTypes = ['Wood Frame', 'Masonry', 'Concrete', 'Steel Frame', 'Mixed', 'Manufactured Housing'];
const perils = [
  'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
  'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
  'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
  'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm'
];
const statuses = ['Active', 'Expired', 'Cancelled', 'Suspended', 'Pending'];
const dataSources = ['Manual Entry', 'Import', 'Integration', 'Migration', 'Calculation'];

// Location schema
const locationSchema = Joi.object({
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .description('Latitude coordinate'),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .description('Longitude coordinate'),
  
  elevation: Joi.number()
    .min(-1000)
    .max(10000)
    .default(0)
    .description('Elevation in meters'),
  
  address: Joi.object({
    street: Joi.string().max(200).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    postalCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).required(),
    region: Joi.string().valid(...regions).required()
  }).required()
});

// Peril exposure schema
const perilExposureSchema = Joi.object({
  peril: Joi.string()
    .valid(...perils)
    .required()
    .description('Type of peril'),
  
  exposureValue: Joi.number()
    .min(0)
    .required()
    .description('Exposure value for this peril'),
  
  deductible: Joi.number()
    .min(0)
    .default(0)
    .description('Deductible amount'),
  
  limit: Joi.number()
    .min(0)
    .optional()
    .description('Coverage limit'),
  
  isExcluded: Joi.boolean()
    .default(false)
    .description('Whether this peril is excluded')
});

// Policy terms schema
const policyTermsSchema = Joi.object({
  effectiveDate: Joi.date()
    .required()
    .description('Policy effective date'),
  
  expirationDate: Joi.date()
    .greater(Joi.ref('effectiveDate'))
    .required()
    .description('Policy expiration date'),
  
  deductible: Joi.number()
    .min(0)
    .required()
    .description('Policy deductible'),
  
  limit: Joi.number()
    .min(0)
    .required()
    .description('Policy limit'),
  
  coinsurance: Joi.number()
    .min(0)
    .max(100)
    .default(100)
    .description('Coinsurance percentage'),
  
  blanketGroup: Joi.string()
    .max(100)
    .optional()
    .description('Blanket coverage group'),
  
  sublimits: Joi.array().items(
    Joi.object({
      type: Joi.string()
        .valid('Property', 'Contents', 'Business Interruption', 'Time Element', 'Other')
        .required(),
      amount: Joi.number().min(0).required()
    })
  ).optional()
});

// Risk factor schema
const riskFactorSchema = Joi.object({
  peril: Joi.string()
    .valid('Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic')
    .required(),
  
  riskScore: Joi.number()
    .min(0)
    .max(10)
    .required(),
  
  probability: Joi.number()
    .min(0)
    .max(1)
    .required(),
  
  expectedLoss: Joi.number()
    .min(0)
    .required(),
  
  lastUpdated: Joi.date()
    .default(Date.now)
});

// Data quality schema
const dataQualitySchema = Joi.object({
  completeness: Joi.number()
    .min(0)
    .max(100)
    .default(100),
  
  lastValidated: Joi.date().optional(),
  
  validationErrors: Joi.array().items(Joi.string()).optional()
});

/**
 * Create Exposure validation schema
 */
const createExposureSchema = Joi.object({
  exposureId: Joi.string()
    .pattern(exposureIdPattern)
    .optional()
    .description('Auto-generated if not provided'),
  
  // References
  accountId: Joi.string()
    .pattern(accountIdPattern)
    .required()
    .description('Reference to Account'),
  
  policyId: Joi.string()
    .pattern(policyIdPattern)
    .required()
    .description('Reference to Policy'),
  
  locationId: Joi.string()
    .pattern(locationIdPattern)
    .required()
    .description('Reference to Location'),
  
  // Exposure values
  totalInsuredValue: Joi.number()
    .min(0)
    .required()
    .description('Total insured value'),
  
  buildingValue: Joi.number()
    .min(0)
    .required()
    .description('Building value'),
  
  contentsValue: Joi.number()
    .min(0)
    .required()
    .description('Contents value'),
  
  businessInterruptionValue: Joi.number()
    .min(0)
    .default(0)
    .description('Business interruption value'),
  
  timeElementValue: Joi.number()
    .min(0)
    .default(0)
    .description('Time element value'),
  
  otherValue: Joi.number()
    .min(0)
    .default(0)
    .description('Other values'),
  
  // Currency
  currency: Joi.string()
    .valid(...currencies)
    .default('USD')
    .description('Currency code'),
  
  // Location
  location: locationSchema.required(),
  
  // Occupancy and construction
  occupancyType: Joi.string()
    .valid(...occupancyTypes)
    .required()
    .description('Type of occupancy'),
  
  constructionType: Joi.string()
    .valid(...constructionTypes)
    .required()
    .description('Type of construction'),
  
  yearBuilt: Joi.number()
    .min(1800)
    .max(new Date().getFullYear() + 5)
    .optional()
    .description('Year building was built'),
  
  numberOfStories: Joi.number()
    .min(1)
    .max(200)
    .default(1)
    .description('Number of stories'),
  
  squareFootage: Joi.number()
    .min(0)
    .optional()
    .description('Square footage'),
  
  // Peril exposure
  perilExposure: Joi.array()
    .items(perilExposureSchema)
    .min(1)
    .required()
    .description('Peril-specific exposure details'),
  
  // Policy terms
  policyTerms: policyTermsSchema.required(),
  
  // Risk factors
  riskFactors: Joi.array()
    .items(riskFactorSchema)
    .optional()
    .description('Risk assessment factors'),
  
  // Status
  status: Joi.string()
    .valid(...statuses)
    .default('Active')
    .description('Exposure status'),
  
  // Data quality
  dataQuality: dataQualitySchema.optional(),
  
  // Metadata
  metadata: Joi.object().optional(),
  
  // Audit fields
  createdBy: Joi.string()
    .default('system')
    .description('User who created the exposure'),
  
  updatedBy: Joi.string()
    .default('system')
    .description('User who last updated the exposure'),
  
  dataSource: Joi.string()
    .valid(...dataSources)
    .default('Manual Entry')
    .description('Source of the data')
}).custom((value, helpers) => {
  // Custom validation: TIV should match sum of components
  const sum = value.buildingValue + value.contentsValue + 
               (value.businessInterruptionValue || 0) + 
               (value.timeElementValue || 0) + 
               (value.otherValue || 0);
  
  if (Math.abs(value.totalInsuredValue - sum) > 0.01) {
    return helpers.error('any.custom', {
      message: `Total Insured Value (${value.totalInsuredValue}) must equal sum of components (${sum})`
    });
  }
  
  return value;
});

/**
 * Update Exposure validation schema
 */
const updateExposureSchema = Joi.object({
  // All fields optional for updates
  totalInsuredValue: Joi.number().min(0).optional(),
  buildingValue: Joi.number().min(0).optional(),
  contentsValue: Joi.number().min(0).optional(),
  businessInterruptionValue: Joi.number().min(0).optional(),
  timeElementValue: Joi.number().min(0).optional(),
  otherValue: Joi.number().min(0).optional(),
  currency: Joi.string().valid(...currencies).optional(),
  location: locationSchema.optional(),
  occupancyType: Joi.string().valid(...occupancyTypes).optional(),
  constructionType: Joi.string().valid(...constructionTypes).optional(),
  yearBuilt: Joi.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  numberOfStories: Joi.number().min(1).max(200).optional(),
  squareFootage: Joi.number().min(0).optional(),
  perilExposure: Joi.array().items(perilExposureSchema).optional(),
  policyTerms: policyTermsSchema.optional(),
  riskFactors: Joi.array().items(riskFactorSchema).optional(),
  status: Joi.string().valid(...statuses).optional(),
  dataQuality: dataQualitySchema.optional(),
  metadata: Joi.object().optional(),
  updatedBy: Joi.string().optional()
}).min(1); // At least one field must be provided

/**
 * Query/filter validation schema
 */
const queryExposureSchema = Joi.object({
  exposureId: Joi.string().pattern(exposureIdPattern).optional(),
  accountId: Joi.string().pattern(accountIdPattern).optional(),
  policyId: Joi.string().pattern(policyIdPattern).optional(),
  locationId: Joi.string().pattern(locationIdPattern).optional(),
  status: Joi.string().valid(...statuses).optional(),
  currency: Joi.string().valid(...currencies).optional(),
  region: Joi.string().valid(...regions).optional(),
  occupancyType: Joi.string().valid(...occupancyTypes).optional(),
  constructionType: Joi.string().valid(...constructionTypes).optional(),
  minValue: Joi.number().min(0).optional(),
  maxValue: Joi.number().min(0).optional(),
  effectiveDateFrom: Joi.date().optional(),
  effectiveDateTo: Joi.date().optional(),
  expirationDateFrom: Joi.date().optional(),
  expirationDateTo: Joi.date().optional(),
  
  // Pagination
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(1000).default(100),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('asc')
});

/**
 * Geographic query validation schema
 */
const geoQuerySchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radiusKm: Joi.number().min(0).max(20000).required(),
  status: Joi.string().valid(...statuses).default('Active'),
  minValue: Joi.number().min(0).default(0)
});

/**
 * Bounding box query validation schema
 */
const boundsQuerySchema = Joi.object({
  north: Joi.number().min(-90).max(90).required(),
  south: Joi.number().min(-90).max(90).required(),
  east: Joi.number().min(-180).max(180).required(),
  west: Joi.number().min(-180).max(180).required(),
  status: Joi.string().valid(...statuses).default('Active'),
  minValue: Joi.number().min(0).default(0)
}).custom((value, helpers) => {
  if (value.north <= value.south) {
    return helpers.error('any.custom', {
      message: 'North must be greater than South'
    });
  }
  if (value.east <= value.west) {
    return helpers.error('any.custom', {
      message: 'East must be greater than West'
    });
  }
  return value;
});

/**
 * Bulk exposure creation schema
 */
const bulkCreateExposureSchema = Joi.object({
  exposures: Joi.array()
    .items(createExposureSchema)
    .min(1)
    .max(1000)
    .required()
    .description('Array of exposures to create')
});

/**
 * Exposure summary/aggregation query schema
 */
const summaryQuerySchema = Joi.object({
  accountId: Joi.string().pattern(accountIdPattern).optional(),
  region: Joi.string().valid(...regions).optional(),
  status: Joi.string().valid(...statuses).default('Active'),
  groupBy: Joi.string().valid('region', 'occupancy', 'construction', 'currency', 'peril').required(),
  asOfDate: Joi.date().default(Date.now)
});

module.exports = {
  createExposureSchema,
  updateExposureSchema,
  queryExposureSchema,
  geoQuerySchema,
  boundsQuerySchema,
  bulkCreateExposureSchema,
  summaryQuerySchema,
  
  // Export components for reuse
  locationSchema,
  perilExposureSchema,
  policyTermsSchema,
  riskFactorSchema,
  dataQualitySchema
};
