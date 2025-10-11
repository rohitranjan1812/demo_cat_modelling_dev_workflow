const Joi = require('joi');

// Account validation schemas
const accountSchema = Joi.object({
  accountId: Joi.string().pattern(/^ACC-\d{6}$/).required(),
  accountName: Joi.string().max(200).required(),
  accountType: Joi.string().valid('Primary', 'Reinsurance', 'Retrocession', 'Facultative', 'Treaty').required(),
  parentAccountId: Joi.string().pattern(/^ACC-\d{6}$/).allow(null),
  accountLevel: Joi.number().integer().min(1).max(10).default(1),
  totalExposure: Joi.number().min(0).default(0),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').default('USD'),
  regions: Joi.array().items(Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa')),
  riskProfile: Joi.string().valid('Low', 'Medium', 'High', 'Very High').default('Medium'),
  maxExposurePerLocation: Joi.number().min(0).allow(null),
  maxExposurePerPeril: Joi.number().min(0).allow(null),
  status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Pending').default('Active'),
  effectiveDate: Joi.date().default(Date.now),
  expiryDate: Joi.date().allow(null),
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().pattern(Joi.string(), Joi.any())
});

const accountUpdateSchema = accountSchema.fork(['accountId', 'createdBy', 'accountType', 'accountName'], (schema) => schema.optional());

// Policy validation schemas
const coverageSchema = Joi.object({
  coverageType: Joi.string().valid('Property', 'Liability', 'Business Interruption', 'Cyber', 'Marine', 'Aviation', 'Energy').required(),
  coverageLimit: Joi.number().min(0).required(),
  deductible: Joi.number().min(0).required(),
  coveragePercentage: Joi.number().min(0).max(100).default(100)
});

const policySchema = Joi.object({
  policyId: Joi.string().pattern(/^POL-\d{8}$/).required(),
  policyNumber: Joi.string().required(),
  accountId: Joi.string().pattern(/^ACC-\d{6}$/).required(),
  policyName: Joi.string().max(200).required(),
  policyType: Joi.string().valid('Direct', 'Reinsurance', 'Facultative', 'Treaty', 'Retrocession').required(),
  coverages: Joi.array().items(coverageSchema).min(1).required(),
  totalLimit: Joi.number().min(0).required(),
  totalDeductible: Joi.number().min(0).required(),
  premium: Joi.number().min(0).required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').default('USD'),
  effectiveDate: Joi.date().required(),
  expiryDate: Joi.date().required(),
  coveredRegions: Joi.array().items(Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa')),
  coveredPerils: Joi.array().items(Joi.string().valid('Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic')),
  riskCharacteristics: Joi.object({
    occupancyType: Joi.string().valid('Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed'),
    constructionType: Joi.string().valid('Frame', 'Masonry', 'Concrete', 'Steel', 'Mixed'),
    yearBuilt: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    numberOfStories: Joi.number().integer().min(1).max(200),
    squareFootage: Joi.number().min(0)
  }),
  sublimits: Joi.array().items(Joi.object({
    peril: Joi.string().valid('Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic').required(),
    limit: Joi.number().min(0).required(),
    deductible: Joi.number().min(0).required(),
    region: Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa')
  })),
  specialConditions: Joi.array().items(Joi.object({
    conditionType: Joi.string().valid('Exclusion', 'Endorsement', 'Warranty', 'Condition', 'Clause').required(),
    description: Joi.string().max(1000).required(),
    effectiveDate: Joi.date().required(),
    expiryDate: Joi.date().allow(null),
    isActive: Joi.boolean().default(true)
  })),
  status: Joi.string().valid('Active', 'Inactive', 'Cancelled', 'Expired', 'Pending').default('Active'),
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().pattern(Joi.string(), Joi.any())
});

const policyUpdateSchema = policySchema.fork(['policyId', 'createdBy'], (schema) => schema.optional());

// Location validation schemas
const coordinatesSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  elevation: Joi.number().min(-1000).max(10000).default(0)
});

const addressSchema = Joi.object({
  street: Joi.string().max(200).required(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100),
  postalCode: Joi.string().max(20),
  country: Joi.string().max(100).required(),
  region: Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa').required()
});

const riskFactorSchema = Joi.object({
  peril: Joi.string().valid('Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic').required(),
  riskScore: Joi.number().min(0).max(10).required(),
  probability: Joi.number().min(0).max(1).required(),
  expectedLoss: Joi.number().min(0).required(),
  lastUpdated: Joi.date().default(Date.now)
});

