/**
 * Simple API Integration Test
 * Tests all backend endpoints without external dependencies
 */

const http = require('http');

const API_BASE = 'localhost';
const API_PORT = 3001;

// Test results
let passed = 0;
let failed = 0;

// Helper function to make HTTP requests
function testEndpoint(method, path, callback) {
  const options = {
    hostname: API_BASE,
    port: API_PORT,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log(`\nTesting: ${method} ${path}`);
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.success !== false) {
          console.log('✅ PASS');
          console.log(`Response: ${data.substring(0, 150)}...`);
          passed++;
        } else {
          console.log('❌ FAIL');
          console.log(`Error: ${jsonData.message}`);
          failed++;
        }
      } catch (e) {
        console.log('❌ FAIL - Invalid JSON response');
        failed++;
      }
      callback();
    });
  });
  
  req.on('error', (e) => {
    console.log('❌ FAIL');
    console.log(`Error: ${e.message}`);
    failed++;
    callback();
  });
  
  req.end();
}

// Run tests sequentially
function runTests() {
  const tests = [
    // Health checks
    ['GET', '/health'],
    ['GET', '/api/v1/integration/health'],
    ['GET', '/api/v1/simulations/health'],
    
    // Account endpoints
    ['GET', '/api/v1/accounts'],
    ['GET', '/api/v1/accounts/statistics'],
    ['GET', '/api/v1/accounts/region/North%20America'],
    
    // Hazard endpoints
    ['GET', '/api/v1/hazards'],
    ['GET', '/api/v1/hazards/statistics'],
    ['GET', '/api/v1/hazard-events'],
    ['GET', '/api/v1/hazard-zones'],
    ['GET', '/api/v1/hazard-scenarios'],
    
    // Vulnerability endpoints
    ['GET', '/api/v1/vulnerabilities'],
    ['GET', '/api/v1/vulnerabilities/statistics'],
    
    // Simulation endpoints
    ['GET', '/api/v1/simulations/runs'],
    ['GET', '/api/v1/simulations/dashboard'],
    
    // Integration endpoints
    ['GET', '/api/v1/integration/dashboard'],
    ['GET', '/api/v1/integration/alerts'],
    ['GET', '/api/v1/integration/risk/location?latitude=25.7617&longitude=-80.1918']
  ];
  
  let currentTest = 0;
  
  function runNextTest() {
    if (currentTest >= tests.length) {
      // Print summary
      console.log('\n================================================');
      console.log('TEST SUMMARY');
      console.log('================================================');
      console.log(`Total Tests: ${passed + failed}`);
      console.log(`Passed: ${passed}`);
      console.log(`Failed: ${failed}`);
      console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
      
      // Save results
      const fs = require('fs');
      const results = {
        timestamp: new Date().toISOString(),
        total: passed + failed,
        passed: passed,
        failed: failed,
        successRate: ((passed / (passed + failed)) * 100).toFixed(1) + '%'
      };
      fs.writeFileSync('api-test-results.json', JSON.stringify(results, null, 2));
      console.log('\nResults saved to: tests/api-test-results.json');
      
      process.exit(failed > 0 ? 1 : 0);
    } else {
      const [method, path] = tests[currentTest];
      currentTest++;
      testEndpoint(method, path, runNextTest);
    }
  }
  
  runNextTest();
}

// Start testing
console.log('🧪 CAT Modeling API Integration Tests');
console.log('=====================================');
runTests();
