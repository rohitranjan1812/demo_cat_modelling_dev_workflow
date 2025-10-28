/**
 * IntegrationService Tests - Cross-Service Orchestration and Data Consistency
 * 
 * Tests for the enhanced IntegrationService methods added in Phase 1.2
 * Validates cross-service coordination, data aggregation, and consistency management
 * 
 * Author: System Testing Team
 * Created: 2025-10-12
 * Version: 1.0.0
 */

const IntegrationService = require('../../src/services/IntegrationService');
const mongoose = require('mongoose');

describe('IntegrationService - Cross-Service Orchestration Tests', () => {
  
  beforeAll(async () => {
    // Test setup - ensure database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure_test');
    }
  });

  afterAll(async () => {
    // Cleanup test data if needed
    await mongoose.connection.close();
  });

  describe('Account Exposure Aggregation', () => {
    
    test('should aggregate account exposures successfully', async () => {
      // Create test account
      const Account = mongoose.model('Account');
      const testAccount = new Account({
        accountId: 'ACC-000001',
        accountName: 'Test Account for Aggregation',
        accountType: 'Primary',
        totalExposure: 1000000,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      await testAccount.save();

      try {
        const result = await IntegrationService.aggregateAccountExposures('ACC-000001');
        
        expect(result).toBeDefined();
        expect(result.accountId).toBe('ACC-000001');
        expect(result.accountName).toBe('Test Account for Aggregation');
        expect(result).toHaveProperty('aggregationTimestamp');
        expect(result).toHaveProperty('totalExposures');
        expect(result).toHaveProperty('totalValue');
        expect(result).toHaveProperty('exposuresByType');
        expect(result).toHaveProperty('geographicDistribution');
        expect(result).toHaveProperty('vulnerabilityProfile');
        expect(result).toHaveProperty('riskMetrics');
        expect(result).toHaveProperty('processingTimeMs');
        
        // Validate structure of exposuresByType
        expect(result.exposuresByType).toHaveProperty('residential');
        expect(result.exposuresByType).toHaveProperty('commercial');
        expect(result.exposuresByType).toHaveProperty('industrial');
        
      } finally {
        // Cleanup
        await Account.deleteOne({ accountId: 'ACC-000001' });
      }
    });

    test('should handle missing account gracefully', async () => {
      await expect(
        IntegrationService.aggregateAccountExposures('NON-EXISTENT-ACCOUNT')
      ).rejects.toThrow('Account not found: NON-EXISTENT-ACCOUNT');
    });

    test('should require account ID', async () => {
      await expect(
        IntegrationService.aggregateAccountExposures()
      ).rejects.toThrow('Account ID is required for exposure aggregation');
    });

  });

  describe('Vulnerability-Hazard Linking', () => {
    
    test('should link vulnerabilities to hazards successfully', async () => {
      // Create test vulnerability
      const Vulnerability = mongoose.model('Vulnerability');
      const testVulnerability = new Vulnerability({
        vulnerabilityId: 'VUL-00000001',
        vulnerabilityName: 'Test Vulnerability',
        vulnerabilityType: 'Physical',
        vulnerabilityCategory: 'Regional',
        geographicScope: {
          centerLatitude: 37.7749,
          centerLongitude: -122.4194,
          radius: 50,
          radiusUnit: 'km',
          administrativeLevel: 'Municipal',
          country: 'United States',
          region: 'North America'
        },
        overallVulnerabilityScore: 7.0,
        overallRiskLevel: 'High',
        confidenceLevel: 'High',
        createdBy: 'test-user',
        lastModifiedBy: 'test-user',
        applicableHazardTypes: ['Earthquake', 'Hurricane']
      });
      await testVulnerability.save();

      // Create test hazards
      const Hazard = mongoose.model('Hazard');
      const testHazard1 = new Hazard({
        hazardId: 'HAZ-00000001',
        hazardName: 'Test Earthquake Hazard',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 37.7749,
          centerLongitude: -122.4194,
          radius: 50,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2025-01-01')
        },
        severity: 'Major',
        probability: 0.1,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      const testHazard2 = new Hazard({
        hazardId: 'HAZ-00000002',
        hazardName: 'Test Hurricane Hazard',
        hazardType: 'Hurricane',
        hazardCategory: 'Natural',
        footprint: {
          centerLatitude: 37.7749,
          centerLongitude: -122.4194,
          radius: 100,
          unit: 'km'
        },
        temporal: {
          startTime: new Date('2025-06-01')
        },
        severity: 'Severe',
        probability: 0.05,
        createdBy: 'test-user',
        lastModifiedBy: 'test-user'
      });
      await testHazard1.save();
      await testHazard2.save();

      try {
        const result = await IntegrationService.linkVulnerabilitiesToHazards(
          testVulnerability._id,
          [testHazard1._id, testHazard2._id]
        );

        expect(result).toBeDefined();
        expect(result.vulnerabilityId).toEqual(testVulnerability._id);
        expect(result.totalHazardsAnalyzed).toBe(2);
        expect(result).toHaveProperty('validLinksCreated');
        expect(result).toHaveProperty('invalidLinksRejected');
        expect(result).toHaveProperty('linkingResults');
        expect(result.linkingResults).toHaveLength(2);
        
        // Should have at least one valid link (earthquake is compatible)
        expect(result.validLinksCreated).toBeGreaterThanOrEqual(1);
        
      } finally {
        // Cleanup
        await Vulnerability.deleteOne({ _id: testVulnerability._id });
        await Hazard.deleteOne({ _id: testHazard1._id });
        await Hazard.deleteOne({ _id: testHazard2._id });
      }
    });

    test('should require vulnerability ID and hazard IDs', async () => {
      await expect(
        IntegrationService.linkVulnerabilitiesToHazards()
      ).rejects.toThrow('Vulnerability ID and hazard IDs array are required');

      await expect(
        IntegrationService.linkVulnerabilitiesToHazards('test-id', [])
      ).rejects.toThrow('Vulnerability ID and hazard IDs array are required');
    });

  });

  describe('Geographic Risk Profile Calculation', () => {
    
    test('should calculate geographic risk profile successfully', async () => {
      const testRegion = {
        name: 'Test Region',
        boundaries: {
          type: 'Polygon',
          coordinates: [[
            [-122.5, 37.7],
            [-122.3, 37.7],
            [-122.3, 37.8],
            [-122.5, 37.8],
            [-122.5, 37.7]
          ]]
        },
        area: 1000 // square km
      };

      const result = await IntegrationService.calculateGeographicRiskProfile(testRegion);

      expect(result).toBeDefined();
      expect(result.region).toEqual(testRegion);
      expect(result).toHaveProperty('analysisTimestamp');
      expect(result).toHaveProperty('exposureSummary');
      expect(result).toHaveProperty('hazardSummary');
      expect(result).toHaveProperty('riskProfile');
      expect(result).toHaveProperty('processingTimeMs');
      
      // Validate structure
      expect(result.exposureSummary).toHaveProperty('totalExposures');
      expect(result.exposureSummary).toHaveProperty('totalValue');
      expect(result.exposureSummary).toHaveProperty('byType');
      
      expect(result.hazardSummary).toHaveProperty('totalHazards');
      expect(result.hazardSummary).toHaveProperty('byType');
      
      expect(result.riskProfile).toHaveProperty('riskScore');
      expect(result.riskProfile).toHaveProperty('riskGrade');
    });

    test('should require region with boundaries', async () => {
      await expect(
        IntegrationService.calculateGeographicRiskProfile()
      ).rejects.toThrow('Region with boundaries is required');

      await expect(
        IntegrationService.calculateGeographicRiskProfile({ name: 'Test' })
      ).rejects.toThrow('Region with boundaries is required');
    });

  });

  describe('Simulation Workflow Orchestration', () => {
    
    test('should orchestrate simulation workflow successfully', async () => {
      const simulationConfig = {
        userId: 'test-user-123',
        simulationType: 'earthquake',
        region: 'california',
        parameters: {
          magnitude: 7.0,
          depth: 10
        }
      };

      const result = await IntegrationService.orchestrateSimulationWorkflow(simulationConfig);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('simulationRunId');
      expect(result).toHaveProperty('orchestrationTimestamp');
      expect(result).toHaveProperty('phases');
      expect(result.status).toBe('completed');
      expect(result).toHaveProperty('processingTimeMs');
      
      // Validate phases structure
      expect(result.phases).toHaveProperty('validation');
      expect(result.phases).toHaveProperty('simulation');
      expect(result.phases).toHaveProperty('monitoring');
      expect(result.phases).toHaveProperty('integration');
      expect(result.phases).toHaveProperty('analysis');
    });

    test('should require simulation configuration with userId', async () => {
      await expect(
        IntegrationService.orchestrateSimulationWorkflow()
      ).rejects.toThrow('Simulation configuration with userId is required');

      await expect(
        IntegrationService.orchestrateSimulationWorkflow({ simulationType: 'earthquake' })
      ).rejects.toThrow('Simulation configuration with userId is required');
    });

  });

  describe('Data Consistency Management', () => {
    
    test('should manage data consistency successfully', async () => {
      const result = await IntegrationService.manageDataConsistency();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('checkTimestamp');
      expect(result).toHaveProperty('consistencyScore');
      expect(result).toHaveProperty('overallStatus');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('processingTimeMs');
      
      // Validate consistency score
      expect(result.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(result.consistencyScore).toBeLessThanOrEqual(1);
      
      // Validate status
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.overallStatus);
      
      // Validate checks structure
      expect(result.checks).toHaveProperty('referentialIntegrity');
      expect(result.checks).toHaveProperty('relationshipValidation');
      expect(result.checks).toHaveProperty('orphanedRecords');
      expect(result.checks).toHaveProperty('calculationValidation');
      expect(result.checks).toHaveProperty('synchronization');
    });

  });

  describe('Cross-Module Integrity Validation', () => {
    
    test('should validate cross-module integrity successfully', async () => {
      const result = await IntegrationService.validateCrossModuleIntegrity();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('validationTimestamp');
      expect(result).toHaveProperty('integrityScore');
      expect(result).toHaveProperty('overallStatus');
      expect(result).toHaveProperty('validations');
      expect(result).toHaveProperty('processingTimeMs');
      
      // Validate integrity score
      expect(result.integrityScore).toBeGreaterThanOrEqual(0);
      expect(result.integrityScore).toBeLessThanOrEqual(1);
      
      // Validate status
      expect(['excellent', 'good', 'fair', 'poor']).toContain(result.overallStatus);
      
      // Validate validations structure
      expect(result.validations).toHaveProperty('serviceInterface');
      expect(result.validations).toHaveProperty('apiCompatibility');
      expect(result.validations).toHaveProperty('schemaValidation');
      expect(result.validations).toHaveProperty('dependencyValidation');
      expect(result.validations).toHaveProperty('integrationTest');
    });

  });

  describe('Private Helper Methods Integration', () => {
    
    test('should calculate distance correctly', () => {
      const coords1 = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
      const coords2 = { latitude: 37.7849, longitude: -122.4094 }; // ~1km away
      
      const distance = IntegrationService._calculateDistance(coords1, coords2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(5); // Should be less than 5km
    });

    test('should calculate risk grade correctly', () => {
      expect(IntegrationService._calculateRiskGrade(0.9)).toBe('A');
      expect(IntegrationService._calculateRiskGrade(0.7)).toBe('B');
      expect(IntegrationService._calculateRiskGrade(0.5)).toBe('C');
      expect(IntegrationService._calculateRiskGrade(0.3)).toBe('D');
      expect(IntegrationService._calculateRiskGrade(0.1)).toBe('F');
    });

    test('should calculate consistency score correctly', () => {
      const checkResults = [
        { score: 1.0 },
        { score: 0.8 },
        { score: 0.9 }
      ];
      
      const score = IntegrationService._calculateConsistencyScore(checkResults);
      expect(score).toBeCloseTo(0.9, 1);
      
      // Empty results should return 0
      expect(IntegrationService._calculateConsistencyScore([])).toBe(0);
    });

  });

  describe('Error Handling and Resilience', () => {
    
    test('should handle database connection errors gracefully', async () => {
      // Mock a database error by temporarily breaking the connection
      const originalFindOne = mongoose.model('Account').findOne;
      mongoose.model('Account').findOne = jest.fn().mockRejectedValue(new Error('Database connection lost'));

      try {
        await expect(
          IntegrationService.aggregateAccountExposures('ACC-000001')
        ).rejects.toThrow('Failed to aggregate account exposures');
      } finally {
        // Restore original method
        mongoose.model('Account').findOne = originalFindOne;
      }
    });

    test('should handle invalid input parameters gracefully', async () => {
      await expect(
        IntegrationService.linkVulnerabilitiesToHazards(null, ['hazard1'])
      ).rejects.toThrow('Vulnerability ID and hazard IDs array are required');

      await expect(
        IntegrationService.linkVulnerabilitiesToHazards('vuln1', null)
      ).rejects.toThrow('Vulnerability ID and hazard IDs array are required');
    });

  });

  describe('Performance and Scalability', () => {
    
    test('should complete operations within reasonable time', async () => {
      const startTime = Date.now();
      
      await IntegrationService.manageDataConsistency();
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle large datasets efficiently', async () => {
      // Test with a region that could potentially have many exposures/hazards
      const largeRegion = {
        name: 'Large Test Region',
        boundaries: {
          type: 'Polygon',
          coordinates: [[
            [-125, 35],
            [-115, 35],
            [-115, 40],
            [-125, 40],
            [-125, 35]
          ]]
        },
        area: 100000 // Large area
      };

      const startTime = Date.now();
      const result = await IntegrationService.calculateGeographicRiskProfile(largeRegion);
      const processingTime = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(processingTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

  });

});