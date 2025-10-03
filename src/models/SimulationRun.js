const mongoose = require('../config/mongoose-wrapper');

// Simulation configuration schema
const simulationConfigSchema = new mongoose.Schema({
  // Time Configuration
  startYear: {
    type: Number,
    required: true,
    min: 1900,
    max: 3000
  },
  
  endYear: {
    type: Number,
    required: true,
    min: 1900,
    max: 3000
  },
  
  timeHorizon: {
    type: Number,
    required: true,
    min: 1
  },
  
  timeHorizonUnit: {
    type: String,
    required: true,
    enum: ['years', 'months', 'days']
  },
  
  // Hazard Configuration
  hazardTypes: [{
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
  
  // Geographic Configuration
  geographicScope: {
    regions: [{
      type: String,
      enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
    }],
    
    countries: [{
      type: String,
      trim: true,
      maxlength: 100
    }],
    
    boundingBox: {
      minLatitude: {
        type: Number,
        min: -90,
        max: 90
      },
      maxLatitude: {
        type: Number,
        min: -90,
        max: 90
      },
      minLongitude: {
        type: Number,
        min: -180,
        max: 180
      },
      maxLongitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  
  // Exposure Configuration
  exposureScope: {
    accountIds: [{
      type: String,
      ref: 'Account'
    }],
    
    policyIds: [{
      type: String,
      ref: 'Policy'
    }],
    
    minExposureAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    
    maxExposureAmount: {
      type: Number,
      min: 0,
      default: null
    },
    
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL'],
      default: 'USD'
    }
  },
  
  // Vulnerability Configuration
  vulnerabilityScope: {
    vulnerabilityIds: [{
      type: String,
      ref: 'Vulnerability'
    }],
    
    vulnerabilityTypes: [{
      type: String,
      enum: ['Physical', 'Social', 'Economic', 'Environmental', 'Institutional', 'Infrastructure', 'Multi-dimensional']
    }],
    
    minVulnerabilityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    
    maxVulnerabilityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 10
    }
  },
  
  // Modeling Configuration
  modelingConfig: {
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
    
    numberOfSimulations: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000
    },
    
    probabilityDistributions: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    }
  },
  
  // Risk Configuration
  riskConfig: {
    confidenceLevels: [{
      type: Number,
      min: 0,
      max: 1
    }],
    
    returnPeriods: [{
      type: Number,
      min: 0
    }],
    
    severityThresholds: {
      minor: {
        type: Number,
        min: 0,
        max: 1
      },
      moderate: {
        type: Number,
        min: 0,
        max: 1
      },
      major: {
        type: Number,
        min: 0,
        max: 1
      },
      severe: {
        type: Number,
        min: 0,
        max: 1
      },
      catastrophic: {
        type: Number,
        min: 0,
        max: 1
      },
      extreme: {
        type: Number,
        min: 0,
        max: 1
      }
    }
  }
}, { _id: false });

