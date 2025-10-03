const mongoose = require('../config/mongoose-wrapper');

// Event impact schema for different types of losses
const eventImpactSchema = new mongoose.Schema({
  impactType: {
    type: String,
    required: true,
    enum: ['Property Damage', 'Business Interruption', 'Infrastructure Damage', 
           'Agricultural Loss', 'Human Casualties', 'Environmental Damage', 'Total']
  },
  
  estimatedLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
  },
  
  confidenceLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  methodology: {
    type: String,
    maxlength: 200
  },
  
  dataSource: {
    type: String,
    maxlength: 200
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Event progression schema for tracking event development
const eventProgressionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  
  stage: {
    type: String,
    required: true,
    enum: ['Formation', 'Development', 'Peak', 'Decay', 'Dissipation', 'Recovery']
  },
  
  intensity: {
    type: Number,
    min: 0,
    max: 10
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  affectedArea: {
    type: Number,
    min: 0
  },
  
  areaUnit: {
    type: String,
    enum: ['km2', 'miles2', 'acres', 'hectares']
  }
}, { _id: false });

// Event response schema for tracking emergency response
const eventResponseSchema = new mongoose.Schema({
  responseType: {
    type: String,
    required: true,
    enum: ['Evacuation', 'Shelter', 'Search and Rescue', 'Medical', 'Infrastructure Repair', 
           'Debris Removal', 'Communication', 'Logistics', 'Recovery Planning']
  },
  
  startTime: {
    type: Date,
    required: true
  },
  
  endTime: {
    type: Date,
    default: null
  },
  
  status: {
    type: String,
    enum: ['Planned', 'Active', 'Completed', 'Suspended', 'Cancelled'],
    default: 'Planned'
  },
  
  resourcesDeployed: {
    personnel: {
      type: Number,
      min: 0
    },
    
    equipment: {
      type: String,
      maxlength: 500
    },
    
    vehicles: {
      type: Number,
      min: 0
    }
  },
  
  effectiveness: {
    type: String,
    enum: ['Poor', 'Fair', 'Good', 'Excellent'],
    default: 'Fair'
  },
  
  cost: {
    type: Number,
    min: 0
  },
  
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
  }
}, { _id: false });

