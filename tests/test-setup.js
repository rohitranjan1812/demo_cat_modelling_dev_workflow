const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock services
jest.mock('../src/services/ExposureService', () => {
  return {
    ExposureService: jest.fn().mockImplementation(() => ({
      getExposuresForLocation: jest.fn().mockResolvedValue([{
        latitude: 12.34,
        longitude: 56.78,
        exposureValue: 100000
      }])
    }))
  };
});

// Set up MongoDB Memory Server
let mongod;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  
  // Connect mongoose
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  // Clean up MongoDB Memory Server
  await mongoose.disconnect();
  await mongod.stop();
});

// Helper function to create test model configuration
function createTestModelConfig(overrides = {}) {
  return {
    modelingConfig: {
      modelProvider: 'Test',
      eventCount: 1000,
      timeHorizon: 1,
      ...overrides
    },
    exposureConfig: {
      searchRadius: 50,
      minValue: 1000,
      maxValue: 1000000
    },
    hazardConfig: {
      types: ['earthquake', 'flood', 'windstorm'],
      intensityRange: {
        min: 1,
        max: 10
      }
    },
    vulnerabilityConfig: {
      damageFactors: {
        earthquake: { min: 0.1, max: 0.9 },
        flood: { min: 0.2, max: 0.8 },
        windstorm: { min: 0.15, max: 0.75 }
      }
    },
    geographicScope: {
      boundingBox: {
        minLatitude: -90,
        maxLatitude: 90,
        minLongitude: -180,
        maxLongitude: 180
      }
    }
  };
}

module.exports = {
  createTestModelConfig
};