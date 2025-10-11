const request = require('supertest');
const app = require('../../src/app');
const SimulationRun = require('../../src/models/SimulationRun');

describe('Simulation Controller', () => {
  beforeEach(async () => {
    await SimulationRun.deleteMany({});
  });

  describe('GET /api/v1/simulations/runs', () => {
    test('should get all simulation runs', async () => {
      // Create test simulation runs
      const simulationRuns = [
        {
          simulationRunId: 'SIMRUN-12345678-123456',
          simulationName: 'Test Simulation 1',
          status: 'Completed',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user',
          configuration: {
            startYear: 2024,
            endYear: 2025,
            timeHorizon: 365,
            timeHorizonUnit: 'days',
            modelingConfig: {
              numberOfSimulations: 1000
            }
          }
        },
        {
          simulationRunId: 'SIMRUN-87654321-654321',
          simulationName: 'Test Simulation 2',
          status: 'Running',
          createdBy: 'test-user',
          lastModifiedBy: 'test-user',  
          configuration: {
            startYear: 2024,
            endYear: 2025,
            timeHorizon: 365,
            timeHorizonUnit: 'days',
            modelingConfig: {
              numberOfSimulations: 1000
            }
          }
        }
      ];

      await SimulationRun.insertMany(simulationRuns);

      const response = await request(app)
        .get('/api/v1/simulations/runs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.simulationRuns).toHaveLength(2);
    });
  });

  describe('POST /api/v1/simulations/start', () => {
    test('should start a new simulation', async () => {
      const simulationConfig = {
        simulationName: 'Test Simulation',
        simulationDescription: 'Test simulation run',
        startYear: 2024,
        endYear: 2025,
        timeHorizon: 365,
        timeHorizonUnit: 'days',
        hazardTypes: ['Earthquake'],
        modelingConfig: {
          numberOfSimulations: 1000,
          modelProvider: 'AIR',
          modelType: 'Probabilistic',
          resolution: 'High'
        }
      };

      const response = await request(app)
        .post('/api/v1/simulations/start')
        .send(simulationConfig)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.simulationRunId).toBeDefined();
      expect(response.body.data.status).toBe('Started');
    });
  });

  describe('GET /api/v1/simulations/:simulationRunId/status', () => {
    test('should get simulation status by ID', async () => {
      const simulationRun = await new SimulationRun({
        simulationRunId: 'SIMRUN-12345678-123456',
        simulationName: 'Test Simulation',
        status: 'Completed',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user',
        configuration: {
          startYear: 2024,
          endYear: 2025,
          timeHorizon: 365,
          timeHorizonUnit: 'days',
          modelingConfig: {
            numberOfSimulations: 1000
          }
        }
      }).save();

      const response = await request(app)
        .get('/api/v1/simulations/SIMRUN-12345678-123456/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.simulationRunId).toBe('SIMRUN-12345678-123456');
    });

    test('should return 404 for non-existent simulation', async () => {
      const response = await request(app)
        .get('/api/v1/simulations/SIMRUN-NONEXISTENT-123456/status')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Simulation run not found');
    });
  });

  describe('POST /api/v1/simulations/:simulationRunId/cancel', () => {
    test('should cancel a running simulation', async () => {
      const simulationRun = await new SimulationRun({
        simulationRunId: 'SIMRUN-12345678-123456',
        simulationName: 'Test Simulation',
        status: 'Running',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user',
        configuration: {
          startYear: 2024,
          endYear: 2025,
          timeHorizon: 365,
          timeHorizonUnit: 'days',
          modelingConfig: {
            numberOfSimulations: 1000
          }
        }
      }).save();

      const response = await request(app)
        .post('/api/v1/simulations/SIMRUN-12345678-123456/cancel')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Simulation cancelled successfully');
    });
  });
});