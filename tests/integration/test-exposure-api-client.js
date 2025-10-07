/**
 * Exposure API Integration Test Runner
 * 
 * Comprehensive integration tests for the Exposure API client.
 * Tests full CRUD lifecycle, error handling, and edge cases.
 * 
 * Run with: node tests/integration/test-exposure-api-client.js
 */

const axios = require('axios');

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = 'http://localhost:3001/api/v1/exposures';
const TEST_CONFIG = {
  accountId: 'ACC-000001',
  policyId: 'POL-000001',
  locationId: 'LOC-000001',
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;
let createdExposures = [];

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    log(`  ✓ ${message}`, 'green');
  } else {
    testsFailed++;
    log(`  ✗ ${message}`, 'red');
    throw new Error(`Assertion failed: ${message}`);
  }
}

function createTestExposure(overrides = {}) {
  const timestamp = Date.now();
  return {
    exposureId: `EXP-TEST-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    exposureType: 'Property',
    accountId: TEST_CONFIG.accountId,
    policyId: TEST_CONFIG.policyId,
    locationId: TEST_CONFIG.locationId,
    totalInsuredValue: 1000000,
    replacementValue: 1200000,
    currency: 'USD',
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
    occupancyType: 'Residential',
    constructionType: 'Concrete',
    yearBuilt: 2015,
    numberOfStories: 2,
    squareFootage: 2500,
    status: 'Active',
    createdBy: 'integration-test',
    lastModifiedBy: 'integration-test',
    metadata: {
      testRun: true,
      timestamp: new Date().toISOString(),
    },
    ...overrides,
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// TEST SUITE
// ============================================================================

async function testConnectionHealth() {
  log('\n📡 Testing API Connection & Health', 'cyan');
  
  try {
    const startTime = Date.now();
    const response = await axios.get(API_BASE_URL, { params: { limit: 1 } });
    const latency = Date.now() - startTime;
    
    assert(response.status === 200, 'API is reachable');
    assert(response.data.success === true, 'API returns success response');
    log(`  ℹ API latency: ${latency}ms`, 'blue');
    
    return true;
  } catch (error) {
    log(`  ✗ Connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function testGetExposures() {
  log('\n📋 Testing GET /exposures - List Exposures', 'cyan');
  
  // Test default pagination
  const response1 = await axios.get(API_BASE_URL);
  assert(response1.data.success === true, 'Returns success');
  assert(response1.data.data !== undefined, 'Returns data object');
  assert(Array.isArray(response1.data.data), 'Returns array of exposures');
  assert(response1.data.pagination !== undefined, 'Returns pagination');
  assert(response1.data.pagination.total > 0, 'Has exposures in database');
  log(`  ℹ Total exposures: ${response1.data.pagination.total}`, 'blue');
  
  // Test custom pagination
  const response2 = await axios.get(API_BASE_URL, { params: { page: 1, limit: 5 } });
  assert(response2.data.data.length <= 5, 'Respects limit parameter');
  assert(response2.data.pagination.limit === 5, 'Returns correct limit in pagination');
  
  // Test filtering by type
  const response3 = await axios.get(API_BASE_URL, { 
    params: { exposureType: 'Property' } 
  });
  assert(
    response3.data.data.every(e => e.exposureType === 'Property'),
    'Filters by exposure type correctly'
  );
  log(`  ℹ Property exposures: ${response3.data.data.length}`, 'blue');
  
  // Test filtering by occupancy
  const response4 = await axios.get(API_BASE_URL, { 
    params: { occupancyType: 'Residential' } 
  });
  if (response4.data.data.length > 0) {
    const allMatchFilter = response4.data.data.every(e => e.occupancyType === 'Residential');
    assert(
      allMatchFilter,
      `Filters by occupancy type correctly (found ${response4.data.data.length} results)`
    );
  } else {
    log('  ⚠ No Residential occupancy type found - skipping filter test', 'yellow');
  }
  
  // Test value range filtering
  const response5 = await axios.get(API_BASE_URL, { 
    params: { minValue: 500000, maxValue: 2000000 } 
  });
  assert(response5.data.success === true, 'Handles value range filters');
}

async function testGetExposureById() {
  log('\n🔍 Testing GET /exposures/:id - Get Single Exposure', 'cyan');
  
  // Get an existing exposure ID
  const listResponse = await axios.get(API_BASE_URL, { params: { limit: 1 } });
  const exposureId = listResponse.data.data[0].exposureId;
  
  // Get by ID
  const response = await axios.get(`${API_BASE_URL}/${exposureId}`);
  assert(response.data.success === true, 'Returns success');
  assert(response.data.data.exposureId === exposureId, 'Returns correct exposure');
  log(`  ℹ Retrieved exposure: ${exposureId}`, 'blue');
  
  // Test 404 for non-existent ID
  try {
    await axios.get(`${API_BASE_URL}/EXP-NONEXISTENT`);
    assert(false, 'Should throw 404 for non-existent exposure');
  } catch (error) {
    assert(error.response.status === 404, 'Returns 404 for non-existent exposure');
  }
}

async function testGetExposuresByAccount() {
  log('\n🏢 Testing GET /exposures/account/:accountId - Filter by Account', 'cyan');
  
  const response = await axios.get(`${API_BASE_URL}/account/${TEST_CONFIG.accountId}`);
  assert(response.data.success === true, 'Returns success');
  assert(Array.isArray(response.data.data), 'Returns array');
  
  if (response.data.data.length > 0) {
    assert(
      response.data.data.every(e => e.accountId === TEST_CONFIG.accountId),
      'All exposures belong to specified account'
    );
    log(`  ℹ Exposures for ${TEST_CONFIG.accountId}: ${response.data.data.length}`, 'blue');
  }
}

async function testGetStatistics() {
  log('\n📊 Testing GET /exposures/statistics/summary - Get Statistics', 'cyan');
  
  const response = await axios.get(`${API_BASE_URL}/statistics/summary`);
  assert(response.data.success === true, 'Returns success');
  assert(response.data.data.totalCount > 0, 'Has total count');
  assert(response.data.data.byType !== undefined, 'Has type breakdown');
  
  log(`  ℹ Total: ${response.data.data.totalCount}`, 'blue');
  log(`  ℹ By Type: ${JSON.stringify(response.data.data.byType)}`, 'blue');
  
  // Test with account filter
  const response2 = await axios.get(`${API_BASE_URL}/statistics/summary`, {
    params: { accountId: TEST_CONFIG.accountId }
  });
  assert(response2.data.success === true, 'Returns success with account filter');
}

async function testCreateExposure() {
  log('\n➕ Testing POST /exposures - Create Exposure', 'cyan');
  
  const testData = createTestExposure();
  const response = await axios.post(API_BASE_URL, testData);
  
  assert(response.data.success === true, 'Returns success');
  assert(response.data.data !== undefined, 'Returns created exposure');
  assert(response.data.data.exposureId === testData.exposureId, 'Created exposure has correct ID');
  assert(
    response.data.data.totalInsuredValue === testData.totalInsuredValue,
    'Created exposure has correct value'
  );
  
  // Store for cleanup
  createdExposures.push(response.data.data.exposureId);
  log(`  ℹ Created exposure: ${response.data.data.exposureId}`, 'blue');
  
  return response.data.data;
}

async function testUpdateExposure(exposureId) {
  log('\n✏️ Testing PUT /exposures/:id - Update Exposure', 'cyan');
  
  const updates = {
    totalInsuredValue: 1500000,
    status: 'Under Review',
    lastModifiedBy: 'integration-test-updated',
  };
  
  const response = await axios.put(`${API_BASE_URL}/${exposureId}`, updates);
  
  assert(response.data.success === true, 'Returns success');
  assert(
    response.data.data.totalInsuredValue === updates.totalInsuredValue,
    'Updated value correctly'
  );
  assert(response.data.data.status === updates.status, 'Updated status correctly');
  log(`  ℹ Updated exposure: ${exposureId}`, 'blue');
  
  // Verify update by fetching
  const verify = await axios.get(`${API_BASE_URL}/${exposureId}`);
  assert(
    verify.data.data.totalInsuredValue === updates.totalInsuredValue,
    'Update persisted in database'
  );
  
  return response.data.data;
}

async function testDeleteExposure(exposureId) {
  log('\n🗑️ Testing DELETE /exposures/:id - Delete Exposure', 'cyan');
  
  const response = await axios.delete(`${API_BASE_URL}/${exposureId}`);
  assert(response.data.success === true, 'Returns success');
  log(`  ℹ Deleted exposure: ${exposureId}`, 'blue');
  
  // Verify deletion
  try {
    await axios.get(`${API_BASE_URL}/${exposureId}`);
    assert(false, 'Deleted exposure should not be fetchable');
  } catch (error) {
    assert(error.response.status === 404, 'Deleted exposure returns 404');
  }
  
  // Remove from cleanup list
  createdExposures = createdExposures.filter(id => id !== exposureId);
}

async function testBulkCreate() {
  log('\n📦 Testing POST /exposures/bulk - Bulk Create', 'cyan');
  
  const exposures = [
    createTestExposure(),
    createTestExposure(),
    createTestExposure(),
  ];
  
  const response = await axios.post(`${API_BASE_URL}/bulk`, { exposures });
  
  assert(response.data.success === true, 'Returns success');
  assert(response.data.data.length === 3, 'Created all 3 exposures');
  
  // Store for cleanup
  response.data.data.forEach(exp => createdExposures.push(exp.exposureId));
  log(`  ℹ Created ${response.data.data.length} exposures in bulk`, 'blue');
}

async function testSearchExposures() {
  log('\n🔎 Testing GET /exposures/search - Search Exposures', 'cyan');
  
  const response = await axios.get(`${API_BASE_URL}/search`, {
    params: {
      q: 'residential',
      page: 1,
      limit: 10,
    }
  });
  
  assert(response.data.success === true, 'Returns success');
  assert(response.data.data !== undefined, 'Returns data object');
  assert(Array.isArray(response.data.data), 'Returns array');
  log(`  ℹ Search found ${response.data.data.length} results`, 'blue');
  
  // Test with combined filters
  const response2 = await axios.get(`${API_BASE_URL}/search`, {
    params: {
      q: 'property',
      exposureType: 'Property',
      occupancyType: 'Residential',
    }
  });
  assert(response2.data.success === true, 'Handles combined filters');
}

async function testFullCRUDLifecycle() {
  log('\n🔄 Testing Full CRUD Lifecycle', 'cyan');
  
  // 1. CREATE
  log('  1/6 Creating exposure...', 'yellow');
  const testData = createTestExposure();
  const createResponse = await axios.post(API_BASE_URL, testData);
  const exposureId = createResponse.data.data.exposureId;
  assert(createResponse.data.success === true, 'CREATE: Success');
  log(`    ✓ Created: ${exposureId}`, 'green');
  
  // 2. READ (single)
  log('  2/6 Reading exposure...', 'yellow');
  const readResponse = await axios.get(`${API_BASE_URL}/${exposureId}`);
  assert(readResponse.data.data.exposureId === exposureId, 'READ: Retrieved correct exposure');
  log(`    ✓ Read: ${exposureId}`, 'green');
  
  // 3. UPDATE
  log('  3/6 Updating exposure...', 'yellow');
  const updateResponse = await axios.put(`${API_BASE_URL}/${exposureId}`, {
    totalInsuredValue: 2000000,
    status: 'Under Review',
  });
  assert(updateResponse.data.data.totalInsuredValue === 2000000, 'UPDATE: Value updated');
  log(`    ✓ Updated: ${exposureId}`, 'green');
  
  // 4. VERIFY UPDATE
  log('  4/6 Verifying update...', 'yellow');
  const verifyResponse = await axios.get(`${API_BASE_URL}/${exposureId}`);
  assert(verifyResponse.data.data.totalInsuredValue === 2000000, 'VERIFY: Update persisted');
  assert(verifyResponse.data.data.status === 'Under Review', 'VERIFY: Status persisted');
  log(`    ✓ Verified: ${exposureId}`, 'green');
  
  // 5. DELETE
  log('  5/6 Deleting exposure...', 'yellow');
  const deleteResponse = await axios.delete(`${API_BASE_URL}/${exposureId}`);
  assert(deleteResponse.data.success === true, 'DELETE: Success');
  log(`    ✓ Deleted: ${exposureId}`, 'green');
  
  // 6. VERIFY DELETE
  log('  6/6 Verifying deletion...', 'yellow');
  try {
    await axios.get(`${API_BASE_URL}/${exposureId}`);
    assert(false, 'VERIFY DELETE: Should return 404');
  } catch (error) {
    assert(error.response.status === 404, 'VERIFY DELETE: Returns 404');
    log(`    ✓ Verified deletion: ${exposureId}`, 'green');
  }
  
  log('  ✅ Full CRUD lifecycle complete!', 'green');
}

async function testErrorHandling() {
  log('\n⚠️ Testing Error Handling', 'cyan');
  
  // Test 404 error
  try {
    await axios.get(`${API_BASE_URL}/EXP-NONEXISTENT`);
    assert(false, 'Should throw error for non-existent resource');
  } catch (error) {
    assert(error.response.status === 404, 'Returns 404 for non-existent resource');
    assert(error.response.data.success === false, 'Error response has success: false');
  }
  
  // Test validation error
  try {
    await axios.post(API_BASE_URL, {
      exposureId: '', // Empty ID
      totalInsuredValue: -1000, // Negative value
    });
    assert(false, 'Should throw validation error');
  } catch (error) {
    assert(error.response.status === 400 || error.response.status === 500, 'Returns 400/500 for invalid data');
  }
  
  // Test duplicate ID
  const testData = createTestExposure();
  await axios.post(API_BASE_URL, testData);
  createdExposures.push(testData.exposureId);
  
  try {
    await axios.post(API_BASE_URL, testData); // Try to create duplicate
    assert(false, 'Should throw error for duplicate ID');
  } catch (error) {
    assert(error.response.status === 400 || error.response.status === 500, 'Returns error for duplicate ID');
  }
}

async function testPerformance() {
  log('\n⚡ Testing Performance', 'cyan');
  
  // Test list query performance
  const start1 = Date.now();
  await axios.get(API_BASE_URL, { params: { limit: 20 } });
  const duration1 = Date.now() - start1;
  log(`  ℹ List query: ${duration1}ms`, 'blue');
  assert(duration1 < 5000, 'List query completes within 5 seconds');
  
  // Test statistics performance
  const start2 = Date.now();
  await axios.get(`${API_BASE_URL}/statistics/summary`);
  const duration2 = Date.now() - start2;
  log(`  ℹ Statistics query: ${duration2}ms`, 'blue');
  assert(duration2 < 3000, 'Statistics query completes within 3 seconds');
  
  // Test single query performance
  const listResponse = await axios.get(API_BASE_URL, { params: { limit: 1 } });
  const exposureId = listResponse.data.data[0].exposureId;
  
  const start3 = Date.now();
  await axios.get(`${API_BASE_URL}/${exposureId}`);
  const duration3 = Date.now() - start3;
  log(`  ℹ Single query: ${duration3}ms`, 'blue');
  assert(duration3 < 2000, 'Single query completes within 2 seconds');
}

// ============================================================================
// CLEANUP
// ============================================================================

async function cleanup() {
  if (createdExposures.length === 0) {
    return;
  }
  
  log(`\n🧹 Cleaning up ${createdExposures.length} test exposures...`, 'yellow');
  
  for (const id of createdExposures) {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      log(`  ✓ Deleted: ${id}`, 'green');
    } catch (error) {
      log(`  ⚠ Failed to delete ${id}: ${error.message}`, 'yellow');
    }
  }
  
  log('  ✓ Cleanup complete', 'green');
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  log('╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Exposure API Integration Test Suite                      ║', 'cyan');
  log('║     Testing full CRUD lifecycle and error handling           ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');
  
  const startTime = Date.now();
  
  try {
    // Check connection first
    const isConnected = await testConnectionHealth();
    if (!isConnected) {
      log('\n❌ Cannot connect to API. Ensure backend is running on port 3001', 'red');
      process.exit(1);
    }
    
    // Run all test suites
    await testGetExposures();
    await testGetExposureById();
    await testGetExposuresByAccount();
    await testGetStatistics();
    await testSearchExposures();
    await testCreateExposure();
    await testBulkCreate();
    
    // Test update and delete with a fresh exposure
    const createdExposure = await testCreateExposure();
    await testUpdateExposure(createdExposure.exposureId);
    await testDeleteExposure(createdExposure.exposureId);
    
    // Full lifecycle test
    await testFullCRUDLifecycle();
    
    // Error handling
    await testErrorHandling();
    
    // Performance tests
    await testPerformance();
    
  } catch (error) {
    log(`\n❌ Test suite failed with error:`, 'red');
    log(error.message, 'red');
    if (error.response) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  } finally {
    await cleanup();
  }
  
  const duration = Date.now() - startTime;
  
  // Print summary
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                     TEST SUMMARY                              ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\n  Tests Passed: ${testsPassed}`, 'green');
  log(`  Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`  Total Duration: ${duration}ms\n`, 'blue');
  
  if (testsFailed === 0) {
    log('✅ ALL TESTS PASSED!', 'green');
    process.exit(0);
  } else {
    log('❌ SOME TESTS FAILED', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests();
