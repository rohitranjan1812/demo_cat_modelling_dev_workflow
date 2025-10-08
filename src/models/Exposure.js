const mongoose = require('../config/mongoose-wrapper');

/**
 * Exposure Model - Unified source of truth for exposure data
 * Consolidates exposure information from Account, Policy, and Location
 * 
 * This model addresses the critical gap identified in ACTION_PLAN_2025-10-03.md
 * where exposure data was fragmented across multiple models.
 */

const exposureSchema = new mongoose.Schema({
  // Basic Exposure Information
  exposureId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^EXP-\d{10}$/.test(v);
      },
      message: 'Exposure ID must be in format EXP-XXXXXXXXXX'
    }
  },
  
  // References
  accountId: {
    type: String,
    required: true,
    ref: 'Account',
    index: true
  },
  
  policyId: {
    type: String,
    required: true,
    ref: 'Policy',
    index: true
  },
  
  locationId: {
    type: String,
    required: true,
    ref: 'Location',
    index: true
  },
  
  // Exposure Values
  totalInsuredValue: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  
  buildingValue: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  contentsValue: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  businessInterruptionValue: {
    type: Number,
    min: 0,
    default: 0
  },
  
  timeElementValue: {
    type: Number,
    min: 0,
    default: 0
  },
  
  otherValue: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Currency
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'],
    index: true
  },
  
  // Geographic Information (denormalized for performance)
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
      index: true
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
      index: true
    },
    elevation: {
      type: Number,
      min: -1000,
      max: 10000,
      default: 0
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, required: true },
      region: {
        type: String,
        required: true,
        enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'],
        index: true
      }
    }
  },
  
  // Occupancy and Construction
  occupancyType: {
    type: String,
    required: true,
    enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use', 'Institutional'],
    index: true
  },
  
  constructionType: {
    type: String,
    required: true,
    enum: ['Wood Frame', 'Masonry', 'Concrete', 'Steel Frame', 'Mixed', 'Manufactured Housing'],
    index: true
  },
  
  yearBuilt: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear() + 5
  },
  
  numberOfStories: {
    type: Number,
    min: 1,
    max: 200,
    default: 1
  },
  
  squareFootage: {
    type: Number,
    min: 0
  },
  
  // Peril-Specific Exposure
  perilExposure: [{
    peril: {
      type: String,
      required: true,
      enum: ['Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood', 
             'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 
             'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave', 
             'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm']
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
    isExcluded: {
      type: Boolean,
      default: false
    }
  }],
  
  // Policy Terms (denormalized for performance)
  policyTerms: {
    effectiveDate: {
      type: Date,
      required: true,
      index: true
    },
    expirationDate: {
      type: Date,
      required: true,
      index: true
    },
    deductible: {
      type: Number,
      required: true,
      min: 0
    },
    limit: {
      type: Number,
      required: true,
      min: 0
    },
    coinsurance: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    blanketGroup: String,
    sublimits: [{
      type: {
        type: String,
        enum: ['Property', 'Contents', 'Business Interruption', 'Time Element', 'Other']
      },
      amount: Number
    }]
  },
  
  // Risk Assessment
  riskFactors: [{
    peril: {
      type: String,
      required: true,
      enum: ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic']
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    expectedLoss: {
      type: Number,
      required: true,
      min: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled', 'Suspended', 'Pending'],
    default: 'Active',
    index: true
  },
  
  dataQuality: {
    completeness: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    lastValidated: Date,
    validationErrors: [String]
  },
  
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  // Audit Fields
  createdBy: {
    type: String,
    default: 'system'
  },
  
  updatedBy: {
    type: String,
    default: 'system'
  },
  
  dataSource: {
    type: String,
    enum: ['Manual Entry', 'Import', 'Integration', 'Migration', 'Calculation'],
    default: 'Manual Entry'
  }
}, {
  timestamps: true,
  collection: 'exposures'
});

// Indexes for performance
exposureSchema.index({ accountId: 1, status: 1 });
exposureSchema.index({ policyId: 1, status: 1 });
exposureSchema.index({ locationId: 1, status: 1 });
exposureSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
exposureSchema.index({ 'location.address.region': 1, status: 1 });
exposureSchema.index({ 'policyTerms.effectiveDate': 1, 'policyTerms.expirationDate': 1 });
exposureSchema.index({ occupancyType: 1, constructionType: 1 });
exposureSchema.index({ totalInsuredValue: -1 });

// Compound index for geospatial queries
exposureSchema.index({ 
  'location.latitude': 1, 
  'location.longitude': 1, 
  status: 1,
  'policyTerms.effectiveDate': 1,
  'policyTerms.expirationDate': 1
});

// 2dsphere index for advanced geospatial queries
exposureSchema.index({
  'location': '2dsphere'
});

// Virtual for active status check
exposureSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'Active' && 
         this.policyTerms.effectiveDate <= now && 
         this.policyTerms.expirationDate >= now;
});

/**
 * Calculate total exposure for a specific peril
 * @param {String} perilType - Type of peril (e.g., 'Earthquake', 'Hurricane')
 * @returns {Number} Total exposure value for the peril
 */
exposureSchema.methods.calculateTotalExposureForPeril = function(perilType) {
  const perilExp = this.perilExposure.find(p => p.peril === perilType);
  if (!perilExp || perilExp.isExcluded) {
    return 0;
  }
  return Math.min(perilExp.exposureValue, perilExp.limit || Infinity) - perilExp.deductible;
};

