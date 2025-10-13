const CATSimulationEngine = require('../../src/services/CATSimulationEngine');
const SimulationRun = require('../../src/models/SimulationRun');
const SimulationEvent = require('../../src/models/SimulationEvent');
const User = require('../../src/models/User');
const Hazard = require('../../src/models/Hazard');
const Account = require('../../src/models/Account');
const Vulnerability = require('../../src/models/Vulnerability');
const ProbabilityDistributionService = require('../../src/services/ProbabilityDistributionService');
const TestUtils = require('../test-utils');

describe('CATSimulationEngine Service Tests', () => {
  let engine;
  let testUser;
  let testData;
  let mockIntegrationService;
  let mockFinancialService;

  beforeAll(async () => {
    try {
      // Create a test user for simulations
      testUser = await User.create({
        userId: 'USR-00000001',
        username: 'test_simulation_user',
        email: 'test.simulation@example.com',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'SimUser',
        role: 'Analyst'
      });
    
      // Get mock test data
      testData = TestUtils.getMockData();
    } catch (error) {
      console.error('Error in beforeAll setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await User.deleteMany({ userId: 'test-user-sim' });
    await SimulationRun.deleteMany({ createdBy: 'test-user-sim' });
    await SimulationEvent.deleteMany({});
  });

  beforeEach(() => {
    // Create mock services
    mockIntegrationService = {
      getAccountsInRegion: jest.fn(),
      getVulnerabilitiesNearLocation: jest.fn(),
      getLocationRiskAssessment: jest.fn(),
      getExposuresNearLocation: jest.fn()
    };

    mockFinancialService = {
      calculatePortfolioVaR: jest.fn(),
      calculatePortfolioTVaR: jest.fn(),
      calculateExpectedLoss: jest.fn(),
      calculateLossVolatility: jest.fn()
    };

    // Initialize engine with mock services
    engine = new CATSimulationEngine(mockIntegrationService, mockFinancialService);

    // Setup default mock returns
    mockIntegrationService.getAccountsInRegion.mockResolvedValue([testData.account]);
    mockIntegrationService.getVulnerabilitiesNearLocation.mockResolvedValue([testData.vulnerability]);
    mockIntegrationService.getExposuresNearLocation.mockResolvedValue([testData.exposure]);
    mockFinancialService.calculateExpectedLoss.mockReturnValue(50000);
    mockFinancialService.calculateLossVolatility.mockReturnValue(0.15);
    mockFinancialService.calculatePortfolioVaR.mockReturnValue(450000);
    mockFinancialService.calculatePortfolioTVaR.mockReturnValue(550000);
  });

  afterEach(async () => {
    await SimulationRun.deleteMany({});
    await SimulationEvent.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      const defaultEngine = new CATSimulationEngine();
      expect(defaultEngine).toBeDefined();
      expect(defaultEngine.probService).toBeInstanceOf(ProbabilityDistributionService);
      expect(defaultEngine.runningSimulations).toBeInstanceOf(Map);
      expect(defaultEngine.integrationService).toBeNull();
      expect(defaultEngine.financialService).toBeNull();
    });

    test('should initialize with injected services', () => {
      expect(engine.integrationService).toBe(mockIntegrationService);
      expect(engine.financialService).toBe(mockFinancialService);
      expect(engine.probService).toBeInstanceOf(ProbabilityDistributionService);
      expect(engine.runningSimulations).toBeInstanceOf(Map);
    });

    test('should have required methods', () => {
      expect(typeof engine.startSimulation).toBe('function');
      expect(typeof engine.runSimulation).toBe('function');
      expect(typeof engine.getSimulationStatus).toBe('function');
      expect(typeof engine.cancelSimulation).toBe('function');
      expect(typeof engine.generateSimulationRunId).toBe('function');
      expect(typeof engine.calculateMedian).toBe('function');
    });
  });

  describe('Simulation Lifecycle', () => {
    const validConfig = {
      simulationName: 'Test Hurricane Simulation',
      simulationDescription: 'Testing hurricane simulation',
      startYear: 2024,
      endYear: 2025,
      timeHorizon: 2,
      timeHorizonUnit: 'years',
      hazardTypes: ['Hurricane'],
      geographicScope: {
        region: 'Florida',
        country: 'United States'
      },
      exposureScope: {
        totalValue: 1000000,
        currency: 'USD'
      },
      modelingConfig: {
        modelProvider: 'AIR',
        modelType: 'Probabilistic',
        numberOfSimulations: 100
      }
    };

    test('should start a new simulation successfully', async () => {
      const result = await engine.startSimulation(validConfig, testUser.userId);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('simulationRunId');
      expect(result).toHaveProperty('status', 'Started');
      expect(result).toHaveProperty('message');
      expect(result.simulationRunId).toMatch(/^SIMRUN-\d{8}-\d{6}$/);

      // Verify simulation run was created in database
      const savedRun = await SimulationRun.findOne({ 
        simulationRunId: result.simulationRunId 
      });
      expect(savedRun).toBeTruthy();
      expect(savedRun.simulationName).toBe(validConfig.simulationName);
      expect(savedRun.createdBy).toBe(testUser.userId);
    });

    test('should handle invalid simulation configuration', async () => {
      const invalidConfig = {
        // Missing required fields
      };

      await expect(
        engine.startSimulation(invalidConfig, testUser.userId)
      ).rejects.toThrow();
    });

    test('should handle missing user ID', async () => {
      await expect(
        engine.startSimulation(validConfig, null)
      ).rejects.toThrow();
    });

    test('should apply default configuration values', async () => {
      const minimalConfig = {
        startYear: 2024,
        endYear: 2024
      };

      const result = await engine.startSimulation(minimalConfig, testUser.userId);

      const savedRun = await SimulationRun.findOne({ 
        simulationRunId: result.simulationRunId 
      });
      expect(savedRun.simulationName).toBe('CAT Simulation');
      expect(savedRun.simulationDescription).toBe('Comprehensive CAT simulation');
      expect(savedRun.configuration.modelingConfig.modelProvider).toBe('AIR');
      expect(savedRun.configuration.modelingConfig.modelType).toBe('Probabilistic');
      expect(savedRun.configuration.modelingConfig.numberOfSimulations).toBe(1000);
    });

    test('should generate unique simulation run IDs', async () => {
      const results = await Promise.all([
        engine.startSimulation(validConfig, 'user1'),
        engine.startSimulation(validConfig, 'user2'),
        engine.startSimulation(validConfig, 'user3')
      ]);

      const ids = results.map(r => r.simulationRunId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('Event Generation', () => {
    const mockConfig = {
      hazardTypes: ['Earthquake', 'Hurricane'],
      modelingConfig: { numberOfSimulations: 3 },
      geographicScope: { regions: ['North America'] }
    };

    test('should generate events for all hazard types', async () => {
      jest.spyOn(engine, 'generateHazardEvents').mockResolvedValue([
        { eventId: 'event1', hazardType: 'Earthquake' }
      ]);

      const events = await engine.generateYearEvents(2020, mockConfig, 'sim-id');

      expect(engine.generateHazardEvents).toHaveBeenCalledTimes(2);
      expect(events).toHaveLength(2);
    });

    test('should generate correct number of events based on frequency distribution', async () => {
      jest.spyOn(engine, 'getHazardFrequencyDistribution').mockReturnValue({
        type: 'Poisson',
        lambda: 2.5
      });
      jest.spyOn(engine, 'generateEventCount').mockReturnValue(3);
      jest.spyOn(engine, 'generateSingleEvent').mockResolvedValue({
        eventId: 'test-event',
        hazardType: 'Earthquake'
      });

      const events = await engine.generateHazardEvents(
        'Earthquake', 2020, mockConfig, 'sim-id'
      );

      expect(engine.generateEventCount).toHaveBeenCalledWith({
        type: 'Poisson',
        lambda: 2.5
      });
      expect(engine.generateSingleEvent).toHaveBeenCalledTimes(3);
      expect(events).toHaveLength(3);
    });
  });

  describe('Statistical Methods', () => {
    test('should calculate median correctly', () => {
      expect(engine.calculateMedian([1, 3, 5, 7, 9])).toBe(5);
      expect(engine.calculateMedian([1, 2, 3, 4])).toBe(2.5);
      expect(engine.calculateMedian([])).toBe(0);
      expect(engine.calculateMedian([5])).toBe(5);
    });

    test('should calculate standard deviation correctly', () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9];
      const stdDev = engine.calculateStandardDeviation(values);
      expect(stdDev).toBeCloseTo(1.86, 1);
      expect(engine.calculateStandardDeviation([])).toBe(0);
    });

    test('should calculate Value at Risk correctly', () => {
      const events = Array.from({ length: 1000 }, (_, i) => ({ totalLoss: i * 100 }));
      const var95 = engine.calculateValueAtRisk(events, 0.95);
      expect(var95).toBeCloseTo(95000, -2);
      expect(engine.calculateValueAtRisk([], 0.95)).toBe(0);
    });

    test('should calculate Tail Value at Risk correctly', () => {
      const events = Array.from({ length: 1000 }, (_, i) => ({ totalLoss: i * 100 }));
      const tvar95 = engine.calculateTailValueAtRisk(events, 0.95);
      expect(tvar95).toBeGreaterThan(95000);
      expect(engine.calculateTailValueAtRisk([], 0.95)).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    test('should generate unique simulation run IDs', () => {
      const ids = Array.from({ length: 10 }, () => engine.generateSimulationRunId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
      ids.forEach(id => {
        expect(id).toMatch(/^SIMRUN-\d{8}-\d{6}$/);
      });
    });

    test('should generate unique event IDs', () => {
      const ids = Array.from({ length: 10 }, () => engine.generateEventId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
      ids.forEach(id => {
        expect(id).toMatch(/^SIM-\d{8}-\d{6}$/);
      });
    });

    test('should generate valid random months', () => {
      const months = Array.from({ length: 20 }, () => engine.generateRandomMonth());
      months.forEach(month => {
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
      });
    });

    test('should generate valid random days', () => {
      const days = Array.from({ length: 20 }, () => engine.generateRandomDay());
      days.forEach(day => {
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(31);
      });
    });

    test('should generate random locations within bounds', () => {
      const config = {
        geographicScope: {
          boundingBox: {
            north: 49.0,
            south: 25.0,
            east: -66.0,
            west: -125.0
          }
        }
      };

      const location = engine.generateRandomLocation(config);
      expect(location).toHaveProperty('latitude');
      expect(location).toHaveProperty('longitude');
      expect(location.latitude).toBeGreaterThanOrEqual(25.0);
      expect(location.latitude).toBeLessThanOrEqual(49.0);
      expect(location.longitude).toBeGreaterThanOrEqual(-125.0);
      expect(location.longitude).toBeLessThanOrEqual(-66.0);
    });
  });

  describe('Risk Calculations', () => {
    test('should calculate risk metrics', () => {
      const exposureImpact = [
        { exposureId: 'exp1', netLoss: 100000 },
        { exposureId: 'exp2', netLoss: 200000 }
      ];

      const metrics = engine.calculateRiskMetrics({}, exposureImpact, []);

      expect(metrics).toMatchObject({
        portfolioVaR: 450000,
        portfolioTVaR: 550000,
        expectedLoss: expect.any(Number),
        standardDeviation: expect.any(Number),
        coefficientOfVariation: expect.any(Number),
        diversificationBenefit: expect.any(Number),
        concentrationRisk: expect.any(Number)
      });
    });

    test('should handle empty exposure impact', () => {
      const metrics = engine.calculateRiskMetrics({}, [], []);
      expect(metrics.expectedLoss).toBe(0);
      expect(metrics.standardDeviation).toBe(0);
      expect(metrics.coefficientOfVariation).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      jest.spyOn(SimulationRun.prototype, 'save').mockRejectedValueOnce(
        new Error('Database connection error')
      );

      const config = {
        simulationName: 'Test Simulation',
        startYear: 2024,
        endYear: 2024
      };

      await expect(
        engine.startSimulation(config, testUser.userId)
      ).rejects.toThrow('Failed to start simulation');
    });

    test('should handle invalid inputs gracefully', () => {
      expect(() => engine.calculateMedian(null)).not.toThrow();
      expect(() => engine.calculateStandardDeviation(undefined)).not.toThrow();
      expect(() => engine.generateRandomLocation(null)).not.toThrow();
    });

    test('should handle extreme values in calculations', () => {
      const extremeValues = [0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
      
      const median = engine.calculateMedian(extremeValues);
      expect(Number.isFinite(median)).toBe(true);
      
      const stdDev = engine.calculateStandardDeviation(extremeValues);
      expect(Number.isFinite(stdDev)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should generate IDs efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        engine.generateSimulationRunId();
        engine.generateEventId();
      }
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('should handle multiple concurrent simulations', async () => {
      const configs = Array.from({ length: 3 }, (_, i) => ({
        simulationName: `Concurrent Simulation ${i + 1}`,
        startYear: 2024,
        endYear: 2024,
        modelingConfig: {
          numberOfSimulations: 5
        }
      }));

      const promises = configs.map(config => 
        engine.startSimulation(config, testUser.userId)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result).toHaveProperty('simulationRunId');
      });
    });
  });
});