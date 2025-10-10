const fc = require('fast-check');

/**
 * Generates valid simulation configuration objects
 */
const simulationConfigArbitrary = () => fc.record({
  modelingConfig: fc.record({
    modelProvider: fc.constant('Test'),
    eventCount: fc.integer({ min: 1, max: 1000 }),
    timeHorizon: fc.integer({ min: 1, max: 10 })
  }),
  exposureConfig: fc.record({
    searchRadius: fc.float({ min: 10, max: 100 }),
    minValue: fc.constant(1000),
    maxValue: fc.constant(1000000)
  }),
  hazardConfig: fc.record({
    types: fc.constant(['earthquake', 'flood', 'windstorm']),
    intensityRange: fc.record({
      min: fc.constant(1),
      max: fc.constant(10)
    })
  }),
  vulnerabilityConfig: fc.record({
    damageFactors: fc.constant({
      earthquake: { min: 0.1, max: 0.9 },
      flood: { min: 0.2, max: 0.8 },
      windstorm: { min: 0.15, max: 0.75 }
    })
  })
});

/**
 * Generates valid hazard objects
 */
const hazardArbitrary = () => fc.record({
  type: fc.constantFrom('earthquake', 'flood', 'windstorm'),
  intensity: fc.float({ min: 1, max: 10 })
});

/**
 * Generates valid exposure objects
 */
const exposureArbitrary = () => fc.record({
  latitude: fc.float({ min: -90, max: 90 }),
  longitude: fc.float({ min: -180, max: 180 }),
  value: fc.float({ min: 1000, max: 1000000 })
});

module.exports = {
  hazardArbitrary,
  exposureArbitrary,
  simulationConfigArbitrary
};