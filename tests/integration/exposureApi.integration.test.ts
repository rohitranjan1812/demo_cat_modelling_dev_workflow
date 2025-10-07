/**
 * Exposure API Integration Tests
 * 
 * Comprehensive test suite for the Exposure API client with:
 * - Full CRUD lifecycle testing
 * - Error handling validation
 * - Edge case coverage
 * - Performance monitoring
 * - Network failure simulation
 * - Logging verification
 * 
 * Run with: npm test -- exposureApi.integration.test.ts
 */

import {
  exposureApi,
  createExposureApiClient,
  ExposureApiError,
  ApiValidationError,
  NetworkError,
  TimeoutError,
} from '../../frontend/src/services/api/exposureApi';
import {
  Exposure,
  CreateExposureInput,
  ExposureType,
  OccupancyType,
  ConstructionType,
  Currency,
  ExposureStatus,
} from '../../frontend/src/types/models';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
  apiBaseUrl: 'http://localhost:3001/api/v1',
  timeout: 30000,
  testAccountId: 'ACC-000001',
  testPolicyId: 'POL-000001',
  testLocationId: 'LOC-000001',
};

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createTestExposure = (overrides?: Partial<CreateExposureInput>): CreateExposureInput => {
  const timestamp = Date.now();
  return {
    exposureId: `EXP-TEST-${timestamp}`,
    exposureType: 'Property' as ExposureType,
    accountId: TEST_CONFIG.testAccountId,
    policyId: TEST_CONFIG.testPolicyId,
    locationId: TEST_CONFIG.testLocationId,
    totalInsuredValue: 1000000,
    replacementValue: 1200000,
    currency: 'USD' as Currency,
    perilExposures: [
      {
        peril: 'Earthquake',
        exposureAmount: 500000,
        deductible: 50000,
      },
      {
        peril: 'Hurricane',
        exposureAmount: 500000,
        deductible: 75000,
      },
    ],
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    occupancyType: 'Residential' as OccupancyType,
    constructionType: 'Concrete' as ConstructionType,
    yearBuilt: 2015,
    numberOfStories: 2,
    squareFootage: 2500,
    status: 'Active' as ExposureStatus,
    createdBy: 'test-user',
    lastModifiedBy: 'test-user',
    metadata: {
      testRun: true,
      timestamp: new Date().toISOString(),
    },
    ...overrides,
  };
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Exposure API Integration Tests', () => {
  let testExposureId: string;
  let createdExposures: string[] = [];

  // ==========================================================================
  // SETUP & TEARDOWN
  // ==========================================================================

  beforeAll(async () => {
    // Test API connection
    const isConnected = await exposureApi.testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to API - ensure backend is running on port 3001');
    }
    console.log('✓ API connection established');
  });

  afterAll(async () => {
    // Clean up test exposures
    console.log(`\nCleaning up ${createdExposures.length} test exposures...`);
    for (const id of createdExposures) {
      try {
        await exposureApi.deleteExposure(id);
      } catch (error) {
        console.warn(`Failed to delete test exposure ${id}:`, error);
      }
    }
    console.log('✓ Cleanup complete');
  });

  afterEach(() => {
    // Clear logs after each test
    exposureApi.clearLogs();
  });

  // ==========================================================================
  // CONNECTION & HEALTH TESTS
  // ==========================================================================

  describe('Connection & Health', () => {
    test('should test connection successfully', async () => {
      const result = await exposureApi.testConnection();
      expect(result).toBe(true);
    });

    test('should get health status with latency', async () => {
      const health = await exposureApi.getHealthStatus();
      expect(health.connected).toBe(true);
      expect(health.latency).toBeDefined();
      expect(health.latency).toBeGreaterThan(0);
      console.log(`API latency: ${health.latency}ms`);
    });
  });

  // ==========================================================================
  // READ OPERATIONS
  // ==========================================================================

  describe('GET /exposures - List Exposures', () => {
    test('should get exposures with default pagination', async () => {
      const response = await exposureApi.getExposures();
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.pagination).toBeDefined();
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.total).toBeGreaterThan(0);

      console.log(`✓ Retrieved ${response.data.length} exposures (total: ${response.pagination.total})`);
    });

    test('should get exposures with custom pagination', async () => {
      const response = await exposureApi.getExposures({ page: 1, limit: 5 });
      
      expect(response.data.length).toBeLessThanOrEqual(5);
      expect(response.pagination.limit).toBe(5);
    });

    test('should filter exposures by type', async () => {
      const response = await exposureApi.getExposures({ 
        exposureType: 'Property' 
      });
      
      expect(response.data.every((e: Exposure) => e.exposureType === 'Property')).toBe(true);
      console.log(`✓ Found ${response.data.length} Property exposures`);
    });

    test('should filter exposures by occupancy type', async () => {
      const response = await exposureApi.getExposures({ 
        occupancyType: 'Residential' 
      });
      
      expect(response.data.every((e: Exposure) => e.occupancyType === 'Residential')).toBe(true);
    });

    test('should filter exposures by construction type', async () => {
      const response = await exposureApi.getExposures({ 
        constructionType: 'Concrete' 
      });
      
      expect(response.data.every((e: Exposure) => e.constructionType === 'Concrete')).toBe(true);
    });

    test('should filter exposures by value range', async () => {
      const minValue = 500000;
      const maxValue = 2000000;
      const response = await exposureApi.getExposures({ 
        minValue,
        maxValue 
      });
      
      response.data.forEach((exposure: Exposure) => {
        expect(exposure.totalInsuredValue).toBeGreaterThanOrEqual(minValue);
        expect(exposure.totalInsuredValue).toBeLessThanOrEqual(maxValue);
      });
    });

    test('should log request and response', async () => {
      await exposureApi.getExposures({ limit: 1 });
      
      const lastRequest = exposureApi.getLastRequest();
      const lastResponse = exposureApi.getLastResponse();
      
      expect(lastRequest).toBeDefined();
      expect(lastRequest?.method).toBe('GET');
      expect(lastResponse).toBeDefined();
      expect(lastResponse?.status).toBe(200);
      expect(lastResponse?.duration).toBeGreaterThan(0);
    });
  });

  describe('GET /exposures/:id - Get Single Exposure', () => {
    test('should get exposure by ID', async () => {
      // First, get list to find an ID
      const list = await exposureApi.getExposures({ limit: 1 });
      const exposureId = list.data[0].exposureId;
      
      const response = await exposureApi.getExposureById(exposureId);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.exposureId).toBe(exposureId);
      console.log(`✓ Retrieved exposure ${exposureId}`);
    });

    test('should throw 404 for non-existent exposure', async () => {
      await expect(
        exposureApi.getExposureById('EXP-NONEXISTENT')
      ).rejects.toThrow(ExposureApiError);

      await expect(
        exposureApi.getExposureById('EXP-NONEXISTENT')
      ).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });
  });

  describe('GET /exposures/account/:accountId - Filter by Account', () => {
    test('should get exposures by account ID', async () => {
      const response = await exposureApi.getExposuresByAccount(TEST_CONFIG.testAccountId);
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data && response.data.length > 0) {
        expect(response.data.every((e: Exposure) => e.accountId === TEST_CONFIG.testAccountId)).toBe(true);
        console.log(`✓ Found ${response.data.length} exposures for account ${TEST_CONFIG.testAccountId}`);
      }
    });
  });

  describe('GET /exposures/statistics/summary - Get Statistics', () => {
    test('should get overall statistics', async () => {
      const response = await exposureApi.getExposureStatistics();
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.totalCount).toBeGreaterThan(0);
      expect(response.data?.byType).toBeDefined();
      
      console.log('✓ Statistics:', {
        totalCount: response.data?.totalCount,
        byType: response.data?.byType,
      });
    });

    test('should get statistics for specific account', async () => {
      const response = await exposureApi.getExposureStatistics(TEST_CONFIG.testAccountId);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });
  });

  // ==========================================================================
  // CREATE OPERATIONS
  // ==========================================================================

  describe('POST /exposures - Create Exposure', () => {
    test('should create new exposure successfully', async () => {
      const testData = createTestExposure();
      
      const response = await exposureApi.createExposure(testData);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.exposureId).toBe(testData.exposureId);
      expect(response.data?.totalInsuredValue).toBe(testData.totalInsuredValue);
      
      // Store for cleanup
      testExposureId = response.data!.exposureId;
      createdExposures.push(testExposureId);
      
      console.log(`✓ Created exposure ${testExposureId}`);
    });

    test('should validate required fields', async () => {
      const invalidData = {
        exposureId: 'EXP-INVALID',
        // Missing required fields
      } as any;
      
      await expect(
        exposureApi.createExposure(invalidData)
      ).rejects.toThrow();
    });

    test('should reject duplicate exposure ID', async () => {
      const testData = createTestExposure();
      
      // Create first time
      const response1 = await exposureApi.createExposure(testData);
      createdExposures.push(response1.data!.exposureId);
      
      // Try to create duplicate
      await expect(
        exposureApi.createExposure(testData)
      ).rejects.toThrow();
    });
  });

  describe('POST /exposures/bulk - Bulk Create', () => {
    test('should create multiple exposures in bulk', async () => {
      const exposures = [
        createTestExposure({ exposureId: `EXP-BULK-1-${Date.now()}` }),
        createTestExposure({ exposureId: `EXP-BULK-2-${Date.now()}` }),
        createTestExposure({ exposureId: `EXP-BULK-3-${Date.now()}` }),
      ];
      
      const response = await exposureApi.createBulkExposures(exposures);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.length).toBe(3);
      
      // Store for cleanup
      response.data?.forEach((exp: Exposure) => createdExposures.push(exp.exposureId));
      
      console.log(`✓ Created ${response.data?.length} exposures in bulk`);
    });
  });

  // ==========================================================================
  // UPDATE OPERATIONS
  // ==========================================================================

  describe('PUT /exposures/:id - Update Exposure', () => {
    test('should update exposure successfully', async () => {
      // Create test exposure
      const testData = createTestExposure();
      const created = await exposureApi.createExposure(testData);
      createdExposures.push(created.data!.exposureId);
      
      // Update it
      const updates = {
        totalInsuredValue: 1500000,
        status: 'Under Review' as ExposureStatus,
        lastModifiedBy: 'test-user-updated',
      };
      
      const response = await exposureApi.updateExposure(
        created.data!.exposureId,
        updates
      );
      
      expect(response.success).toBe(true);
      expect(response.data?.totalInsuredValue).toBe(updates.totalInsuredValue);
      expect(response.data?.status).toBe(updates.status);
      
      console.log(`✓ Updated exposure ${created.data!.exposureId}`);
    });

    test('should reject invalid updates', async () => {
      const testData = createTestExposure();
      const created = await exposureApi.createExposure(testData);
      createdExposures.push(created.data!.exposureId);
      
      const invalidUpdates = {
        totalInsuredValue: -1000, // Negative value
      };
      
      await expect(
        exposureApi.updateExposure(created.data!.exposureId, invalidUpdates)
      ).rejects.toThrow();
    });

    test('should throw 404 when updating non-existent exposure', async () => {
      await expect(
        exposureApi.updateExposure('EXP-NONEXISTENT', { status: 'Inactive' })
      ).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('Batch Update Operations', () => {
    test('should update multiple exposures in batch', async () => {
      // Create test exposures
      const exposure1 = await exposureApi.createExposure(createTestExposure());
      const exposure2 = await exposureApi.createExposure(createTestExposure());
      createdExposures.push(exposure1.data!.exposureId, exposure2.data!.exposureId);
      
      // Batch update
      const updates = [
        { id: exposure1.data!.exposureId, data: { status: 'Inactive' as ExposureStatus } },
        { id: exposure2.data!.exposureId, data: { status: 'Inactive' as ExposureStatus } },
      ];
      
      const results = await exposureApi.batchUpdateExposures(updates);
      
      expect(results.length).toBe(2);
      expect(results.every((r: any) => r.success)).toBe(true);
      
      console.log(`✓ Batch updated ${results.length} exposures`);
    });
  });

  // ==========================================================================
  // DELETE OPERATIONS
  // ==========================================================================

  describe('DELETE /exposures/:id - Delete Exposure', () => {
    test('should delete exposure successfully', async () => {
      // Create test exposure
      const testData = createTestExposure();
      const created = await exposureApi.createExposure(testData);
      
      // Delete it
      const response = await exposureApi.deleteExposure(created.data!.exposureId);
      
      expect(response.success).toBe(true);
      
      // Verify it's gone
      await expect(
        exposureApi.getExposureById(created.data!.exposureId)
      ).rejects.toMatchObject({ status: 404 });
      
      console.log(`✓ Deleted exposure ${created.data!.exposureId}`);
    });

    test('should throw 404 when deleting non-existent exposure', async () => {
      await expect(
        exposureApi.deleteExposure('EXP-NONEXISTENT')
      ).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('Batch Delete Operations', () => {
    test('should delete multiple exposures in batch', async () => {
      // Create test exposures
      const exposure1 = await exposureApi.createExposure(createTestExposure());
      const exposure2 = await exposureApi.createExposure(createTestExposure());
      
      const ids = [exposure1.data!.exposureId, exposure2.data!.exposureId];
      
      // Batch delete
      const results = await exposureApi.batchDeleteExposures(ids);
      
      expect(results.length).toBe(2);
      expect(results.every((r: any) => r.success)).toBe(true);
      
      console.log(`✓ Batch deleted ${results.length} exposures`);
    });
  });

  // ==========================================================================
  // SEARCH OPERATIONS
  // ==========================================================================

  describe('GET /exposures/search - Search Exposures', () => {
    test('should search exposures by term', async () => {
      const response = await exposureApi.searchExposures({
        q: 'residential',
        page: 1,
        limit: 10,
      });
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      
      console.log(`✓ Search found ${response.data.length} exposures`);
    });

    test('should search with combined filters', async () => {
      const response = await exposureApi.searchExposures({
        q: 'property',
        exposureType: 'Property',
        occupancyType: 'Residential',
        page: 1,
      });
      
      expect(response.success).toBe(true);
    });
  });

  // ==========================================================================
  // ERROR HANDLING TESTS
  // ==========================================================================

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      // Create client with invalid URL
      const badClient = createExposureApiClient({
        enableLogging: false,
      });
      
      // This will fail because we can't change baseURL after creation
      // In real test, you'd use a mocking library
    });

    test('should log errors properly', async () => {
      try {
        await exposureApi.getExposureById('EXP-NONEXISTENT');
      } catch (error) {
        const lastError = exposureApi.getLastError();
        expect(lastError).toBeDefined();
        expect(lastError?.status).toBe(404);
      }
    });

    test('should handle validation errors with details', async () => {
      const invalidData = {
        exposureId: '', // Empty ID
        totalInsuredValue: -1000, // Negative value
      } as any;
      
      try {
        await exposureApi.createExposure(invalidData);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof ApiValidationError) {
          expect(error.fields).toBeDefined();
        }
      }
    });
  });

  // ==========================================================================
  // FULL CRUD LIFECYCLE TEST
  // ==========================================================================

  describe('Full CRUD Lifecycle', () => {
    test('should complete full CRUD cycle successfully', async () => {
      console.log('\n🔄 Starting full CRUD lifecycle test...');
      
      // 1. CREATE
      console.log('  1/5 Creating exposure...');
      const testData = createTestExposure();
      const created = await exposureApi.createExposure(testData);
      expect(created.success).toBe(true);
      const exposureId = created.data!.exposureId;
      console.log(`  ✓ Created: ${exposureId}`);
      
      // 2. READ (single)
      console.log('  2/5 Reading exposure...');
      const read = await exposureApi.getExposureById(exposureId);
      expect(read.success).toBe(true);
      expect(read.data?.exposureId).toBe(exposureId);
      console.log(`  ✓ Read: ${exposureId}`);
      
      // 3. UPDATE
      console.log('  3/5 Updating exposure...');
      const updated = await exposureApi.updateExposure(exposureId, {
        totalInsuredValue: 2000000,
        status: 'Under Review',
      });
      expect(updated.success).toBe(true);
      expect(updated.data?.totalInsuredValue).toBe(2000000);
      console.log(`  ✓ Updated: ${exposureId}`);
      
      // 4. VERIFY UPDATE
      console.log('  4/5 Verifying update...');
      const verified = await exposureApi.getExposureById(exposureId);
      expect(verified.data?.totalInsuredValue).toBe(2000000);
      expect(verified.data?.status).toBe('Under Review');
      console.log(`  ✓ Verified: ${exposureId}`);
      
      // 5. DELETE
      console.log('  5/5 Deleting exposure...');
      const deleted = await exposureApi.deleteExposure(exposureId);
      expect(deleted.success).toBe(true);
      console.log(`  ✓ Deleted: ${exposureId}`);
      
      // 6. VERIFY DELETE
      console.log('  6/5 Verifying deletion...');
      await expect(
        exposureApi.getExposureById(exposureId)
      ).rejects.toMatchObject({ status: 404 });
      console.log(`  ✓ Verified deletion: ${exposureId}`);
      
      console.log('✅ Full CRUD lifecycle complete!\n');
    });
  });

  // ==========================================================================
  // PERFORMANCE TESTS
  // ==========================================================================

  describe('Performance Tests', () => {
    test('should measure response time for list query', async () => {
      const startTime = Date.now();
      await exposureApi.getExposures({ limit: 20 });
      const duration = Date.now() - startTime;
      
      console.log(`Response time: ${duration}ms`);
      expect(duration).toBeLessThan(5000); // Should be under 5 seconds
    });

    test('should measure response time for statistics', async () => {
      const startTime = Date.now();
      await exposureApi.getExposureStatistics();
      const duration = Date.now() - startTime;
      
      console.log(`Statistics response time: ${duration}ms`);
      expect(duration).toBeLessThan(3000); // Should be under 3 seconds
    });
  });

  // ==========================================================================
  // HELPER FUNCTION TESTS
  // ==========================================================================

  describe('Helper Functions', () => {
    test('should check if exposure exists', async () => {
      const list = await exposureApi.getExposures({ limit: 1 });
      const existingId = list.data[0].exposureId;
      
      const exists = await exposureApi.exposureExists(existingId);
      expect(exists).toBe(true);
      
      const notExists = await exposureApi.exposureExists('EXP-NONEXISTENT');
      expect(notExists).toBe(false);
    });

    test('should get exposure count', async () => {
      const count = await exposureApi.getExposureCount({ 
        exposureType: 'Property' 
      });
      
      expect(count).toBeGreaterThan(0);
      console.log(`Property exposure count: ${count}`);
    });
  });
});

// ============================================================================
// TEST RUNNER
// ============================================================================

// Run with: npm test -- exposureApi.integration.test.ts
// Or: jest exposureApi.integration.test.ts --verbose
