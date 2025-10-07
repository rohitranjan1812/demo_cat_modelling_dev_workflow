const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testCreateExposure() {
  console.log('Testing exposure creation...\n');
  
  const newExposure = {
    // Required system fields
    exposureId: `EXP-TEST-${Date.now()}`,
    createdBy: 'e2e-test-user',
    lastModifiedBy: 'e2e-test-user',
    
    // Basic data
    exposureType: 'Property',
    status: 'Active',
    accountId: 'ACC-000001', // Global Insurance Corp (exists in seed data)
    policyId: 'POL-87654321', // Test policy (created by seed script)
    locationId: 'LOC-11223344', // Test location (created by seed script)
    effectiveDate: new Date('2025-01-01'),
    expiryDate: new Date('2025-12-31'),
    location: {
      latitude: 34.0522,
      longitude: -118.2437
    },
    occupancyType: 'Commercial',
    constructionType: 'Concrete',
    yearBuilt: 2015,
    numberOfStories: 5,
    squareFootage: 50000,
    currency: 'USD',
    totalInsuredValue: 5000000,
    replacementValue: 6000000,
    perilExposures: [
      {
        peril: 'Earthquake',
        exposureAmount: 3000000,
        deductible: 250000
      },
      {
        peril: 'Wildfire',
        exposureAmount: 2000000,
        deductible: 150000
      }
    ]
  };
  
  console.log('Sending request to:', `${BASE_URL}/exposures`);
  console.log('Data:', JSON.stringify(newExposure, null, 2));
  
  try {
    const response = await axios.post(`${BASE_URL}/exposures`, newExposure);
    console.log('\n✅ SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('\n❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Error:', JSON.stringify(error.response?.data, null, 2));
    console.log('Full error:', error.message);
  }
}

testCreateExposure();
