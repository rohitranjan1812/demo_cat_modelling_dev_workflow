const mongoose = require('../config/mongoose-wrapper');

/**
 * Exposure Model
 * Represents the value at risk for specific locations, assets, or portfolios
 * Consolidates exposure data from accounts, policies, and locations
 */

// Geographic location schema for exposure
const exposureLocationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  elevation: {
    type: Number,
    min: -1000,
    max: 10000,
    default: 0
  },
  address: {
    street: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    region: {
      type: String,
      required: true,
      enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
    }
  }
}, { _id: false });

// Exposure value by peril type
const perilExposureSchema = new mongoose.Schema({
  peril: {
    type: String,
    required: true,
    enum: [
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm'
    ]
  },
  exposureValue: {
    type: Number,
    required: true,
    min: 0
  },
  deductible: {
    type: Number,
    min: 0,
    default: 0
  },
  limit: {
    type: Number,
    min: 0
  },
  attachmentPoint: {
    type: Number,
    min: 0,
    default: 0
  },
  premium: {
    type: Number,
    min: 0,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Building/Asset characteristics
const assetCharacteristicsSchema = new mongoose.Schema({
  occupancyType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use', 'Other']
  },
  constructionType: {
    type: String,
    enum: ['Wood Frame', 'Steel Frame', 'Concrete', 'Masonry', 'Mixed', 'Other']
  },
  yearBuilt: {
    type: Number,
    min: 1800,
    max: 2100
  },
  numberOfStories: {
    type: Number,
    min: 0,
    max: 200
  },
  totalArea: {
    type: Number,
    min: 0
  },
  areaUnit: {
    type: String,
    enum: ['sqft', 'sqm'],
    default: 'sqft'
  },
  basementPresent: {
    type: Boolean,
    default: false
  },
  roofType: {
    type: String,
    enum: ['Flat', 'Pitched', 'Gabled', 'Hip', 'Other']
  },
  foundationType: {
    type: String,
    enum: ['Slab', 'Crawlspace', 'Basement', 'Pier', 'Other']
  }
}, { _id: false });

// Main Exposure Schema
const exposureSchema = new mongoose.Schema({
  // Identification
  exposureId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^EXP-\d{8}$/.test(v);
      },
      message: 'Exposure ID must be in format EXP-XXXXXXXX'
    }
  },
  
  exposureName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  exposureType: {
    type: String,
    required: true,
    enum: ['Property', 'Casualty', 'Business Interruption', 'Liability', 'Multi-Line'],
    index: true
  },
  
  // Relationships
  accountId: {
    type: String,
    required: true,
    ref: 'Account',
    index: true
  },
  
  policyId: {
    type: String,
    ref: 'Policy',
    index: true
  },
  
  locationId: {
    type: String,
    ref: 'Location',
    index: true
  },
  
  // Location Information
  location: {
    type: exposureLocationSchema,
    required: true
  },
  
  // Financial Information
  totalInsuredValue: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  
  buildingValue: {
    type: Number,
    min: 0,
    default: 0
  },
  
  contentsValue: {
    type: Number,
    min: 0,
    default: 0
  },
  
  businessInterruptionValue: {
    type: Number,
    min: 0,
    default: 0
  },
  
  otherValue: {
    type: Number,
    min: 0,
    default: 0
  },
  
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'],
    index: true
  },
  
  // Peril-specific exposures
  perilExposures: {
    type: [perilExposureSchema],
    default: []
  },
  
  // Asset Characteristics
  assetCharacteristics: {
    type: assetCharacteristicsSchema
  },
  
  // Coverage Details
  coverageDetails: {
    policyNumber: { type: String, trim: true },
    coverageType: {
      type: String,
      enum: ['Named Peril', 'All Risk', 'Catastrophe', 'Multi-Peril']
    },
    deductible: { type: Number, min: 0, default: 0 },
    deductibleType: {
      type: String,
      enum: ['Flat', 'Percentage', 'Per Occurrence', 'Annual Aggregate']
    },
    limit: { type: Number, min: 0 },
    sublimits: [{
      coverageType: String,
      limit: Number
    }],
    coinsurance: { type: Number, min: 0, max: 100, default: 100 },
    attachmentPoint: { type: Number, min: 0, default: 0 }
  },
  
  // Temporal Information
  effectiveDate: {
    type: Date,
    required: true,
    index: true
  },
  
  expiryDate: {
    type: Date,
    required: true,
    index: true
  },
  
  // Status
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive', 'Expired', 'Pending', 'Cancelled'],
    default: 'Active',
    index: true
  },
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 5
  },
  
  riskGrade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    default: 'C'
  },
  
  vulnerabilityScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  dataSource: {
    type: String,
    maxlength: 200,
    default: 'Manual Entry'
  },
  
  dataQuality: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Unknown'],
    default: 'Medium'
  },
  
  lastValidated: {
    type: Date,
    default: Date.now
  },
  
  // Audit fields
  createdBy: {
    type: String,
    required: true
  },
  
  lastModifiedBy: {
    type: String,
    required: true
  },
  
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'exposures'
});

