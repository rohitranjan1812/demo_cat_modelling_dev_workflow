const Joi = require('joi');

// Hazard validation schema
const hazardSchema = Joi.object({
  hazardId: Joi.string().pattern(/^HAZ-\d{8}$/).required(),
  hazardName: Joi.string().max(200).required(),
  hazardType: Joi.string().valid(
    'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
    'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
    'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
    'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
    'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
    'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
    'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
  ).required(),
  hazardCategory: Joi.string().valid('Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading').required(),
  
  intensities: Joi.array().items(Joi.object({
    scale: Joi.string().valid('Richter', 'Mercalli', 'Saffir-Simpson', 'Fujita', 'Enhanced Fujita', 'Beaufort', 'Custom').required(),
    value: Joi.number().min(0).required(),
    unit: Joi.string().valid('Magnitude', 'Intensity', 'Category', 'Scale', 'm/s', 'km/h', 'mph', 'Custom').required(),
    description: Joi.string().max(500)
  })).optional(),
  
  footprint: Joi.object({
    centerLatitude: Joi.number().min(-90).max(90).required(),
    centerLongitude: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(0).required(),
    unit: Joi.string().valid('km', 'miles', 'nautical_miles').required(),
    affectedArea: Joi.number().min(0).optional(),
    areaUnit: Joi.string().valid('km2', 'miles2', 'acres', 'hectares').optional(),
    polygon: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()))).optional()
  }).required(),
  
  temporal: Joi.object({
    startTime: Joi.date().required(),
    endTime: Joi.date().optional(),
    duration: Joi.number().min(0).optional(),
    durationUnit: Joi.string().valid('seconds', 'minutes', 'hours', 'days', 'weeks', 'months').optional(),
    peakIntensityTime: Joi.date().optional(),
    warningTime: Joi.number().min(0).optional(),
    warningTimeUnit: Joi.string().valid('seconds', 'minutes', 'hours', 'days').optional()
  }).required(),
  
  severity: Joi.string().valid('Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme').required(),
  probability: Joi.number().min(0).max(1).required(),
  returnPeriod: Joi.number().min(0).optional(),
  returnPeriodUnit: Joi.string().valid('years', 'months', 'days').optional(),
  
  economicImpact: Joi.array().items(Joi.object({
    estimatedLoss: Joi.number().min(0).required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').required(),
    confidenceLevel: Joi.number().min(0).max(100).optional(),
    lossType: Joi.string().valid('Property', 'Business Interruption', 'Infrastructure', 'Agricultural', 'Total').required(),
    methodology: Joi.string().max(200).optional()
  })).optional(),
  
  affectedRegions: Joi.array().items(Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa')).optional(),
  affectedCountries: Joi.array().items(Joi.string().max(100)).optional(),
  
  vulnerabilityFactors: Joi.object({
    populationDensity: Joi.string().valid('Low', 'Medium', 'High', 'Very High').optional(),
    infrastructureQuality: Joi.string().valid('Poor', 'Fair', 'Good', 'Excellent').optional(),
    emergencyResponse: Joi.string().valid('Limited', 'Adequate', 'Good', 'Excellent').optional(),
    buildingCodes: Joi.string().valid('None', 'Basic', 'Moderate', 'Strict', 'Advanced').optional(),
    warningSystems: Joi.string().valid('None', 'Basic', 'Moderate', 'Advanced', 'State-of-the-art').optional()
  }).optional(),
  
  climateChangeImpact: Joi.object({
    isClimateRelated: Joi.boolean().optional(),
    climateScenario: Joi.string().valid('RCP2.6', 'RCP4.5', 'RCP6.0', 'RCP8.5', 'Historical', 'Custom').optional(),
    temperatureIncrease: Joi.number().min(0).optional(),
    seaLevelRise: Joi.number().min(0).optional(),
    precipitationChange: Joi.number().optional()
  }).optional(),
  
  modelData: Joi.object({
    modelProvider: Joi.string().valid('RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'JBA', 'Custom', 'Multiple').optional(),
    modelVersion: Joi.string().max(50).optional(),
    modelType: Joi.string().valid('Probabilistic', 'Deterministic', 'Scenario', 'Hybrid').optional(),
    resolution: Joi.string().valid('High', 'Medium', 'Low', 'Variable').optional(),
    lastModelUpdate: Joi.date().optional(),
    modelResults: Joi.object().optional()
  }).optional(),
  
  dataSources: Joi.array().items(Joi.object({
    sourceType: Joi.string().valid('Satellite', 'Ground Station', 'Model Output', 'Historical Data', 'Expert Opinion', 'Other').required(),
    sourceName: Joi.string().max(200).required(),
    reliability: Joi.string().valid('Low', 'Medium', 'High', 'Very High').optional(),
    lastUpdated: Joi.date().optional()
  })).optional(),
  
  status: Joi.string().valid('Active', 'Inactive', 'Under Review', 'Deprecated', 'Draft').optional(),
  isHistorical: Joi.boolean().optional(),
  isSimulated: Joi.boolean().optional(),
  
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().optional()
});