const locationSchema = Joi.object({
  locationId: Joi.string().pattern(/^LOC-\d{8}$/).required(),
  locationName: Joi.string().max(200).required(),
  coordinates: coordinatesSchema.required(),
  address: addressSchema.required(),
  riskZones: Joi.array().items(Joi.object({
    zoneType: Joi.string().valid('Flood', 'Earthquake', 'Hurricane', 'Wildfire', 'Tornado', 'Wind', 'Storm Surge').required(),
    zoneCode: Joi.string().required(),
    zoneDescription: Joi.string().max(500),
    riskLevel: Joi.string().valid('Low', 'Medium', 'High', 'Very High', 'Extreme').required()
  })),
  riskFactors: Joi.array().items(riskFactorSchema),
  propertyCharacteristics: Joi.object({
    occupancyType: Joi.string().valid('Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed').required(),
    constructionType: Joi.string().valid('Frame', 'Masonry', 'Concrete', 'Steel', 'Mixed').required(),
    yearBuilt: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    numberOfStories: Joi.number().integer().min(1).max(200),
    squareFootage: Joi.number().min(0),
    replacementCost: Joi.number().min(0),
    marketValue: Joi.number().min(0)
  }),
  totalExposure: Joi.number().min(0).default(0),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').default('USD'),
  associatedPolicies: Joi.array().items(Joi.object({
    policyId: Joi.string().pattern(/^POL-\d{8}$/).required(),
    exposureAmount: Joi.number().min(0).required(),
    effectiveDate: Joi.date().required(),
    expiryDate: Joi.date().required()
  })),
  catModelData: Joi.object({
    modelProvider: Joi.string().valid('RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'Custom'),
    modelVersion: Joi.string().max(50),
    lastModelUpdate: Joi.date().default(Date.now),
    modelResults: Joi.object().pattern(Joi.string(), Joi.any())
  }),
  status: Joi.string().valid('Active', 'Inactive', 'Under Review', 'Excluded').default('Active'),
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().pattern(Joi.string(), Joi.any())
});

const locationUpdateSchema = locationSchema.fork(['locationId', 'createdBy'], (schema) => schema.optional());

// Sublimit validation schemas
const sublimitSchema = Joi.object({
  sublimitId: Joi.string().pattern(/^SUB-\d{8}$/).required(),
  sublimitName: Joi.string().max(200).required(),
  accountId: Joi.string().pattern(/^ACC-\d{6}$/).allow(null),
  policyId: Joi.string().pattern(/^POL-\d{8}$/).allow(null),
  locationId: Joi.string().pattern(/^LOC-\d{8}$/).allow(null),
  scope: Joi.string().valid('Account', 'Policy', 'Location', 'Peril', 'Region', 'Coverage', 'Global').required(),
  coverageType: Joi.string().valid('Property', 'Liability', 'Business Interruption', 'Cyber', 'Marine', 'Aviation', 'Energy').required(),
  peril: Joi.string().valid('Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic', 'All Perils'),
  region: Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa', 'Global'),
  limit: Joi.number().min(0).required(),
  deductible: Joi.number().min(0).required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').default('USD'),
  aggregationRule: Joi.string().valid('Per Occurrence', 'Per Location', 'Per Policy', 'Per Account', 'Per Year', 'Per Event').default('Per Occurrence'),
  sharingRule: Joi.string().valid('Primary', 'Excess', 'Proportional', 'Layered').default('Primary'),
  priority: Joi.number().integer().min(1).max(100).default(1),
  layer: Joi.number().integer().min(1).max(20).default(1),
  geographicConstraints: Joi.object({
    countries: Joi.array().items(Joi.string().length(3)),
    states: Joi.array().items(Joi.string().max(100)),
    postalCodes: Joi.array().items(Joi.string().max(20)),
    coordinates: Joi.object({
      type: Joi.string().valid('Point', 'Polygon', 'Circle').default('Point'),
      coordinates: Joi.array().items(Joi.number()),
      radius: Joi.number().min(0)
    })
  }),
  timeConstraints: Joi.object({
    effectiveDate: Joi.date().default(Date.now),
    expiryDate: Joi.date().allow(null),
    seasonalRestrictions: Joi.array().items(Joi.object({
      startMonth: Joi.number().integer().min(1).max(12).required(),
      endMonth: Joi.number().integer().min(1).max(12).required(),
      restrictionType: Joi.string().valid('Reduced Limit', 'Exclusion', 'Higher Deductible').required(),
      adjustmentFactor: Joi.number().min(0).max(2).required()
    }))
  }),
  businessRules: Joi.object({
    maxExposurePerLocation: Joi.number().min(0).allow(null),
    maxExposurePerPolicy: Joi.number().min(0).allow(null),
    maxExposurePerAccount: Joi.number().min(0).allow(null),
    minRetention: Joi.number().min(0).default(0),
    maxCession: Joi.number().min(0).max(100).default(100)
  }),
  status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Expired', 'Pending').default('Active'),
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().pattern(Joi.string(), Joi.any())
});

const sublimitUpdateSchema = sublimitSchema.fork(['sublimitId', 'createdBy'], (schema) => schema.optional());

// Special Condition validation schemas
const specialConditionSchema = Joi.object({
  conditionId: Joi.string().pattern(/^CON-\d{8}$/).required(),
  conditionName: Joi.string().max(200).required(),
  conditionType: Joi.string().valid('Exclusion', 'Endorsement', 'Warranty', 'Condition', 'Clause', 'Rider', 'Amendment').required(),
  category: Joi.string().valid('Coverage', 'Exclusion', 'Deductible', 'Limit', 'Territory', 'Time', 'Peril', 'Property', 'Liability', 'Other').required(),
  accountId: Joi.string().pattern(/^ACC-\d{6}$/).allow(null),
  policyId: Joi.string().pattern(/^POL-\d{8}$/).allow(null),
  locationId: Joi.string().pattern(/^LOC-\d{8}$/).allow(null),
  description: Joi.string().max(2000).required(),
  shortDescription: Joi.string().max(500),
  coverageImpact: Joi.string().valid('Increases Coverage', 'Decreases Coverage', 'Excludes Coverage', 'Modifies Coverage', 'No Impact').required(),
  financialImpact: Joi.object({
    impactType: Joi.string().valid('Premium Adjustment', 'Deductible Change', 'Limit Change', 'Exclusion', 'No Impact'),
    adjustmentAmount: Joi.number().default(0),
    adjustmentPercentage: Joi.number().min(-100).max(1000).default(0),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').default('USD')
  }),
  scope: Joi.string().valid('Account', 'Policy', 'Location', 'Peril', 'Region', 'Coverage', 'Global').required(),
  applicablePerils: Joi.array().items(Joi.string().valid('Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic', 'All Perils')),
  applicableRegions: Joi.array().items(Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa', 'Global')),
  applicableCoverages: Joi.array().items(Joi.string().valid('Property', 'Liability', 'Business Interruption', 'Cyber', 'Marine', 'Aviation', 'Energy')),
  geographicConstraints: Joi.object({
    countries: Joi.array().items(Joi.string().length(3)),
    states: Joi.array().items(Joi.string().max(100)),
    postalCodes: Joi.array().items(Joi.string().max(20)),
    coordinates: Joi.object({
      type: Joi.string().valid('Point', 'Polygon', 'Circle').default('Point'),
      coordinates: Joi.array().items(Joi.number()),
      radius: Joi.number().min(0)
    })
  }),
  timeConstraints: Joi.object({
    effectiveDate: Joi.date().default(Date.now),
    expiryDate: Joi.date().allow(null),
    seasonalRestrictions: Joi.array().items(Joi.object({
      startMonth: Joi.number().integer().min(1).max(12).required(),
      endMonth: Joi.number().integer().min(1).max(12).required(),
      restrictionType: Joi.string().valid('Active', 'Inactive', 'Modified').required(),
      modificationFactor: Joi.number().min(0).max(2).required()
    }))
  }),
  conditionRules: Joi.object({
    triggerEvents: Joi.array().items(Joi.string().valid('Loss Occurrence', 'Policy Renewal', 'Location Change', 'Coverage Change', 'Manual Trigger')),
    evaluationCriteria: Joi.string().max(1000),
    complianceRequired: Joi.boolean().default(false),
    complianceDeadline: Joi.date().allow(null),
    nonComplianceConsequences: Joi.string().max(1000)
  }),
  dependencies: Joi.array().items(Joi.object({
    conditionId: Joi.string().pattern(/^CON-\d{8}$/).required(),
    relationshipType: Joi.string().valid('Prerequisite', 'Mutually Exclusive', 'Complementary', 'Override').required(),
    isRequired: Joi.boolean().default(false)
  })),
  priority: Joi.number().integer().min(1).max(100).default(50),
  precedence: Joi.number().integer().min(1).max(100).default(50),
  status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Expired', 'Pending', 'Under Review').default('Active'),
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().pattern(Joi.string(), Joi.any())
});

const specialConditionUpdateSchema = specialConditionSchema.fork(['conditionId', 'createdBy'], (schema) => schema.optional());

// Query parameter validation schemas
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Expired', 'Pending', 'Under Review'),
  search: Joi.string().max(200)
});

module.exports = {
  accountSchema,
  accountUpdateSchema,
  policySchema,
  policyUpdateSchema,
  locationSchema,
  locationUpdateSchema,
  sublimitSchema,
  sublimitUpdateSchema,
  specialConditionSchema,
  specialConditionUpdateSchema,
  querySchema
};
