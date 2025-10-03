const mongoose = require('../config/mongoose-wrapper');

const sublimitSchema = new mongoose.Schema({
  // Basic Sublimit Information
  sublimitId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^SUB-\d{8}$/.test(v);
      },
      message: 'Sublimit ID must be in format SUB-XXXXXXXX'
    }
  },
  
  sublimitName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Associated Entities
  accountId: {
    type: String,
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
  
  // Sublimit Scope
  scope: {
    type: String,
    required: true,
    enum: ['Account', 'Policy', 'Location', 'Peril', 'Region', 'Coverage', 'Global'],
    index: true
  },
  
  // Coverage Details
  coverageType: {
    type: String,
    required: true,
    enum: ['Property', 'Liability', 'Business Interruption', 'Cyber', 'Marine', 'Aviation', 'Energy']
  },
  
  peril: {
    type: String,
    enum: ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic', 'All Perils']
  },
  
  region: {
    type: String,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa', 'Global']
  },
  
  // Financial Limits
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
  
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  
  // Sublimit Rules
  aggregationRule: {
    type: String,
    enum: ['Per Occurrence', 'Per Location', 'Per Policy', 'Per Account', 'Per Year', 'Per Event'],
    default: 'Per Occurrence'
  },
  
  sharingRule: {
    type: String,
    enum: ['Primary', 'Excess', 'Proportional', 'Layered'],
    default: 'Primary'
  },
  
  // Priority and Hierarchy
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 1
  },
  
  layer: {
    type: Number,
    min: 1,
    max: 20,
    default: 1
  },
  
  // Geographic Constraints
  geographicConstraints: {
    countries: [{
      type: String,
      maxlength: 3 // ISO country codes
    }],
    
    states: [{
      type: String,
      maxlength: 100
    }],
    
    postalCodes: [{
      type: String,
      maxlength: 20
    }],
    
    coordinates: {
      type: {
        type: String,
        enum: ['Point', 'Polygon', 'Circle'],
        default: 'Point'
      },
      
      coordinates: {
        type: [Number],
        required: function() {
          return this.geographicConstraints && this.geographicConstraints.coordinates;
        }
      },
      
      radius: {
        type: Number,
        min: 0,
        required: function() {
          return this.geographicConstraints && 
                 this.geographicConstraints.coordinates && 
                 this.geographicConstraints.coordinates.type === 'Circle';
        }
      }
    }
  },
  
  // Time-based Constraints
  timeConstraints: {
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    
    expiryDate: {
      type: Date,
      default: null
    },
    
    seasonalRestrictions: [{
      startMonth: {
        type: Number,
        min: 1,
        max: 12
      },
      
      endMonth: {
        type: Number,
        min: 1,
        max: 12
      },
      
      restrictionType: {
        type: String,
        enum: ['Reduced Limit', 'Exclusion', 'Higher Deductible']
      },
      
      adjustmentFactor: {
        type: Number,
        min: 0,
        max: 2
      }
    }]
  },
  
  // Business Rules
  businessRules: {
    maxExposurePerLocation: {
      type: Number,
      min: 0,
      default: null
    },
    
    maxExposurePerPolicy: {
      type: Number,
      min: 0,
      default: null
    },
    
    maxExposurePerAccount: {
      type: Number,
      min: 0,
      default: null
    },
    
    minRetention: {
      type: Number,
      min: 0,
      default: 0
    },
    
    maxCession: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Expired', 'Pending'],
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
sublimitSchema.index({ scope: 1, status: 1 });
sublimitSchema.index({ accountId: 1, policyId: 1, locationId: 1 });
sublimitSchema.index({ coverageType: 1, peril: 1, region: 1 });
sublimitSchema.index({ priority: 1, layer: 1 });
sublimitSchema.index({ 'timeConstraints.effectiveDate': 1, 'timeConstraints.expiryDate': 1 });
sublimitSchema.index({ limit: -1 });

// Pre-save middleware for validation
sublimitSchema.pre('save', function(next) {
  // Validate expiry date is after effective date
  if (this.timeConstraints.expiryDate && 
      this.timeConstraints.expiryDate <= this.timeConstraints.effectiveDate) {
    return next(new Error('Expiry date must be after effective date'));
  }
  
  // Validate at least one entity is associated
  if (!this.accountId && !this.policyId && !this.locationId) {
    return next(new Error('At least one entity (account, policy, or location) must be associated'));
  }
  
  // Validate scope matches associated entities
  if (this.scope === 'Account' && !this.accountId) {
    return next(new Error('Account scope requires accountId'));
  }
  
  if (this.scope === 'Policy' && !this.policyId) {
    return next(new Error('Policy scope requires policyId'));
  }
  
  if (this.scope === 'Location' && !this.locationId) {
    return next(new Error('Location scope requires locationId'));
  }
  
  // Validate seasonal restrictions
  for (const restriction of this.timeConstraints.seasonalRestrictions) {
    if (restriction.startMonth > restriction.endMonth) {
      return next(new Error('Seasonal restriction start month must be before end month'));
    }
  }
  
  next();
});

// Static method to find sublimits by scope and entity
sublimitSchema.statics.findByScopeAndEntity = function(scope, entityId) {
  const query = { scope, status: 'Active' };
  
  switch (scope) {
    case 'Account':
      query.accountId = entityId;
      break;
    case 'Policy':
      query.policyId = entityId;
      break;
    case 'Location':
      query.locationId = entityId;
      break;
  }
  
  return this.find(query).sort({ priority: 1, layer: 1 });
};

// Static method to find applicable sublimits for a specific peril and region
sublimitSchema.statics.findApplicableSublimits = function(peril, region, coverageType) {
  return this.find({
    $or: [
      { peril: 'All Perils' },
      { peril: peril }
    ],
    $or: [
      { region: 'Global' },
      { region: region }
    ],
    coverageType: coverageType,
    status: 'Active',
    'timeConstraints.effectiveDate': { $lte: new Date() },
    $or: [
      { 'timeConstraints.expiryDate': null },
      { 'timeConstraints.expiryDate': { $gt: new Date() } }
    ]
  }).sort({ priority: 1, layer: 1 });
};

// Instance method to check if sublimit applies to a specific location
sublimitSchema.methods.appliesToLocation = function(location) {
  // Check geographic constraints
  if (this.geographicConstraints.countries.length > 0) {
    if (!this.geographicConstraints.countries.includes(location.address.country)) {
      return false;
    }
  }
  
  if (this.geographicConstraints.states.length > 0) {
    if (!this.geographicConstraints.states.includes(location.address.state)) {
      return false;
    }
  }
  
  if (this.geographicConstraints.postalCodes.length > 0) {
    if (!this.geographicConstraints.postalCodes.includes(location.address.postalCode)) {
      return false;
    }
  }
  
  // Check coordinate constraints
  if (this.geographicConstraints.coordinates) {
    const coords = this.geographicConstraints.coordinates;
    if (coords.type === 'Circle') {
      const distance = this.distanceToLocation(location);
      if (distance > coords.radius) {
        return false;
      }
    }
  }
  
  return true;
};

// Instance method to calculate distance to a location
sublimitSchema.methods.distanceToLocation = function(location) {
  if (!this.geographicConstraints.coordinates || 
      this.geographicConstraints.coordinates.type !== 'Circle') {
    return 0;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (location.coordinates.latitude - this.geographicConstraints.coordinates.coordinates[1]) * Math.PI / 180;
  const dLng = (location.coordinates.longitude - this.geographicConstraints.coordinates.coordinates[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.geographicConstraints.coordinates.coordinates[1] * Math.PI / 180) * 
    Math.cos(location.coordinates.latitude * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Instance method to get effective limit considering seasonal restrictions
sublimitSchema.methods.getEffectiveLimit = function(date = new Date()) {
  const month = date.getMonth() + 1;
  
  for (const restriction of this.timeConstraints.seasonalRestrictions) {
    if (month >= restriction.startMonth && month <= restriction.endMonth) {
      switch (restriction.restrictionType) {
        case 'Reduced Limit':
          return this.limit * restriction.adjustmentFactor;
        case 'Exclusion':
          return 0;
        case 'Higher Deductible':
          return this.limit; // Deductible adjustment would be handled elsewhere
      }
    }
  }
  
  return this.limit;
};

module.exports = mongoose.model('Sublimit', sublimitSchema);
