const mongoose = require('mongoose');
const HazardEvent = require('../../src/models/HazardEvent');

describe('HazardEvent Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cat_modeling_test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await HazardEvent.deleteMany({});
  });

  describe('HazardEvent Creation', () => {
    it('should create a hazard event with valid data', async () => {
      const eventData = {
        eventId: 'EVT-12345678',
        eventName: 'Test Earthquake Event',
        hazardId: 'HAZ-12345678',
        eventType: 'Earthquake',
        eventCategory: 'Natural',
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-01-02'),
        centerLatitude: 40.7128,
        centerLongitude: -74.0060,
        affectedRadius: 100,
        radiusUnit: 'km',
        severity: 'Major',
        intensity: 7.5,
        magnitude: 7.5,
        magnitudeScale: 'Richter',
        affectedRegions: ['North America'],
        affectedCountries: ['United States'],
        status: 'Completed',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const event = new HazardEvent(eventData);
      const savedEvent = await event.save();

      expect(savedEvent.eventId).toBe('EVT-12345678');
      expect(savedEvent.eventName).toBe('Test Earthquake Event');
      expect(savedEvent.eventType).toBe('Earthquake');
      expect(savedEvent.severity).toBe('Major');
      expect(savedEvent.intensity).toBe(7.5);
    });

    it('should not create an event with invalid event ID format', async () => {
      const eventData = {
        eventId: 'INVALID-ID',
        eventName: 'Test Event',
        hazardId: 'HAZ-12345678',
        eventType: 'Earthquake',
        eventCategory: 'Natural',
        startTime: new Date('2024-01-01'),
        centerLatitude: 40.7128,
        centerLongitude: -74.0060,
        affectedRadius: 100,
        radiusUnit: 'km',
        severity: 'Major',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const event = new HazardEvent(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should not create an event with invalid coordinates', async () => {
      const eventData = {
        eventId: 'EVT-12345678',
        eventName: 'Test Event',
        hazardId: 'HAZ-12345678',
        eventType: 'Earthquake',
        eventCategory: 'Natural',
        startTime: new Date('2024-01-01'),
        centerLatitude: 200, // Invalid latitude
        centerLongitude: -74.0060,
        affectedRadius: 100,
        radiusUnit: 'km',
        severity: 'Major',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const event = new HazardEvent(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should not create an event with intensity outside 0-10 range', async () => {
      const eventData = {
        eventId: 'EVT-12345678',
        eventName: 'Test Event',
        hazardId: 'HAZ-12345678',
        eventType: 'Earthquake',
        eventCategory: 'Natural',
        startTime: new Date('2024-01-01'),
        centerLatitude: 40.7128,
        centerLongitude: -74.0060,
        affectedRadius: 100,
        radiusUnit: 'km',
        severity: 'Major',
        intensity: 15, // Invalid intensity
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const event = new HazardEvent(eventData);
      await expect(event.save()).rejects.toThrow();
    });
  });

  describe('HazardEvent Methods', () => {
    let event;

    beforeEach(async () => {
      event = new HazardEvent({
        eventId: 'EVT-12345678',
        eventName: 'Test Earthquake Event',
        hazardId: 'HAZ-12345678',
        eventType: 'Earthquake',
        eventCategory: 'Natural',
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-01-02'),
        centerLatitude: 40.7128,
        centerLongitude: -74.0060,
        affectedRadius: 100,
        radiusUnit: 'km',
        severity: 'Major',
        intensity: 7.5,
        impacts: [
          {
            impactType: 'Property Damage',
            estimatedLoss: 1000000,
            currency: 'USD'
          },
          {
            impactType: 'Business Interruption',
            estimatedLoss: 500000,
            currency: 'USD'
          }
        ],
        casualties: {
          fatalities: 10,
          injuries: 50,
          missing: 5,
          displaced: 1000
        },
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      await event.save();
    });

    it('should check if event affects a location', () => {
      // Test location within radius
      const withinRadius = event.affectsLocation(40.7128, -74.0060, 0);
      expect(withinRadius).toBe(true);

      // Test location outside radius
      const outsideRadius = event.affectsLocation(50.0000, -100.0000, 0);
      expect(outsideRadius).toBe(false);

      // Test location within radius with buffer
      const withBuffer = event.affectsLocation(41.0000, -74.0000, 50);
      expect(withBuffer).toBe(true);
    });

    it('should get total economic impact', () => {
      const totalImpact = event.getTotalEconomicImpact('USD');
      expect(totalImpact).toBe(1500000); // 1000000 + 500000
    });

    it('should get total casualties', () => {
      const totalCasualties = event.getTotalCasualties();
      expect(totalCasualties).toBe(65); // 10 + 50 + 5
    });

    it('should calculate event duration in hours', () => {
      const duration = event.getDurationInHours();
      expect(duration).toBe(24); // 1 day = 24 hours
    });

    it('should get current stage from progression', () => {
      event.progression = [
        {
          timestamp: new Date('2024-01-01T00:00:00'),
          stage: 'Formation',
          intensity: 3
        },
        {
          timestamp: new Date('2024-01-01T12:00:00'),
          stage: 'Peak',
          intensity: 7.5
        }
      ];

      const currentStage = event.getCurrentStage();
      expect(currentStage).toBe('Peak');
    });

    it('should calculate event severity score', () => {
      const score = event.calculateSeverityScore();
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  describe('HazardEvent Static Methods', () => {
    beforeEach(async () => {
      // Create test events
      const events = [
        {
          eventId: 'EVT-11111111',
          eventName: 'Earthquake Event 1',
          hazardId: 'HAZ-11111111',
          eventType: 'Earthquake',
          eventCategory: 'Natural',
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-01-02'),
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          affectedRadius: 100,
          radiusUnit: 'km',
          severity: 'Major',
          affectedRegions: ['North America'],
          status: 'Completed',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        },
        {
          eventId: 'EVT-22222222',
          eventName: 'Hurricane Event 1',
          hazardId: 'HAZ-22222222',
          eventType: 'Hurricane',
          eventCategory: 'Natural',
          startTime: new Date('2024-01-01'),
          endTime: new Date('2024-01-03'),
          centerLatitude: 25.7617,
          centerLongitude: -80.1918,
          affectedRadius: 200,
          radiusUnit: 'km',
          severity: 'Severe',
          affectedRegions: ['North America'],
          status: 'Ongoing',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        }
      ];

      await HazardEvent.insertMany(events);
    });

    it('should find events by type', async () => {
      const earthquakes = await HazardEvent.findByType('Earthquake');
      expect(earthquakes).toHaveLength(1);
      expect(earthquakes[0].eventType).toBe('Earthquake');
    });

    it('should find events by region', async () => {
      const northAmericaEvents = await HazardEvent.findByRegion('North America');
      expect(northAmericaEvents).toHaveLength(2);
    });

    it('should find events by severity', async () => {
      const severeEvents = await HazardEvent.findBySeverity('Severe');
      expect(severeEvents).toHaveLength(1);
      expect(severeEvents[0].severity).toBe('Severe');
    });

    it('should find events within geographic bounds', async () => {
      const events = await HazardEvent.findWithinBounds(30, 50, -90, -70);
      expect(events).toHaveLength(2);
    });

    it('should find events by time range', async () => {
      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-02');
      const events = await HazardEvent.findByTimeRange(startTime, endTime);
      expect(events).toHaveLength(2);
    });

    it('should find ongoing events', async () => {
      const ongoingEvents = await HazardEvent.findOngoing();
      expect(ongoingEvents).toHaveLength(1);
      expect(ongoingEvents[0].status).toBe('Ongoing');
    });
  });

  describe('HazardEvent Validation', () => {
    it('should validate end time is after start time', async () => {
      const eventData = {
        eventId: 'EVT-12345678',
        eventName: 'Test Event',
        hazardId: 'HAZ-12345678',
        eventType: 'Earthquake',
        eventCategory: 'Natural',
        startTime: new Date('2024-01-02'),
        endTime: new Date('2024-01-01'), // End before start
        centerLatitude: 40.7128,
        centerLongitude: -74.0060,
        affectedRadius: 100,
        radiusUnit: 'km',
        severity: 'Major',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const event = new HazardEvent(eventData);
      await expect(event.save()).rejects.toThrow();
    });

    it('should validate casualty numbers are non-negative', async () => {
      const eventData = {
        eventId: 'EVT-12345678',
        eventName: 'Test Event',
        hazardId: 'HAZ-12345678',
        eventType: 'Earthquake',
        eventCategory: 'Natural',
        startTime: new Date('2024-01-01'),
        centerLatitude: 40.7128,
        centerLongitude: -74.0060,
        affectedRadius: 100,
        radiusUnit: 'km',
        severity: 'Major',
        casualties: {
          fatalities: -5, // Negative casualties
          injuries: 50,
          missing: 5,
          displaced: 1000
        },
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const event = new HazardEvent(eventData);
      await expect(event.save()).rejects.toThrow();
    });
  });
});


