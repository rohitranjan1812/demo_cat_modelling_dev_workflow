const CATSimulationEngine = require('../../src/services/CATSimulationEngine');
const SimulationRun = require('../../src/models/SimulationRun');
const SimulationEvent = require('../../src/models/SimulationEvent');
const ProbabilityDistributionService = require('../../src/services/ProbabilityDistributionService');

// Mock the models
jest.mock('../../src/models/SimulationRun');
jest.mock('../../src/models/SimulationEvent');
jest.mock('../../src/services/ProbabilityDistributionService');

describe('CATSimulationEngine', () => {
  let simulationEngine;
  let mockSimulationRun;
  let mockSimulationEvent;

  beforeEach(() => {
    simulationEngine = new CATSimulationEngine();
    
    // Mock simulation run
    mockSimulationRun = {
      simulationRunId: 'SIMRUN-12345678-123456',
      simulationName: 'Test Simulation',
      configuration: {
        startYear: 2020,
        endYear: 2025,
        timeHorizon: 5,
        timeHorizonUnit: 'years',
        hazardTypes: ['Earthquake', 'Hurricane'],
        modelingConfig: {
          numberOfSimulations: 1000
        }
      },
      save: jest.fn().mockResolvedValue(true),
      startSimulation: jest.fn(),
      updateProgress: jest.fn(),
      completeSimulation: jest.fn(),
      failSimulation: jest.fn()
    };

    // Mock simulation event
    mockSimulationEvent = {
      eventId: 'SIM-12345678-123456',
      simulationRunId: 'SIMRUN-12345678-123456',
      eventName: 'Test Event',
      hazardType: 'Earthquake',
      severity: 'Major',
      intensity: 6.5,
      probability: 0.1,
      financialImpact: {
        totalLoss: 1000000,
        currency: 'USD'
      }
    };

    // Mock static methods
    SimulationRun.findOne = jest.fn();
    SimulationRun.findById = jest.fn();
    SimulationEvent.insertMany = jest.fn().mockResolvedValue(true);
    SimulationEvent.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([mockSimulationEvent])
        })
      })
    });
    SimulationEvent.countDocuments = jest.fn().mockResolvedValue(1);
    SimulationEvent.aggregate = jest.fn().mockResolvedValue([]);
  });

  describe('startSimulation', () => {
    it('should start a new simulation successfully', async () => {
      const config = {
        simulationName: 'Test Simulation',
        startYear: 2020,
        endYear: 2025,
        timeHorizon: 5,
        timeHorizonUnit: 'years',
        hazardTypes: ['Earthquake'],
        modelingConfig: {
          numberOfSimulations: 1000
        }
      };

      const userId = 'user123';

      // Mock the simulation run creation
      SimulationRun.mockImplementation(() => mockSimulationRun);

      const result = await simulationEngine.startSimulation(config, userId);

      expect(result.success).toBe(true);
      expect(result.simulationRunId).toBeDefined();
      expect(mockSimulationRun.save).toHaveBeenCalled();
    });

    it('should handle errors when starting simulation', async () => {
      const config = {};
      const userId = 'user123';

      // Mock error
      SimulationRun.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(simulationEngine.startSimulation(config, userId))
        .rejects.toThrow('Failed to start simulation: Database error');
    });
  });

  describe('generateEventIntensity', () => {
    it('should generate intensity for earthquake', () => {
      const intensity = simulationEngine.generateEventIntensity('Earthquake', 2020);
      
      expect(intensity).toHaveProperty('value');
      expect(intensity).toHaveProperty('scale');
      expect(intensity.value).toBeGreaterThanOrEqual(0);
      expect(intensity.scale).toBe('Richter');
    });

    it('should generate intensity for hurricane', () => {
      const intensity = simulationEngine.generateEventIntensity('Hurricane', 2020);
      
      expect(intensity).toHaveProperty('value');
      expect(intensity).toHaveProperty('scale');
      expect(intensity.value).toBeGreaterThanOrEqual(0);
      expect(intensity.scale).toBe('Saffir-Simpson');
    });
  });

  describe('determineEventSeverity', () => {
    it('should determine severity for earthquake', () => {
      const intensity = { value: 7.5, scale: 'Richter' };
      const severity = simulationEngine.determineEventSeverity(intensity, 'Earthquake');
      
      expect(['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme']).toContain(severity);
    });

    it('should determine severity for hurricane', () => {
      const intensity = { value: 4, scale: 'Saffir-Simpson' };
      const severity = simulationEngine.determineEventSeverity(intensity, 'Hurricane');
      
      expect(['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme']).toContain(severity);
    });
  });

  describe('calculateEventProbability', () => {
    it('should calculate probability based on intensity', () => {
      const intensity = { value: 6.5, scale: 'Richter' };
      const probability = simulationEngine.calculateEventProbability(intensity, 'Earthquake');
      
      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateReturnPeriod', () => {
    it('should calculate return period from probability', () => {
      const probability = 0.1;
      const returnPeriod = simulationEngine.calculateReturnPeriod(probability);
      
      expect(returnPeriod).toBe(10);
    });

    it('should handle zero probability', () => {
      const probability = 0;
      const returnPeriod = simulationEngine.calculateReturnPeriod(probability);
      
      expect(returnPeriod).toBe(1000);
    });
  });

  describe('generateGeographicImpact', () => {
    it('should generate geographic impact for event', async () => {
      const hazardType = 'Earthquake';
      const intensity = { value: 6.5, scale: 'Richter' };
      const config = {
        geographicScope: {
          boundingBox: {
            minLatitude: 20,
            maxLatitude: 50,
            minLongitude: -130,
            maxLongitude: -60
          }
        }
      };

      const impact = await simulationEngine.generateGeographicImpact(hazardType, intensity, config);
      
      expect(Array.isArray(impact)).toBe(true);
      expect(impact.length).toBeGreaterThan(0);
      expect(impact[0]).toHaveProperty('affectedLatitude');
      expect(impact[0]).toHaveProperty('affectedLongitude');
      expect(impact[0]).toHaveProperty('affectedRadius');
      expect(impact[0]).toHaveProperty('intensityAtLocation');
    });
  });

  describe('generateFinancialImpact', () => {
    it('should generate financial impact for event', async () => {
      const hazardType = 'Earthquake';
      const intensity = { value: 6.5, scale: 'Richter' };
      const geographicImpact = [{
        affectedLatitude: 40.7128,
        affectedLongitude: -74.0060,
        intensityAtLocation: 6.5
      }];
      const config = {
        exposureScope: {
          currency: 'USD'
        }
      };

      const impact = await simulationEngine.generateFinancialImpact(hazardType, intensity, geographicImpact, config);
      
      expect(impact).toHaveProperty('directLoss');
      expect(impact).toHaveProperty('indirectLoss');
      expect(impact).toHaveProperty('businessInterruptionLoss');
      expect(impact).toHaveProperty('totalLoss');
      expect(impact).toHaveProperty('currency');
      expect(impact.totalLoss).toBe(impact.directLoss + impact.indirectLoss + impact.businessInterruptionLoss);
    });
  });

  describe('calculateRiskMetrics', () => {
    it('should calculate risk metrics for event', () => {
      const financialImpact = {
        totalLoss: 1000000,
        currency: 'USD'
      };
      const exposureImpact = [{
        accountId: 'ACC-123456',
        exposureAmount: 2000000,
        actualLoss: 500000
      }];
      const vulnerabilityImpact = [{
        vulnerabilityId: 'VUL-123456',
        vulnerabilityScore: 7.5,
        adjustedLoss: 750000
      }];

      const metrics = simulationEngine.calculateRiskMetrics(financialImpact, exposureImpact, vulnerabilityImpact);
      
      expect(metrics).toHaveProperty('expectedLoss');
      expect(metrics).toHaveProperty('valueAtRisk');
      expect(metrics).toHaveProperty('tailValueAtRisk');
      expect(metrics).toHaveProperty('standardDeviation');
      expect(metrics).toHaveProperty('riskAdjustedExposure');
      expect(metrics).toHaveProperty('lossRatio');
      expect(metrics).toHaveProperty('diversificationBenefit');
      expect(metrics).toHaveProperty('concentrationRisk');
    });
  });

  describe('calculateSimulationResults', () => {
    it('should calculate comprehensive simulation results', async () => {
      const events = [
        {
          eventId: 'SIM-1',
          hazardType: 'Earthquake',
          severity: 'Major',
          eventYear: 2020,
          financialImpact: {
            totalLoss: 1000000,
            currency: 'USD'
          },
          exposureImpact: [{
            accountId: 'ACC-1',
            exposureAmount: 2000000,
            actualLoss: 500000
          }],
          vulnerabilityImpact: [{
            vulnerabilityId: 'VUL-1',
            vulnerabilityScore: 7.5,
            adjustedLoss: 750000
          }],
          geographicImpact: [{
            affectedLatitude: 40.7128,
            affectedLongitude: -74.0060
          }]
        },
        {
          eventId: 'SIM-2',
          hazardType: 'Hurricane',
          severity: 'Severe',
          eventYear: 2021,
          financialImpact: {
            totalLoss: 2000000,
            currency: 'USD'
          },
          exposureImpact: [{
            accountId: 'ACC-2',
            exposureAmount: 3000000,
            actualLoss: 1000000
          }],
          vulnerabilityImpact: [{
            vulnerabilityId: 'VUL-2',
            vulnerabilityScore: 8.0,
            adjustedLoss: 800000
          }],
          geographicImpact: [{
            affectedLatitude: 25.7617,
            affectedLongitude: -80.1918
          }]
        }
      ];

      const config = {
        exposureScope: {
          currency: 'USD'
        }
      };

      const results = await simulationEngine.calculateSimulationResults(events, config);
      
      expect(results).toHaveProperty('totalEvents');
      expect(results).toHaveProperty('totalLoss');
      expect(results).toHaveProperty('averageLoss');
      expect(results).toHaveProperty('maxLoss');
      expect(results).toHaveProperty('minLoss');
      expect(results).toHaveProperty('eventsByHazardType');
      expect(results).toHaveProperty('eventsBySeverity');
      expect(results).toHaveProperty('eventsByYear');
      expect(results).toHaveProperty('expectedLoss');
      expect(results).toHaveProperty('diversificationBenefit');
      expect(results).toHaveProperty('concentrationRisk');
      
      expect(results.totalEvents).toBe(2);
      expect(results.totalLoss).toBe(3000000);
      expect(results.averageLoss).toBe(1500000);
      expect(results.maxLoss).toBe(2000000);
      expect(results.minLoss).toBe(1000000);
    });
  });

  describe('Helper methods', () => {
    it('should generate simulation run ID', () => {
      const id = simulationEngine.generateSimulationRunId();
      expect(id).toMatch(/^SIMRUN-\d{8}-\d{6}$/);
    });

    it('should generate event ID', () => {
      const id = simulationEngine.generateEventId();
      expect(id).toMatch(/^SIM-\d{8}-\d{6}$/);
    });

    it('should generate random month', () => {
      const month = simulationEngine.generateRandomMonth();
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
    });

    it('should generate random day', () => {
      const day = simulationEngine.generateRandomDay();
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    });

    it('should get hazard category', () => {
      expect(simulationEngine.getHazardCategory('Earthquake')).toBe('Natural');
      expect(simulationEngine.getHazardCategory('Hurricane')).toBe('Natural');
      expect(simulationEngine.getHazardCategory('Unknown')).toBe('Natural');
    });

    it('should get intensity configuration', () => {
      const config = simulationEngine.getIntensityConfiguration('Earthquake');
      expect(config).toHaveProperty('distribution');
      expect(config).toHaveProperty('parameters');
      expect(config).toHaveProperty('scale');
      expect(config.scale).toBe('Richter');
    });

    it('should calculate median', () => {
      const values = [1, 2, 3, 4, 5];
      const median = simulationEngine.calculateMedian(values);
      expect(median).toBe(3);
    });

    it('should calculate standard deviation', () => {
      const values = [1, 2, 3, 4, 5];
      const std = simulationEngine.calculateStandardDeviation(values);
      expect(std).toBeGreaterThan(0);
    });

    it('should calculate value at risk', () => {
      const events = [
        { financialImpact: { totalLoss: 1000000 } },
        { financialImpact: { totalLoss: 2000000 } },
        { financialImpact: { totalLoss: 3000000 } }
      ];
      const var95 = simulationEngine.calculateValueAtRisk(events, 0.95);
      expect(var95).toBeGreaterThanOrEqual(0);
    });

    it('should calculate tail value at risk', () => {
      const events = [
        { financialImpact: { totalLoss: 1000000 } },
        { financialImpact: { totalLoss: 2000000 } },
        { financialImpact: { totalLoss: 3000000 } }
      ];
      const tvar95 = simulationEngine.calculateTailValueAtRisk(events, 0.95);
      expect(tvar95).toBeGreaterThanOrEqual(0);
    });

    it('should calculate diversification benefit', () => {
      const exposureImpact = [
        { exposureAmount: 1000000, actualLoss: 500000 },
        { exposureAmount: 2000000, actualLoss: 1000000 }
      ];
      const benefit = simulationEngine.calculateDiversificationBenefit(exposureImpact);
      expect(benefit).toBeGreaterThanOrEqual(0);
    });

    it('should calculate concentration risk', () => {
      const exposureImpact = [
        { exposureAmount: 1000000, actualLoss: 500000 },
        { exposureAmount: 2000000, actualLoss: 1000000 }
      ];
      const risk = simulationEngine.calculateConcentrationRisk(exposureImpact);
      expect(risk).toBeGreaterThanOrEqual(0);
      expect(risk).toBeLessThanOrEqual(1);
    });
  });

  describe('Integration tests', () => {
    it('should run complete simulation workflow', async () => {
      const config = {
        simulationName: 'Integration Test Simulation',
        startYear: 2020,
        endYear: 2021,
        timeHorizon: 1,
        timeHorizonUnit: 'years',
        hazardTypes: ['Earthquake'],
        modelingConfig: {
          numberOfSimulations: 10
        },
        geographicScope: {
          boundingBox: {
            minLatitude: 20,
            maxLatitude: 50,
            minLongitude: -130,
            maxLongitude: -60
          }
        },
        exposureScope: {
          currency: 'USD'
        }
      };

      const userId = 'user123';

      // Mock the simulation run
      SimulationRun.mockImplementation(() => mockSimulationRun);
      SimulationRun.findOne = jest.fn().mockResolvedValue(mockSimulationRun);
      SimulationRun.findById = jest.fn().mockResolvedValue(mockSimulationRun);

      // Start simulation
      const result = await simulationEngine.startSimulation(config, userId);
      expect(result.success).toBe(true);

      // Mock the simulation run to be completed
      mockSimulationRun.status = 'Completed';
      mockSimulationRun.results = {
        totalEvents: 5,
        totalLoss: 5000000,
        averageLoss: 1000000
      };

      // Get simulation status
      const status = await simulationEngine.getSimulationStatus(mockSimulationRun.simulationRunId);
      expect(status).toBeDefined();
    });
  });
});
