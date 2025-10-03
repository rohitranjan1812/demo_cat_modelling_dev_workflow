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

// Main test suite
async function runAPITests() {
  console.log('🧪 Starting Comprehensive API Integration Tests'.yellow);
  console.log('================================================'.yellow);
  
  // 1. Health Check
  console.log('\n📋 Testing Health Endpoints'.yellow);
  await testEndpoint('GET', HEALTH_URL, null, 'Backend health check');
  await testEndpoint('GET', '/integration/health', null, 'Integration service health');
  await testEndpoint('GET', '/simulations/health', null, 'Simulation service health');
  
  // 2. Account Endpoints
  console.log('\n📋 Testing Account Endpoints'.yellow);
  await testEndpoint('GET', '/accounts', null, 'Get all accounts');
  await testEndpoint('GET', '/accounts/statistics', null, 'Account statistics');
  await testEndpoint('GET', '/accounts/region/North America', null, 'Accounts by region');
  
  // 3. Hazard Endpoints
  console.log('\n📋 Testing Hazard Endpoints'.yellow);
  await testEndpoint('GET', '/hazards', null, 'Get all hazards');
  await testEndpoint('GET', '/hazards/statistics', null, 'Hazard statistics');
  await testEndpoint('GET', '/hazards/affecting-location?latitude=25.7617&longitude=-80.1918', null, 'Hazards by location');
  await testEndpoint('GET', '/hazard-events', null, 'Get hazard events');
  await testEndpoint('GET', '/hazard-zones', null, 'Get hazard zones');
  await testEndpoint('GET', '/hazard-scenarios', null, 'Get hazard scenarios');
  
  // 4. Vulnerability Endpoints
  console.log('\n📋 Testing Vulnerability Endpoints'.yellow);
  await testEndpoint('GET', '/vulnerabilities', null, 'Get all vulnerabilities');
  await testEndpoint('GET', '/vulnerabilities/statistics', null, 'Vulnerability statistics');
  await testEndpoint('GET', '/vulnerabilities/by-hazard/Hurricane', null, 'Vulnerabilities by hazard type');
  
  // 5. Simulation Endpoints
  console.log('\n📋 Testing Simulation Endpoints'.yellow);
  await testEndpoint('GET', '/simulations/runs', null, 'Get simulation runs');
  await testEndpoint('GET', '/simulations/dashboard', null, 'Simulation dashboard');
  
  // Test simulation creation
  const simulationConfig = {
    simulationName: 'Test Simulation Run',
    simulationDescription: 'API integration test simulation',
    configuration: {
      startYear: 2025,
      endYear: 2025,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Hurricane'],
      geographicScope: {
        regions: ['North America']
      },
      modelingConfig: {
        numberOfSimulations: 100,
        modelProvider: 'RMS',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    }
  };
  
  const simulationResult = await testEndpoint('POST', '/simulations/start', simulationConfig, 'Start new simulation');
  
  if (simulationResult && simulationResult.data && simulationResult.data.simulationRunId) {
    const simId = simulationResult.data.simulationRunId;
    await testEndpoint('GET', `/simulations/${simId}/status`, null, 'Get simulation status');
    await testEndpoint('GET', `/simulations/${simId}/results`, null, 'Get simulation results');
    await testEndpoint('GET', `/simulations/${simId}/events`, null, 'Get simulation events');
    await testEndpoint('GET', `/simulations/${simId}/statistics`, null, 'Get simulation statistics');
  }
  
  // 6. Integration Endpoints
  console.log('\n📋 Testing Integration Endpoints'.yellow);
  await testEndpoint('GET', '/integration/risk/location?latitude=25.7617&longitude=-80.1918', null, 'Location risk assessment');
  await testEndpoint('GET', '/integration/risk/location/trends', null, 'Risk trend analysis');
  await testEndpoint('GET', '/integration/dashboard', null, 'Risk dashboard');
  await testEndpoint('GET', '/integration/alerts', null, 'Risk alerts');
  
  // Print test summary
  console.log('\n================================================'.yellow);
  console.log('📊 Test Summary'.yellow);
  console.log('================================================'.yellow);
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`.white);
  console.log(`Passed: ${testResults.passed}`.green);
  console.log(`Failed: ${testResults.failed}`.red);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`.cyan);
  
  // Save detailed results
  const fs = require('fs');
  const reportPath = 'tests/api-test-report.json';
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
