const mongoose = require('../config/mongoose-wrapper');

// Zone boundary schema for complex geographic shapes
const boundarySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Circle', 'Polygon', 'MultiPolygon', 'Rectangle', 'Custom']
  },
  
  coordinates: {
    type: [[[Number]]], // Array of coordinate arrays for complex shapes
    required: true
  },
  
  centerLatitude: {
    type: Number,
    min: -90,
    max: 90
  },
  
  centerLongitude: {
    type: Number,
    min: -180,
    max: 180
  },
  
  radius: {
    type: Number,
    min: 0
  },
  
  radiusUnit: {
    type: String,
    enum: ['km', 'miles', 'nautical_miles']
  },
  
  area: {
    type: Number,
    min: 0
  },
  
  areaUnit: {
    type: String,
    enum: ['km2', 'miles2', 'acres', 'hectares']
  }
}, { _id: false });

// Risk level schema for different hazard types
const riskLevelSchema = new mongoose.Schema({
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
    ]
  },
  
  riskLevel: {
    type: String,
    required: true,
    enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme']
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
  
  returnPeriod: {
    type: Number,
    min: 0
  },
  
  returnPeriodUnit: {
    type: String,
    enum: ['years', 'months', 'days']
  },
  
  expectedLoss: {
    type: Number,
    min: 0
  },
  
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Vulnerability factors schema
const vulnerabilitySchema = new mongoose.Schema({
  populationDensity: {
    type: String,
    enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
    required: true
  },
  
  populationCount: {
    type: Number,
    min: 0
  },
  
  infrastructureQuality: {
    type: String,
    enum: ['Poor', 'Fair', 'Good', 'Excellent'],
    required: true
  },
  
  buildingCodes: {
    type: String,
    enum: ['None', 'Basic', 'Moderate', 'Strict', 'Advanced'],
    required: true
  },
  
  emergencyResponse: {
    type: String,
    enum: ['Limited', 'Adequate', 'Good', 'Excellent'],
    required: true
  },
  
  warningSystems: {
    type: String,
    enum: ['None', 'Basic', 'Moderate', 'Advanced', 'State-of-the-art'],
    required: true
  },
  
  economicDevelopment: {
    type: String,
    enum: ['Underdeveloped', 'Developing', 'Developed', 'Highly Developed'],
    required: true
  },
  
  socialVulnerability: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High'],
    required: true
  },
  
  environmentalSensitivity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High'],
    required: true
  }
}, { _id: false });

// Climate change impact schema
const climateChangeSchema = new mongoose.Schema({
  temperatureChange: {
    type: Number
  },
  
  temperatureUnit: {
    type: String,
    enum: ['Celsius', 'Fahrenheit']
  },
  
  precipitationChange: {
    type: Number
  },
  
  precipitationUnit: {
    type: String,
    enum: ['mm', 'inches']
  },
  
  seaLevelRise: {
    type: Number,
    min: 0
  },
  
  seaLevelUnit: {
    type: String,
    enum: ['mm', 'cm', 'inches', 'feet']
  },
  
  climateScenario: {
    type: String,
    enum: ['RCP2.6', 'RCP4.5', 'RCP6.0', 'RCP8.5', 'Historical', 'Custom']
  },
  
  timeHorizon: {
    type: String,
    enum: ['2020s', '2030s', '2040s', '2050s', '2060s', '2070s', '2080s', '2090s', '2100s']
  },
  
  confidenceLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High']
  }
}, { _id: false });

