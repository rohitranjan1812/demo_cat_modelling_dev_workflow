const mongoose = require('../config/mongoose-wrapper');

// Financial impact schema for simulation events
const financialImpactSchema = new mongoose.Schema({
  directLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  indirectLoss: {
    type: Number,
    default: 0,
    min: 0
  },
  
  businessInterruptionLoss: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
  },
  
  confidenceInterval: {
    lower: {
      type: Number,
      min: 0
    },
    upper: {
      type: Number,
      min: 0
    },
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 1
    }
  }
}, { _id: false });

// Geographic impact schema
const geographicImpactSchema = new mongoose.Schema({
  affectedLatitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  
  affectedLongitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  
  affectedRadius: {
    type: Number,
    required: true,
    min: 0
  },
  
  radiusUnit: {
    type: String,
    required: true,
    enum: ['km', 'miles', 'nautical_miles']
  },
  
  affectedArea: {
    type: Number,
    min: 0
  },
  
  areaUnit: {
    type: String,
    enum: ['km2', 'miles2', 'acres', 'hectares']
  },
  
  intensityAtLocation: {
    type: Number,
    required: true,
    min: 0
  },
  
  intensityScale: {
    type: String,
    required: true,
    enum: ['Richter', 'Mercalli', 'Saffir-Simpson', 'Fujita', 'Enhanced Fujita', 'Beaufort', 'Custom']
  }
}, { _id: false });

