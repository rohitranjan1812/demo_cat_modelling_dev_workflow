/**
 * Comprehensive API Integration Tests
 * Tests all backend endpoints with enhanced mock database
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE_URL = 'http://localhost:3001/api/v1';
const HEALTH_URL = 'http://localhost:3001/health';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make API requests
async function testEndpoint(method, endpoint, data = null, description = '') {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const testName = `${method} ${endpoint}${description ? ' - ' + description : ''}`;
  
  try {
    console.log(`\nTesting: ${testName}`.cyan);
    
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.data.success !== false) {
      console.log(`✅ PASS`.green);
      console.log(`Response: ${JSON.stringify(response.data).substring(0, 200)}...`.gray);
      testResults.passed++;
      testResults.tests.push({
        name: testName,
        status: 'PASS',
        response: response.data
      });
      return response.data;
    } else {
      throw new Error(response.data.message || 'Unknown error');
    }
  } catch (error) {
    console.log(`❌ FAIL`.red);
    console.log(`Error: ${error.message}`.red);
    testResults.failed++;
    testResults.tests.push({
      name: testName,
      status: 'FAIL',
      error: error.message
    });
    return null;
  }
}

// Real DB Integration Tests
async function runRealDBTests() {
  console.log('\n🧪 Running Real Database Integration Tests'.cyan);
  console.log('================================================'.cyan);
  
  // Test 1: Verify seeded hazards data
  console.log('\n📊 Testing Seeded Hazards Data'.yellow);
  const hazardsResponse = await testEndpoint('GET', '/hazards?page=1&limit=5', null, 'Get hazards with pagination');
  if (hazardsResponse) {
    // Verify data structure
    const hazards = hazardsResponse.data;
    console.log(`Found ${hazards.length} hazards`.gray);
    
    if (hazards.length > 0) {
      const firstHazard = hazards[0];
      console.log('First hazard keys:', Object.keys(firstHazard).join(', ').gray);
      
      // Check for coordinate data
      if (firstHazard.footprint) {
        console.log(`✅ Coordinate data present: lat=${firstHazard.footprint.centerLatitude}, lng=${firstHazard.footprint.centerLongitude}`.green);
      } else {
        console.log('⚠️ No footprint data found'.yellow);
      }
      
      // Check pagination
      if (hazardsResponse.pagination) {
        console.log(`Pagination: page=${hazardsResponse.pagination.page}, total=${hazardsResponse.pagination.total}`.gray);
      }
    }
  }

  // Test 2: Test hazard filtering
  console.log('\n🔍 Testing Hazard Filtering'.yellow);
  const filteredResponse = await testEndpoint('GET', '/hazards?hazardType=Hurricane&status=Active', null, 'Filter by type and status');
  if (filteredResponse) {
    console.log(`Filtered hazards: ${filteredResponse.data.length}`.gray);
  }

  // Test 3: Verify seeded vulnerabilities data
  console.log('\n📊 Testing Seeded Vulnerabilities Data'.yellow);
  const vulnerabilitiesResponse = await testEndpoint('GET', '/vulnerabilities?page=1&limit=5', null, 'Get vulnerabilities with pagination');
  if (vulnerabilitiesResponse) {
    const vulnerabilities = vulnerabilitiesResponse.data;
    console.log(`Found ${vulnerabilities.length} vulnerabilities`.gray);
    
    if (vulnerabilities.length > 0) {
      const firstVulnerability = vulnerabilities[0];
      
      // Check for geographic scope
      if (firstVulnerability.geographicScope) {
        console.log(`✅ Geographic data present: lat=${firstVulnerability.geographicScope.centerLatitude}, lng=${firstVulnerability.geographicScope.centerLongitude}`.green);
      }
      
      // Check vulnerability score
      console.log(`First vulnerability score: ${firstVulnerability.overallVulnerabilityScore}`.gray);
    }
  }

  // Test 4: Test vulnerability filtering
  console.log('\n🔍 Testing Vulnerability Filtering'.yellow);
  const vulnFilteredResponse = await testEndpoint('GET', '/vulnerabilities?vulnerabilityType=Physical&overallRiskLevel=High', null, 'Filter by type and risk level');
  if (vulnFilteredResponse) {
    console.log(`Filtered vulnerabilities: ${vulnFilteredResponse.data.length}`.gray);
  }

  // Test 5: Verify seeded accounts data
  console.log('\n📊 Testing Seeded Accounts Data'.yellow);
  const accountsResponse = await testEndpoint('GET', '/accounts?page=1&limit=5', null, 'Get accounts with pagination');
  if (accountsResponse) {
    const accounts = accountsResponse.data;
    console.log(`Found ${accounts.length} accounts`.gray);
    
    if (accounts.length > 0) {
      const firstAccount = accounts[0];
      console.log(`First account: ${firstAccount.accountName}, Exposure: ${firstAccount.totalExposure}`.gray);
    }
  }

  // Test 6: Verify seeded simulations data
  console.log('\n📊 Testing Seeded Simulations Data'.yellow);
  const simulationsResponse = await testEndpoint('GET', '/simulations/runs?page=1&limit=5', null, 'Get simulation runs');
  if (simulationsResponse) {
    const simulations = simulationsResponse.data;
    console.log(`Found ${simulations.length} simulations`.gray);
    
    if (simulations.length > 0) {
      const firstSimulation = simulations[0];
      console.log(`First simulation: ${firstSimulation.simulationName}`.gray);
    }
  }

  // Test 7: Test error handling - invalid endpoint
  console.log('\n🛡️ Testing Error Handling'.yellow);
  try {
    await axios.get(`${API_BASE_URL}/invalid-endpoint`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Error handling works - 404 returned for invalid endpoint'.green);
    } else {
      console.log('⚠️ Unexpected error response'.yellow);
    }
  }

  // Test 8: Test pagination edge cases
  console.log('\n📄 Testing Pagination Edge Cases'.yellow);
  const largePageResponse = await testEndpoint('GET', '/hazards?page=100&limit=1', null, 'Large page number (should return empty)');
  if (largePageResponse && largePageResponse.data.length === 0) {
    console.log('✅ Pagination edge case works - empty results for invalid page'.green);
  }

  // Test 9: Test data validation - coordinate bounds
  console.log('\n📍 Testing Geographic Data'.yellow);
  const hurricaneResponse = await testEndpoint('GET', '/hazards?hazardType=Hurricane', null, 'Get hurricane hazards');
  if (hurricaneResponse) {
    const hurricanes = hurricaneResponse.data;
    hurricanes.forEach(hazard => {
      if (hazard.footprint) {
        const lat = hazard.footprint.centerLatitude;
        const lng = hazard.footprint.centerLongitude;
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log(`✅ Valid coordinates: ${lat}, ${lng}`.gray);
        } else {
          console.log(`⚠️ Invalid coordinates: ${lat}, ${lng}`.yellow);
        }
      }
    });
  }

  // Test 10: Test integration endpoint
  console.log('\n🔗 Testing Integration Endpoints'.yellow);
  const locationRiskResponse = await testEndpoint('GET', '/integration/risk/location?latitude=25.7617&longitude=-80.1918', null, 'Location risk assessment');
  if (locationRiskResponse) {
    console.log('✅ Integration endpoint returns data'.green);
  }
}

// Update the main function to run real DB tests
async function runAPITests() {
  console.log('🧪 Starting API Integration Tests with Real Database'.yellow);
  console.log('================================================'.yellow);
  
  // Run real DB tests
  await runRealDBTests();

  // Print summary
  console.log('\n================================================'.yellow);
  console.log('📊 Test Summary'.yellow);
  console.log('================================================'.yellow);
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`.white);
  console.log(`Passed: ${testResults.passed}`.green);
  console.log(`Failed: ${testResults.failed}`.red);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`.cyan);
  
  // Save detailed results
  const fs = require('fs');
  const reportPath = 'tests/real-db-test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`.gray);
  
  // Return success if all tests passed
  return testResults.failed === 0;
}

// Check if server is running before testing
async function checkServerAndRunTests() {
  try {
    console.log('🔍 Checking if backend server is running...'.gray);
    await axios.get(HEALTH_URL);
    console.log('✅ Backend server is running'.green);
    
    // Run tests
    const success = await runAPITests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.log('❌ Backend server is not running!'.red);
    console.log('Please start the backend server first with: npm run start:backend'.yellow);
    process.exit(1);
  }
}

// Run tests
checkServerAndRunTests();
