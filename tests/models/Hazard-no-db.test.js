/**
 * Hazard Model Tests - No Database Required
 * Tests model validation and methods without database operations
 */
const Hazard = require('../../src/models/Hazard');

describe('Hazard Model - No Database', () => {
  describe('Model Validation', () => {
    test('should validate hazard ID format', () => {
      const validHazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Earthquake',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(validHazard.hazardId).toBe('HAZ-12345678');
      expect(validHazard.validateSync()).toBeUndefined();
    });

    test('should reject invalid hazard ID format', () => {
      const invalidHazard = new Hazard({
        hazardId: 'INVALID-ID',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const validationError = invalidHazard.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.hazardId).toBeDefined();
    });

    test('should validate probability range', () => {
      const validHazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.5,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(validHazard.probability).toBe(0.5);
      expect(validHazard.validateSync()).toBeUndefined();
    });

    test('should reject probability outside 0-1 range', () => {
      const invalidHazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 1.5,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const validationError = invalidHazard.validateSync();
      expect(validationError).toBeDefined();
      expect(validationError.errors.probability).toBeDefined();
    });

    test('should validate coordinates', () => {
      const validHazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(validHazard.footprint.centerLatitude).toBe(40.7128);
      expect(validHazard.validateSync()).toBeUndefined();
    });

    test('should reject invalid coordinates', () => {
      const invalidHazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 200, // Invalid latitude
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const validationError = invalidHazard.validateSync();
      expect(validationError).toBeDefined();
    });
  });

  describe('Model Methods', () => {
    let hazard;

    beforeEach(() => {
      hazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Earthquake',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        economicImpact: [
          {
            estimatedLoss: 1000000,
            currency: 'USD',
            lossType: 'Property'
          }
        ],
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
    });

    test('should check if hazard affects a location', () => {
      // Test location within radius
      const withinRadius = hazard.affectsLocation(40.7128, -74.0060, 0);
      expect(withinRadius).toBe(true);

      // Test location outside radius
      const outsideRadius = hazard.affectsLocation(50.0000, -100.0000, 0);
      expect(outsideRadius).toBe(false);

      // Test location within radius with buffer
      const withBuffer = hazard.affectsLocation(41.0000, -74.0000, 50);
      expect(withBuffer).toBe(true);
    });

    test('should get total economic impact', () => {
      const totalImpact = hazard.getTotalEconomicImpact('USD');
      expect(totalImpact).toBe(1000000);
    });

    test('should get intensity by scale', () => {
      hazard.intensities = [
        {
          scale: 'Richter',
          value: 7.5,
          unit: 'Magnitude'
        }
      ];

      const intensity = hazard.getIntensityByScale('Richter');
      expect(intensity).toBeDefined();
      expect(intensity.value).toBe(7.5);
    });

    test('should calculate hazard score', () => {
      const score = hazard.calculateHazardScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  describe('Model Schema', () => {
    test('should have required fields', () => {
      const hazard = new Hazard();
      const validationError = hazard.validateSync();
      
      expect(validationError.errors.hazardId).toBeDefined();
      expect(validationError.errors.hazardName).toBeDefined();
      expect(validationError.errors.hazardType).toBeDefined();
      expect(validationError.errors.hazardCategory).toBeDefined();
      expect(validationError.errors.createdBy).toBeDefined();
      expect(validationError.errors.lastModifiedBy).toBeDefined();
    });

    test('should have optional fields with defaults', () => {
      const hazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(hazard.status).toBe('Active');
      // confidenceLevel might not have a default value
    });

    test('should handle economic impact array', () => {
      const hazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        economicImpact: [
          {
            estimatedLoss: 1000000,
            currency: 'USD',
            lossType: 'Property'
          },
          {
            estimatedLoss: 500000,
            currency: 'USD',
            lossType: 'Infrastructure'
          }
        ],
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      expect(hazard.economicImpact).toHaveLength(2);
      expect(hazard.validateSync()).toBeUndefined();
    });
  });

  describe('Model Transformations', () => {
    test('should transform to JSON correctly', () => {
      const hazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const json = hazard.toJSON();
      expect(json.hazardId).toBe('HAZ-12345678');
      expect(json.hazardName).toBe('Test Hazard');
      expect(json._id).toBeDefined();
    });

    test('should transform to object correctly', () => {
      const hazard = new Hazard({
        hazardId: 'HAZ-12345678',
        hazardName: 'Test Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2024-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });

      const obj = hazard.toObject();
      expect(obj.hazardId).toBe('HAZ-12345678');
      expect(obj.hazardName).toBe('Test Hazard');
    });
  });
});