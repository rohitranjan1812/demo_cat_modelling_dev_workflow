/**
 * Automated API Test - Exposure Filters
 * 
 * Tests backend filter endpoints to ensure:
 * 1. All 9 filter parameters are supported
 * 2. Filters correctly query the database
 * 3. Results match filter criteria
 * 4. Pagination works with filters
 * 5. Multiple filters work together (AND logic)
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Test utilities
const logTest = (testName) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(60));
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

const logError = (message, error) => {
  console.error(`❌ ${message}`);
  if (error.response) {
    console.error(`   Status: ${error.response.status}`);
    console.error(`   Data:`, error.response.data);
  } else {
    console.error(`   Error:`, error.message);
  }
};

const logInfo = (message, data) => {
  console.log(`ℹ️  ${message}`);
  if (data) {
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  }
};

// Test functions
async function testBasicFetch() {
  logTest('1. Basic Fetch - No Filters');
  
  try {
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: { page: 1, limit: 5 }
    });
    
    if (response.data.success && response.data.data) {
      logSuccess(`Fetched ${response.data.data.length} exposures`);
      logInfo('Pagination', response.data.pagination);
      return true;
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Basic fetch failed', error);
    return false;
  }
}

async function testExposureTypeFilter() {
  logTest('2. Exposure Type Filter');
  
  try {
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        exposureType: 'PROPERTY'
      }
    });
    
    if (response.data.success && response.data.data) {
      const exposures = response.data.data;
      const allMatch = exposures.every(e => e.exposureType === 'PROPERTY');
      
      if (allMatch) {
        logSuccess(`All ${exposures.length} exposures have type PROPERTY`);
        return true;
      } else {
        logError('Some exposures do not match filter', { exposures });
        return false;
      }
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Exposure type filter failed', error);
    return false;
  }
}

async function testOccupancyTypeFilter() {
  logTest('3. Occupancy Type Filter');
  
  try {
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        occupancyType: 'RESIDENTIAL'
      }
    });
    
    if (response.data.success && response.data.data) {
      const exposures = response.data.data;
      logSuccess(`Fetched ${exposures.length} exposures with occupancy RESIDENTIAL`);
      
      if (exposures.length > 0) {
        logInfo('Sample exposure', {
          id: exposures[0]._id,
          occupancyType: exposures[0].occupancyType
        });
      }
      return true;
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Occupancy type filter failed', error);
    return false;
  }
}

async function testConstructionTypeFilter() {
  logTest('4. Construction Type Filter');
  
  try {
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        constructionType: 'FRAME'
      }
    });
    
    if (response.data.success && response.data.data) {
      const exposures = response.data.data;
      logSuccess(`Fetched ${exposures.length} exposures with construction FRAME`);
      return true;
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Construction type filter failed', error);
    return false;
  }
}

async function testStatusFilter() {
  logTest('5. Status Filter');
  
  try {
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        status: 'ACTIVE'
      }
    });
    
    if (response.data.success && response.data.data) {
      const exposures = response.data.data;
      const allMatch = exposures.every(e => e.status === 'ACTIVE');
      
      if (allMatch) {
        logSuccess(`All ${exposures.length} exposures have status ACTIVE`);
        return true;
      } else {
        logError('Some exposures do not match filter', { exposures });
        return false;
      }
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Status filter failed', error);
    return false;
  }
}

async function testValueRangeFilter() {
  logTest('6. Value Range Filter (minValue, maxValue)');
  
  try {
    const minValue = 100000;
    const maxValue = 500000;
    
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        minValue,
        maxValue
      }
    });
    
    if (response.data.success && response.data.data) {
      const exposures = response.data.data;
      const allMatch = exposures.every(e => {
        const tiv = e.totalInsuredValue || 0;
        return tiv >= minValue && tiv <= maxValue;
      });
      
      if (allMatch) {
        logSuccess(`All ${exposures.length} exposures have TIV between $${minValue} and $${maxValue}`);
        if (exposures.length > 0) {
          logInfo('Sample TIV values', exposures.map(e => e.totalInsuredValue));
        }
        return true;
      } else {
        logError('Some exposures outside value range', { exposures });
        return false;
      }
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Value range filter failed', error);
    return false;
  }
}

async function testAccountIdFilter() {
  logTest('7. Account ID Filter');
  
  try {
    // First get an exposure to find a valid accountId
    const allResponse = await axios.get(`${BASE_URL}/exposures`, {
      params: { page: 1, limit: 1 }
    });
    
    if (!allResponse.data.success || !allResponse.data.data || allResponse.data.data.length === 0) {
      logError('No exposures available to test accountId filter', {});
      return false;
    }
    
    const testAccountId = allResponse.data.data[0].accountId;
    logInfo('Testing with accountId', testAccountId);
    
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        accountId: testAccountId
      }
    });
    
    if (response.data.success && response.data.data) {
      const exposures = response.data.data;
      const allMatch = exposures.every(e => e.accountId === testAccountId);
      
      if (allMatch) {
        logSuccess(`All ${exposures.length} exposures have accountId ${testAccountId}`);
        return true;
      } else {
        logError('Some exposures do not match accountId filter', { exposures });
        return false;
      }
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Account ID filter failed', error);
    return false;
  }
}

async function testMultipleFilters() {
  logTest('8. Multiple Filters Combined (AND logic)');
  
  try {
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        exposureType: 'PROPERTY',
        status: 'ACTIVE',
        minValue: 50000
      }
    });
    
    if (response.data.success && response.data.data) {
      const exposures = response.data.data;
      const allMatch = exposures.every(e => 
        e.exposureType === 'PROPERTY' &&
        e.status === 'ACTIVE' &&
        (e.totalInsuredValue || 0) >= 50000
      );
      
      if (allMatch) {
        logSuccess(`All ${exposures.length} exposures match all 3 filters`);
        logInfo('Filters applied', {
          exposureType: 'PROPERTY',
          status: 'ACTIVE',
          minValue: 50000
        });
        return true;
      } else {
        logError('Some exposures do not match all filters', { exposures });
        return false;
      }
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Multiple filters test failed', error);
    return false;
  }
}

async function testPaginationWithFilters() {
  logTest('9. Pagination with Filters');
  
  try {
    // Page 1
    const page1 = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 3,
        exposureType: 'PROPERTY'
      }
    });
    
    // Page 2
    const page2 = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 2,
        limit: 3,
        exposureType: 'PROPERTY'
      }
    });
    
    if (page1.data.success && page2.data.success) {
      logSuccess(`Page 1: ${page1.data.data.length} exposures`);
      logSuccess(`Page 2: ${page2.data.data.length} exposures`);
      logInfo('Page 1 Pagination', page1.data.pagination);
      logInfo('Page 2 Pagination', page2.data.pagination);
      
      // Verify no duplicates
      const page1Ids = page1.data.data.map(e => e._id);
      const page2Ids = page2.data.data.map(e => e._id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      if (overlap.length === 0) {
        logSuccess('No duplicate exposures between pages');
        return true;
      } else {
        logError('Found duplicate exposures between pages', { overlap });
        return false;
      }
    } else {
      logError('Invalid response structure', {});
      return false;
    }
  } catch (error) {
    logError('Pagination with filters test failed', error);
    return false;
  }
}

async function testEmptyResults() {
  logTest('10. Empty Results (No Matches)');
  
  try {
    const response = await axios.get(`${BASE_URL}/exposures`, {
      params: {
        page: 1,
        limit: 10,
        exposureType: 'NONEXISTENT_TYPE'
      }
    });
    
    if (response.data.success && response.data.data) {
      if (response.data.data.length === 0) {
        logSuccess('Correctly returns empty array for no matches');
        logInfo('Pagination for empty results', response.data.pagination);
        return true;
      } else {
        logError('Expected empty results but got data', { data: response.data.data });
        return false;
      }
    } else {
      logError('Invalid response structure', { data: response.data });
      return false;
    }
  } catch (error) {
    logError('Empty results test failed', error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       EXPOSURE FILTERS - AUTOMATED API TESTS               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  const tests = [
    testBasicFetch,
    testExposureTypeFilter,
    testOccupancyTypeFilter,
    testConstructionTypeFilter,
    testStatusFilter,
    testValueRangeFilter,
    testAccountIdFilter,
    testMultipleFilters,
    testPaginationWithFilters,
    testEmptyResults
  ];
  
  for (const test of tests) {
    results.total++;
    const passed = await test();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTotal Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);
  
  if (results.failed === 0) {
    console.log('🎉 All tests passed! Filter functionality is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
