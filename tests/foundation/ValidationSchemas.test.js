const {
  portfolioSchema,
  exposureSchema,
  hazardSchema,
  vulnerabilitySchema,
  simulationSchema,
  resultSchema,
  policySchema,
  claimSchema,
  riskParametersSchema,
  catastropheEventSchema
} = require('../../src/validation/schemas');

/**
 * Test suite for ValidationSchemas - Foundation Layer
 * Tests all validation schemas used throughout the application
 * Priority: P0 (Foundation)
 */
describe('ValidationSchemas - Foundation Tests', () => {
  
  describe('Portfolio Schema Validation', () => {
    const validPortfolio = {
      name: 'Test Portfolio',
      description: 'Test portfolio description',
      currency: 'USD',
      totalValue: 1000000,
      exposures: ['exp1', 'exp2'],
      createdBy: 'user123',
      metadata: { region: 'US' }
    };

    test('should validate correct portfolio data', () => {
      const result = portfolioSchema.validate(validPortfolio);
      expect(result.error).toBeUndefined();
      expect(result.value).toMatchObject(validPortfolio);
    });

    test('should require mandatory fields', () => {
      const invalidPortfolio = { ...validPortfolio };
      delete invalidPortfolio.name;
      
      const result = portfolioSchema.validate(invalidPortfolio);
      expect(result.error).toBeDefined();
      expect(result.error.details[0].path).toContain('name');
    });

    test('should validate currency format', () => {
      const invalidPortfolio = { ...validPortfolio, currency: 'INVALID' };
      
      const result = portfolioSchema.validate(invalidPortfolio);
      expect(result.error).toBeDefined();
      expect(result.error.details[0].path).toContain('currency');
    });

    test('should validate totalValue constraints', () => {
      const testCases = [
        { value: -1000, shouldFail: true }, // Negative value
        { value: 0, shouldFail: false }, // Zero is valid
        { value: 1000000, shouldFail: false }, // Positive value
        { value: 'invalid', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ value, shouldFail }) => {
        const portfolio = { ...validPortfolio, totalValue: value };
        const result = portfolioSchema.validate(portfolio);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate exposures array', () => {
      const testCases = [
        { exposures: [], shouldFail: false }, // Empty array
        { exposures: ['exp1'], shouldFail: false }, // Single exposure
        { exposures: ['exp1', 'exp2', 'exp3'], shouldFail: false }, // Multiple exposures
        { exposures: 'not-an-array', shouldFail: true }, // Invalid type
        { exposures: [123, 'exp2'], shouldFail: true } // Mixed types
      ];

      testCases.forEach(({ exposures, shouldFail }) => {
        const portfolio = { ...validPortfolio, exposures };
        const result = portfolioSchema.validate(portfolio);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should handle optional metadata', () => {
      const portfolioWithoutMetadata = { ...validPortfolio };
      delete portfolioWithoutMetadata.metadata;
      
      const result = portfolioSchema.validate(portfolioWithoutMetadata);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Exposure Schema Validation', () => {
    const validExposure = {
      assetId: 'asset123',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St, New York, NY',
        country: 'US',
        region: 'Northeast'
      },
      value: 500000,
      currency: 'USD',
      assetType: 'residential',
      constructionType: 'wood-frame',
      yearBuilt: 1995,
      occupancy: 'single-family',
      stories: 2,
      basement: false,
      coverage: {
        building: 400000,
        contents: 100000,
        businessInterruption: 0
      }
    };

    test('should validate correct exposure data', () => {
      const result = exposureSchema.validate(validExposure);
      expect(result.error).toBeUndefined();
      expect(result.value).toMatchObject(validExposure);
    });

    test('should validate location coordinates', () => {
      const testCases = [
        { lat: 90, lng: 180, shouldFail: false }, // Valid bounds
        { lat: -90, lng: -180, shouldFail: false }, // Valid bounds
        { lat: 91, lng: 0, shouldFail: true }, // Invalid latitude
        { lat: 0, lng: 181, shouldFail: true }, // Invalid longitude
        { lat: 'invalid', lng: 0, shouldFail: true }, // Non-numeric
      ];

      testCases.forEach(({ lat, lng, shouldFail }) => {
        const exposure = {
          ...validExposure,
          location: {
            ...validExposure.location,
            latitude: lat,
            longitude: lng
          }
        };
        
        const result = exposureSchema.validate(exposure);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate asset type enumeration', () => {
      const validTypes = ['residential', 'commercial', 'industrial', 'agricultural'];
      const invalidTypes = ['unknown', 'mixed', ''];

      validTypes.forEach(assetType => {
        const exposure = { ...validExposure, assetType };
        const result = exposureSchema.validate(exposure);
        expect(result.error).toBeUndefined();
      });

      invalidTypes.forEach(assetType => {
        const exposure = { ...validExposure, assetType };
        const result = exposureSchema.validate(exposure);
        expect(result.error).toBeDefined();
      });
    });

    test('should validate year built constraints', () => {
      const currentYear = new Date().getFullYear();
      
      const testCases = [
        { year: 1800, shouldFail: false }, // Old but valid
        { year: currentYear, shouldFail: false }, // Current year
        { year: currentYear + 1, shouldFail: true }, // Future year
        { year: 1700, shouldFail: true }, // Too old
        { year: 'recent', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ year, shouldFail }) => {
        const exposure = { ...validExposure, yearBuilt: year };
        const result = exposureSchema.validate(exposure);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate coverage amounts', () => {
      const testCases = [
        { building: 400000, contents: 100000, bi: 0, shouldFail: false },
        { building: -1000, contents: 100000, bi: 0, shouldFail: true }, // Negative building
        { building: 400000, contents: -100, bi: 0, shouldFail: true }, // Negative contents
        { building: 400000, contents: 100000, bi: -500, shouldFail: true } // Negative BI
      ];

      testCases.forEach(({ building, contents, bi, shouldFail }) => {
        const exposure = {
          ...validExposure,
          coverage: {
            building,
            contents,
            businessInterruption: bi
          }
        };
        
        const result = exposureSchema.validate(exposure);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });
  });

  describe('Hazard Schema Validation', () => {
    const validHazard = {
      eventType: 'hurricane',
      severity: 'major',
      location: {
        latitude: 25.7617,
        longitude: -80.1918,
        radius: 100
      },
      parameters: {
        windSpeed: 150,
        stormSurge: 12,
        category: 4,
        duration: 8
      },
      probability: 0.02,
      returnPeriod: 50,
      seasonality: {
        startMonth: 6,
        endMonth: 11,
        peakMonth: 9
      }
    };

    test('should validate correct hazard data', () => {
      const result = hazardSchema.validate(validHazard);
      expect(result.error).toBeUndefined();
      expect(result.value).toMatchObject(validHazard);
    });

    test('should validate event type enumeration', () => {
      const validTypes = ['hurricane', 'earthquake', 'flood', 'wildfire', 'tornado', 'hail'];
      const invalidTypes = ['tsunami', 'volcano', 'unknown'];

      validTypes.forEach(eventType => {
        const hazard = { ...validHazard, eventType };
        const result = hazardSchema.validate(hazard);
        expect(result.error).toBeUndefined();
      });

      invalidTypes.forEach(eventType => {
        const hazard = { ...validHazard, eventType };
        const result = hazardSchema.validate(hazard);
        expect(result.error).toBeDefined();
      });
    });

    test('should validate severity levels', () => {
      const validSeverities = ['minor', 'moderate', 'major', 'extreme'];
      const invalidSeverities = ['low', 'high', 'catastrophic'];

      validSeverities.forEach(severity => {
        const hazard = { ...validHazard, severity };
        const result = hazardSchema.validate(hazard);
        expect(result.error).toBeUndefined();
      });

      invalidSeverities.forEach(severity => {
        const hazard = { ...validHazard, severity };
        const result = hazardSchema.validate(hazard);
        expect(result.error).toBeDefined();
      });
    });

    test('should validate probability range', () => {
      const testCases = [
        { prob: 0, shouldFail: false }, // Minimum
        { prob: 1, shouldFail: false }, // Maximum
        { prob: 0.5, shouldFail: false }, // Middle
        { prob: -0.1, shouldFail: true }, // Below range
        { prob: 1.1, shouldFail: true }, // Above range
        { prob: 'high', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ prob, shouldFail }) => {
        const hazard = { ...validHazard, probability: prob };
        const result = hazardSchema.validate(hazard);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate return period constraints', () => {
      const testCases = [
        { period: 1, shouldFail: false }, // Minimum
        { period: 1000, shouldFail: false }, // High value
        { period: 0, shouldFail: true }, // Too low
        { period: -10, shouldFail: true }, // Negative
        { period: 'frequent', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ period, shouldFail }) => {
        const hazard = { ...validHazard, returnPeriod: period };
        const result = hazardSchema.validate(hazard);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate seasonality months', () => {
      const testCases = [
        { start: 1, end: 12, peak: 6, shouldFail: false }, // Valid range
        { start: 6, end: 11, peak: 9, shouldFail: false }, // Hurricane season
        { start: 0, end: 12, peak: 6, shouldFail: true }, // Invalid start
        { start: 1, end: 13, peak: 6, shouldFail: true }, // Invalid end
        { start: 1, end: 12, peak: 0, shouldFail: true }, // Invalid peak
        { start: 6, end: 3, peak: 9, shouldFail: true } // End before start
      ];

      testCases.forEach(({ start, end, peak, shouldFail }) => {
        const hazard = {
          ...validHazard,
          seasonality: {
            startMonth: start,
            endMonth: end,
            peakMonth: peak
          }
        };
        
        const result = hazardSchema.validate(hazard);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });
  });

  describe('Vulnerability Schema Validation', () => {
    const validVulnerability = {
      assetType: 'residential',
      constructionType: 'wood-frame',
      hazardType: 'hurricane',
      vulnerabilityFunction: {
        type: 'beta',
        parameters: {
          alpha: 2.5,
          beta: 1.8,
          threshold: 50,
          scale: 200
        }
      },
      damageStates: [
        { name: 'none', threshold: 0, meanDamageRatio: 0 },
        { name: 'slight', threshold: 50, meanDamageRatio: 0.05 },
        { name: 'moderate', threshold: 100, meanDamageRatio: 0.25 },
        { name: 'extensive', threshold: 150, meanDamageRatio: 0.65 },
        { name: 'complete', threshold: 200, meanDamageRatio: 1.0 }
      ],
      uncertainty: {
        epistemic: 0.3,
        aleatory: 0.2
      }
    };

    test('should validate correct vulnerability data', () => {
      const result = vulnerabilitySchema.validate(validVulnerability);
      expect(result.error).toBeUndefined();
      expect(result.value).toMatchObject(validVulnerability);
    });

    test('should validate vulnerability function types', () => {
      const validTypes = ['beta', 'lognormal', 'weibull', 'linear', 'polynomial'];
      const invalidTypes = ['unknown', 'custom', 'exponential'];

      validTypes.forEach(type => {
        const vulnerability = {
          ...validVulnerability,
          vulnerabilityFunction: {
            ...validVulnerability.vulnerabilityFunction,
            type
          }
        };
        
        const result = vulnerabilitySchema.validate(vulnerability);
        expect(result.error).toBeUndefined();
      });

      invalidTypes.forEach(type => {
        const vulnerability = {
          ...validVulnerability,
          vulnerabilityFunction: {
            ...validVulnerability.vulnerabilityFunction,
            type
          }
        };
        
        const result = vulnerabilitySchema.validate(vulnerability);
        expect(result.error).toBeDefined();
      });
    });

    test('should validate damage states ordering', () => {
      const validDamageStates = [
        { name: 'none', threshold: 0, meanDamageRatio: 0 },
        { name: 'slight', threshold: 50, meanDamageRatio: 0.1 },
        { name: 'complete', threshold: 100, meanDamageRatio: 1.0 }
      ];

      const invalidDamageStates = [
        { name: 'slight', threshold: 100, meanDamageRatio: 0.1 },
        { name: 'none', threshold: 0, meanDamageRatio: 0 }, // Wrong order
        { name: 'complete', threshold: 50, meanDamageRatio: 1.0 }
      ];

      const validVuln = { ...validVulnerability, damageStates: validDamageStates };
      const invalidVuln = { ...validVulnerability, damageStates: invalidDamageStates };

      expect(vulnerabilitySchema.validate(validVuln).error).toBeUndefined();
      expect(vulnerabilitySchema.validate(invalidVuln).error).toBeDefined();
    });

    test('should validate damage ratio constraints', () => {
      const testCases = [
        { ratio: 0, shouldFail: false }, // Minimum
        { ratio: 1, shouldFail: false }, // Maximum
        { ratio: 0.5, shouldFail: false }, // Middle
        { ratio: -0.1, shouldFail: true }, // Below range
        { ratio: 1.1, shouldFail: true }, // Above range
        { ratio: 'moderate', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ ratio, shouldFail }) => {
        const damageStates = validVulnerability.damageStates.map((state, index) => 
          index === 0 ? { ...state, meanDamageRatio: ratio } : state
        );
        
        const vulnerability = { ...validVulnerability, damageStates };
        const result = vulnerabilitySchema.validate(vulnerability);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate uncertainty parameters', () => {
      const testCases = [
        { epistemic: 0, aleatory: 0, shouldFail: false }, // Minimum
        { epistemic: 1, aleatory: 1, shouldFail: false }, // Maximum
        { epistemic: -0.1, aleatory: 0.5, shouldFail: true }, // Negative epistemic
        { epistemic: 0.5, aleatory: -0.1, shouldFail: true }, // Negative aleatory
        { epistemic: 1.1, aleatory: 0.5, shouldFail: true }, // Above range
        { epistemic: 0.5, aleatory: 1.1, shouldFail: true } // Above range
      ];

      testCases.forEach(({ epistemic, aleatory, shouldFail }) => {
        const vulnerability = {
          ...validVulnerability,
          uncertainty: { epistemic, aleatory }
        };
        
        const result = vulnerabilitySchema.validate(vulnerability);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });
  });

  describe('Simulation Schema Validation', () => {
    const validSimulation = {
      name: 'Test Simulation',
      description: 'Test simulation run',
      portfolioId: 'portfolio123',
      hazardModel: 'hurricane-model-v2',
      vulnerabilityModel: 'residential-vuln-v1',
      parameters: {
        numSimulations: 10000,
        randomSeed: 12345,
        correlationMatrix: [[1, 0.3], [0.3, 1]],
        timeHorizon: 1,
        currency: 'USD'
      },
      outputOptions: {
        includeRawResults: false,
        aggregationLevel: 'portfolio',
        percentiles: [50, 90, 95, 99, 99.5],
        returnPeriods: [10, 25, 50, 100, 250, 500]
      },
      metadata: {
        createdBy: 'user123',
        version: '1.0',
        tags: ['test', 'validation']
      }
    };

    test('should validate correct simulation data', () => {
      const result = simulationSchema.validate(validSimulation);
      expect(result.error).toBeUndefined();
      expect(result.value).toMatchObject(validSimulation);
    });

    test('should validate simulation count constraints', () => {
      const testCases = [
        { count: 1000, shouldFail: false }, // Minimum practical
        { count: 100000, shouldFail: false }, // High count
        { count: 100, shouldFail: true }, // Too low
        { count: 1000000, shouldFail: true }, // Too high
        { count: 'many', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ count, shouldFail }) => {
        const simulation = {
          ...validSimulation,
          parameters: {
            ...validSimulation.parameters,
            numSimulations: count
          }
        };
        
        const result = simulationSchema.validate(simulation);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate percentiles array', () => {
      const testCases = [
        { percentiles: [50, 95, 99], shouldFail: false }, // Valid
        { percentiles: [0, 50, 100], shouldFail: false }, // Edge values
        { percentiles: [-1, 50, 99], shouldFail: true }, // Below range
        { percentiles: [50, 95, 101], shouldFail: true }, // Above range
        { percentiles: [99, 95, 50], shouldFail: true }, // Wrong order
        { percentiles: [], shouldFail: true } // Empty array
      ];

      testCases.forEach(({ percentiles, shouldFail }) => {
        const simulation = {
          ...validSimulation,
          outputOptions: {
            ...validSimulation.outputOptions,
            percentiles
          }
        };
        
        const result = simulationSchema.validate(simulation);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate return periods array', () => {
      const testCases = [
        { periods: [10, 50, 100], shouldFail: false }, // Valid
        { periods: [1, 10, 1000], shouldFail: false }, // Wide range
        { periods: [0, 10, 50], shouldFail: true }, // Zero period
        { periods: [-5, 10, 50], shouldFail: true }, // Negative period
        { periods: [50, 10, 100], shouldFail: true }, // Wrong order
        { periods: [], shouldFail: true } // Empty array
      ];

      testCases.forEach(({ periods, shouldFail }) => {
        const simulation = {
          ...validSimulation,
          outputOptions: {
            ...validSimulation.outputOptions,
            returnPeriods: periods
          }
        };
        
        const result = simulationSchema.validate(simulation);
        
        if (shouldFail) {
          expect(result.error).toBeDefined();
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    test('should validate aggregation level enumeration', () => {
      const validLevels = ['portfolio', 'exposure', 'region', 'assetType'];
      const invalidLevels = ['building', 'city', 'unknown'];

      validLevels.forEach(level => {
        const simulation = {
          ...validSimulation,
          outputOptions: {
            ...validSimulation.outputOptions,
            aggregationLevel: level
          }
        };
        
        const result = simulationSchema.validate(simulation);
        expect(result.error).toBeUndefined();
      });

      invalidLevels.forEach(level => {
        const simulation = {
          ...validSimulation,
          outputOptions: {
            ...validSimulation.outputOptions,
            aggregationLevel: level
          }
        };
        
        const result = simulationSchema.validate(simulation);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Result Schema Validation', () => {
    const validResult = {
      simulationId: 'sim123',
      portfolioId: 'portfolio123',
      timestamp: new Date().toISOString(),
      statistics: {
        meanLoss: 150000,
        stdDevLoss: 75000,
        skewness: 2.1,
        kurtosis: 8.5,
        coefficientOfVariation: 0.5
      },
      percentiles: {
        50: 100000,
        90: 300000,
        95: 450000,
        99: 800000,
        99.5: 1000000
      },
      returnPeriods: {
        10: 200000,
        25: 350000,
        50: 500000,
        100: 750000,
        250: 1200000,
        500: 1800000
      },
      exceedanceProbability: {
        100000: 0.6,
        500000: 0.1,
        1000000: 0.02
      },
      metadata: {
        numSimulations: 10000,
        convergenceStatus: 'converged',
        executionTime: 125.5,
        memoryUsage: '512MB'
      }
    };

    test('should validate correct result data', () => {
      const result = resultSchema.validate(validResult);
      expect(result.error).toBeUndefined();
      expect(result.value).toMatchObject(validResult);
    });

    test('should validate statistics constraints', () => {
      const testCases = [
        { meanLoss: -1000, shouldFail: true }, // Negative mean
        { stdDevLoss: -500, shouldFail: true }, // Negative std dev
        { coefficientOfVariation: -0.1, shouldFail: true }, // Negative CV
        { meanLoss: 0, stdDevLoss: 0, shouldFail: false }, // Zero values
        { meanLoss: 'high', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ meanLoss, stdDevLoss, coefficientOfVariation, shouldFail }) => {
        const stats = { ...validResult.statistics };
        if (meanLoss !== undefined) stats.meanLoss = meanLoss;
        if (stdDevLoss !== undefined) stats.stdDevLoss = stdDevLoss;
        if (coefficientOfVariation !== undefined) stats.coefficientOfVariation = coefficientOfVariation;
        
        const result = { ...validResult, statistics: stats };
        const validation = resultSchema.validate(result);
        
        if (shouldFail) {
          expect(validation.error).toBeDefined();
        } else {
          expect(validation.error).toBeUndefined();
        }
      });
    });

    test('should validate timestamp format', () => {
      const testCases = [
        { timestamp: new Date().toISOString(), shouldFail: false }, // Valid ISO
        { timestamp: '2023-01-01T00:00:00.000Z', shouldFail: false }, // Valid format
        { timestamp: 'invalid-date', shouldFail: true }, // Invalid format
        { timestamp: '2023-01-01', shouldFail: true }, // Date only
        { timestamp: Date.now(), shouldFail: true } // Timestamp number
      ];

      testCases.forEach(({ timestamp, shouldFail }) => {
        const result = { ...validResult, timestamp };
        const validation = resultSchema.validate(result);
        
        if (shouldFail) {
          expect(validation.error).toBeDefined();
        } else {
          expect(validation.error).toBeUndefined();
        }
      });
    });

    test('should validate percentile ordering', () => {
      const validPercentiles = { 50: 100000, 90: 200000, 95: 250000, 99: 400000 };
      const invalidPercentiles = { 50: 300000, 90: 200000, 95: 250000, 99: 400000 }; // Wrong order

      const validResult1 = { ...validResult, percentiles: validPercentiles };
      const invalidResult1 = { ...validResult, percentiles: invalidPercentiles };

      expect(resultSchema.validate(validResult1).error).toBeUndefined();
      expect(resultSchema.validate(invalidResult1).error).toBeDefined();
    });

    test('should validate exceedance probability constraints', () => {
      const testCases = [
        { prob: 0, shouldFail: false }, // Minimum
        { prob: 1, shouldFail: false }, // Maximum
        { prob: -0.1, shouldFail: true }, // Below range
        { prob: 1.1, shouldFail: true }, // Above range
        { prob: 'low', shouldFail: true } // Non-numeric
      ];

      testCases.forEach(({ prob, shouldFail }) => {
        const exceedanceProbability = { 100000: prob };
        const result = { ...validResult, exceedanceProbability };
        const validation = resultSchema.validate(result);
        
        if (shouldFail) {
          expect(validation.error).toBeDefined();
        } else {
          expect(validation.error).toBeUndefined();
        }
      });
    });
  });

  describe('Cross-Schema Integration Tests', () => {
    test('should validate portfolio-exposure relationship', () => {
      const portfolio = {
        name: 'Test Portfolio',
        currency: 'USD',
        totalValue: 1000000,
        exposures: ['exp1', 'exp2'],
        createdBy: 'user123'
      };

      const exposure = {
        assetId: 'exp1',
        location: { latitude: 40.7128, longitude: -74.0060 },
        value: 500000,
        currency: 'USD', // Must match portfolio currency
        assetType: 'residential'
      };

      const portfolioResult = portfolioSchema.validate(portfolio);
      const exposureResult = exposureSchema.validate(exposure);

      expect(portfolioResult.error).toBeUndefined();
      expect(exposureResult.error).toBeUndefined();
      expect(portfolio.currency).toBe(exposure.currency);
      expect(portfolio.exposures).toContain(exposure.assetId);
    });

    test('should validate hazard-vulnerability compatibility', () => {
      const hazard = {
        eventType: 'hurricane',
        severity: 'major',
        location: { latitude: 25.7617, longitude: -80.1918 },
        parameters: { windSpeed: 150 },
        probability: 0.02,
        returnPeriod: 50
      };

      const vulnerability = {
        assetType: 'residential',
        constructionType: 'wood-frame',
        hazardType: 'hurricane', // Must match hazard event type
        vulnerabilityFunction: { type: 'beta', parameters: {} },
        damageStates: [{ name: 'none', threshold: 0, meanDamageRatio: 0 }]
      };

      const hazardResult = hazardSchema.validate(hazard);
      const vulnerabilityResult = vulnerabilitySchema.validate(vulnerability);

      expect(hazardResult.error).toBeUndefined();
      expect(vulnerabilityResult.error).toBeUndefined();
      expect(hazard.eventType).toBe(vulnerability.hazardType);
    });

    test('should validate simulation-result relationship', () => {
      const simulation = {
        name: 'Test Simulation',
        portfolioId: 'portfolio123',
        hazardModel: 'hurricane-model',
        vulnerabilityModel: 'residential-vuln',
        parameters: { numSimulations: 10000 },
        outputOptions: { percentiles: [50, 90, 95, 99] }
      };

      const result = {
        simulationId: 'sim123',
        portfolioId: 'portfolio123', // Must match simulation portfolio
        timestamp: new Date().toISOString(),
        statistics: { meanLoss: 150000 },
        percentiles: { 50: 100000, 90: 200000, 95: 250000, 99: 400000 }, // Must match requested percentiles
        metadata: { numSimulations: 10000 } // Must match simulation parameters
      };

      const simulationResult = simulationSchema.validate(simulation);
      const resultResult = resultSchema.validate(result);

      expect(simulationResult.error).toBeUndefined();
      expect(resultResult.error).toBeUndefined();
      expect(simulation.portfolioId).toBe(result.portfolioId);
      expect(simulation.parameters.numSimulations).toBe(result.metadata.numSimulations);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing required fields gracefully', () => {
      const incompletePortfolio = { name: 'Test' }; // Missing required fields
      
      const result = portfolioSchema.validate(incompletePortfolio);
      
      expect(result.error).toBeDefined();
      expect(result.error.details).toHaveLength(1); // Should report missing fields
    });

    test('should handle extra fields appropriately', () => {
      const portfolioWithExtra = {
        name: 'Test Portfolio',
        currency: 'USD',
        totalValue: 1000000,
        exposures: [],
        createdBy: 'user123',
        extraField: 'should be allowed', // Extra field
        _internal: 'should be stripped' // Internal field
      };

      const result = portfolioSchema.validate(portfolioWithExtra, { allowUnknown: true, stripUnknown: { objects: true } });
      
      expect(result.error).toBeUndefined();
      expect(result.value.extraField).toBe('should be allowed');
      expect(result.value._internal).toBeUndefined();
    });

    test('should provide meaningful error messages', () => {
      const invalidExposure = {
        assetId: '', // Empty string
        location: { latitude: 200, longitude: 300 }, // Invalid coordinates
        value: -1000, // Negative value
        currency: 'INVALID', // Invalid currency
        assetType: 'unknown' // Invalid type
      };

      const result = exposureSchema.validate(invalidExposure);
      
      expect(result.error).toBeDefined();
      expect(result.error.details.length).toBeGreaterThan(1);
      
      // Check that error messages are descriptive
      const errorMessages = result.error.details.map(detail => detail.message);
      expect(errorMessages.some(msg => msg.includes('latitude'))).toBe(true);
      expect(errorMessages.some(msg => msg.includes('longitude'))).toBe(true);
    });

    test('should handle type coercion appropriately', () => {
      const portfolioWithStrings = {
        name: 'Test Portfolio',
        currency: 'USD',
        totalValue: '1000000', // String number
        exposures: [],
        createdBy: 'user123'
      };

      const result = portfolioSchema.validate(portfolioWithStrings, { convert: true });
      
      expect(result.error).toBeUndefined();
      expect(typeof result.value.totalValue).toBe('number');
      expect(result.value.totalValue).toBe(1000000);
    });
  });

  describe('Performance Tests', () => {
    test('should validate schemas efficiently with large datasets', () => {
      const largeExposureList = Array.from({ length: 1000 }, (_, i) => ({
        assetId: `asset${i}`,
        location: { latitude: 40.7128, longitude: -74.0060 },
        value: 500000,
        currency: 'USD',
        assetType: 'residential'
      }));

      const startTime = Date.now();
      const results = largeExposureList.map(exposure => exposureSchema.validate(exposure));
      const endTime = Date.now();

      expect(results.every(result => !result.error)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test('should handle complex nested validation efficiently', () => {
      const complexPortfolio = {
        name: 'Complex Portfolio',
        currency: 'USD',
        totalValue: 10000000,
        exposures: Array.from({ length: 100 }, (_, i) => `exp${i}`),
        metadata: {
          regions: Array.from({ length: 50 }, (_, i) => ({ name: `Region ${i}`, weight: 0.02 })),
          riskFactors: Array.from({ length: 20 }, (_, i) => ({ factor: `Factor ${i}`, correlation: Math.random() }))
        },
        createdBy: 'user123'
      };

      const startTime = Date.now();
      const result = portfolioSchema.validate(complexPortfolio);
      const endTime = Date.now();

      expect(result.error).toBeUndefined();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });
});