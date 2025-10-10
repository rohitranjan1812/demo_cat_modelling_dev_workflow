const fc = require('fast-check');
const { simulationConfigArbitrary, hazardArbitrary, exposureArbitrary } = require('../helpers/generators');
const CATSimulationEngine = require('../../src/services/CATSimulationEngine');
const { createTestModelConfig } = require('../test-setup');

describe('CATSimulationEngine Property Tests', () => {
  describe('generateRandomLocation', () => {
    it('should generate coordinates within bounding box', () => {
      fc.assert(
        fc.property(
          fc.record({
            geographicScope: fc.record({
              boundingBox: fc.record({
                minLatitude: fc.float({ min: -90, max: 89 }),
                maxLatitude: fc.float({ min: -89, max: 90 }),
                minLongitude: fc.float({ min: -180, max: 179 }),
                maxLongitude: fc.float({ min: -179, max: 180 })
              }).filter(box => 
                box.maxLatitude > box.minLatitude && 
                box.maxLongitude > box.minLongitude
              )
            })
          }),
          boundingBox => {
            const engine = new CATSimulationEngine();
            const location = engine.generateRandomLocation(boundingBox);
            
            expect(location.latitude).toBeGreaterThanOrEqual(boundingBox.geographicScope.boundingBox.minLatitude);
            expect(location.latitude).toBeLessThanOrEqual(boundingBox.geographicScope.boundingBox.maxLatitude);
            expect(location.longitude).toBeGreaterThanOrEqual(boundingBox.geographicScope.boundingBox.minLongitude);
            expect(location.longitude).toBeLessThanOrEqual(boundingBox.geographicScope.boundingBox.maxLongitude);
          }
        )
      );
    });
  });

  describe('calculateRiskMetrics', () => {
    it('should cap lossRatio at 1.0 and ensure no NaN values', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              exposureAmount: fc.float({ min: 1000, max: 1000000 })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.record({
            totalLoss: fc.float({ min: 0, max: 2000000 })
          }),
          (exposureImpact, financialImpact) => {
            const engine = new CATSimulationEngine();
            const metrics = engine.calculateRiskMetrics(financialImpact, exposureImpact);
            
            expect(metrics.lossRatio).toBeDefined();
            expect(metrics.lossRatio).toBeLessThanOrEqual(1.0);
            expect(metrics.lossRatio).toBeGreaterThanOrEqual(0);
            expect(Number.isNaN(metrics.lossRatio)).toBe(false);
          }
        )
      );
    });
  });

  describe('generateEventIntensity', () => {
    it('should generate valid intensity values for known hazard types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('earthquake', 'flood', 'windstorm'),
          fc.integer({ min: 2020, max: 2050 }),
          (hazardType, year) => {
            const engine = new CATSimulationEngine();
            
            engine.probService = {
              generateSample: jest.fn().mockReturnValue([5])
            };
            
            const intensity = engine.generateEventIntensity(hazardType, year);
            expect(intensity).toBeDefined();
            expect(intensity.value).toBeDefined();
            expect(Number.isNaN(intensity.value)).toBe(false);
            expect(intensity.scale).toBeDefined();
          }
        )
      );
    });
  });

  describe('Event Generation', () => {
    it('should generate events with valid properties', () => {
      fc.assert(
        fc.property(
          hazardArbitrary(),
          exposureArbitrary(),
          fc.integer({ min: 2020, max: 2050 }),
          (hazard, exposure, year) => {
            const engine = new CATSimulationEngine();
            const config = createTestModelConfig();

            engine.probService = {
              generateSample: jest.fn().mockReturnValue([5])
            };
            
            const event = engine.generateSingleEvent(
              hazard.type,
              year,
              config,
              'TEST-RUN-001'
            );
            
            // Check event properties
            expect(event.hazardType).toBeDefined();
            expect(event.eventYear).toBe(year);
            expect(event.eventId).toBeDefined();
            expect(event.intensity).toBeDefined();
            expect(event.severity).toBeDefined();
            expect(event.probability).toBeDefined();
            expect(event.returnPeriod).toBeDefined();
            expect(event.geographicImpact).toBeDefined();
            expect(event.financialImpact).toBeDefined();
            expect(event.vulnerabilityImpact).toBeDefined();
            expect(event.exposureImpact).toBeDefined();
            expect(event.riskMetrics).toBeDefined();
          }
        )
      );
    });
  });

  describe('Vulnerability Calculation', () => {
    it('should calculate vulnerabilities within configured ranges', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('earthquake', 'flood', 'windstorm'),
          fc.float({ min: 1, max: 10 }),
          (hazardType, intensity) => {
            const engine = new CATSimulationEngine();
            const config = createTestModelConfig();
            
            const vulnerability = engine.generateVulnerabilityImpact(
              hazardType,
              intensity,
              config.vulnerabilityConfig
            );
            
            expect(vulnerability).toBeDefined();
            expect(vulnerability.damageRatio).toBeDefined();
            expect(vulnerability.damageRatio).toBeGreaterThanOrEqual(0);
            expect(vulnerability.damageRatio).toBeLessThanOrEqual(1);
          }
        )
      );
    });
  });
});