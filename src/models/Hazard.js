const mongoose = require('../config/mongoose-wrapper');

// Hazard intensity schema for different measurement scales
const intensitySchema = new mongoose.Schema({
  scale: {
    type: String,
    required: true,
    enum: ['Richter', 'Mercalli', 'Saffir-Simpson', 'Fujita', 'Enhanced Fujita', 'Beaufort', 'Custom']
  },
  
  value: {
    type: Number,
    required: true,
    min: 0
  },
  
  unit: {
    type: String,
    required: true,
    enum: ['Magnitude', 'Intensity', 'Category', 'Scale', 'm/s', 'km/h', 'mph', 'Custom']
  },
  
  description: {
    type: String,
    maxlength: 500
  }
}, { _id: false });

// Geographic footprint schema
const footprintSchema = new mongoose.Schema({
  centerLatitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  
  centerLongitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  
  radius: {
    type: Number,
    required: true,
    min: 0
  },
  
  unit: {
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
  
  polygon: {
    type: [[[Number]]], // Array of coordinate arrays for complex shapes
    default: null
  }
}, { _id: false });

// Temporal characteristics schema
const temporalSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true
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
    enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months']
  },
  
  peakIntensityTime: {
    type: Date,
    default: null
  },
  
  warningTime: {
    type: Number,
    min: 0
  },
  
  warningTimeUnit: {
    type: String,
    enum: ['seconds', 'minutes', 'hours', 'days']
  }
}, { _id: false });

