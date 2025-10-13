const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const hazardRoutes = require('../../src/routes/hazards');
const Hazard = require('../../src/models/Hazard');
const HazardEvent = require('../../src/models/HazardEvent');
const HazardZone = require('../../src/models/HazardZone');
const HazardScenario = require('../../src/models/HazardScenario');

// Create test app
const app = express();
app.use(express.json());
app.use('/api', hazardRoutes);

describe('Hazard Controller', () => {
    afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Hazard.deleteMany({});
    await HazardEvent.deleteMany({});
    await HazardZone.deleteMany({});
    await HazardScenario.deleteMany({});
  });

  describe('GET /api/hazards', () => {
    it('should get all hazards with pagination', async () => {
      // Create test hazards
      const hazards = [
        {
          hazardId: 'HAZ-11111111',
          hazardName: 'Test Earthquake 1',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        },
        {
          hazardId: 'HAZ-22222222',
          hazardName: 'Test Hurricane 1',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        }
      ];

      await Hazard.insertMany(hazards);

      const response = await request(app)
        .get('/api/hazards')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBe(2);
    });

    it('should filter hazards by type', async () => {
      // Create test hazards
      const hazards = [
        {
          hazardId: 'HAZ-11111111',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        },
        {
          hazardId: 'HAZ-22222222',
          hazardName: 'Test Hurricane',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        }
      ];

      await Hazard.insertMany(hazards);

      const response = await request(app)
        .get('/api/hazards?hazardType=Earthquake')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].hazardType).toBe('Earthquake');
    });

    it('should filter hazards by severity', async () => {
      // Create test hazards
      const hazards = [
        {
          hazardId: 'HAZ-11111111',
          hazardName: 'Test Major Hazard',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        },
        {
          hazardId: 'HAZ-22222222',
          hazardName: 'Test Minor Hazard',
          hazardType: 'Hail',
          hazardCategory: 'Natural',
          footprint: {
            centerLatitude: 25.7617,
            centerLongitude: -80.1918,
            radius: 50,
            unit: 'km'
          },
          temporal: {
            startTime: new Date('2024-01-01')
          },
          severity: 'Minor',
          probability: 0.8,
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        }
      ];

      await Hazard.insertMany(hazards);

      const response = await request(app)
        .get('/api/hazards?severity=Major')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].severity).toBe('Major');
    });
  });

  describe('GET /api/hazards/:id', () => {
    it('should get a hazard by ID', async () => {
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
        status: 'Active',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      await hazard.save();

      const response = await request(app)
        .get('/api/hazards/HAZ-12345678')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.hazardId).toBe('HAZ-12345678');
    });

    it('should return 404 for non-existent hazard', async () => {
      const response = await request(app)
        .get('/api/hazards/HAZ-99999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hazard not found');
    });
  });

  describe('POST /api/hazards', () => {
    it('should create a new hazard', async () => {
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
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const response = await request(app)
        .post('/api/hazards')
        .send(hazardData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Hazard created successfully');
      expect(response.body.data.hazardId).toBe('HAZ-12345678');
    });

    it('should return 400 for invalid hazard data', async () => {
      const invalidHazardData = {
        hazardId: 'INVALID-ID',
        hazardName: 'Test Hazard',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/hazards')
        .send(invalidHazardData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/hazards/:id', () => {
    it('should update an existing hazard', async () => {
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
        status: 'Active',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      await hazard.save();

      const updateData = {
        hazardName: 'Updated Hazard Name',
        severity: 'Severe',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const response = await request(app)
        .put('/api/hazards/HAZ-12345678')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Hazard updated successfully');
      expect(response.body.data.hazardName).toBe('Updated Hazard Name');
      expect(response.body.data.severity).toBe('Severe');
    });

    it('should return 404 for non-existent hazard', async () => {
      const updateData = {
        hazardName: 'Updated Hazard Name',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      };

      const response = await request(app)
        .put('/api/hazards/HAZ-99999999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hazard not found');
    });
  });

  describe('DELETE /api/hazards/:id', () => {
    it('should delete an existing hazard', async () => {
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
        status: 'Active',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      await hazard.save();

      const response = await request(app)
        .delete('/api/hazards/HAZ-12345678')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Hazard deleted successfully');
    });

    it('should return 404 for non-existent hazard', async () => {
      const response = await request(app)
        .delete('/api/hazards/HAZ-99999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Hazard not found');
    });
  });

  describe('GET /api/hazards/affecting-location', () => {
    it('should get hazards affecting a specific location', async () => {
      // Create test hazards
      const hazards = [
        {
          hazardId: 'HAZ-11111111',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        },
        {
          hazardId: 'HAZ-22222222',
          hazardName: 'Test Hurricane',
          hazardType: 'Hurricane',
          hazardCategory: 'Natural',
          footprint: {
            centerLatitude: 25.7617,
            centerLongitude: -80.1918,
            radius: 50,
            unit: 'km'
          },
          temporal: {
            startTime: new Date('2024-01-01')
          },
          severity: 'Severe',
          probability: 0.05,
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        }
      ];

      await Hazard.insertMany(hazards);

      const response = await request(app)
        .get('/api/hazards/affecting-location?latitude=40.7128&longitude=-74.0060')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].hazardId).toBe('HAZ-11111111');
    });

    it('should return 400 for missing coordinates', async () => {
      const response = await request(app)
        .get('/api/hazards/affecting-location')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Latitude and longitude are required');
    });
  });

  describe('GET /api/hazards/statistics', () => {
    it('should get hazard statistics', async () => {
      // Create test hazards
      const hazards = [
        {
          hazardId: 'HAZ-11111111',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        },
        {
          hazardId: 'HAZ-22222222',
          hazardName: 'Test Hurricane',
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
          status: 'Active',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user'
        }
      ];

      await Hazard.insertMany(hazards);

      const response = await request(app)
        .get('/api/hazards/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overall.totalHazards).toBe(2);
      expect(response.body.data.bySeverity).toBeDefined();
      expect(response.body.data.byType).toBeDefined();
    });
  });
});



