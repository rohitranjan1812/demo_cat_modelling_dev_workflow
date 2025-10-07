const mongoose = require('../config/mongoose-wrapper');
const { 
  PERIL_TYPE_VALUES,
  EXPOSURE_TYPE_VALUES,
  CURRENCY_VALUES,
  OCCUPANCY_TYPE_VALUES,
  CONSTRUCTION_TYPE_VALUES,
  EXPOSURE_STATUS_VALUES
} = require('../constants');

const perilExposureSchema = new mongoose.Schema({
  peril: {
    type: String,
    required: true,
    enum: PERIL_TYPE_VALUES
  },
  
  exposureAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  deductible: {
    type: Number,
    min: 0,
    default: 0
  }
}, { _id: false });

const exposureSchema = new mongoose.Schema({
  // Basic Exposure Information
  exposureId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^EXP-\d{8}$/.test(v);
      },
      message: 'Exposure ID must be in format EXP-XXXXXXXX'
    }
  },
  
  exposureType: {
    type: String,
    required: true,
    enum: EXPOSURE_TYPE_VALUES,
    index: true
  },
  
  accountId: {
    type: String,
    required: true,
    ref: 'Account',
    index: true
  },
  
  // Relationship Fields
  accountId: {
    type: String,
    ref: 'Account',
    required: true,
    index: true
  },
  
  policyId: {
    type: String,
    ref: 'Policy',
    required: true,
    index: true
  },
  
  locationId: {
    type: String,
    ref: 'Location',
    required: true,
    index: true
  },
  
  // Financial Information
  totalInsuredValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  replacementValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: CURRENCY_VALUES
  },
  
  perilExposures: [perilExposureSchema],
  
  location: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 }
  },
  
  occupancyType: {
    type: String,
    required: true,
    enum: OCCUPANCY_TYPE_VALUES,
    index: true
  },
  
  constructionType: {
    type: String,
    required: true,
    enum: CONSTRUCTION_TYPE_VALUES,
    index: true
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
  
  status: {
    type: String,
    enum: EXPOSURE_STATUS_VALUES,
    default: 'Active',
    index: true
  },
  
  createdBy: {
    type: String,
    required: true
  },
  
  lastModifiedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
exposureSchema.index({ accountId: 1, status: 1 });
exposureSchema.index({ policyId: 1, status: 1 });
exposureSchema.index({ locationId: 1, status: 1 });
exposureSchema.index({ effectiveDate: 1, expiryDate: 1 });
exposureSchema.index({ exposureId: 1 }, { unique: true });
exposureSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
exposureSchema.index({ 'perilExposures.peril': 1 });

// Virtual property for display name
exposureSchema.virtual('displayName').get(function() {
  return `${this.exposureType} - ${this.exposureId}`;
});

// Instance methods

/**
 * Check if exposure is currently active
 */
exposureSchema.methods.isActive = function() {
  const now = new Date();
  return (
    this.status === 'Active' &&
    this.effectiveDate <= now &&
    this.expiryDate >= now
  );
};

/**
 * Get total exposure for a specific peril
 */
exposureSchema.methods.getTotalExposureForPeril = function(peril) {
  const perilExp = this.perilExposures.find(p => p.peril === peril);
  return perilExp ? perilExp.exposureAmount : 0;
};

/**
 * Get list of active perils
 */
exposureSchema.methods.getActivePerils = function() {
  return this.perilExposures.map(p => p.peril);
};

/**
 * Calculate net exposure after deductible for a peril
 */
exposureSchema.methods.calculateNetExposure = function(peril) {
  const perilExp = this.perilExposures.find(p => p.peril === peril);
  if (!perilExp) return 0;
  return Math.max(0, perilExp.exposureAmount - perilExp.deductible);
};

/**
 * Calculate risk-adjusted exposure value
 */
exposureSchema.methods.getRiskAdjustedExposure = function() {
  // Risk factors based on occupancy and construction
  const occupancyRiskFactors = {
    'Residential': 1.0,
    'Commercial': 1.2,
    'Industrial': 1.5,
    'Agricultural': 0.8,
    'Institutional': 1.1,
    'Mixed-Use': 1.15
  };

  const constructionRiskFactors = {
    'Frame': 1.3,
    'Masonry': 1.0,
    'Concrete': 0.8,
    'Steel': 0.9,
    'Wood': 1.4,
    'Mobile': 1.8
  };

  const occupancyFactor = occupancyRiskFactors[this.occupancyType] || 1.0;
  const constructionFactor = constructionRiskFactors[this.constructionType] || 1.0;
  
  return this.totalInsuredValue * occupancyFactor * constructionFactor;
};

// Static methods

/**
 * Get exposures within a geographic radius
 */
exposureSchema.statics.getExposuresInRadius = async function(latitude, longitude, radiusKm) {
  const radiusInDegrees = radiusKm / 111; // Approximate conversion
  
  return this.find({
    status: 'Active',
    'location.latitude': {
      $gte: latitude - radiusInDegrees,
      $lte: latitude + radiusInDegrees
    },
    'location.longitude': {
      $gte: longitude - radiusInDegrees,
      $lte: longitude + radiusInDegrees
    }
  });
};

/**
 * Get all active exposures
 */
exposureSchema.statics.getActiveExposures = async function(asOfDate = new Date()) {
  return this.find({
    status: 'Active',
    effectiveDate: { $lte: asOfDate },
    expiryDate: { $gte: asOfDate }
  });
};

/**
 * Get total exposure value for a specific peril
 */
exposureSchema.statics.getTotalExposureByPeril = async function(peril, filters = {}) {
  const match = {
    status: 'Active',
    'perilExposures.peril': peril,
    ...filters
  };

  const result = await this.aggregate([
    { $match: match },
    { $unwind: '$perilExposures' },
    { $match: { 'perilExposures.peril': peril } },
    {
      $group: {
        _id: null,
        totalExposure: { $sum: '$perilExposures.exposureAmount' },
        count: { $sum: 1 },
        avgExposure: { $avg: '$perilExposures.exposureAmount' }
      }
    }
  ]);

  return result[0] || { totalExposure: 0, count: 0, avgExposure: 0 };
};

/**
 * Validate exposure data consistency
 */
exposureSchema.statics.validateExposureConsistency = async function(exposureId) {
  const exposure = await this.findOne({ exposureId });
  if (!exposure) {
    throw new Error(`Exposure ${exposureId} not found`);
  }

  const errors = [];

  // Validate TIV vs replacement value
  if (exposure.totalInsuredValue > exposure.replacementValue) {
    errors.push('TIV exceeds replacement value');
  }

  // Validate date range
  if (exposure.effectiveDate >= exposure.expiryDate) {
    errors.push('Effective date must be before expiry date');
  }

  // Validate peril exposures sum doesn't exceed TIV
  const totalPerilExposure = exposure.perilExposures.reduce(
    (sum, p) => sum + p.exposureAmount, 0
  );
  if (totalPerilExposure > exposure.totalInsuredValue * 1.1) { // Allow 10% variance
    errors.push('Sum of peril exposures significantly exceeds TIV');
  }

  // Validate geographic coordinates if present
  if (exposure.location) {
    if (exposure.location.latitude < -90 || exposure.location.latitude > 90) {
      errors.push('Invalid latitude value');
    }
    if (exposure.location.longitude < -180 || exposure.location.longitude > 180) {
      errors.push('Invalid longitude value');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Pre-save validation middleware
exposureSchema.pre('save', async function(next) {
  try {
    // Validate TIV vs replacement value
    if (this.totalInsuredValue > this.replacementValue * 1.2) {
      throw new Error('Total Insured Value cannot exceed Replacement Value by more than 20%');
    }

    // Validate date range
    if (this.effectiveDate >= this.expiryDate) {
      throw new Error('Effective date must be before expiry date');
    }

    // Validate peril exposures
    if (this.perilExposures && this.perilExposures.length > 0) {
      const totalPerilExposure = this.perilExposures.reduce(
        (sum, p) => sum + p.exposureAmount, 0
      );
      
      // Total peril exposure shouldn't wildly exceed TIV (allow some variance for multi-peril)
      if (totalPerilExposure > this.totalInsuredValue * 1.5) {
        throw new Error('Sum of peril exposures exceeds reasonable variance from TIV');
      }

      // Validate individual peril exposures
      this.perilExposures.forEach(perilExp => {
        if (perilExp.exposureAmount < 0) {
          throw new Error('Peril exposure amount cannot be negative');
        }
        if (perilExp.deductible < 0) {
          throw new Error('Deductible cannot be negative');
        }
        if (perilExp.limit && perilExp.limit < perilExp.exposureAmount) {
          throw new Error('Peril limit cannot be less than exposure amount');
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Exposure = mongoose.model('Exposure', exposureSchema);

module.exports = Exposure;
