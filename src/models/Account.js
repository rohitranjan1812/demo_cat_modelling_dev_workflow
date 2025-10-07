const mongoose = require('../config/mongoose-wrapper');
const { 
  ACCOUNT_TYPE_VALUES, 
  CURRENCY_VALUES, 
  REGIONS_VALUES, 
  ACCOUNT_STATUS_VALUES,
  EXTENDED_PERIL_TYPE_VALUES,
  RISK_LEVEL_VALUES
} = require('../constants');

const accountSchema = new mongoose.Schema({
  // Basic Account Information
  accountId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^ACC-\d{6}$/.test(v);
      },
      message: 'Account ID must be in format ACC-XXXXXX'
    }
  },
  
  accountName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  accountType: {
    type: String,
    required: true,
    enum: ACCOUNT_TYPE_VALUES,
    index: true
  },
  
  // Hierarchical Structure
  parentAccountId: {
    type: String,
    ref: 'Account',
    default: null,
    index: true
  },
  
  accountLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1
  },
  
  // Financial Information
  totalExposure: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: CURRENCY_VALUES
  },
  
  // Geographic Scope
  regions: [{
    type: String,
    enum: REGIONS_VALUES
  }],
  
  // Risk Profile
  riskProfile: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High'],
    default: 'Medium'
  },
  
  // Hazard Risk Profile
  hazardRiskProfile: {
    overallRiskLevel: {
      type: String,
      enum: RISK_LEVEL_VALUES,
      default: 'Medium'
    },
    
    primaryHazards: [{
      hazardType: {
        type: String,
        enum: EXTENDED_PERIL_TYPE_VALUES
      },
      
      riskLevel: {
        type: String,
        enum: RISK_LEVEL_VALUES
      },
      
      exposureAmount: {
        type: Number,
        min: 0
      },
      
      lastAssessed: {
        type: Date,
        default: Date.now
      }
    }],
    
    lastRiskAssessment: {
      type: Date,
      default: Date.now
    },
    
    riskAssessmentMethod: {
      type: String,
      enum: ['Model', 'Expert', 'Historical', 'Hybrid']
    }
  },
  
  // Business Rules
  maxExposurePerLocation: {
    type: Number,
    min: 0,
    default: null
  },
  
  maxExposurePerPeril: {
    type: Number,
    min: 0,
    default: null
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ACCOUNT_STATUS_VALUES,
    default: 'Active',
    index: true
  },
  
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  expiryDate: {
    type: Date,
    default: null
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
accountSchema.index({ accountType: 1, status: 1 });
accountSchema.index({ parentAccountId: 1, accountLevel: 1 });
accountSchema.index({ regions: 1 });
accountSchema.index({ effectiveDate: 1, expiryDate: 1 });

// Virtual for full account hierarchy path
accountSchema.virtual('hierarchyPath').get(function() {
  return this.parentAccountId ? `${this.parentAccountId}/${this.accountId}` : this.accountId;
});

// Pre-save middleware for validation
accountSchema.pre('save', function(next) {
  // Validate expiry date is after effective date
  if (this.expiryDate && this.expiryDate <= this.effectiveDate) {
    return next(new Error('Expiry date must be after effective date'));
  }
  
  // Validate account level based on parent
  if (this.parentAccountId && this.accountLevel <= 1) {
    return next(new Error('Child accounts must have level > 1'));
  }
  
  next();
});

// Static method to find accounts by region
accountSchema.statics.findByRegion = function(region) {
  return this.find({ 
    regions: region, 
    status: 'Active' 
  });
};

// Instance method to get all child accounts
accountSchema.methods.getChildAccounts = function() {
  return this.constructor.find({ 
    parentAccountId: this.accountId,
    status: 'Active'
  });
};

// Instance method to calculate total exposure including children
accountSchema.methods.getTotalExposureIncludingChildren = async function() {
  const children = await this.getChildAccounts();
  let totalExposure = this.totalExposure;
  
  for (const child of children) {
    totalExposure += await child.getTotalExposureIncludingChildren();
  }
  
  return totalExposure;
};

// Instance method to get hazard risk for a specific hazard type
accountSchema.methods.getHazardRisk = function(hazardType) {
  return this.hazardRiskProfile.primaryHazards.find(hazard => hazard.hazardType === hazardType);
};

// Instance method to get highest hazard risk level
accountSchema.methods.getHighestHazardRiskLevel = function() {
  const riskLevels = ['Low', 'Medium', 'High', 'Very High', 'Extreme'];
  return this.hazardRiskProfile.primaryHazards.reduce((highest, hazard) => {
    const currentIndex = riskLevels.indexOf(hazard.riskLevel);
    const highestIndex = riskLevels.indexOf(highest.riskLevel);
    return currentIndex > highestIndex ? hazard : highest;
  }, this.hazardRiskProfile.primaryHazards[0] || { riskLevel: 'Low' });
};

// Instance method to calculate total hazard exposure
accountSchema.methods.calculateTotalHazardExposure = function() {
  return this.hazardRiskProfile.primaryHazards.reduce((total, hazard) => {
    return total + (hazard.exposureAmount || 0);
  }, 0);
};

// Instance method to get hazard exposure by risk level
accountSchema.methods.getHazardExposureByRiskLevel = function(riskLevel) {
  return this.hazardRiskProfile.primaryHazards.filter(hazard => hazard.riskLevel === riskLevel);
};

// Instance method to calculate overall hazard risk score
accountSchema.methods.calculateHazardRiskScore = function() {
  if (this.hazardRiskProfile.primaryHazards.length === 0) return 0;
  
  const riskWeights = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Very High': 4,
    'Extreme': 5
  };
  
  const totalScore = this.hazardRiskProfile.primaryHazards.reduce((sum, hazard) => {
    return sum + (riskWeights[hazard.riskLevel] || 0);
  }, 0);
  
  return totalScore / this.hazardRiskProfile.primaryHazards.length;
};

// Instance method to check if account has exposure to a specific hazard type
accountSchema.methods.hasHazardExposure = function(hazardType) {
  return this.hazardRiskProfile.primaryHazards.some(hazard => hazard.hazardType === hazardType);
};

module.exports = mongoose.model('Account', accountSchema);