// Hazard Event validation schema
const hazardEventSchema = Joi.object({
  eventId: Joi.string().pattern(/^EVT-\d{8}$/).required(),
  eventName: Joi.string().max(200).required(),
  hazardId: Joi.string().required(),
  eventType: Joi.string().valid(
    'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
    'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
    'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
    'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
    'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
    'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
    'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
  ).required(),
  eventCategory: Joi.string().valid('Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading').required(),
  
  startTime: Joi.date().required(),
  endTime: Joi.date().optional(),
  duration: Joi.number().min(0).optional(),
  durationUnit: Joi.string().valid('seconds', 'minutes', 'hours', 'days', 'weeks', 'months').optional(),
  
  centerLatitude: Joi.number().min(-90).max(90).required(),
  centerLongitude: Joi.number().min(-180).max(180).required(),
  affectedRadius: Joi.number().min(0).required(),
  radiusUnit: Joi.string().valid('km', 'miles', 'nautical_miles').required(),
  affectedArea: Joi.number().min(0).optional(),
  areaUnit: Joi.string().valid('km2', 'miles2', 'acres', 'hectares').optional(),
  
  affectedRegions: Joi.array().items(Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa')).optional(),
  affectedCountries: Joi.array().items(Joi.string().max(100)).optional(),
  affectedCities: Joi.array().items(Joi.string().max(100)).optional(),
  
  severity: Joi.string().valid('Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme').required(),
  intensity: Joi.number().min(0).max(10).optional(),
  magnitude: Joi.number().min(0).optional(),
  magnitudeScale: Joi.string().valid('Richter', 'Mercalli', 'Saffir-Simpson', 'Fujita', 'Enhanced Fujita', 'Beaufort', 'Custom').optional(),
  
  impacts: Joi.array().items(Joi.object({
    impactType: Joi.string().valid('Property Damage', 'Business Interruption', 'Infrastructure Damage', 
                                  'Agricultural Loss', 'Human Casualties', 'Environmental Damage', 'Total').required(),
    estimatedLoss: Joi.number().min(0).required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').required(),
    confidenceLevel: Joi.number().min(0).max(100).optional(),
    methodology: Joi.string().max(200).optional(),
    dataSource: Joi.string().max(200).optional(),
    lastUpdated: Joi.date().optional()
  })).optional(),
  
  progression: Joi.array().items(Joi.object({
    timestamp: Joi.date().required(),
    stage: Joi.string().valid('Formation', 'Development', 'Peak', 'Decay', 'Dissipation', 'Recovery').required(),
    intensity: Joi.number().min(0).max(10).required(),
    description: Joi.string().max(1000).optional(),
    affectedArea: Joi.number().min(0).optional(),
    areaUnit: Joi.string().valid('km2', 'miles2', 'acres', 'hectares').optional()
  })).optional(),
  
  emergencyResponse: Joi.array().items(Joi.object({
    responseType: Joi.string().valid('Evacuation', 'Shelter', 'Search and Rescue', 'Medical', 'Infrastructure Repair', 
                                    'Debris Removal', 'Communication', 'Logistics', 'Recovery Planning').required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().optional(),
    status: Joi.string().valid('Planned', 'Active', 'Completed', 'Suspended', 'Cancelled').optional(),
    resourcesDeployed: Joi.object({
      personnel: Joi.number().min(0).optional(),
      equipment: Joi.string().max(500).optional(),
      vehicles: Joi.number().min(0).optional()
    }).optional(),
    effectiveness: Joi.string().valid('Poor', 'Fair', 'Good', 'Excellent').optional(),
    cost: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').optional()
  })).optional(),
  
  casualties: Joi.object({
    fatalities: Joi.number().min(0).optional(),
    injuries: Joi.number().min(0).optional(),
    missing: Joi.number().min(0).optional(),
    displaced: Joi.number().min(0).optional()
  }).optional(),
  
  infrastructureImpact: Joi.object({
    buildingsDamaged: Joi.number().min(0).optional(),
    buildingsDestroyed: Joi.number().min(0).optional(),
    roadsAffected: Joi.number().min(0).optional(),
    bridgesAffected: Joi.number().min(0).optional(),
    powerOutages: Joi.number().min(0).optional(),
    waterOutages: Joi.number().min(0).optional(),
    telecommunicationsAffected: Joi.number().min(0).optional()
  }).optional(),
  
  environmentalImpact: Joi.object({
    airQuality: Joi.string().valid('Good', 'Moderate', 'Unhealthy', 'Hazardous', 'Unknown').optional(),
    waterContamination: Joi.boolean().optional(),
    soilContamination: Joi.boolean().optional(),
    wildlifeAffected: Joi.number().min(0).optional(),
    ecosystemDamage: Joi.string().valid('None', 'Minimal', 'Moderate', 'Severe', 'Critical').optional()
  }).optional(),
  
  status: Joi.string().valid('Ongoing', 'Completed', 'Recovering', 'Investigation', 'Closed').optional(),
  
  dataQuality: Joi.object({
    overall: Joi.string().valid('Poor', 'Fair', 'Good', 'Excellent').optional(),
    completeness: Joi.number().min(0).max(100).optional(),
    accuracy: Joi.string().valid('Low', 'Medium', 'High', 'Very High').optional(),
    timeliness: Joi.string().valid('Delayed', 'Moderate', 'Timely', 'Real-time').optional()
  }).optional(),
  
  dataSources: Joi.array().items(Joi.object({
    sourceType: Joi.string().valid('Government', 'NGO', 'Media', 'Satellite', 'Ground Station', 'Model Output', 'Other').required(),
    sourceName: Joi.string().max(200).required(),
    reliability: Joi.string().valid('Low', 'Medium', 'High', 'Very High').optional(),
    lastUpdated: Joi.date().optional()
  })).optional(),
  
  affectedLocations: Joi.array().items(Joi.object({
    locationId: Joi.string().required(),
    impactLevel: Joi.string().valid('None', 'Minimal', 'Moderate', 'Severe', 'Total').required(),
    estimatedLoss: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').optional()
  })).optional(),
  
  affectedPolicies: Joi.array().items(Joi.object({
    policyId: Joi.string().required(),
    estimatedClaim: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').optional(),
    claimStatus: Joi.string().valid('Pending', 'Under Review', 'Approved', 'Denied', 'Settled').optional()
  })).optional(),
  
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().optional()
});

// Hazard Zone validation schema
const hazardZoneSchema = Joi.object({
  zoneId: Joi.string().pattern(/^ZON-\d{8}$/).required(),
  zoneName: Joi.string().max(200).required(),
  zoneCode: Joi.string().max(50).required(),
  zoneType: Joi.string().valid(
    'Flood', 'Earthquake', 'Hurricane', 'Wildfire', 'Tornado', 'Wind', 'Storm Surge',
    'Tsunami', 'Volcanic', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave',
    'Cold Wave', 'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism',
    'Cyber', 'Nuclear', 'Chemical', 'Industrial', 'Transportation', 'Infrastructure',
    'Pandemic', 'Biological', 'Radiological', 'Space Weather', 'Asteroid',
    'Climate Change', 'Sea Level Rise', 'Permafrost', 'Glacial', 'Multi-Hazard'
  ).required(),
  zoneCategory: Joi.string().valid('Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading').required(),
  
  boundary: Joi.object({
    type: Joi.string().valid('Circle', 'Polygon', 'MultiPolygon', 'Rectangle', 'Custom').required(),
    coordinates: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()))).required(),
    centerLatitude: Joi.number().min(-90).max(90).optional(),
    centerLongitude: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(0).optional(),
    radiusUnit: Joi.string().valid('km', 'miles', 'nautical_miles').optional(),
    area: Joi.number().min(0).optional(),
    areaUnit: Joi.string().valid('km2', 'miles2', 'acres', 'hectares').optional()
  }).required(),
  
  country: Joi.string().max(100).required(),
  state: Joi.string().max(100).optional(),
  region: Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa').required(),
  administrativeLevel: Joi.string().valid('National', 'State/Province', 'County/District', 'Municipal', 'Local', 'Custom').required(),
  
  riskLevels: Joi.array().items(Joi.object({
    hazardType: Joi.string().valid(
      'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
      'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
      'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
      'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
      'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
      'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
      'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
      'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
    ).required(),
    riskLevel: Joi.string().valid('Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme').required(),
    riskScore: Joi.number().min(0).max(10).required(),
    probability: Joi.number().min(0).max(1).required(),
    returnPeriod: Joi.number().min(0).optional(),
    returnPeriodUnit: Joi.string().valid('years', 'months', 'days').optional(),
    expectedLoss: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').optional(),
    lastUpdated: Joi.date().optional()
  })).optional(),
  
  vulnerability: Joi.object({
    populationDensity: Joi.string().valid('Very Low', 'Low', 'Medium', 'High', 'Very High').required(),
    populationCount: Joi.number().min(0).optional(),
    infrastructureQuality: Joi.string().valid('Poor', 'Fair', 'Good', 'Excellent').required(),
    buildingCodes: Joi.string().valid('None', 'Basic', 'Moderate', 'Strict', 'Advanced').required(),
    emergencyResponse: Joi.string().valid('Limited', 'Adequate', 'Good', 'Excellent').required(),
    warningSystems: Joi.string().valid('None', 'Basic', 'Moderate', 'Advanced', 'State-of-the-art').required(),
    economicDevelopment: Joi.string().valid('Underdeveloped', 'Developing', 'Developed', 'Highly Developed').required(),
    socialVulnerability: Joi.string().valid('Low', 'Medium', 'High', 'Very High').required(),
    environmentalSensitivity: Joi.string().valid('Low', 'Medium', 'High', 'Very High').required()
  }).required(),
  
  climateChange: Joi.object({
    temperatureChange: Joi.number().optional(),
    temperatureUnit: Joi.string().valid('Celsius', 'Fahrenheit').optional(),
    precipitationChange: Joi.number().optional(),
    precipitationUnit: Joi.string().valid('mm', 'inches').optional(),
    seaLevelRise: Joi.number().min(0).optional(),
    seaLevelUnit: Joi.string().valid('mm', 'cm', 'inches', 'feet').optional(),
    climateScenario: Joi.string().valid('RCP2.6', 'RCP4.5', 'RCP6.0', 'RCP8.5', 'Historical', 'Custom').optional(),
    timeHorizon: Joi.string().valid('2020s', '2030s', '2040s', '2050s', '2060s', '2070s', '2080s', '2090s', '2100s').optional(),
    confidenceLevel: Joi.string().valid('Low', 'Medium', 'High', 'Very High').optional()
  }).optional(),
  
  zoneDescription: Joi.string().max(2000).optional(),
  zonePurpose: Joi.string().valid('Insurance', 'Planning', 'Emergency Response', 'Regulatory', 'Research', 'Public Awareness').required(),
  zoneAuthority: Joi.string().max(200).required(),
  
  dataSources: Joi.array().items(Joi.object({
    sourceType: Joi.string().valid('Government', 'NGO', 'Academic', 'Private', 'Satellite', 'Ground Station', 'Model Output', 'Other').required(),
    sourceName: Joi.string().max(200).required(),
    reliability: Joi.string().valid('Low', 'Medium', 'High', 'Very High').optional(),
    lastUpdated: Joi.date().optional()
  })).optional(),
  
  modelData: Joi.object({
    modelProvider: Joi.string().valid('RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'JBA', 'Custom', 'Multiple').optional(),
    modelVersion: Joi.string().max(50).optional(),
    modelType: Joi.string().valid('Probabilistic', 'Deterministic', 'Scenario', 'Hybrid').optional(),
    resolution: Joi.string().valid('High', 'Medium', 'Low', 'Variable').optional(),
    lastModelUpdate: Joi.date().optional(),
    modelResults: Joi.object().optional()
  }).optional(),
  
  status: Joi.string().valid('Active', 'Inactive', 'Under Review', 'Deprecated', 'Draft').optional(),
  effectiveDate: Joi.date().required(),
  expiryDate: Joi.date().optional(),
  
  affectedLocations: Joi.array().items(Joi.object({
    locationId: Joi.string().required(),
    riskLevel: Joi.string().valid('Very Low', 'Low', 'Medium', 'High', 'Very High', 'Extreme').required(),
    riskScore: Joi.number().min(0).max(10).optional()
  })).optional(),
  
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().optional()
});

