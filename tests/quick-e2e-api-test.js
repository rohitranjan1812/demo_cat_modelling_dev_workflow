/**
 * Quick E2E API Test Script
 * Tests backend API endpoints with seeded data
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testAPI() {
  console.log('\n🧪 Testing Backend API with Seeded Data');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  try {
    // Test 1: GET all exposures
    console.log('📋 Test 1: GET /api/v1/exposures (first 5)');
    const exposuresRes = await axios.get(`${API_BASE}/exposures?limit=5`);
    console.log(`✅ Status: ${exposuresRes.status}`);
    console.log(`✅ Total Exposures in DB: ${exposuresRes.data.total}`);
    console.log(`✅ Returned: ${exposuresRes.data.data.length} exposures`);
    console.log(`✅ Page: ${exposuresRes.data.page} of ${exposuresRes.data.pages}\n`);
    
    // Show sample exposure
    if (exposuresRes.data.data.length > 0) {
      const sample = exposuresRes.data.data[0];
      console.log('📄 Sample Exposure:');
      console.log(`   ID: ${sample.exposureId}`);
      console.log(`   Type: ${sample.exposureType}`);
      console.log(`   Account: ${sample.accountId}`);
      console.log(`   Location: ${sample.locationId}`);
      console.log(`   TIV: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: sample.currency }).format(sample.totalInsuredValue)}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Perils: ${sample.perils?.length || 0}\n`);
    }
    
    // Test 2: GET exposures by type
    console.log('📋 Test 2: Filter by exposureType=Property');
    const propertyRes = await axios.get(`${API_BASE}/exposures?exposureType=Property&limit=5`);
    console.log(`✅ Status: ${propertyRes.status}`);
    console.log(`✅ Property Exposures: ${propertyRes.data.total}\n`);
    
    // Test 3: GET exposures by account
    if (exposuresRes.data.data.length > 0) {
      const accountId = exposuresRes.data.data[0].accountId;
      console.log(`📋 Test 3: Filter by accountId=${accountId}`);
      const accountRes = await axios.get(`${API_BASE}/exposures?accountId=${accountId}`);
      console.log(`✅ Status: ${accountRes.status}`);
      console.log(`✅ Exposures for account: ${accountRes.data.total}\n`);
    }
    
    // Test 4: GET single exposure details
    if (exposuresRes.data.data.length > 0) {
      const exposureId = exposuresRes.data.data[0].exposureId;
      console.log(`📋 Test 4: GET /api/v1/exposures/${exposureId}`);
      const detailRes = await axios.get(`${API_BASE}/exposures/${exposureId}`);
      console.log(`✅ Status: ${detailRes.status}`);
      console.log(`✅ Exposure Details Retrieved:`);
      console.log(`   - ID: ${detailRes.data.data.exposureId}`);
      console.log(`   - Type: ${detailRes.data.data.exposureType}`);
      console.log(`   - Occupancy: ${detailRes.data.data.occupancyType}`);
      console.log(`   - Construction: ${detailRes.data.data.constructionType}`);
      console.log(`   - Year Built: ${detailRes.data.data.yearBuilt}`);
      console.log(`   - Location Coords: (${detailRes.data.data.location?.latitude}, ${detailRes.data.data.location?.longitude})`);
      console.log(`   - Perils: ${detailRes.data.data.perils?.map(p => p.peril).join(', ')}\n`);
    }
    
    // Test 5: GET exposure statistics
    console.log('📋 Test 5: GET /api/v1/exposures/statistics/summary');
    const statsRes = await axios.get(`${API_BASE}/exposures/statistics/summary`);
    console.log(`✅ Status: ${statsRes.status}`);
    console.log(`✅ Statistics:`);
    console.log(`   - Total Count: ${statsRes.data.data.totalCount}`);
    console.log(`   - Total Value: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(statsRes.data.data.totalValue)}`);
    console.log(`   - Avg Value: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(statsRes.data.data.averageValue)}`);
    console.log(`   - By Type:`, statsRes.data.data.byType);
    console.log(`   - By Status:`, statsRes.data.data.byStatus);
    console.log(`   - By Construction:`, statsRes.data.data.byConstructionType);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ All API Tests Passed!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Return data for frontend testing
    return {
      totalExposures: exposuresRes.data.total,
      sampleExposure: exposuresRes.data.data[0],
      statistics: statsRes.data.data
    };
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    console.error('\n═══════════════════════════════════════════════════════════════\n');
    throw error;
  }
}

// Run tests
testAPI()
  .then((data) => {
    console.log('📝 Ready for Frontend Testing!');
    console.log(`   - Backend: http://localhost:3001`);
    console.log(`   - Frontend: http://localhost:3000`);
    console.log(`   - Exposures Available: ${data.totalExposures}`);
    console.log(`\n🎯 Next: Open http://localhost:3000/exposures in your browser\n`);
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
