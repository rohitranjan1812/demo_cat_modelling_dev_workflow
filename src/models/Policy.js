const mongoose = require('../config/mongoose-wrapper');
const { 
  COVERAGE_TYPE_VALUES,
  POLICY_TYPE_VALUES,
  CURRENCY_VALUES,
  REGIONS_VALUES,
  EXTENDED_PERIL_TYPE_VALUES,
  PERIL_TYPE_VALUES,
  OCCUPANCY_TYPE_VALUES,
  CONSTRUCTION_TYPE_VALUES,
  POLICY_STATUS_VALUES
} = require('../constants');

const coverageSchema = new mongoose.Schema({
  coverageType: {
    type: String,
    required: true,
    enum: COVERAGE_TYPE_VALUES
  },
  
  coverageLimit: {
    type: Number,
    required: true,
    min: 0
  },
  
  deductible: {
    type: Number,
    required: true,
    min: 0
  },
  
  coveragePercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  }
}, { _id: false });

const policySchema = new mongoose.Schema({
  // Basic Policy Information
  policyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^POL-\d{8}$/.test(v);
      },
      message: 'Policy ID must be in format POL-XXXXXXXX'
    }
  },
  
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  accountId: {
    type: String,
    required: true,
    ref: 'Account',
    index: true
  },
  
  // Policy Details
  policyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  policyType: {
    type: String,
    required: true,
    enum: POLICY_TYPE_VALUES,
    index: true
  },
  
  // Coverage Information
  coverages: [coverageSchema],
  
  totalLimit: {
    type: Number,
    required: true,
    min: 0
  },
  
  totalDeductible: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Premium Information
  premium: {
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
  
  // Policy Period
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
  
  // Geographic Scope
  coveredRegions: [{
    type: String,
    enum: REGIONS_VALUES
  }],
  
  // Peril Coverage
  coveredPerils: [{
    type: String,
    enum: EXTENDED_PERIL_TYPE_VALUES
  }],
  
  // Hazard Coverage
  hazardCoverage: [{
    hazardId: {
      type: String,
      ref: 'Hazard',
      required: true
    },
    
    coverageLimit: {
      type: Number,
      required: true,
      min: 0
    },
    
    deductible: {
      type: Number,
      required: true,
      min: 0
    },
    
    coveragePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    
    effectiveDate: {
      type: Date,
      required: true
    },
    
    expiryDate: {
      type: Date,
      default: null
    }
  }],
  
  // Risk Characteristics
  riskCharacteristics: {
    occupancyType: {
      type: String,
      enum: OCCUPANCY_TYPE_VALUES
    },
    
    constructionType: {
      type: String,
      enum: CONSTRUCTION_TYPE_VALUES
    },
    
    yearBuilt: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear()
    },
    
    numberOfStories: {
      type: Number,
      min: 1,
      max: 200
    },
    
    squareFootage: {
      type: Number,
      min: 0
    }
  },
  
  // Sublimits
  sublimits: [{
    peril: {
      type: String,
      required: true,
      enum: PERIL_TYPE_VALUES
    },
    
    limit: {
      type: Number,
      required: true,
      min: 0
    },
    
    deductible: {
      type: Number,
      required: true,
      min: 0
    },
    
    region: {
      type: String,
      enum: REGIONS_VALUES
    }
  }],
  
  // Special Conditions
  specialConditions: [{
    conditionType: {
      type: String,
      required: true,
      enum: ['Exclusion', 'Endorsement', 'Warranty', 'Condition', 'Clause']
    },
    
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    effectiveDate: {
      type: Date,
      required: true
    },
    
    expiryDate: {
      type: Date,
      default: null
    },
    
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Status and Metadata
  status: {
    type: String,
    enum: POLICY_STATUS_VALUES,
    default: 'Active',
    index: true
  },
  
  // Audit Trail
  createdBy: {
    type: String,
    required: true
  },
  
  lastModifiedBy: {
    type: String,
    required: true
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
policySchema.index({ accountId: 1, status: 1 });
policySchema.index({ policyType: 1, status: 1 });
policySchema.index({ effectiveDate: 1, expiryDate: 1 });
policySchema.index({ coveredRegions: 1 });
policySchema.index({ coveredPerils: 1 });
policySchema.index({ 'riskCharacteristics.occupancyType': 1 });
policySchema.index({ 'riskCharacteristics.constructionType': 1 });

// Pre-save middleware for validation
policySchema.pre('save', function(next) {
  // Validate expiry date is after effective date
  if (this.expiryDate <= this.effectiveDate) {
    return next(new Error('Expiry date must be after effective date'));
  }
  
  // Validate total limit matches sum of coverage limits
  const totalCoverageLimit = this.coverages.reduce((sum, coverage) => 
    sum + (coverage.coverageLimit * coverage.coveragePercentage / 100), 0
  );
  
  if (Math.abs(totalCoverageLimit - this.totalLimit) > 0.01) {
    return next(new Error('Total limit must match sum of coverage limits'));
  }
  
  // Validate sublimits don't exceed total limit
  const totalSublimit = this.sublimits.reduce((sum, sublimit) => sum + sublimit.limit, 0);
  if (totalSublimit > this.totalLimit) {
    return next(new Error('Total sublimits cannot exceed total policy limit'));
  }
  
  next();
});

// Static method to find policies by peril
policySchema.statics.findByPeril = function(peril) {
  return this.find({ 
    coveredPerils: peril, 
    status: 'Active' 
  });
};

// Static method to find policies by region
policySchema.statics.findByRegion = function(region) {
  return this.find({ 
    coveredRegions: region, 
    status: 'Active' 
  });
};

// Instance method to get effective sublimit for a peril and region
policySchema.methods.getEffectiveSublimit = function(peril, region = null) {
  const sublimit = this.sublimits.find(s => 
    s.peril === peril && (region === null || s.region === region)
  );
  
  return sublimit ? sublimit.limit : this.totalLimit;
};

// Instance method to check if policy covers a specific peril and region
policySchema.methods.coversPerilAndRegion = function(peril, region) {
  return this.coveredPerils.includes(peril) && 
         this.coveredRegions.includes(region) &&
         this.status === 'Active';
};

// Instance method to get hazard coverage for a specific hazard
policySchema.methods.getHazardCoverage = function(hazardId) {
  return this.hazardCoverage.find(coverage => coverage.hazardId === hazardId);
};

// Instance method to check if policy covers a specific hazard
policySchema.methods.coversHazard = function(hazardId) {
  const coverage = this.getHazardCoverage(hazardId);
  if (!coverage) return false;
  
  const now = new Date();
  return this.status === 'Active' &&
         coverage.effectiveDate <= now &&
         (!coverage.expiryDate || coverage.expiryDate >= now);
};

// Instance method to get effective hazard coverage limit
policySchema.methods.getEffectiveHazardCoverageLimit = function(hazardId) {
  const coverage = this.getHazardCoverage(hazardId);
  if (!coverage) return 0;
  
  return coverage.coverageLimit * (coverage.coveragePercentage / 100);
};

// Instance method to get effective hazard coverage deductible
policySchema.methods.getEffectiveHazardCoverageDeductible = function(hazardId) {
  const coverage = this.getHazardCoverage(hazardId);
  if (!coverage) return 0;
  
  return coverage.deductible;
};

// Instance method to calculate total hazard exposure
policySchema.methods.calculateTotalHazardExposure = function() {
  return this.hazardCoverage.reduce((total, coverage) => {
    return total + this.getEffectiveHazardCoverageLimit(coverage.hazardId);
  }, 0);
};

// Instance method to get active hazard coverages
policySchema.methods.getActiveHazardCoverages = function() {
  const now = new Date();
  return this.hazardCoverage.filter(coverage => 
    coverage.effectiveDate <= now && 
    (!coverage.expiryDate || coverage.expiryDate >= now)
  );
};

module.exports = mongoose.model('Policy', policySchema);
