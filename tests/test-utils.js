const mongoose = require('mongoose');

/**
 * Test utilities for managing database connections and test data
 */
class TestUtils {
  static isDatabaseAvailable() {
    return mongoose.connection.readyState === 1;
  }

  static async skipIfNoDatabase(testFn) {
    if (!this.isDatabaseAvailable()) {
      console.log('⚠️  Skipping test - Database not available');
      return;
    }
    return testFn();
  }

  static async createTestData(model, data) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available');
    }
    return await model.create(data);
  }

  static async cleanupModel(model) {
    if (this.isDatabaseAvailable()) {
      try {
        await model.deleteMany({});
      } catch (error) {
        console.warn(`Warning: Could not clean model ${model.modelName}:`, error.message);
      }
    }
  }

  static async cleanupAllModels() {
    if (this.isDatabaseAvailable()) {
      const models = [
        require('../src/models/Account'),
        require('../src/models/Hazard'),
        require('../src/models/Vulnerability'),
        require('../src/models/HazardEvent'),
        require('../src/models/HazardScenario'),
        require('../src/models/HazardZone'),
        require('../src/models/Location'),
        require('../src/models/Policy'),
        require('../src/models/SimulationEvent'),
        require('../src/models/SimulationRun'),
        require('../src/models/SpecialCondition'),
        require('../src/models/Sublimit')
      ];

      for (const model of models) {
        try {
          await model.deleteMany({});
        } catch (error) {
          console.warn(`Warning: Could not clean model ${model.modelName}:`, error.message);
        }
      }
    }
  }

  static getMockData() {
    return {
      account: {
        accountId: 'ACC-123456',
        accountName: 'Test Account',
        accountType: 'Primary',
        totalExposure: 1000000,
        currency: 'USD',
        regions: ['North America'],
        riskProfile: 'Medium',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      },
      hazard: {
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
      },
      vulnerability: {
        vulnerabilityId: 'VUL-12345678',
        vulnerabilityName: 'Test Vulnerability',
        vulnerabilityDescription: 'A test vulnerability for unit testing',
        vulnerabilityType: 'Physical',
        vulnerabilityCategory: 'Community',
        geographicScope: {
          centerLatitude: 40.7128,
          centerLongitude: -74.0060,
          radius: 10,
          radiusUnit: 'km',
          administrativeLevel: 'Municipal',
          country: 'United States',
          state: 'New York',
          region: 'North America'
        },
        overallVulnerabilityScore: 7.5,
        overallRiskLevel: 'High',
        confidenceLevel: 'High',
        vulnerabilityFactors: [{
          factorType: 'Physical',
          factorName: 'Building Age',
          factorValue: 8,
          weight: 0.3,
          unit: 'years',
          description: 'Average age of buildings in the area'
        }],
        hazardVulnerabilities: [{
          hazardType: 'Earthquake',
          vulnerabilityScore: 8,
          confidenceLevel: 'High',
          methodology: 'FEMA HAZUS'
        }],
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      }
    };
  }
}

module.exports = TestUtils;