// Simulation results schema
const simulationResultsSchema = new mongoose.Schema({
  // Event Statistics
  totalEvents: {
    type: Number,
    required: true,
    min: 0
  },
  
  eventsByHazardType: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  eventsBySeverity: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  eventsByYear: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // Financial Statistics
  totalLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  averageLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  medianLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  maxLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  minLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  standardDeviation: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Risk Metrics
  expectedLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  valueAtRisk: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  tailValueAtRisk: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // Diversification Metrics
  diversificationBenefit: {
    type: Number,
    default: 0
  },
  
  concentrationRisk: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  
  // Geographic Statistics
  affectedRegions: [{
    type: String,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
  }],
  
  affectedCountries: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  
  // Vulnerability Statistics
  averageVulnerabilityScore: {
    type: Number,
    min: 0,
    max: 10
  },
  
  vulnerabilityDistribution: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // Exposure Statistics
  totalExposure: {
    type: Number,
    required: true,
    min: 0
  },
  
  averageExposure: {
    type: Number,
    required: true,
    min: 0
  },
  
  exposureDistribution: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, { _id: false });

const simulationRunSchema = new mongoose.Schema({
  // Basic Information
  simulationRunId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^SIMRUN-\d{8}-\d{6}$/.test(v);
      },
      message: 'Simulation Run ID must be in format SIMRUN-XXXXXXXX-XXXXXX'
    }
  },
  
  simulationName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  simulationDescription: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Configuration
  configuration: {
    type: simulationConfigSchema,
    required: true
  },
  
  // Results
  results: {
    type: simulationResultsSchema,
    default: null
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['Pending', 'Running', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  currentStep: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Timing Information
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
  
  // Error Information
  errorMessage: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  errorDetails: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  // Performance Metrics
  performanceMetrics: {
    eventsPerSecond: {
      type: Number,
      min: 0
    },
    
    memoryUsage: {
      type: Number,
      min: 0
    },
    
    cpuUsage: {
      type: Number,
      min: 0,
      max: 100
    },
    
    databaseQueries: {
      type: Number,
      min: 0
    },
    
    averageQueryTime: {
      type: Number,
      min: 0
    }
  },
  
  // Status and Metadata
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
simulationRunSchema.index({ status: 1, createdBy: 1 });
simulationRunSchema.index({ 'configuration.startYear': 1, 'configuration.endYear': 1 });
simulationRunSchema.index({ 'configuration.geographicScope.regions': 1 });
simulationRunSchema.index({ 'configuration.exposureScope.currency': 1 });
simulationRunSchema.index({ startTime: 1, endTime: 1 });
simulationRunSchema.index({ isHistorical: 1, isSimulated: 1 });

// Pre-save middleware for validation
simulationRunSchema.pre('save', function(next) {
  // Validate end year is after start year
  if (this.configuration.endYear <= this.configuration.startYear) {
    return next(new Error('End year must be after start year'));
  }
  
  // Validate time horizon is reasonable
  if (this.configuration.timeHorizon <= 0) {
    return next(new Error('Time horizon must be positive'));
  }
  
  // Validate number of simulations is reasonable
  if (this.configuration.modelingConfig.numberOfSimulations <= 0) {
    return next(new Error('Number of simulations must be positive'));
  }
  
  // Validate progress is between 0 and 100
  if (this.progress < 0 || this.progress > 100) {
    return next(new Error('Progress must be between 0 and 100'));
  }
  
  // Calculate duration if both start and end times are present
  if (this.startTime && this.endTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
    this.durationUnit = 'seconds';
  }
  
  next();
});

// Static method to find runs by status
simulationRunSchema.statics.findByStatus = function(status) {
  return this.find({ 
    status: status 
  }).sort({ createdAt: -1 });
};

// Static method to find runs by user
simulationRunSchema.statics.findByUser = function(userId) {
  return this.find({ 
    createdBy: userId 
  }).sort({ createdAt: -1 });
};

// Static method to find runs by year range
simulationRunSchema.statics.findByYearRange = function(startYear, endYear) {
  return this.find({
    'configuration.startYear': { $gte: startYear },
    'configuration.endYear': { $lte: endYear }
  });
};

// Static method to find runs by region
simulationRunSchema.statics.findByRegion = function(region) {
  return this.find({
    'configuration.geographicScope.regions': region
  });
};

// Static method to find runs by hazard type
simulationRunSchema.statics.findByHazardType = function(hazardType) {
  return this.find({
    'configuration.hazardTypes': hazardType
  });
};

// Instance method to calculate progress percentage
simulationRunSchema.methods.calculateProgress = function(completedEvents, totalEvents) {
  if (totalEvents === 0) return 0;
  return Math.min(100, Math.round((completedEvents / totalEvents) * 100));
};

// Instance method to update progress
simulationRunSchema.methods.updateProgress = function(completedEvents, totalEvents, currentStep) {
  this.progress = this.calculateProgress(completedEvents, totalEvents);
  this.currentStep = currentStep;
  this.lastModifiedBy = this.lastModifiedBy; // Update last modified
};

// Instance method to start simulation
simulationRunSchema.methods.startSimulation = function() {
  this.status = 'Running';
  this.startTime = new Date();
  this.progress = 0;
  this.currentStep = 'Initializing simulation';
};

// Instance method to complete simulation
simulationRunSchema.methods.completeSimulation = function(results) {
  this.status = 'Completed';
  this.endTime = new Date();
  this.progress = 100;
  this.currentStep = 'Simulation completed';
  this.results = results;
};

// Instance method to fail simulation
simulationRunSchema.methods.failSimulation = function(errorMessage, errorDetails = {}) {
  this.status = 'Failed';
  this.endTime = new Date();
  this.errorMessage = errorMessage;
  this.errorDetails = errorDetails;
};

// Instance method to cancel simulation
simulationRunSchema.methods.cancelSimulation = function() {
  this.status = 'Cancelled';
  this.endTime = new Date();
  this.currentStep = 'Simulation cancelled';
};

// Instance method to get duration in human readable format
simulationRunSchema.methods.getDurationString = function() {
  if (!this.duration) return 'Not started';
  
  const seconds = this.duration;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

// Instance method to get performance summary
simulationRunSchema.methods.getPerformanceSummary = function() {
  if (!this.performanceMetrics) return null;
  
  return {
    duration: this.getDurationString(),
    eventsPerSecond: this.performanceMetrics.eventsPerSecond || 0,
    memoryUsage: this.performanceMetrics.memoryUsage || 0,
    cpuUsage: this.performanceMetrics.cpuUsage || 0,
    databaseQueries: this.performanceMetrics.databaseQueries || 0,
    averageQueryTime: this.performanceMetrics.averageQueryTime || 0
  };
};

// Instance method to get results summary
simulationRunSchema.methods.getResultsSummary = function() {
  if (!this.results) return null;
  
  return {
    totalEvents: this.results.totalEvents,
    totalLoss: this.results.totalLoss,
    averageLoss: this.results.averageLoss,
    maxLoss: this.results.maxLoss,
    expectedLoss: this.results.expectedLoss,
    diversificationBenefit: this.results.diversificationBenefit,
    concentrationRisk: this.results.concentrationRisk
  };
};

module.exports = mongoose.model('SimulationRun', simulationRunSchema);
