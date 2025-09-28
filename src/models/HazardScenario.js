const mongoose = require('mongoose');

// Scenario parameter schema for different types of parameters
const scenarioParameterSchema = new mongoose.Schema({
  parameterName: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  parameterType: {
    type: String,
    required: true,
    enum: ['Numeric', 'Categorical', 'Boolean', 'Date', 'Text', 'Array', 'Object']
  },
  
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  unit: {
    type: String,
    maxlength: 50
  },
  
  description: {
    type: String,
    maxlength: 500
  },
  
  isVariable: {
    type: Boolean,
    default: false
  },
  
  minValue: {
    type: Number
  },
  
  maxValue: {
    type: Number
  },
  
  stepSize: {
    type: Number
  },
  
  possibleValues: [{
    type: mongoose.Schema.Types.Mixed
  }]
}, { _id: false });

// Scenario result schema for different types of outputs
const scenarioResultSchema = new mongoose.Schema({
  resultType: {
    type: String,
    required: true,
    enum: ['Economic Loss', 'Casualties', 'Infrastructure Damage', 'Environmental Impact',
           'Business Interruption', 'Recovery Time', 'Insurance Claims', 'Risk Score',
           'Probability', 'Return Period', 'Custom']
  },
  
  value: {
    type: Number,
    required: true
  },
  
  unit: {
    type: String,
    maxlength: 50
  },
  
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
  },
  
  confidenceLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  
  methodology: {
    type: String,
    maxlength: 200
  },
  
  dataSource: {
    type: String,
    maxlength: 200
  },
  
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Scenario validation schema
const scenarioValidationSchema = new mongoose.Schema({
  validationType: {
    type: String,
    required: true,
    enum: ['Parameter Range', 'Logical Consistency', 'Data Quality', 'Model Validation', 'Expert Review']
  },
  
  status: {
    type: String,
    required: true,
    enum: ['Passed', 'Failed', 'Warning', 'Pending']
  },
  
  message: {
    type: String,
    maxlength: 1000
  },
  
  validatedBy: {
    type: String,
    maxlength: 100
  },
  
  validatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const hazardScenarioSchema = new mongoose.Schema({
  // Basic Scenario Information
  scenarioId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^SCN-\d{8}$/.test(v);
      },
      message: 'Scenario ID must be in format SCN-XXXXXXXX'
    }
  },
  
  scenarioName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  scenarioDescription: {
    type: String,
    maxlength: 2000
  },
  
  // Scenario Classification
  scenarioType: {
    type: String,
    required: true,
    enum: ['Historical', 'Probabilistic', 'Deterministic', 'Stress Test', 'Sensitivity Analysis',
           'What-if', 'Monte Carlo', 'Worst Case', 'Best Case', 'Custom'],
    index: true
  },
  
  scenarioCategory: {
    type: String,
    required: true,
    enum: ['Single Hazard', 'Multi-Hazard', 'Compound', 'Cascading', 'Sequential', 'Simultaneous'],
    index: true
  },
  
  // Hazard Information
  primaryHazard: {
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
  
  secondaryHazards: [{
    type: String,
    enum: [
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
      'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
      'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
      'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
      'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
    ]
  }],
  
  // Geographic Scope
  geographicScope: {
    type: String,
    required: true,
    enum: ['Local', 'Regional', 'National', 'Continental', 'Global'],
    index: true
  },
  
  affectedRegions: [{
    type: String,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
  }],
  
  affectedCountries: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  
  // Scenario Parameters
  parameters: [scenarioParameterSchema],
  
  // Scenario Results
  results: [scenarioResultSchema],
  
  // Scenario Validation
  validations: [scenarioValidationSchema],
  
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
    
    simulationRuns: {
      type: Number,
      min: 1,
      default: 1
    },
    
    lastModelUpdate: {
      type: Date,
      default: Date.now
    },
    
    modelResults: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    }
  },
  
  // Scenario Timing
  scenarioStartTime: {
    type: Date,
    required: true
  },
  
  scenarioEndTime: {
    type: Date,
    default: null
  },
  
  scenarioDuration: {
    type: Number,
    min: 0
  },
  
  durationUnit: {
    type: String,
    enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years']
  },
  
  // Scenario Status
  status: {
    type: String,
    enum: ['Draft', 'Running', 'Completed', 'Failed', 'Cancelled', 'Paused'],
    default: 'Draft',
    index: true
  },
  
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Execution Information
  executionInfo: {
    startTime: {
      type: Date,
      default: null
    },
    
    endTime: {
      type: Date,
      default: null
    },
    
    duration: {
      type: Number,
      min: 0
    },
    
    durationUnit: {
      type: String,
      enum: ['seconds', 'minutes', 'hours', 'days']
    },
    
    resourcesUsed: {
      cpuTime: {
        type: Number,
        min: 0
      },
      
      memoryUsed: {
        type: Number,
        min: 0
      },
      
      memoryUnit: {
        type: String,
        enum: ['MB', 'GB', 'TB']
      },
      
      storageUsed: {
        type: Number,
        min: 0
      },
      
      storageUnit: {
        type: String,
        enum: ['MB', 'GB', 'TB']
      }
    }
  },
  
  // Scenario Configuration
  configuration: {
    randomSeed: {
      type: Number,
      default: null
    },
    
    convergenceCriteria: {
      type: String,
      maxlength: 200
    },
    
    maxIterations: {
      type: Number,
      min: 1,
      default: 1000
    },
    
    tolerance: {
      type: Number,
      min: 0,
      default: 0.001
    },
    
    parallelProcessing: {
      type: Boolean,
      default: false
    },
    
    numberOfCores: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  
  // Data Sources
  dataSources: [{
    sourceType: {
      type: String,
      enum: ['Historical Data', 'Model Output', 'Expert Opinion', 'Satellite Data',
             'Ground Station', 'Government Data', 'NGO Data', 'Media Reports', 'Other']
    },
    
    sourceName: {
      type: String,
      required: true,
      maxlength: 200
    },
    
    reliability: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High']
    },
    
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Links to Exposure Data
  affectedLocations: [{
    locationId: {
      type: String,
      ref: 'Location',
      required: true
    },
    
    impactLevel: {
      type: String,
      enum: ['None', 'Minimal', 'Moderate', 'Severe', 'Total'],
      required: true
    },
    
    estimatedLoss: {
      type: Number,
      min: 0
    },
    
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
    }
  }],
  
  affectedPolicies: [{
    policyId: {
      type: String,
      ref: 'Policy',
      required: true
    },
    
    estimatedClaim: {
      type: Number,
      min: 0
    },
    
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
    }
  }],
  
  // Scenario Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  isTemplate: {
    type: Boolean,
    default: false
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
hazardScenarioSchema.index({ scenarioType: 1, status: 1 });
hazardScenarioSchema.index({ scenarioCategory: 1, primaryHazard: 1 });
hazardScenarioSchema.index({ geographicScope: 1, affectedRegions: 1 });
hazardScenarioSchema.index({ primaryHazard: 1, secondaryHazards: 1 });
hazardScenarioSchema.index({ scenarioStartTime: 1, scenarioEndTime: 1 });
hazardScenarioSchema.index({ status: 1, priority: 1 });
hazardScenarioSchema.index({ 'affectedLocations.locationId': 1 });
hazardScenarioSchema.index({ 'affectedPolicies.policyId': 1 });
hazardScenarioSchema.index({ tags: 1 });
hazardScenarioSchema.index({ isPublic: 1, isTemplate: 1 });

// Pre-save middleware for validation
hazardScenarioSchema.pre('save', function(next) {
  // Validate scenario end time is after start time
  if (this.scenarioEndTime && this.scenarioEndTime <= this.scenarioStartTime) {
    return next(new Error('Scenario end time must be after start time'));
  }
  
  // Validate execution end time is after start time
  if (this.executionInfo.endTime && this.executionInfo.startTime && 
      this.executionInfo.endTime <= this.executionInfo.startTime) {
    return next(new Error('Execution end time must be after start time'));
  }
  
  // Validate progress is between 0 and 100
  if (this.progress < 0 || this.progress > 100) {
    return next(new Error('Progress must be between 0 and 100'));
  }
  
  // Validate simulation runs is at least 1
  if (this.modelData.simulationRuns < 1) {
    return next(new Error('Simulation runs must be at least 1'));
  }
  
  // Validate max iterations is at least 1
  if (this.configuration.maxIterations < 1) {
    return next(new Error('Max iterations must be at least 1'));
  }
  
  // Validate tolerance is non-negative
  if (this.configuration.tolerance < 0) {
    return next(new Error('Tolerance must be non-negative'));
  }
  
  next();
});

// Static method to find scenarios by type
hazardScenarioSchema.statics.findByType = function(scenarioType) {
  return this.find({ 
    scenarioType: scenarioType, 
    status: { $ne: 'Cancelled' }
  });
};

// Static method to find scenarios by hazard
hazardScenarioSchema.statics.findByHazard = function(hazardType) {
  return this.find({ 
    $or: [
      { primaryHazard: hazardType },
      { secondaryHazards: hazardType }
    ],
    status: { $ne: 'Cancelled' }
  });
};

// Static method to find scenarios by region
hazardScenarioSchema.statics.findByRegion = function(region) {
  return this.find({ 
    affectedRegions: region, 
    status: { $ne: 'Cancelled' }
  });
};

// Static method to find scenarios by status
hazardScenarioSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Static method to find running scenarios
hazardScenarioSchema.statics.findRunning = function() {
  return this.find({ status: 'Running' });
};

// Static method to find completed scenarios
hazardScenarioSchema.statics.findCompleted = function() {
  return this.find({ status: 'Completed' });
};

// Static method to find scenarios by priority
hazardScenarioSchema.statics.findByPriority = function(priority) {
  return this.find({ 
    priority: priority, 
    status: { $ne: 'Cancelled' }
  });
};

// Instance method to get total economic impact
hazardScenarioSchema.methods.getTotalEconomicImpact = function(currency = 'USD') {
  return this.results
    .filter(result => result.resultType === 'Economic Loss' && result.currency === currency)
    .reduce((total, result) => total + result.value, 0);
};

// Instance method to get total casualties
hazardScenarioSchema.methods.getTotalCasualties = function() {
  return this.results
    .filter(result => result.resultType === 'Casualties')
    .reduce((total, result) => total + result.value, 0);
};

// Instance method to get execution duration in hours
hazardScenarioSchema.methods.getExecutionDurationInHours = function() {
  if (!this.executionInfo.startTime || !this.executionInfo.endTime) {
    return null;
  }
  
  const durationMs = this.executionInfo.endTime.getTime() - this.executionInfo.startTime.getTime();
  return durationMs / (1000 * 60 * 60); // Convert to hours
};

// Instance method to get scenario duration in hours
hazardScenarioSchema.methods.getScenarioDurationInHours = function() {
  if (!this.scenarioEndTime) {
    return null; // Scenario is ongoing
  }
  
  const durationMs = this.scenarioEndTime.getTime() - this.scenarioStartTime.getTime();
  return durationMs / (1000 * 60 * 60); // Convert to hours
};

// Instance method to get parameter value
hazardScenarioSchema.methods.getParameterValue = function(parameterName) {
  const parameter = this.parameters.find(p => p.parameterName === parameterName);
  return parameter ? parameter.value : null;
};

// Instance method to set parameter value
hazardScenarioSchema.methods.setParameterValue = function(parameterName, value) {
  const parameter = this.parameters.find(p => p.parameterName === parameterName);
  if (parameter) {
    parameter.value = value;
  } else {
    this.parameters.push({
      parameterName: parameterName,
      parameterType: 'Numeric',
      value: value
    });
  }
};

// Instance method to get result value
hazardScenarioSchema.methods.getResultValue = function(resultType) {
  const result = this.results.find(r => r.resultType === resultType);
  return result ? result.value : null;
};

// Instance method to add result
hazardScenarioSchema.methods.addResult = function(resultType, value, unit = null, currency = null) {
  this.results.push({
    resultType: resultType,
    value: value,
    unit: unit,
    currency: currency,
    timestamp: new Date()
  });
};

// Instance method to calculate scenario risk score
hazardScenarioSchema.methods.calculateRiskScore = function() {
  const economicImpact = this.getTotalEconomicImpact();
  const casualties = this.getTotalCasualties();
  
  // Normalize values (this is a simplified calculation)
  const economicScore = Math.min(economicImpact / 1000000, 10); // Scale to 0-10
  const casualtyScore = Math.min(casualties / 100, 10); // Scale to 0-10
  
  return (economicScore + casualtyScore) / 2;
};

// Instance method to validate scenario
hazardScenarioSchema.methods.validateScenario = function() {
  const validations = [];
  
  // Check if scenario has required parameters
  if (this.parameters.length === 0) {
    validations.push({
      validationType: 'Parameter Range',
      status: 'Failed',
      message: 'Scenario must have at least one parameter'
    });
  }
  
  // Check if scenario has valid time range
  if (this.scenarioEndTime && this.scenarioEndTime <= this.scenarioStartTime) {
    validations.push({
      validationType: 'Logical Consistency',
      status: 'Failed',
      message: 'Scenario end time must be after start time'
    });
  }
  
  // Check if scenario has valid progress
  if (this.progress < 0 || this.progress > 100) {
    validations.push({
      validationType: 'Parameter Range',
      status: 'Failed',
      message: 'Progress must be between 0 and 100'
    });
  }
  
  // If no validation errors, mark as passed
  if (validations.length === 0) {
    validations.push({
      validationType: 'Logical Consistency',
      status: 'Passed',
      message: 'Scenario validation passed'
    });
  }
  
  this.validations = validations;
  return validations;
};

module.exports = mongoose.model('HazardScenario', hazardScenarioSchema);