// Hazard Scenario validation schema
const hazardScenarioSchema = Joi.object({
  scenarioId: Joi.string().pattern(/^SCN-\d{8}$/).required(),
  scenarioName: Joi.string().max(200).required(),
  scenarioDescription: Joi.string().max(2000).optional(),
  
  scenarioType: Joi.string().valid('Historical', 'Probabilistic', 'Deterministic', 'Stress Test', 'Sensitivity Analysis',
                                  'What-if', 'Monte Carlo', 'Worst Case', 'Best Case', 'Custom').required(),
  scenarioCategory: Joi.string().valid('Single Hazard', 'Multi-Hazard', 'Compound', 'Cascading', 'Sequential', 'Simultaneous').required(),
  
  primaryHazard: Joi.string().valid(
    'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
    'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
    'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
    'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
    'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
    'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
    'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
  ).required(),
  
  secondaryHazards: Joi.array().items(Joi.string().valid(
    'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Flash Flood',
    'Wildfire', 'Forest Fire', 'Bushfire', 'Hail', 'Wind', 'Storm Surge', 'Tsunami',
    'Volcanic Eruption', 'Landslide', 'Avalanche', 'Drought', 'Heat Wave', 'Cold Wave',
    'Ice Storm', 'Blizzard', 'Sandstorm', 'Dust Storm', 'Terrorism', 'Cyber Attack',
    'Nuclear Accident', 'Chemical Spill', 'Oil Spill', 'Industrial Accident',
    'Transportation Accident', 'Infrastructure Failure', 'Pandemic', 'Biological Attack',
    'Radiological Attack', 'Space Weather', 'Solar Flare', 'Asteroid Impact',
    'Climate Change Impact', 'Sea Level Rise', 'Permafrost Thaw', 'Glacial Lake Outburst'
  )).optional(),
  
  geographicScope: Joi.string().valid('Local', 'Regional', 'National', 'Continental', 'Global').required(),
  affectedRegions: Joi.array().items(Joi.string().valid('North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa')).optional(),
  affectedCountries: Joi.array().items(Joi.string().max(100)).optional(),
  
  parameters: Joi.array().items(Joi.object({
    parameterName: Joi.string().max(100).required(),
    parameterType: Joi.string().valid('Numeric', 'Categorical', 'Boolean', 'Date', 'Text', 'Array', 'Object').required(),
    value: Joi.any().required(),
    unit: Joi.string().max(50).optional(),
    description: Joi.string().max(500).optional(),
    isVariable: Joi.boolean().optional(),
    minValue: Joi.number().optional(),
    maxValue: Joi.number().optional(),
    stepSize: Joi.number().optional(),
    possibleValues: Joi.array().items(Joi.any()).optional()
  })).optional(),
  
  results: Joi.array().items(Joi.object({
    resultType: Joi.string().valid('Economic Loss', 'Casualties', 'Infrastructure Damage', 'Environmental Impact',
                                  'Business Interruption', 'Recovery Time', 'Insurance Claims', 'Risk Score',
                                  'Probability', 'Return Period', 'Custom').required(),
    value: Joi.number().required(),
    unit: Joi.string().max(50).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').optional(),
    confidenceLevel: Joi.number().min(0).max(100).optional(),
    methodology: Joi.string().max(200).optional(),
    dataSource: Joi.string().max(200).optional(),
    timestamp: Joi.date().optional()
  })).optional(),
  
  validations: Joi.array().items(Joi.object({
    validationType: Joi.string().valid('Parameter Range', 'Logical Consistency', 'Data Quality', 'Model Validation', 'Expert Review').required(),
    status: Joi.string().valid('Passed', 'Failed', 'Warning', 'Pending').required(),
    message: Joi.string().max(1000).optional(),
    validatedBy: Joi.string().max(100).optional(),
    validatedAt: Joi.date().optional()
  })).optional(),
  
  modelData: Joi.object({
    modelProvider: Joi.string().valid('RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'JBA', 'Custom', 'Multiple').optional(),
    modelVersion: Joi.string().max(50).optional(),
    modelType: Joi.string().valid('Probabilistic', 'Deterministic', 'Scenario', 'Hybrid').optional(),
    resolution: Joi.string().valid('High', 'Medium', 'Low', 'Variable').optional(),
    simulationRuns: Joi.number().min(1).optional(),
    lastModelUpdate: Joi.date().optional(),
    modelResults: Joi.object().optional()
  }).optional(),
  
  scenarioStartTime: Joi.date().required(),
  scenarioEndTime: Joi.date().optional(),
  scenarioDuration: Joi.number().min(0).optional(),
  durationUnit: Joi.string().valid('seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years').optional(),
  
  status: Joi.string().valid('Draft', 'Running', 'Completed', 'Failed', 'Cancelled', 'Paused').optional(),
  progress: Joi.number().min(0).max(100).optional(),
  
  executionInfo: Joi.object({
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional(),
    duration: Joi.number().min(0).optional(),
    durationUnit: Joi.string().valid('seconds', 'minutes', 'hours', 'days').optional(),
    resourcesUsed: Joi.object({
      cpuTime: Joi.number().min(0).optional(),
      memoryUsed: Joi.number().min(0).optional(),
      memoryUnit: Joi.string().valid('MB', 'GB', 'TB').optional(),
      storageUsed: Joi.number().min(0).optional(),
      storageUnit: Joi.string().valid('MB', 'GB', 'TB').optional()
    }).optional()
  }).optional(),
  
  configuration: Joi.object({
    randomSeed: Joi.number().optional(),
    convergenceCriteria: Joi.string().max(200).optional(),
    maxIterations: Joi.number().min(1).optional(),
    tolerance: Joi.number().min(0).optional(),
    parallelProcessing: Joi.boolean().optional(),
    numberOfCores: Joi.number().min(1).optional()
  }).optional(),
  
  dataSources: Joi.array().items(Joi.object({
    sourceType: Joi.string().valid('Historical Data', 'Model Output', 'Expert Opinion', 'Satellite Data',
                                  'Ground Station', 'Government Data', 'NGO Data', 'Media Reports', 'Other').required(),
    sourceName: Joi.string().max(200).required(),
    reliability: Joi.string().valid('Low', 'Medium', 'High', 'Very High').optional(),
    lastUpdated: Joi.date().optional()
  })).optional(),
  
  affectedLocations: Joi.array().items(Joi.object({
    locationId: Joi.string().required(),
    impactLevel: Joi.string().valid('None', 'Minimal', 'Moderate', 'Severe', 'Total').required(),
    estimatedLoss: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').optional()
  })).optional(),
  
  affectedPolicies: Joi.array().items(Joi.object({
    policyId: Joi.string().required(),
    estimatedClaim: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL').optional()
  })).optional(),
  
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional(),
  isPublic: Joi.boolean().optional(),
  isTemplate: Joi.boolean().optional(),
  
  createdBy: Joi.string().required(),
  lastModifiedBy: Joi.string().required(),
  metadata: Joi.object().optional()
});

// Validation middleware functions
const validateHazard = (req, res, next) => {
  const { error } = hazardSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

const validateHazardEvent = (req, res, next) => {
  const { error } = hazardEventSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

const validateHazardZone = (req, res, next) => {
  const { error } = hazardZoneSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

const validateHazardScenario = (req, res, next) => {
  const { error } = hazardScenarioSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateHazard,
  validateHazardEvent,
  validateHazardZone,
  validateHazardScenario
};