/**
 * Get net exposure after applying policy terms
 * @param {Number} grossLoss - Gross loss amount
 * @returns {Number} Net loss after deductibles and limits
 */
exposureSchema.methods.applyPolicyTerms = function(grossLoss) {
  // Apply deductible
  let netLoss = Math.max(0, grossLoss - this.policyTerms.deductible);
  
  // Apply coinsurance
  netLoss = netLoss * (this.policyTerms.coinsurance / 100);
  
  // Apply limit
  netLoss = Math.min(netLoss, this.policyTerms.limit);
  
  return netLoss;
};

/**
 * Check if exposure is valid for a given date
 * @param {Date} date - Date to check
 * @returns {Boolean} True if exposure is valid on the date
 */
exposureSchema.methods.isValidOnDate = function(date = new Date()) {
  return this.status === 'Active' &&
         this.policyTerms.effectiveDate <= date &&
         this.policyTerms.expirationDate >= date;
};

/**
 * Validate exposure consistency
 * @returns {Object} Validation result with isValid flag and errors array
 */
exposureSchema.methods.validateExposureConsistency = function() {
  const errors = [];
  
  // Check TIV matches sum of components
  const sumComponents = this.buildingValue + this.contentsValue + 
                       (this.businessInterruptionValue || 0) + 
                       (this.timeElementValue || 0) + 
                       (this.otherValue || 0);
  
  if (Math.abs(this.totalInsuredValue - sumComponents) > 0.01) {
    errors.push(`TIV mismatch: ${this.totalInsuredValue} vs ${sumComponents}`);
  }
  
  // Check peril exposure doesn't exceed TIV
  this.perilExposure.forEach(pe => {
    if (pe.exposureValue > this.totalInsuredValue) {
      errors.push(`Peril ${pe.peril} exposure ${pe.exposureValue} exceeds TIV ${this.totalInsuredValue}`);
    }
  });
  
  // Check policy dates
  if (this.policyTerms.expirationDate <= this.policyTerms.effectiveDate) {
    errors.push('Expiration date must be after effective date');
  }
  
  // Check limit is reasonable
  if (this.policyTerms.limit < this.totalInsuredValue * 0.1) {
    errors.push(`Policy limit ${this.policyTerms.limit} seems too low for TIV ${this.totalInsuredValue}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Static method: Find exposures within radius of a point
 * @param {Number} latitude - Center latitude
 * @param {Number} longitude - Center longitude
 * @param {Number} radiusKm - Radius in kilometers
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Array of exposures within radius
 */
exposureSchema.statics.getExposuresInRadius = async function(latitude, longitude, radiusKm, options = {}) {
  const { status = 'Active', minValue = 0 } = options;
  
  // Simple bounding box calculation (approximate)
  const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
  const lonDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
  
  const query = {
    'location.latitude': { $gte: latitude - latDelta, $lte: latitude + latDelta },
    'location.longitude': { $gte: longitude - lonDelta, $lte: longitude + lonDelta },
    status: status,
    totalInsuredValue: { $gte: minValue }
  };
  
  return this.find(query);
};

/**
 * Static method: Get active exposures
 * @param {Date} asOfDate - Date to check active status (defaults to now)
 * @returns {Promise<Array>} Array of active exposures
 */
exposureSchema.statics.getActiveExposures = async function(asOfDate = new Date()) {
  return this.find({
    status: 'Active',
    'policyTerms.effectiveDate': { $lte: asOfDate },
    'policyTerms.expirationDate': { $gte: asOfDate }
  });
};

/**
 * Static method: Get exposures by region
 * @param {String} region - Region name
 * @param {Object} options - Additional query options
 * @returns {Promise<Array>} Array of exposures in the region
 */
exposureSchema.statics.getExposuresByRegion = async function(region, options = {}) {
  const { status = 'Active', minValue = 0 } = options;
  
  return this.find({
    'location.address.region': region,
    status: status,
    totalInsuredValue: { $gte: minValue }
  });
};

/**
 * Static method: Calculate total exposure for account
 * @param {String} accountId - Account ID
 * @returns {Promise<Number>} Total exposure value
 */
exposureSchema.statics.getTotalExposureForAccount = async function(accountId) {
  const result = await this.aggregate([
    {
      $match: {
        accountId: accountId,
        status: 'Active'
      }
    },
    {
      $group: {
        _id: null,
        totalExposure: { $sum: '$totalInsuredValue' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].totalExposure : 0;
};

/**
 * Pre-save middleware: Generate exposureId if not present
 */
exposureSchema.pre('save', function(next) {
  if (!this.exposureId) {
    // Generate unique ID: EXP-XXXXXXXXXX (timestamp + random)
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    this.exposureId = `EXP-${timestamp}${random}`;
  }
  next();
});

/**
 * Pre-save middleware: Validate data consistency
 */
exposureSchema.pre('save', function(next) {
  const validation = this.validateExposureConsistency();
  if (!validation.isValid && this.dataQuality) {
    this.dataQuality.validationErrors = validation.errors;
    this.dataQuality.completeness = 80; // Mark as incomplete if validation fails
  }
  next();
});

const Exposure = mongoose.model('Exposure', exposureSchema);

module.exports = Exposure;
