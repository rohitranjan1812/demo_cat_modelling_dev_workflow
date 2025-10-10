const mongoose = require('mongoose');

/**
 * Create a test hazard with required fields
 * @param {Object} overrides - Optional fields to override defaults
 * @returns {Promise<Document>} Created hazard document
 */
exports.createTestHazard = async (overrides = {}) => {
  const Hazard = mongoose.model('Hazard');
  const now = new Date();
  
  const defaults = {
    hazardId: `HAZ-${Date.now()}`,
    hazardName: 'Test Hazard',
    hazardType: 'Earthquake',
    hazardCategory: 'Natural',
    intensities: [{ 
      scale: 'Richter', 
      value: 6.0, 
      unit: 'Magnitude', 
      description: 'Test intensity' 
    }],
    footprint: {
      centerLatitude: 20.5937,
      centerLongitude: 78.9629,
      radius: 300,
      unit: 'km',
      affectedArea: 50000,
      areaUnit: 'km2'
    },
    temporal: {
      startTime: now,
      endTime: new Date(now.getTime() + 3600 * 1000),
      duration: 1,
      durationUnit: 'hours'
    },
    severity: 'Moderate',
    probability: 0.5,
    economicImpact: [{ 
      estimatedLoss: 1000000, 
      currency: 'USD', 
      confidenceLevel: 80,
      lossType: 'Total' 
    }],
    affectedRegions: ['Asia Pacific'],
    affectedCountries: ['India'],
    status: 'Active',
    createdBy: 'test',
    lastModifiedBy: 'test'
  };
  
  return Hazard.create({ ...defaults, ...overrides });
};

/**
 * Create a test simulation configuration
 * @param {Object} overrides - Optional fields to override defaults
 * @returns {Object} Simulation configuration object
 */
exports.createTestSimulationConfig = (overrides = {}) => {
  const defaults = {
    simulationName: 'Test Simulation',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 1,
    timeHorizon: 1,
    timeHorizonUnit: 'years',
    hazardTypes: ['Earthquake'],
    geographicScope: {
      boundingBox: {
        minLatitude: 8,
        maxLatitude: 35,
        minLongitude: 68,
        maxLongitude: 97
      }
    },
    modelingConfig: {
      numberOfSimulations: 1
    }
  };
  
  return { ...defaults, ...overrides };
};

/**
 * Custom test assertions for simulation results
 */
exports.assertions = {
  assertValidSimulationRun: (run) => {
    expect(run).toBeTruthy();
    expect(run.status).toBe('Completed');
    expect(run.results).toBeTruthy();
    expect(typeof run.results.totalEvents).toBe('number');
    expect(run.results.totalEvents).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(run.results.affectedRegions)).toBe(true);
    // No NaN values
    expect(Object.values(run.results).every(v => 
      !Number.isNaN(parseFloat(v)) || !Number.isFinite(v)
    )).toBe(true);
  }
};