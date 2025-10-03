const mongoose = require('../config/mongoose-wrapper');

const coordinatesSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  
  elevation: {
    type: Number,
    min: -1000,
    max: 10000,
    default: 0
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  state: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  postalCode: {
    type: String,
    trim: true,
    maxlength: 20
  },
  
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  region: {
    type: String,
    required: true,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa']
  }
}, { _id: false });

const riskFactorSchema = new mongoose.Schema({
  peril: {
    type: String,
    required: true,
    enum: ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic']
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
  
  expectedLoss: {
    type: Number,
    required: true,
    min: 0
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  // Basic Location Information
  locationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^LOC-\d{8}$/.test(v);
      },
      message: 'Location ID must be in format LOC-XXXXXXXX'
    }
  },
  
  locationName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // Geographic Information
  coordinates: {
    type: coordinatesSchema,
    required: true,
    index: '2dsphere'
  },
  
  address: {
    type: addressSchema,
    required: true
  },
  
  // Risk Zones
  riskZones: [{
    zoneType: {
      type: String,
      enum: ['Flood', 'Earthquake', 'Hurricane', 'Wildfire', 'Tornado', 'Wind', 'Storm Surge']
    },
    
    zoneCode: {
      type: String,
      required: true
    },
    
    zoneDescription: {
      type: String,
      maxlength: 500
    },
    
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Very High', 'Extreme'],
      required: true
    }
  }],
  
  // Risk Factors
  riskFactors: [riskFactorSchema],
  
  // Hazard Exposure
  hazardExposure: [{
    hazardId: {
      type: String,
      ref: 'Hazard',
      required: true
    },
    
    exposureLevel: {
      type: String,
      enum: ['None', 'Low', 'Medium', 'High', 'Very High', 'Extreme'],
      required: true
    },
    
    riskScore: {
      type: Number,
      min: 0,
      max: 10
    },
    
    lastAssessed: {
      type: Date,
      default: Date.now
    },
    
    assessmentMethod: {
      type: String,
      enum: ['Model', 'Expert', 'Historical', 'Hybrid']
    }
  }],
  
  // Hazard Zone Membership
  hazardZones: [{
    zoneId: {
      type: String,
      ref: 'HazardZone',
      required: true
    },
    
    zoneType: {
      type: String,
      required: true
    },
    
    riskLevel: {
      type: String,
      enum: ['Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme'],
      required: true
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
  
  // Property Characteristics
  propertyCharacteristics: {
    occupancyType: {
      type: String,
      enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed'],
      required: true
    },
    
    constructionType: {
      type: String,
      enum: ['Frame', 'Masonry', 'Concrete', 'Steel', 'Mixed'],
      required: true
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
    },
    
    replacementCost: {
      type: Number,
      min: 0
    },
    
    marketValue: {
      type: Number,
      min: 0
    }
  },
  
  // Exposure Information
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
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  
  // Associated Policies
  associatedPolicies: [{
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
    
    effectiveDate: {
      type: Date,
      required: true
    },
    
    expiryDate: {
      type: Date,
      required: true
    }
  }],
  
  // Catastrophe Modeling Data
  catModelData: {
    modelProvider: {
      type: String,
      enum: ['RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'Custom']
    },
    
    modelVersion: {
      type: String,
      maxlength: 50
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
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Review', 'Excluded'],
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
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
locationSchema.index({ 'address.region': 1, status: 1 });
locationSchema.index({ 'address.country': 1, 'address.state': 1 });
locationSchema.index({ 'propertyCharacteristics.occupancyType': 1 });
locationSchema.index({ 'propertyCharacteristics.constructionType': 1 });
locationSchema.index({ 'riskZones.zoneType': 1, 'riskZones.riskLevel': 1 });
locationSchema.index({ 'riskFactors.peril': 1 });
locationSchema.index({ totalExposure: -1 });

// Pre-save middleware for validation
locationSchema.pre('save', function(next) {
  // Validate total exposure matches sum of associated policy exposures
  const totalPolicyExposure = this.associatedPolicies.reduce((sum, policy) => 
    sum + policy.exposureAmount, 0
  );
  
  if (Math.abs(totalPolicyExposure - this.totalExposure) > 0.01) {
    return next(new Error('Total exposure must match sum of associated policy exposures'));
  }
  
  // Validate risk factors have valid peril names
  const validPerils = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic'];
  const invalidPerils = this.riskFactors.filter(rf => !validPerils.includes(rf.peril));
  if (invalidPerils.length > 0) {
    return next(new Error(`Invalid peril names: ${invalidPerils.map(rf => rf.peril).join(', ')}`));
  }
  
  next();
});

// Static method to find locations by region
locationSchema.statics.findByRegion = function(region) {
  return this.find({ 
    'address.region': region, 
    status: 'Active' 
  });
};

// Static method to find locations by peril risk level
locationSchema.statics.findByPerilRiskLevel = function(peril, minRiskLevel = 0) {
  return this.find({ 
    'riskFactors.peril': peril,
    'riskFactors.riskScore': { $gte: minRiskLevel },
    status: 'Active' 
  });
};

// Static method to find locations within a geographic radius
locationSchema.statics.findWithinRadius = function(centerLat, centerLng, radiusKm) {
  return this.find({
    coordinates: {
      $geoWithin: {
        $centerSphere: [
          [centerLng, centerLat],
          radiusKm / 6378.1 // Convert km to radians
        ]
      }
    },
    status: 'Active'
  });
};

// Instance method to get risk factor for a specific peril
locationSchema.methods.getRiskFactor = function(peril) {
  return this.riskFactors.find(rf => rf.peril === peril);
};

// Instance method to get highest risk zone
locationSchema.methods.getHighestRiskZone = function() {
  const riskLevels = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4, 'Extreme': 5 };
  return this.riskZones.reduce((highest, zone) => {
    return riskLevels[zone.riskLevel] > riskLevels[highest.riskLevel] ? zone : highest;
  }, this.riskZones[0]);
};

// Instance method to calculate distance to another location
locationSchema.methods.distanceTo = function(otherLocation) {
  const R = 6371; // Earth's radius in km
  const dLat = (otherLocation.coordinates.latitude - this.coordinates.latitude) * Math.PI / 180;
  const dLng = (otherLocation.coordinates.longitude - this.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.coordinates.latitude * Math.PI / 180) * Math.cos(otherLocation.coordinates.latitude * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Instance method to get hazard exposure for a specific hazard
locationSchema.methods.getHazardExposure = function(hazardId) {
  return this.hazardExposure.find(exposure => exposure.hazardId === hazardId);
};

// Instance method to get highest hazard exposure level
locationSchema.methods.getHighestHazardExposure = function() {
  const exposureLevels = ['None', 'Low', 'Medium', 'High', 'Very High', 'Extreme'];
  return this.hazardExposure.reduce((highest, exposure) => {
    const currentIndex = exposureLevels.indexOf(exposure.exposureLevel);
    const highestIndex = exposureLevels.indexOf(highest.exposureLevel);
    return currentIndex > highestIndex ? exposure : highest;
  }, this.hazardExposure[0] || { exposureLevel: 'None' });
};

// Instance method to get hazard zones for a specific zone type
locationSchema.methods.getHazardZonesByType = function(zoneType) {
  return this.hazardZones.filter(zone => zone.zoneType === zoneType);
};

// Instance method to calculate overall hazard risk score
locationSchema.methods.calculateHazardRiskScore = function() {
  if (this.hazardExposure.length === 0) return 0;
  
  const exposureWeights = {
    'None': 0,
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Very High': 4,
    'Extreme': 5
  };
  
  const totalScore = this.hazardExposure.reduce((sum, exposure) => {
    return sum + (exposureWeights[exposure.exposureLevel] || 0) + (exposure.riskScore || 0);
  }, 0);
  
  return totalScore / this.hazardExposure.length;
};

// Instance method to check if location is in a hazard zone
locationSchema.methods.isInHazardZone = function(zoneId) {
  return this.hazardZones.some(zone => zone.zoneId === zoneId);
};

// Instance method to get active hazard zones
locationSchema.methods.getActiveHazardZones = function() {
  const now = new Date();
  return this.hazardZones.filter(zone => 
    zone.effectiveDate <= now && 
    (!zone.expiryDate || zone.expiryDate >= now)
  );
};

module.exports = mongoose.model('Location', locationSchema);
