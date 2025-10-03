const mongoose = require('../config/mongoose-wrapper');

const specialConditionSchema = new mongoose.Schema({
  // Basic Condition Information
  conditionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^CON-\d{8}$/.test(v);
      },
      message: 'Condition ID must be in format CON-XXXXXXXX'
    }
  },
  
  conditionName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Condition Type and Category
  conditionType: {
    type: String,
    required: true,
    enum: ['Exclusion', 'Endorsement', 'Warranty', 'Condition', 'Clause', 'Rider', 'Amendment'],
    index: true
  },
  
  category: {
    type: String,
    required: true,
    enum: ['Coverage', 'Exclusion', 'Deductible', 'Limit', 'Territory', 'Time', 'Peril', 'Property', 'Liability', 'Other'],
    index: true
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
  
  // Condition Details
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  shortDescription: {
    type: String,
    maxlength: 500
  },
  
  // Coverage Impact
  coverageImpact: {
    type: String,
    enum: ['Increases Coverage', 'Decreases Coverage', 'Excludes Coverage', 'Modifies Coverage', 'No Impact'],
    required: true
  },
  
  // Financial Impact
  financialImpact: {
    impactType: {
      type: String,
      enum: ['Premium Adjustment', 'Deductible Change', 'Limit Change', 'Exclusion', 'No Impact']
    },
    
    adjustmentAmount: {
      type: Number,
      default: 0
    },
    
    adjustmentPercentage: {
      type: Number,
      min: -100,
      max: 1000,
      default: 0
    },
    
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
    }
  },
  
  // Scope and Applicability
  scope: {
    type: String,
    required: true,
    enum: ['Account', 'Policy', 'Location', 'Peril', 'Region', 'Coverage', 'Global'],
    index: true
  },
  
  applicablePerils: [{
    type: String,
    enum: ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic', 'All Perils']
  }],
  
  applicableRegions: [{
    type: String,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa', 'Global']
  }],
  
  applicableCoverages: [{
    type: String,
    enum: ['Property', 'Liability', 'Business Interruption', 'Cyber', 'Marine', 'Aviation', 'Energy']
  }],
  
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
        enum: ['Active', 'Inactive', 'Modified']
      },
      
      modificationFactor: {
        type: Number,
        min: 0,
        max: 2
      }
    }]
  },
  
  // Condition Rules and Logic
  conditionRules: {
    triggerEvents: [{
      type: String,
      enum: ['Loss Occurrence', 'Policy Renewal', 'Location Change', 'Coverage Change', 'Manual Trigger']
    }],
    
    evaluationCriteria: {
      type: String,
      maxlength: 1000
    },
    
    complianceRequired: {
      type: Boolean,
      default: false
    },
    
    complianceDeadline: {
      type: Date,
      default: null
    },
    
    nonComplianceConsequences: {
      type: String,
      maxlength: 1000
    }
  },
  
  // Dependencies and Relationships
  dependencies: [{
    conditionId: {
      type: String,
      ref: 'SpecialCondition',
      required: true
    },
    
    relationshipType: {
      type: String,
      enum: ['Prerequisite', 'Mutually Exclusive', 'Complementary', 'Override'],
      required: true
    },
    
    isRequired: {
      type: Boolean,
      default: false
    }
  }],
  
  // Priority and Hierarchy
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 50
  },
  
  precedence: {
    type: Number,
    min: 1,
    max: 100,
    default: 50
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Expired', 'Pending', 'Under Review'],
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
specialConditionSchema.index({ conditionType: 1, category: 1, status: 1 });
specialConditionSchema.index({ scope: 1, status: 1 });
specialConditionSchema.index({ accountId: 1, policyId: 1, locationId: 1 });
specialConditionSchema.index({ applicablePerils: 1, applicableRegions: 1 });
specialConditionSchema.index({ priority: 1, precedence: 1 });
specialConditionSchema.index({ 'timeConstraints.effectiveDate': 1, 'timeConstraints.expiryDate': 1 });

// Pre-save middleware for validation
specialConditionSchema.pre('save', function(next) {
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
  
  // Validate dependencies don't reference self
  for (const dep of this.dependencies) {
    if (dep.conditionId === this.conditionId) {
      return next(new Error('Condition cannot depend on itself'));
    }
  }
  
  next();
});

// Static method to find conditions by scope and entity
specialConditionSchema.statics.findByScopeAndEntity = function(scope, entityId) {
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
  
  return this.find(query).sort({ priority: 1, precedence: 1 });
};

// Static method to find applicable conditions for a specific peril and region
specialConditionSchema.statics.findApplicableConditions = function(peril, region, coverageType) {
  return this.find({
    $or: [
      { applicablePerils: 'All Perils' },
      { applicablePerils: peril }
    ],
    $or: [
      { applicableRegions: 'Global' },
      { applicableRegions: region }
    ],
    $or: [
      { applicableCoverages: { $size: 0 } },
      { applicableCoverages: coverageType }
    ],
    status: 'Active',
    'timeConstraints.effectiveDate': { $lte: new Date() },
    $or: [
      { 'timeConstraints.expiryDate': null },
      { 'timeConstraints.expiryDate': { $gt: new Date() } }
    ]
  }).sort({ priority: 1, precedence: 1 });
};

// Instance method to check if condition applies to a specific location
specialConditionSchema.methods.appliesToLocation = function(location) {
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
specialConditionSchema.methods.distanceToLocation = function(location) {
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

// Instance method to check if condition is currently active
specialConditionSchema.methods.isActive = function(date = new Date()) {
  if (this.status !== 'Active') {
    return false;
  }
  
  if (this.timeConstraints.effectiveDate > date) {
    return false;
  }
  
  if (this.timeConstraints.expiryDate && this.timeConstraints.expiryDate <= date) {
    return false;
  }
  
  // Check seasonal restrictions
  const month = date.getMonth() + 1;
  for (const restriction of this.timeConstraints.seasonalRestrictions) {
    if (month >= restriction.startMonth && month <= restriction.endMonth) {
      if (restriction.restrictionType === 'Inactive') {
        return false;
      }
    }
  }
  
  return true;
};

// Instance method to get effective financial impact
specialConditionSchema.methods.getEffectiveFinancialImpact = function(baseAmount, date = new Date()) {
  if (!this.isActive(date)) {
    return 0;
  }
  
  let impact = this.financialImpact.adjustmentAmount;
  
  if (this.financialImpact.adjustmentPercentage !== 0) {
    impact += baseAmount * (this.financialImpact.adjustmentPercentage / 100);
  }
  
  // Apply seasonal modifications
  const month = date.getMonth() + 1;
  for (const restriction of this.timeConstraints.seasonalRestrictions) {
    if (month >= restriction.startMonth && month <= restriction.endMonth) {
      if (restriction.restrictionType === 'Modified') {
        impact *= restriction.modificationFactor;
      }
    }
  }
  
  return impact;
};

module.exports = mongoose.model('SpecialCondition', specialConditionSchema);