// Indexes for performance
exposureSchema.index({ accountId: 1, status: 1 });
exposureSchema.index({ policyId: 1, status: 1 });
exposureSchema.index({ locationId: 1 });
exposureSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
exposureSchema.index({ effectiveDate: 1, expiryDate: 1 });
exposureSchema.index({ currency: 1, totalInsuredValue: 1 });
exposureSchema.index({ exposureType: 1, status: 1 });
exposureSchema.index({ 'location.address.region': 1 });
exposureSchema.index({ 'location.address.country': 1 });

// Geospatial index for location-based queries
exposureSchema.index({ 'location.latitude': 1, 'location.longitude': 1 }, { '2dsphere': true });

// Instance Methods

/**
 * Calculate total exposure for a specific peril
 * @param {string} peril - Peril type
 * @returns {number} Total exposure value for the peril
 */
exposureSchema.methods.calculateTotalExposureForPeril = function(peril) {
  const perilExposure = this.perilExposures.find(p => p.peril === peril);
  if (perilExposure) {
    return perilExposure.exposureValue;
  }
  // If no specific peril exposure, return total insured value
  return this.totalInsuredValue;
};

/**
 * Get net exposure after deductibles
 * @param {string} peril - Peril type (optional)
 * @returns {number} Net exposure value
 */
exposureSchema.methods.getNetExposure = function(peril = null) {
  if (peril) {
    const perilExposure = this.perilExposures.find(p => p.peril === peril);
    if (perilExposure) {
      return Math.max(0, perilExposure.exposureValue - perilExposure.deductible);
    }
  }
  return Math.max(0, this.totalInsuredValue - (this.coverageDetails?.deductible || 0));
};

/**
 * Check if exposure is currently active
 * @returns {boolean} True if exposure is active
 */
exposureSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'Active' &&
         this.effectiveDate <= now &&
         this.expiryDate >= now;
};

/**
 * Validate exposure consistency
 * @returns {Object} Validation result
 */
