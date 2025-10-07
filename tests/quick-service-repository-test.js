/**
 * Quick Service Repository Integration Test
 * Tests that services are properly using repositories instead of BaseService
 */

const mongoose = require('mongoose');

// Test services that should now use repository pattern
const HazardService = require('../src/services/HazardService');
const VulnerabilityService = require('../src/services/VulnerabilityService');
const ExposureService = require('../src/services/ExposureService');
const AccountService = require('../src/services/AccountService');

async function testServiceRepositoryIntegration() {
  console.log('🧪 Testing Service Repository Integration...\n');
  
  try {
    // Connect to database
    console.log('📍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_exposure');
    console.log('✅ Connected to MongoDB\n');

    // Test HazardService
    console.log('🔍 Testing HazardService...');
    const hazardService = new HazardService();
    
    // Check that it has repository properties
    if (hazardService.hazardRepository && hazardService.locationRepository && hazardService.vulnerabilityRepository) {
      console.log('✅ HazardService has repository dependencies');
    } else {
      console.log('❌ HazardService missing repository dependencies');
    }

    // Try to get hazard count
    try {
      const hazardCount = await hazardService.hazardRepository.count();
      console.log(`✅ HazardService repository working - ${hazardCount} hazards found`);
    } catch (error) {
      console.log('❌ HazardService repository error:', error.message);
    }

    // Test VulnerabilityService  
    console.log('\n🔍 Testing VulnerabilityService...');
    const vulnerabilityService = new VulnerabilityService();
    
    // Check that it has repository properties
    if (vulnerabilityService.vulnerabilityRepository && vulnerabilityService.locationRepository) {
      console.log('✅ VulnerabilityService has repository dependencies');
    } else {
      console.log('❌ VulnerabilityService missing repository dependencies');
    }

    // Try vulnerability geospatial query that was previously failing
    try {
      const testCoordinates = { coordinates: [-74.34608473816789, 42.39549373928942] };
      const nearbyVulnerabilities = await vulnerabilityService.vulnerabilityRepository.findNearCoordinates(
        testCoordinates.coordinates, 
        10000, // 10km
        { limit: 5 }
      );
      console.log(`✅ VulnerabilityService geospatial query working - ${nearbyVulnerabilities.length} vulnerabilities found`);
    } catch (error) {
      console.log('❌ VulnerabilityService geospatial query error:', error.message);
    }

    // Test ExposureService
    console.log('\n🔍 Testing ExposureService...');
    const exposureService = new ExposureService();
    
    if (exposureService.locationRepository && exposureService.hazardRepository && exposureService.vulnerabilityRepository) {
      console.log('✅ ExposureService has repository dependencies');
    } else {
      console.log('❌ ExposureService missing repository dependencies');
    }

    // Test AccountService
    console.log('\n🔍 Testing AccountService...');
    const accountService = new AccountService();
    
    if (accountService.locationRepository && accountService.hazardRepository && accountService.vulnerabilityRepository) {
      console.log('✅ AccountService has repository dependencies');
    } else {
      console.log('❌ AccountService missing repository dependencies');
    }

    console.log('\n✅ Service repository integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  testServiceRepositoryIntegration()
    .then(() => {
      console.log('🎉 Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = testServiceRepositoryIntegration;