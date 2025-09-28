const mongoose = require('mongoose');
const Hazard = require('../../src/models/Hazard');

describe('Hazard Model', () => {
  beforeEach(async () => {
    // Clear the collection before each test
    if (mongoose.connection.readyState === 1) {
      await Hazard.deleteMany({});
    }
  });

  describe('Hazard Creation', () => {
    it('should create a hazard with valid data', async () => {
      const hazardData = {
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
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-01-02')
        },
        severity: 'Major',
        probability: 0.1,
        affectedRegions: ['North America'],
        affectedCountries: ['United States'],
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const hazard = new Hazard(hazardData);
      const savedHazard = await hazard.save();

      expect(savedHazard.hazardId).toBe('HAZ-12345678');
      expect(savedHazard.hazardName).toBe('Test Earthquake');
      expect(savedHazard.hazardType).toBe('Earthquake');
      expect(savedHazard.severity).toBe('Major');
      expect(savedHazard.probability).toBe(0.1);
    });

    it('should not create a hazard with invalid hazard ID format', async () => {
      const hazardData = {
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
      };

      const hazard = new Hazard(hazardData);
      await expect(hazard.save()).rejects.toThrow();
    });

    it('should not create a hazard with probability outside 0-1 range', async () => {
      const hazardData = {
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
        probability: 1.5, // Invalid probability
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const hazard = new Hazard(hazardData);
      await expect(hazard.save()).rejects.toThrow();
    });

    it('should not create a hazard with invalid coordinates', async () => {
      const hazardData = {
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
      };

      const hazard = new Hazard(hazardData);
      await expect(hazard.save()).rejects.toThrow();
    });
  });

  describe('Hazard Methods', () => {
    let hazard;

    beforeEach(async () => {
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
      await hazard.save();
    });

    it('should check if hazard affects a location', () => {
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

    it('should get total economic impact', () => {
      const totalImpact = hazard.getTotalEconomicImpact('USD');
      expect(totalImpact).toBe(1000000);
    });

    it('should get intensity by scale', () => {
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

    it('should calculate hazard score', () => {
      const score = hazard.calculateHazardScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  describe('Hazard Static Methods', () => {
    beforeEach(async () => {
      // Create test hazards
      const hazards = [
        {
          hazardId: 'HAZ-11111111',
          hazardName: 'Earthquake 1',
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
          affectedRegions: ['North America'],
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        },
        {
          hazardId: 'HAZ-22222222',
          hazardName: 'Hurricane 1',
          hazardType: 'Hurricane',
          hazardCategory: 'Natural',
          footprint: {
            centerLatitude: 25.7617,
            centerLongitude: -80.1918,
            radius: 200,
            unit: 'km'
          },
          temporal: {
            startTime: new Date('2024-01-01')
          },
          severity: 'Severe',
          probability: 0.05,
          affectedRegions: ['North America'],
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        }
      ];

      await Hazard.insertMany(hazards);
    });

    it('should find hazards by type', async () => {
      const earthquakes = await Hazard.findByType('Earthquake');
      expect(earthquakes).toHaveLength(1);
      expect(earthquakes[0].hazardType).toBe('Earthquake');
    });

    it('should find hazards by region', async () => {
      const northAmericaHazards = await Hazard.findByRegion('North America');
      expect(northAmericaHazards).toHaveLength(2);
    });

    it('should find hazards by severity and probability range', async () => {
      const severeHazards = await Hazard.findBySeverityAndProbability('Severe', 0, 0.1);
      expect(severeHazards).toHaveLength(1);
      expect(severeHazards[0].severity).toBe('Severe');
    });

    it('should find hazards within geographic bounds', async () => {
      const hazards = await Hazard.findWithinBounds(30, 50, -90, -70);
      expect(hazards).toHaveLength(2);
    });

    it('should find hazards by time range', async () => {
      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-02');
      const hazards = await Hazard.findByTimeRange(startTime, endTime);
      expect(hazards).toHaveLength(2);
    });
  });

  describe('Hazard Validation', () => {
    it('should validate end time is after start time', async () => {
      const hazardData = {
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
          startTime: new Date('2024-01-02'),
          endTime: new Date('2024-01-01') // End before start
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const hazard = new Hazard(hazardData);
      await expect(hazard.save()).rejects.toThrow();
    });

    it('should validate economic impact currency consistency', async () => {
      const hazardData = {
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
            currency: 'EUR', // Different currency
            lossType: 'Property'
          }
        ],
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const hazard = new Hazard(hazardData);
      await expect(hazard.save()).rejects.toThrow();
    });
  });
});