const hazardZoneSchema = new mongoose.Schema({
  // Basic Zone Information
  zoneId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^ZON-\d{8}$/.test(v);
      },
      message: 'Zone ID must be in format ZON-XXXXXXXX'
    }
  },
  
  zoneName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  zoneCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
    index: true
  },
  
  zoneType: {
    type: String,
    required: true,
    enum: ['Flood', 'Earthquake', 'Hurricane', 'Wildfire', 'Tornado', 'Wind', 'Storm Surge',
           'Tsunami', 'Volcanic', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave',
           'Cold Wave', 'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism',
           'Cyber', 'Nuclear', 'Chemical', 'Industrial', 'Transportation', 'Infrastructure',
           'Pandemic', 'Biological', 'Radiological', 'Space Weather', 'Asteroid',
           'Climate Change', 'Sea Level Rise', 'Permafrost', 'Glacial', 'Multi-Hazard']
  },
  
  zoneCategory: {
    type: String,
    required: true,
    enum: ['Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading'],
    index: true
  },
  
  // Geographic Information
  boundary: {
    type: boundarySchema,
    required: true
  },
  
  // Administrative Information
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  
  state: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  region: {
    type: String,
    required: true,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'],
    index: true
  },
  
  administrativeLevel: {
    type: String,
    enum: ['National', 'State/Province', 'County/District', 'Municipal', 'Local', 'Custom'],
    required: true
  },
  
  // Risk Levels
  riskLevels: [riskLevelSchema],
  
  // Vulnerability Assessment
  vulnerability: {
    type: vulnerabilitySchema,
    required: true
  },
  
  // Climate Change Impact
  climateChange: {
    type: climateChangeSchema,
    default: null
  },
  
  // Zone Characteristics
  zoneDescription: {
    type: String,
    maxlength: 2000
  },
  
  zonePurpose: {
    type: String,
    enum: ['Insurance', 'Planning', 'Emergency Response', 'Regulatory', 'Research', 'Public Awareness'],
    required: true
  },
  
  zoneAuthority: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  // Data Sources
  dataSources: [{
    sourceType: {
      type: String,
      enum: ['Government', 'NGO', 'Academic', 'Private', 'Satellite', 'Ground Station', 'Model Output', 'Other']
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
  
  // Zone Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Review', 'Deprecated', 'Draft'],
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
  
  // Links to Exposure Data
  affectedLocations: [{
    locationId: {
      type: String,
      ref: 'Location',
      required: true
    },
    
    riskLevel: {
      type: String,
      enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme'],
      required: true
    },
    
    riskScore: {
      type: Number,
      min: 0,
      max: 10
    }
  }],
  
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
hazardZoneSchema.index({ zoneType: 1, status: 1 });
hazardZoneSchema.index({ zoneCategory: 1, region: 1 });
hazardZoneSchema.index({ country: 1, state: 1 });
hazardZoneSchema.index({ 'boundary.centerLatitude': 1, 'boundary.centerLongitude': 1 });
hazardZoneSchema.index({ 'riskLevels.hazardType': 1, 'riskLevels.riskLevel': 1 });
hazardZoneSchema.index({ 'affectedLocations.locationId': 1 });
hazardZoneSchema.index({ effectiveDate: 1, expiryDate: 1 });

// Pre-save middleware for validation
hazardZoneSchema.pre('save', function(next) {
  // Validate expiry date is after effective date
  if (this.expiryDate && this.expiryDate <= this.effectiveDate) {
    return next(new Error('Expiry date must be after effective date'));
  }
  
  // Validate boundary coordinates
  if (this.boundary.centerLatitude && 
      (this.boundary.centerLatitude < -90 || this.boundary.centerLatitude > 90)) {
    return next(new Error('Center latitude must be between -90 and 90'));
  }
  
  if (this.boundary.centerLongitude && 
      (this.boundary.centerLongitude < -180 || this.boundary.centerLongitude > 180)) {
    return next(new Error('Center longitude must be between -180 and 180'));
  }
  
  // Validate risk levels have valid probability values
  const invalidRiskLevels = this.riskLevels.filter(rl => 
    rl.probability < 0 || rl.probability > 1
  );
  if (invalidRiskLevels.length > 0) {
    return next(new Error('Risk level probabilities must be between 0 and 1'));
  }
  
  // Validate risk scores are between 0 and 10
  const invalidRiskScores = this.riskLevels.filter(rl => 
    rl.riskScore < 0 || rl.riskScore > 10
  );
  if (invalidRiskScores.length > 0) {
    return next(new Error('Risk scores must be between 0 and 10'));
  }
  
  next();
});

// Static method to find zones by type
hazardZoneSchema.statics.findByType = function(zoneType) {
  return this.find({ 
    zoneType: zoneType, 
    status: 'Active' 
  });
};

// Static method to find zones by region
hazardZoneSchema.statics.findByRegion = function(region) {
  return this.find({ 
    region: region, 
    status: 'Active' 
  });
};

// Static method to find zones by country
hazardZoneSchema.statics.findByCountry = function(country) {
  return this.find({ 
    country: country, 
    status: 'Active' 
  });
};

// Static method to find zones by risk level
hazardZoneSchema.statics.findByRiskLevel = function(hazardType, minRiskLevel = 'Low') {
  const riskLevelOrder = ['Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme'];
  const minIndex = riskLevelOrder.indexOf(minRiskLevel);
  
  return this.find({ 
    'riskLevels.hazardType': hazardType,
    'riskLevels.riskLevel': { $in: riskLevelOrder.slice(minIndex) },
    status: 'Active' 
  });
};

// Static method to find zones within geographic bounds
hazardZoneSchema.statics.findWithinBounds = function(minLat, maxLat, minLng, maxLng) {
  return this.find({
    'boundary.centerLatitude': { $gte: minLat, $lte: maxLat },
    'boundary.centerLongitude': { $gte: minLng, $lte: maxLng },
    status: 'Active'
  });
};

// Static method to find zones affecting a specific location
hazardZoneSchema.statics.findAffectingLocation = function(latitude, longitude, bufferKm = 0) {
  return this.find({
    'boundary.centerLatitude': { 
      $gte: latitude - (bufferKm / 111), // Rough conversion: 1 degree ≈ 111 km
      $lte: latitude + (bufferKm / 111)
    },
    'boundary.centerLongitude': { 
      $gte: longitude - (bufferKm / (111 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (bufferKm / (111 * Math.cos(latitude * Math.PI / 180)))
    },
    status: 'Active'
  });
};

// Instance method to check if zone contains a specific location
hazardZoneSchema.methods.containsLocation = function(latitude, longitude) {
  // For circular zones
  if (this.boundary.type === 'Circle' && this.boundary.centerLatitude && this.boundary.centerLongitude) {
    const R = 6371; // Earth's radius in km
    const dLat = (latitude - this.boundary.centerLatitude) * Math.PI / 180;
    const dLng = (longitude - this.boundary.centerLongitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.boundary.centerLatitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance <= this.boundary.radius;
  }
  
  // For polygon zones (simplified point-in-polygon check)
  if (this.boundary.type === 'Polygon' && this.boundary.coordinates) {
    // This is a simplified implementation
    // In production, you'd want to use a proper point-in-polygon algorithm
    return false; // Placeholder
  }
  
  return false;
};

// Instance method to get risk level for a specific hazard type
hazardZoneSchema.methods.getRiskLevel = function(hazardType) {
  return this.riskLevels.find(rl => rl.hazardType === hazardType);
};

// Instance method to get highest risk level
hazardZoneSchema.methods.getHighestRiskLevel = function() {
  const riskLevelOrder = ['Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme'];
  return this.riskLevels.reduce((highest, current) => {
    const currentIndex = riskLevelOrder.indexOf(current.riskLevel);
    const highestIndex = riskLevelOrder.indexOf(highest.riskLevel);
    return currentIndex > highestIndex ? current : highest;
  }, this.riskLevels[0]);
};

// Instance method to calculate zone vulnerability score
hazardZoneSchema.methods.calculateVulnerabilityScore = function() {
  const vulnerabilityWeights = {
    populationDensity: { 'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 },
    infrastructureQuality: { 'Poor': 4, 'Fair': 3, 'Good': 2, 'Excellent': 1 },
    buildingCodes: { 'None': 5, 'Basic': 4, 'Moderate': 3, 'Strict': 2, 'Advanced': 1 },
    emergencyResponse: { 'Limited': 4, 'Adequate': 3, 'Good': 2, 'Excellent': 1 },
    warningSystems: { 'None': 5, 'Basic': 4, 'Moderate': 3, 'Advanced': 2, 'State-of-the-art': 1 },
    economicDevelopment: { 'Underdeveloped': 4, 'Developing': 3, 'Developed': 2, 'Highly Developed': 1 },
    socialVulnerability: { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 },
    environmentalSensitivity: { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 }
  };
  
  let totalScore = 0;
  let factorCount = 0;
  
  Object.keys(vulnerabilityWeights).forEach(factor => {
    if (this.vulnerability[factor]) {
      totalScore += vulnerabilityWeights[factor][this.vulnerability[factor]] || 0;
      factorCount++;
    }
  });
  
  return factorCount > 0 ? totalScore / factorCount : 0;
};

// Instance method to get zone area in square kilometers
hazardZoneSchema.methods.getAreaInKm2 = function() {
  if (this.boundary.area && this.boundary.areaUnit) {
    const conversionFactors = {
      'km2': 1,
      'miles2': 2.58999,
      'acres': 0.004047,
      'hectares': 0.01
    };
    
    return this.boundary.area * (conversionFactors[this.boundary.areaUnit] || 1);
  }
  
  return null;
};

module.exports = mongoose.model('HazardZone', hazardZoneSchema);