exposureSchema.methods.validateExposureConsistency = function() {
  const errors = [];
  const warnings = [];
  
  // Check if sum of components equals total
  const componentSum = this.buildingValue + this.contentsValue + 
                       this.businessInterruptionValue + this.otherValue;
  
  if (Math.abs(componentSum - this.totalInsuredValue) > 0.01) {
    warnings.push('Sum of component values does not match total insured value');
  }
  
  // Check date consistency
  if (this.expiryDate <= this.effectiveDate) {
    errors.push('Expiry date must be after effective date');
  }
  
  // Check peril exposures
  this.perilExposures.forEach(peril => {
    if (peril.exposureValue > this.totalInsuredValue) {
      warnings.push(`Peril exposure for ${peril.peril} exceeds total insured value`);
    }
    if (peril.limit && peril.limit < peril.deductible) {
      errors.push(`Limit is less than deductible for ${peril.peril}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Static Methods

/**
 * Find exposures within a geographic radius
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of exposures
 */
exposureSchema.statics.getExposuresInRadius = async function(latitude, longitude, radiusKm, filters = {}) {
  const radiusInDegrees = radiusKm / 111; // Approximate km to degrees
  
  const query = {
    'location.latitude': {
      $gte: latitude - radiusInDegrees,
      $lte: latitude + radiusInDegrees
    },
    'location.longitude': {
      $gte: longitude - radiusInDegrees,
      $lte: longitude + radiusInDegrees
    },
    ...filters
  };
  
  return await this.find(query);
};

/**
 * Get active exposures
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of active exposures
 */
exposureSchema.statics.getActiveExposures = async function(filters = {}) {
  const now = new Date();
  
  return await this.find({
    status: 'Active',
    effectiveDate: { $lte: now },
    expiryDate: { $gte: now },
    ...filters
  });
};

/**
 * Calculate total exposure for account
 * @param {string} accountId - Account identifier
 * @param {Object} options - Calculation options
 * @returns {Promise<Object>} Exposure summary
 */
exposureSchema.statics.calculateAccountExposure = async function(accountId, options = {}) {
  const { currency = 'USD', includeInactive = false } = options;
  
  const query = { accountId };
  if (!includeInactive) {
    query.status = 'Active';
  }
  if (currency) {
    query.currency = currency;
  }
  
  const exposures = await this.find(query);
  
  const summary = {
    accountId,
    currency,
    totalExposure: 0,
    buildingExposure: 0,
    contentsExposure: 0,
    businessInterruptionExposure: 0,
    otherExposure: 0,
    numberOfExposures: exposures.length,
    exposuresByType: {},
    exposuresByRegion: {},
    perilExposures: {}
  };
  
  exposures.forEach(exposure => {
    summary.totalExposure += exposure.totalInsuredValue;
    summary.buildingExposure += exposure.buildingValue;
    summary.contentsExposure += exposure.contentsValue;
    summary.businessInterruptionExposure += exposure.businessInterruptionValue;
    summary.otherExposure += exposure.otherValue;
    
    // By type
    const type = exposure.exposureType;
    summary.exposuresByType[type] = (summary.exposuresByType[type] || 0) + exposure.totalInsuredValue;
    
    // By region
    const region = exposure.location.address.region;
    summary.exposuresByRegion[region] = (summary.exposuresByRegion[region] || 0) + exposure.totalInsuredValue;
    
    // By peril
    exposure.perilExposures.forEach(peril => {
      summary.perilExposures[peril.peril] = (summary.perilExposures[peril.peril] || 0) + peril.exposureValue;
    });
  });
  
  return summary;
};

/**
 * Find exposures for specific perils
 * @param {Array<string>} perils - Array of peril types
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of exposures
 */
exposureSchema.statics.getExposuresForPerils = async function(perils, filters = {}) {
  return await this.find({
    'perilExposures.peril': { $in: perils },
    ...filters
  });
};

/**
 * Generate exposure ID
 * @returns {string} New exposure ID
 */
exposureSchema.statics.generateExposureId = function() {
  const timestamp = Date.now().toString().slice(-8);
  return `EXP-${timestamp}`;
};

// Middleware

// Pre-save validation
exposureSchema.pre('save', function(next) {
  // Auto-generate exposure ID if not provided
  if (!this.exposureId) {
    this.exposureId = this.constructor.generateExposureId();
  }
  
  // Validate dates
  if (this.expiryDate <= this.effectiveDate) {
    return next(new Error('Expiry date must be after effective date'));
  }
  
  // Update status based on dates
  const now = new Date();
  if (this.expiryDate < now && this.status === 'Active') {
    this.status = 'Expired';
  }
  
  // Increment version
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  
  next();
});

// Post-save hook for logging
exposureSchema.post('save', function(doc) {
  console.log(`Exposure ${doc.exposureId} saved successfully`);
});

const Exposure = mongoose.model('Exposure', exposureSchema);

module.exports = Exposure;