// Vulnerability impact schema
const vulnerabilityImpactSchema = new mongoose.Schema({
  vulnerabilityId: {
    type: String,
    ref: 'Vulnerability',
    required: true
  },
  
  vulnerabilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  
  vulnerabilityMultiplier: {
    type: Number,
    required: true,
    min: 0
  },
  
  adjustedLoss: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Exposure impact schema
const exposureImpactSchema = new mongoose.Schema({
  accountId: {
    type: String,
    ref: 'Account',
    required: true
  },
  
  policyId: {
    type: String,
    ref: 'Policy',
    required: true
  },
  
  exposureAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  lossRatio: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  
  actualLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  deductible: {
    type: Number,
    default: 0,
    min: 0
  },
  
  limit: {
    type: Number,
    default: null,
    min: 0
  },
  
  netLoss: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const simulationEventSchema = new mongoose.Schema({
  // Basic Event Information
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^SIM-\d{8}-\d{6}$/.test(v);
      },
      message: 'Event ID must be in format SIM-XXXXXXXX-XXXXXX'
    }
  },
  
  simulationRunId: {
    type: String,
    required: true,
    ref: 'SimulationRun',
    index: true
  },
  
  eventName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Hazard Information
  hazardType: {
    type: String,
    required: true,
    enum: [
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
      'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
      'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
      'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
      'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
    ],
    index: true
  },
  
  hazardCategory: {
    type: String,
    required: true,
    enum: ['Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading']
  },
  
  // Event Characteristics
  severity: {
    type: String,
    required: true,
    enum: ['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme'],
    index: true
  },
  
  intensity: {
    type: Number,
    required: true,
    min: 0
  },
  
  intensityScale: {
    type: String,
    required: true,
    enum: ['Richter', 'Mercalli', 'Saffir-Simpson', 'Fujita', 'Enhanced Fujita', 'Beaufort', 'Custom']
  },
  
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  
  returnPeriod: {
    type: Number,
    required: true,
    min: 0
  },
  
  returnPeriodUnit: {
    type: String,
    required: true,
    enum: ['years', 'months', 'days']
  },
  
  // Temporal Information
  eventYear: {
    type: Number,
    required: true,
    min: 1900,
    max: 3000
  },
  
  eventMonth: {
    type: Number,
    min: 1,
    max: 12
  },
  
  eventDay: {
    type: Number,
    min: 1,
    max: 31
  },
  
  duration: {
    type: Number,
    min: 0
  },
  
  durationUnit: {
    type: String,
    enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months']
  },
  
  // Geographic Information
  geographicImpact: [geographicImpactSchema],
  
  // Financial Impact
  financialImpact: {
    type: financialImpactSchema,
    required: true
  },
  
  // Vulnerability Impact
  vulnerabilityImpact: [vulnerabilityImpactSchema],
  
  // Exposure Impact
  exposureImpact: [exposureImpactSchema],
  
  // Risk Metrics
  riskMetrics: {
    expectedLoss: {
      type: Number,
      required: true,
      min: 0
    },
    
    valueAtRisk: {
      type: Number,
      required: true,
      min: 0
    },
    
    tailValueAtRisk: {
      type: Number,
      required: true,
      min: 0
    },
    
    standardDeviation: {
      type: Number,
      required: true,
      min: 0
    },
    
    riskAdjustedExposure: {
      type: Number,
      required: true,
      min: 0
    },
    
    lossRatio: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    
    diversificationBenefit: {
      type: Number,
      default: 0
    },
    
    concentrationRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  },
  
  // Modeling Information
  modelData: {
    modelProvider: {
      type: String,
      enum: ['RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'JBA', 'Custom', 'Multiple']
    },
    
    modelVersion: {
      type: String,
      maxlength: 50
    },
    
    modelType: {
      type: String,
      enum: ['Probabilistic', 'Deterministic', 'Scenario', 'Hybrid']
    },
    
    resolution: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'Variable']
    },
    
    randomSeed: {
      type: Number
    },
    
    probabilityDistribution: {
      type: String,
      enum: ['Normal', 'Lognormal', 'Gamma', 'Weibull', 'Pareto', 'Exponential', 'Beta', 'Custom']
    },
    
    distributionParameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    }
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Generated', 'Validated', 'Processed', 'Failed'],
    default: 'Generated',
    index: true
  },
  
  isHistorical: {
    type: Boolean,
    default: false
  },
  
  isSimulated: {
    type: Boolean,
    default: true
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
simulationEventSchema.index({ simulationRunId: 1, eventYear: 1 });
simulationEventSchema.index({ hazardType: 1, severity: 1 });
simulationEventSchema.index({ eventYear: 1, eventMonth: 1 });
simulationEventSchema.index({ 'financialImpact.totalLoss': -1 });
simulationEventSchema.index({ 'riskMetrics.expectedLoss': -1 });
simulationEventSchema.index({ 'geographicImpact.affectedLatitude': 1, 'geographicImpact.affectedLongitude': 1 });
simulationEventSchema.index({ status: 1, isSimulated: 1 });

// Pre-save middleware for validation
simulationEventSchema.pre('save', function(next) {
  // Validate probability is between 0 and 1
  if (this.probability < 0 || this.probability > 1) {
    return next(new Error('Probability must be between 0 and 1'));
  }
  
  // Validate intensity is positive
  if (this.intensity < 0) {
    return next(new Error('Intensity must be positive'));
  }
  
  // Validate financial impact consistency
  if (this.financialImpact.totalLoss !== this.financialImpact.directLoss + this.financialImpact.indirectLoss + this.financialImpact.businessInterruptionLoss) {
    return next(new Error('Total loss must equal sum of direct, indirect, and business interruption losses'));
  }
  
  // Validate event year is reasonable
  if (this.eventYear < 1900 || this.eventYear > 3000) {
    return next(new Error('Event year must be between 1900 and 3000'));
  }
  
  next();
});

// Static method to find events by simulation run
simulationEventSchema.statics.findBySimulationRun = function(simulationRunId) {
  return this.find({ 
    simulationRunId: simulationRunId,
    status: { $ne: 'Failed' }
  }).sort({ eventYear: 1, eventMonth: 1, eventDay: 1 });
};

// Static method to find events by hazard type
simulationEventSchema.statics.findByHazardType = function(hazardType) {
  return this.find({ 
    hazardType: hazardType,
    status: { $ne: 'Failed' }
  });
};

// Static method to find events by year range
simulationEventSchema.statics.findByYearRange = function(startYear, endYear) {
  return this.find({
    eventYear: { $gte: startYear, $lte: endYear },
    status: { $ne: 'Failed' }
  });
};

// Static method to find events by severity
simulationEventSchema.statics.findBySeverity = function(severity) {
  return this.find({ 
    severity: severity,
    status: { $ne: 'Failed' }
  });
};

// Static method to find events by financial loss range
simulationEventSchema.statics.findByLossRange = function(minLoss, maxLoss) {
  return this.find({
    'financialImpact.totalLoss': { $gte: minLoss, $lte: maxLoss },
    status: { $ne: 'Failed' }
  });
};

// Instance method to calculate total exposure impact
simulationEventSchema.methods.calculateTotalExposureImpact = function() {
  return this.exposureImpact.reduce((total, impact) => {
    return total + impact.actualLoss;
  }, 0);
};

// Instance method to calculate total vulnerability impact
simulationEventSchema.methods.calculateTotalVulnerabilityImpact = function() {
  return this.vulnerabilityImpact.reduce((total, impact) => {
    return total + impact.adjustedLoss;
  }, 0);
};

// Instance method to calculate diversification benefit
simulationEventSchema.methods.calculateDiversificationBenefit = function() {
  const totalExposure = this.exposureImpact.reduce((sum, impact) => sum + impact.exposureAmount, 0);
  const totalLoss = this.financialImpact.totalLoss;
  
  if (totalExposure === 0) return 0;
  
  // Simple diversification benefit calculation
  const concentrationRisk = this.riskMetrics.concentrationRisk;
  const diversificationBenefit = totalLoss * (1 - concentrationRisk);
  
  return Math.max(0, diversificationBenefit);
};

// Instance method to get risk level based on loss
simulationEventSchema.methods.getRiskLevel = function() {
  const totalLoss = this.financialImpact.totalLoss;
  
  if (totalLoss < 1000000) return 'Low';
  if (totalLoss < 10000000) return 'Medium';
  if (totalLoss < 100000000) return 'High';
  if (totalLoss < 1000000000) return 'Very High';
  return 'Extreme';
};

// Instance method to calculate loss ratio
simulationEventSchema.methods.calculateLossRatio = function() {
  const totalExposure = this.exposureImpact.reduce((sum, impact) => sum + impact.exposureAmount, 0);
  const totalLoss = this.financialImpact.totalLoss;
  
  if (totalExposure === 0) return 0;
  
  return totalLoss / totalExposure;
};

// Instance method to get geographic bounds
simulationEventSchema.methods.getGeographicBounds = function() {
  if (this.geographicImpact.length === 0) return null;
  
  const lats = this.geographicImpact.map(impact => impact.affectedLatitude);
  const lngs = this.geographicImpact.map(impact => impact.affectedLongitude);
  
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs)
  };
};

module.exports = mongoose.model('SimulationEvent', simulationEventSchema);
