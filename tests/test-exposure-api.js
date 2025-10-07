/**
 * Test Exposure API Endpoints
 * 
 * Simple test script to verify all exposure endpoints are working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Helper function to make requests
async function testEndpoint(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${url}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${method} ${url}`);
    console.log(`   Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('Testing Exposure API Endpoints');
  console.log('========================================\n');
  
  // Test 1: Health check
  console.log('1. Testing Health Check...');
  await testEndpoint('GET', '/health');
  console.log('');
  
  // Test 2: Get all exposures
  console.log('2. Testing GET /exposures...');
  const exposuresResponse = await testEndpoint('GET', '/exposures');
  console.log('');
  
  // Test 3: Get exposures with pagination
  console.log('3. Testing GET /exposures with pagination...');
  await testEndpoint('GET', '/exposures?page=1&limit=5');
  console.log('');
  
  // Test 4: Get single exposure (if any exist)
  if (exposuresResponse && exposuresResponse.data && exposuresResponse.data.length > 0) {
    const exposureId = exposuresResponse.data[0].exposureId;
    console.log(`4. Testing GET /exposures/${exposureId}...`);
    await testEndpoint('GET', `/exposures/${exposureId}`);
    console.log('');
    
    // Test 5: Get exposures by account
    const accountId = exposuresResponse.data[0].accountId;
    console.log(`5. Testing GET /exposures/account/${accountId}...`);
    await testEndpoint('GET', `/exposures/account/${accountId}`);
    console.log('');
    
    // Test 6: Get exposures by location
    const locationId = exposuresResponse.data[0].locationId;
    console.log(`6. Testing GET /exposures/location/${locationId}...`);
    await testEndpoint('GET', `/exposures/location/${locationId}`);
    console.log('');
    
    // Test 7: Get exposures by policy
    if (exposuresResponse.data[0].policyId) {
      const policyId = exposuresResponse.data[0].policyId;
      console.log(`7. Testing GET /exposures/policy/${policyId}...`);
      await testEndpoint('GET', `/exposures/policy/${policyId}`);
      console.log('');
    }
  }
  
  // Test 8: Search exposures
  console.log('8. Testing GET /exposures/search...');
  await testEndpoint('GET', '/exposures/search?occupancyType=Residential');
  console.log('');
  
  // Test 9: Get statistics
  console.log('9. Testing GET /exposures/statistics/summary...');
  await testEndpoint('GET', '/exposures/statistics/summary');
  console.log('');
  
  // Test 10: Create new exposure (POST)
  console.log('10. Testing POST /exposures...');
  const newExposure = {
    exposureId: `EXP-${Date.now().toString().substring(4)}`,
    accountId: 'ACC-000001',
    policyId: 'POL-00000001',
    locationId: 'LOC-00000001',
    exposureType: 'Property',
    totalValue: 1000000,
    currency: 'USD',
    occupancyType: 'Residential',
    constructionType: 'Frame',
    yearBuilt: 2020,
    squareFootage: 2500,
    numberOfStories: 2,
    perilExposures: [
      {
        peril: 'Earthquake',
        exposureAmount: 800000,
        deductible: 10000
      }
    ],
    location: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    status: 'Active',
    createdBy: 'api-test',
    lastModifiedBy: 'api-test'
  };
  
  const createdExposure = await testEndpoint('POST', '/exposures', newExposure);
  console.log('');
  
  // Test 11: Update exposure (PUT)
  if (createdExposure && createdExposure.data) {
    console.log(`11. Testing PUT /exposures/${createdExposure.data.exposureId}...`);
    await testEndpoint('PUT', `/exposures/${createdExposure.data.exposureId}`, {
      totalValue: 1100000
    });
    console.log('');
    
    // Test 12: Delete exposure (DELETE)
    console.log(`12. Testing DELETE /exposures/${createdExposure.data.exposureId}...`);
    await testEndpoint('DELETE', `/exposures/${createdExposure.data.exposureId}`);
    console.log('');
  }
  
  console.log('========================================');
  console.log('✅ All Exposure API Tests Complete!');
  console.log('========================================\n');
}

// Run tests
runTests().catch(console.error);