// Economic impact schema
const economicImpactSchema = new mongoose.Schema({
  estimatedLoss: {
    type: Number,
    min: 0
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
  
  lossType: {
    type: String,
    enum: ['Property', 'Business Interruption', 'Infrastructure', 'Agricultural', 'Total']
  },
  
  methodology: {
    type: String,
    maxlength: 200
  }
}, { _id: false });

const hazardSchema = new mongoose.Schema({
  // Basic Hazard Information
  hazardId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^HAZ-\d{8}$/.test(v);
      },
      message: 'Hazard ID must be in format HAZ-XXXXXXXX'
    }
  },
  
  hazardName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  hazardType: {
    type: String,
    required: true,
    enum: [
      // Natural Hazards
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm',
      
      // Man-made Hazards
      'Terrorism', 'Cyber Attack', 'Nuclear Accident', 'Chemical Spill', 'Oil Spill',
      'Industrial Accident', 'Transportation Accident', 'Infrastructure Failure',
      'Pandemic', 'Biological Attack', 'Radiological Attack',
      
      // Emerging Hazards
      'Space Weather', 'Solar Flare', 'Asteroid Impact', 'Climate Change Impact',
      'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
    ],
    index: true
  },
  
  hazardCategory: {
    type: String,
    required: true,
    enum: ['Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading'],
    index: true
  },
  
  // Hazard Characteristics
  intensities: [intensitySchema],
  
  // Geographic Information
  footprint: {
    type: footprintSchema,
    required: true
  },
  
  // Temporal Information
  temporal: {
    type: temporalSchema,
    required: true
  },
  
  // Severity and Impact
  severity: {
    type: String,
    required: true,
    enum: ['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme'],
    index: true
  },
  
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  
  returnPeriod: {
    type: Number,
    min: 0
  },
  
  returnPeriodUnit: {
    type: String,
    enum: ['years', 'months', 'days']
  },
  
  // Economic Impact
  economicImpact: [economicImpactSchema],
  
  // Affected Regions
  affectedRegions: [{
    type: String,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
  }],
  
  affectedCountries: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  
  // Vulnerability Factors (Legacy - kept for backward compatibility)
  vulnerabilityFactors: {
    populationDensity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High']
    },
    
    infrastructureQuality: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'Excellent']
    },
    
    emergencyResponse: {
      type: String,
      enum: ['Limited', 'Adequate', 'Good', 'Excellent']
    },
    
    buildingCodes: {
      type: String,
      enum: ['None', 'Basic', 'Moderate', 'Strict', 'Advanced']
    },
    
    warningSystems: {
      type: String,
      enum: ['None', 'Basic', 'Moderate', 'Advanced', 'State-of-the-art']
    }
  },

  // Linked Vulnerabilities (New vulnerability module integration)
  linkedVulnerabilities: [{
    vulnerabilityId: {
      type: String,
      ref: 'Vulnerability',
      required: true
    },
    
    relationshipType: {
      type: String,
      enum: ['Primary', 'Secondary', 'Related', 'Cascading'],
      required: true
    },
    
    vulnerabilityScore: {
      type: Number,
      min: 0,
      max: 10
    },
    
    linkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Climate Change Considerations
  climateChangeImpact: {
    isClimateRelated: {
      type: Boolean,
      default: false
    },
    
    climateScenario: {
      type: String,
      enum: ['RCP2.6', 'RCP4.5', 'RCP6.0', 'RCP8.5', 'Historical', 'Custom']
    },
    
    temperatureIncrease: {
      type: Number,
      min: 0
    },
    
    seaLevelRise: {
      type: Number,
      min: 0
    },
    
    precipitationChange: {
      type: Number
    }
  },
  
  // Modeling Data
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
  
  // Data Sources
  dataSources: [{
    sourceType: {
      type: String,
      enum: ['Satellite', 'Ground Station', 'Model Output', 'Historical Data', 'Expert Opinion', 'Other']
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
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Review', 'Deprecated', 'Draft'],
    default: 'Active',
    index: true
  },
  
  isHistorical: {
    type: Boolean,
    default: false
  },
  
  isSimulated: {
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
hazardSchema.index({ hazardType: 1, status: 1 });
hazardSchema.index({ hazardCategory: 1, severity: 1 });
hazardSchema.index({ 'footprint.centerLatitude': 1, 'footprint.centerLongitude': 1 });
hazardSchema.index({ 'temporal.startTime': 1, 'temporal.endTime': 1 });
hazardSchema.index({ affectedRegions: 1 });
hazardSchema.index({ affectedCountries: 1 });
hazardSchema.index({ probability: -1 });
hazardSchema.index({ severity: 1, probability: -1 });
hazardSchema.index({ isHistorical: 1, isSimulated: 1 });
hazardSchema.index({ 'linkedVulnerabilities.vulnerabilityId': 1 });

// Pre-save middleware for validation
hazardSchema.pre('save', function(next) {
  // Validate end time is after start time
  if (this.temporal.endTime && this.temporal.endTime <= this.temporal.startTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Validate probability is between 0 and 1
  if (this.probability < 0 || this.probability > 1) {
    return next(new Error('Probability must be between 0 and 1'));
  }
  
  // Validate footprint coordinates
  if (this.footprint.centerLatitude < -90 || this.footprint.centerLatitude > 90) {
    return next(new Error('Center latitude must be between -90 and 90'));
  }
  
  if (this.footprint.centerLongitude < -180 || this.footprint.centerLongitude > 180) {
    return next(new Error('Center longitude must be between -180 and 180'));
  }
  
  // Validate economic impact currency consistency
  const currencies = this.economicImpact.map(impact => impact.currency);
  const uniqueCurrencies = [...new Set(currencies)];
  if (uniqueCurrencies.length > 1) {
    return next(new Error('All economic impacts must use the same currency'));
  }
  
  next();
});

// Static method to find hazards by type
hazardSchema.statics.findByType = function(hazardType) {
  return this.find({ 
    hazardType: hazardType, 
    status: 'Active' 
  });
};

// Static method to find hazards by region
hazardSchema.statics.findByRegion = function(region) {
  return this.find({ 
    affectedRegions: region, 
    status: 'Active' 
  });
};

// Static method to find hazards by severity and probability range
hazardSchema.statics.findBySeverityAndProbability = function(severity, minProb = 0, maxProb = 1) {
  return this.find({ 
    severity: severity,
    probability: { $gte: minProb, $lte: maxProb },
    status: 'Active' 
  });
};

// Static method to find hazards within geographic bounds
hazardSchema.statics.findWithinBounds = function(minLat, maxLat, minLng, maxLng) {
  return this.find({
    'footprint.centerLatitude': { $gte: minLat, $lte: maxLat },
    'footprint.centerLongitude': { $gte: minLng, $lte: maxLng },
    status: 'Active'
  });
};

// Static method to find hazards by time range
hazardSchema.statics.findByTimeRange = function(startTime, endTime) {
  return this.find({
    'temporal.startTime': { $gte: startTime },
    'temporal.endTime': { $lte: endTime },
    status: 'Active'
  });
};

// Instance method to check if hazard affects a specific location
hazardSchema.methods.affectsLocation = function(latitude, longitude, bufferKm = 0) {
  const R = 6371; // Earth's radius in km
  const dLat = (latitude - this.footprint.centerLatitude) * Math.PI / 180;
  const dLng = (longitude - this.footprint.centerLongitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.footprint.centerLatitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= (this.footprint.radius + bufferKm);
};

// Instance method to get total economic impact
hazardSchema.methods.getTotalEconomicImpact = function(currency = 'USD') {
  return this.economicImpact
    .filter(impact => impact.currency === currency)
    .reduce((total, impact) => total + impact.estimatedLoss, 0);
};

// Instance method to get intensity by scale
hazardSchema.methods.getIntensityByScale = function(scale) {
  return this.intensities.find(intensity => intensity.scale === scale);
};

// Instance method to calculate hazard score
hazardSchema.methods.calculateHazardScore = function() {
  const severityWeights = {
    'Minor': 1,
    'Moderate': 2,
    'Major': 3,
    'Severe': 4,
    'Catastrophic': 5,
    'Extreme': 6
  };
  
  const severityScore = severityWeights[this.severity] || 0;
  const probabilityScore = this.probability * 10; // Scale to 0-10
  const impactScore = this.getTotalEconomicImpact() / 1000000; // Scale to millions
  
  return (severityScore + probabilityScore + Math.min(impactScore, 10)) / 3;
};

// Instance method to get linked vulnerabilities
hazardSchema.methods.getLinkedVulnerabilities = function() {
  return this.linkedVulnerabilities;
};

// Instance method to add vulnerability link
hazardSchema.methods.addVulnerabilityLink = function(vulnerabilityId, relationshipType = 'Primary', vulnerabilityScore = null) {
  // Check if vulnerability is already linked
  const existingLink = this.linkedVulnerabilities.find(link => link.vulnerabilityId === vulnerabilityId);
  if (existingLink) {
    throw new Error('Vulnerability is already linked to this hazard');
  }
  
  this.linkedVulnerabilities.push({
    vulnerabilityId,
    relationshipType,
    vulnerabilityScore,
    linkedAt: new Date()
  });
};

// Instance method to remove vulnerability link
hazardSchema.methods.removeVulnerabilityLink = function(vulnerabilityId) {
  const index = this.linkedVulnerabilities.findIndex(link => link.vulnerabilityId === vulnerabilityId);
  if (index === -1) {
    throw new Error('Vulnerability link not found');
  }
  
  this.linkedVulnerabilities.splice(index, 1);
};

// Instance method to get average vulnerability score
hazardSchema.methods.getAverageVulnerabilityScore = function() {
  if (this.linkedVulnerabilities.length === 0) {
    return null;
  }
  
  const scores = this.linkedVulnerabilities
    .filter(link => link.vulnerabilityScore !== null && link.vulnerabilityScore !== undefined)
    .map(link => link.vulnerabilityScore);
  
  if (scores.length === 0) {
    return null;
  }
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

// Instance method to get primary vulnerabilities
hazardSchema.methods.getPrimaryVulnerabilities = function() {
  return this.linkedVulnerabilities.filter(link => link.relationshipType === 'Primary');
};

// Instance method to calculate risk with vulnerability
hazardSchema.methods.calculateRiskWithVulnerability = function() {
  const hazardScore = this.calculateHazardScore();
  const vulnerabilityScore = this.getAverageVulnerabilityScore();
  
  if (vulnerabilityScore === null) {
    return hazardScore;
  }
  
  // Risk = Hazard × Vulnerability (simplified formula)
  return hazardScore * (vulnerabilityScore / 10);
};

module.exports = mongoose.model('Hazard', hazardSchema);