const hazardEventSchema = new mongoose.Schema({
  // Basic Event Information
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^EVT-\d{8}$/.test(v);
      },
      message: 'Event ID must be in format EVT-XXXXXXXX'
    }
  },
  
  eventName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Reference to Hazard
  hazardId: {
    type: String,
    required: true,
    ref: 'Hazard',
    index: true
  },
  
  // Event Classification
  eventType: {
    type: String,
    required: true,
    enum: [
      // Natural Events
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm',
      
      // Man-made Events
      'Terrorism', 'Cyber Attack', 'Nuclear Accident', 'Chemical Spill', 'Oil Spill',
      'Industrial Accident', 'Transportation Accident', 'Infrastructure Failure',
      'Pandemic', 'Biological Attack', 'Radiological Attack',
      
      // Emerging Events
      'Space Weather', 'Solar Flare', 'Asteroid Impact', 'Climate Change Impact',
      'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
    ],
    index: true
  },
  
  eventCategory: {
    type: String,
    required: true,
    enum: ['Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading'],
    index: true
  },
  
  // Event Timing
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  
  endTime: {
    type: Date,
    default: null,
    index: true
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
  
  affectedRegions: [{
    type: String,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
  }],
  
  affectedCountries: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  
  affectedCities: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  
  // Event Characteristics
  severity: {
    type: String,
    required: true,
    enum: ['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme'],
    index: true
  },
  
  intensity: {
    type: Number,
    min: 0,
    max: 10
  },
  
  magnitude: {
    type: Number,
    min: 0
  },
  
  magnitudeScale: {
    type: String,
    enum: ['Richter', 'Mercalli', 'Saffir-Simpson', 'Fujita', 'Enhanced Fujita', 'Beaufort', 'Custom']
  },
  
  // Event Impact
  impacts: [eventImpactSchema],
  
  // Event Progression
  progression: [eventProgressionSchema],
  
  // Emergency Response
  emergencyResponse: [eventResponseSchema],
  
  // Casualties and Displacement
  casualties: {
    fatalities: {
      type: Number,
      min: 0,
      default: 0
    },
    
    injuries: {
      type: Number,
      min: 0,
      default: 0
    },
    
    missing: {
      type: Number,
      min: 0,
      default: 0
    },
    
    displaced: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Infrastructure Impact
  infrastructureImpact: {
    buildingsDamaged: {
      type: Number,
      min: 0,
      default: 0
    },
    
    buildingsDestroyed: {
      type: Number,
      min: 0,
      default: 0
    },
    
    roadsAffected: {
      type: Number,
      min: 0,
      default: 0
    },
    
    bridgesAffected: {
      type: Number,
      min: 0,
      default: 0
    },
    
    powerOutages: {
      type: Number,
      min: 0,
      default: 0
    },
    
    waterOutages: {
      type: Number,
      min: 0,
      default: 0
    },
    
    telecommunicationsAffected: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Environmental Impact
  environmentalImpact: {
    airQuality: {
      type: String,
      enum: ['Good', 'Moderate', 'Unhealthy', 'Hazardous', 'Unknown']
    },
    
    waterContamination: {
      type: Boolean,
      default: false
    },
    
    soilContamination: {
      type: Boolean,
      default: false
    },
    
    wildlifeAffected: {
      type: Number,
      min: 0,
      default: 0
    },
    
    ecosystemDamage: {
      type: String,
      enum: ['None', 'Minimal', 'Moderate', 'Severe', 'Critical']
    }
  },
  
  // Event Status
  status: {
    type: String,
    enum: ['Ongoing', 'Completed', 'Recovering', 'Investigation', 'Closed'],
    default: 'Ongoing',
    index: true
  },
  
  // Data Quality and Sources
  dataQuality: {
    overall: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'Excellent'],
      default: 'Fair'
    },
    
    completeness: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    
    accuracy: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High'],
      default: 'Medium'
    },
    
    timeliness: {
      type: String,
      enum: ['Delayed', 'Moderate', 'Timely', 'Real-time'],
      default: 'Moderate'
    }
  },
  
  dataSources: [{
    sourceType: {
      type: String,
      enum: ['Government', 'NGO', 'Media', 'Satellite', 'Ground Station', 'Model Output', 'Other']
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
    },
    
    claimStatus: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Denied', 'Settled'],
      default: 'Pending'
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
hazardEventSchema.index({ eventType: 1, status: 1 });
hazardEventSchema.index({ eventCategory: 1, severity: 1 });
hazardEventSchema.index({ centerLatitude: 1, centerLongitude: 1 });
hazardEventSchema.index({ startTime: 1, endTime: 1 });
hazardEventSchema.index({ affectedRegions: 1 });
hazardEventSchema.index({ affectedCountries: 1 });
hazardEventSchema.index({ severity: 1, intensity: -1 });
hazardEventSchema.index({ 'affectedLocations.locationId': 1 });
hazardEventSchema.index({ 'affectedPolicies.policyId': 1 });

// Pre-save middleware for validation
hazardEventSchema.pre('save', function(next) {
  // Validate end time is after start time
  if (this.endTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
  
  // Validate coordinates
  if (this.centerLatitude < -90 || this.centerLatitude > 90) {
    return next(new Error('Center latitude must be between -90 and 90'));
  }
  
  if (this.centerLongitude < -180 || this.centerLongitude > 180) {
    return next(new Error('Center longitude must be between -180 and 180'));
  }
  
  // Validate intensity is between 0 and 10
  if (this.intensity < 0 || this.intensity > 10) {
    return next(new Error('Intensity must be between 0 and 10'));
  }
  
  // Validate casualty numbers are non-negative
  if (this.casualties.fatalities < 0 || this.casualties.injuries < 0 || 
      this.casualties.missing < 0 || this.casualties.displaced < 0) {
    return next(new Error('Casualty numbers must be non-negative'));
  }
  
  next();
});

// Static method to find events by type
hazardEventSchema.statics.findByType = function(eventType) {
  return this.find({ 
    eventType: eventType, 
    status: { $ne: 'Closed' }
  });
};

// Static method to find events by region
hazardEventSchema.statics.findByRegion = function(region) {
  return this.find({ 
    affectedRegions: region, 
    status: { $ne: 'Closed' }
  });
};

// Static method to find events by severity
hazardEventSchema.statics.findBySeverity = function(severity) {
  return this.find({ 
    severity: severity, 
    status: { $ne: 'Closed' }
  });
};

// Static method to find events within geographic bounds
hazardEventSchema.statics.findWithinBounds = function(minLat, maxLat, minLng, maxLng) {
  return this.find({
    centerLatitude: { $gte: minLat, $lte: maxLat },
    centerLongitude: { $gte: minLng, $lte: maxLng },
    status: { $ne: 'Closed' }
  });
};

// Static method to find events by time range
hazardEventSchema.statics.findByTimeRange = function(startTime, endTime) {
  return this.find({
    startTime: { $gte: startTime },
    $or: [
      { endTime: { $lte: endTime } },
      { endTime: null }
    ],
    status: { $ne: 'Closed' }
  });
};

// Static method to find ongoing events
hazardEventSchema.statics.findOngoing = function() {
  return this.find({ 
    status: 'Ongoing' 
  });
};

// Instance method to check if event affects a specific location
hazardEventSchema.methods.affectsLocation = function(latitude, longitude, bufferKm = 0) {
  const R = 6371; // Earth's radius in km
  const dLat = (latitude - this.centerLatitude) * Math.PI / 180;
  const dLng = (longitude - this.centerLongitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.centerLatitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= (this.affectedRadius + bufferKm);
};

// Instance method to get total economic impact
hazardEventSchema.methods.getTotalEconomicImpact = function(currency = 'USD') {
  return this.impacts
    .filter(impact => impact.currency === currency)
    .reduce((total, impact) => total + impact.estimatedLoss, 0);
};

// Instance method to get total casualties
hazardEventSchema.methods.getTotalCasualties = function() {
  return this.casualties.fatalities + this.casualties.injuries + this.casualties.missing;
};

// Instance method to calculate event duration in hours
hazardEventSchema.methods.getDurationInHours = function() {
  if (!this.endTime) {
    return null; // Event is ongoing
  }
  
  const durationMs = this.endTime.getTime() - this.startTime.getTime();
  return durationMs / (1000 * 60 * 60); // Convert to hours
};

// Instance method to get event progression stage
hazardEventSchema.methods.getCurrentStage = function() {
  if (this.progression.length === 0) {
    return 'Unknown';
  }
  
  const latestProgression = this.progression
    .sort((a, b) => b.timestamp - a.timestamp)[0];
  
  return latestProgression.stage;
};

// Instance method to calculate event severity score
hazardEventSchema.methods.calculateSeverityScore = function() {
  const severityWeights = {
    'Minor': 1,
    'Moderate': 2,
    'Major': 3,
    'Severe': 4,
    'Catastrophic': 5,
    'Extreme': 6
  };
  
  const severityScore = severityWeights[this.severity] || 0;
  const intensityScore = this.intensity || 0;
  const casualtyScore = Math.min(this.getTotalCasualties() / 100, 10); // Scale to 0-10
  const impactScore = Math.min(this.getTotalEconomicImpact() / 1000000, 10); // Scale to millions
  
  return (severityScore + intensityScore + casualtyScore + impactScore) / 4;
};

module.exports = mongoose.model('HazardEvent', hazardEventSchema);




