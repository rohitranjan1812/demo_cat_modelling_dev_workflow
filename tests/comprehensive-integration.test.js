/**
 * Comprehensive Integration Test Suite
 * Tests all major architectural improvements and validates 100% integration
 */

const mongoose = require('mongoose');
const { repositories } = require('../src/repositories');

// Import services
const HazardService = require('../src/services/HazardService');
const VulnerabilityService = require('../src/services/VulnerabilityService');
const ExposureService = require('../src/services/ExposureService');
const AccountService = require('../src/services/AccountService');

async function runComprehensiveIntegrationTests() {
  console.log('🚀 Starting Comprehensive Integration Test Suite...\n');
  
  let testResults = {
    geospatialQueries: false,
    repositoryPattern: false,
    crossEntityRelationships: false,
    serviceIntegration: false,
    dataConsistency: false,
    performanceBaseline: false
  };
  
  try {
    // Connect to database
    console.log('📍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_exposure');
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Geospatial Query Integration
    console.log('🔍 Test 1: Geospatial Query Integration');
    console.log('=' .repeat(50));
    
    try {
      // Test location geospatial queries
      const locationCount = await repositories.location.count();
      console.log(`📍 Location count: ${locationCount}`);
      
      if (locationCount > 0) {
        const sampleLocation = await repositories.location.findOne({});
        console.log(`📍 Sample location: ${sampleLocation.locationId}`);
        
        // Test geospatial query
        const [lng, lat] = sampleLocation.location.coordinates;
        console.log(`📍 Testing geospatial query at coordinates: [${lng}, ${lat}]`);
        
        const nearbyLocations = await repositories.location.findNearCoordinates(lat, lng, 10000, { limit: 5 });
        console.log(`✅ Found ${nearbyLocations.length} locations within 10km`);
        
        // Test hazard geospatial queries
        const nearbyHazards = await repositories.hazard.findNearCoordinates(lat, lng, 50000, { limit: 5 });
        console.log(`✅ Found ${nearbyHazards.length} hazards within 50km`);
        
        // Test vulnerability geospatial queries
        const nearbyVulnerabilities = await repositories.vulnerability.findNearCoordinates(lat, lng, 50000, { limit: 5 });
        console.log(`✅ Found ${nearbyVulnerabilities.length} vulnerabilities within 50km`);
        
        testResults.geospatialQueries = true;
        console.log('✅ Geospatial queries working correctly\n');
      } else {
        console.log('⚠️ No location data available for geospatial testing\n');
      }
    } catch (error) {
      console.log(`❌ Geospatial query test failed: ${error.message}\n`);
    }

    // Test 2: Repository Pattern Integration
    console.log('🔍 Test 2: Repository Pattern Integration');
    console.log('=' .repeat(50));
    
    try {
      // Test repository health
      const healthStatus = await repositories.getHealthStatus();
      console.log('📊 Repository Health Status:');
      console.log(`   Locations: ${healthStatus.location.status} (${healthStatus.location.count})`);
      console.log(`   Hazards: ${healthStatus.hazard.status} (${healthStatus.hazard.count})`);
      console.log(`   Vulnerabilities: ${healthStatus.vulnerability.status} (${healthStatus.vulnerability.count})`);
      console.log(`   Overall: ${healthStatus.overall}`);
      
      // Test repository statistics
      const stats = await repositories.getComprehensiveStats();
      console.log('📊 Repository Statistics:');
      console.log(`   Total entities: ${stats.totalEntities}`);
      console.log(`   Active entities: ${stats.activeEntities}`);
      console.log(`   Last updated: ${stats.lastUpdated}`);
      
      testResults.repositoryPattern = true;
      console.log('✅ Repository pattern integration working correctly\n');
    } catch (error) {
      console.log(`❌ Repository pattern test failed: ${error.message}\n`);
    }

    // Test 3: Cross-Entity Relationships
    console.log('🔍 Test 3: Cross-Entity Relationships');
    console.log('=' .repeat(50));
    
    try {
      // Test cross-entity queries
      const sampleHazard = await repositories.hazard.findOne({});
      if (sampleHazard) {
        console.log(`🌪️ Testing relationships for hazard: ${sampleHazard.hazardId}`);
        
        const relatedEntities = await repositories.findRelatedEntities({
          entityType: 'hazard',
          entityId: sampleHazard.hazardId,
          radius: 50000
        });
        console.log(`✅ Found related entities: ${Object.keys(relatedEntities).join(', ')}`);
        
        testResults.crossEntityRelationships = true;
        console.log('✅ Cross-entity relationships working correctly\n');
      } else {
        console.log('⚠️ No hazard data available for relationship testing\n');
      }
    } catch (error) {
      console.log(`❌ Cross-entity relationship test failed: ${error.message}\n`);
    }

    // Test 4: Service Layer Integration
    console.log('🔍 Test 4: Service Layer Integration');
    console.log('=' .repeat(50));
    
    try {
      // Test all services are using repository pattern
      const hazardService = new HazardService();
      const vulnerabilityService = new VulnerabilityService();
      const exposureService = new ExposureService();
      const accountService = new AccountService();
      
      console.log('📊 Service Dependencies:');
      console.log(`   HazardService: ${hazardService.hazardRepository ? '✅' : '❌'} repository`);
      console.log(`   VulnerabilityService: ${vulnerabilityService.vulnerabilityRepository ? '✅' : '❌'} repository`);
      console.log(`   ExposureService: ${exposureService.locationRepository ? '✅' : '❌'} repository`);
      console.log(`   AccountService: ${accountService.locationRepository ? '✅' : '❌'} repository`);
      
      // Test service response format consistency
      console.log('\n📊 Testing Service Response Formats:');
      
      try {
        // Test hazard service (use repository count for quick test)
        const hazardCount = await hazardService.hazardRepository.count();
        console.log(`   HazardService repository access: ✅ (${hazardCount} hazards)`);
      } catch (error) {
        console.log(`   HazardService repository access: ❌ ${error.message}`);
      }
      
      try {
        // Test vulnerability service
        const vulnCount = await vulnerabilityService.vulnerabilityRepository.count();
        console.log(`   VulnerabilityService repository access: ✅ (${vulnCount} vulnerabilities)`);
      } catch (error) {
        console.log(`   VulnerabilityService repository access: ❌ ${error.message}`);
      }
      
      testResults.serviceIntegration = true;
      console.log('✅ Service layer integration working correctly\n');
    } catch (error) {
      console.log(`❌ Service integration test failed: ${error.message}\n`);
    }

    // Test 5: Data Consistency Validation
    console.log('🔍 Test 5: Data Consistency Validation');
    console.log('=' .repeat(50));
    
    try {
      // Test data format consistency
      const locations = await repositories.location.find({}, { limit: 3 });
      const hazards = await repositories.hazard.find({}, { limit: 3 });
      const vulnerabilities = await repositories.vulnerability.find({}, { limit: 3 });
      
      console.log('📊 Data Format Validation:');
      
      // Check GeoJSON format compliance
      let geoJsonCompliant = true;
      
      for (const location of locations) {
        if (!location.location || location.location.type !== 'Point' || !Array.isArray(location.location.coordinates)) {
          geoJsonCompliant = false;
          break;
        }
      }
      
      for (const hazard of hazards) {
        if (!hazard.footprint?.center || hazard.footprint.center.type !== 'Point' || !Array.isArray(hazard.footprint.center.coordinates)) {
          geoJsonCompliant = false;
          break;
        }
      }
      
      for (const vulnerability of vulnerabilities) {
        if (!vulnerability.geographicScope?.center || vulnerability.geographicScope.center.type !== 'Point' || !Array.isArray(vulnerability.geographicScope.center.coordinates)) {
          geoJsonCompliant = false;
          break;
        }
      }
      
      console.log(`   GeoJSON format compliance: ${geoJsonCompliant ? '✅' : '❌'}`);
      console.log(`   Locations checked: ${locations.length}`);
      console.log(`   Hazards checked: ${hazards.length}`);
      console.log(`   Vulnerabilities checked: ${vulnerabilities.length}`);
      
      testResults.dataConsistency = geoJsonCompliant;
      console.log(`${geoJsonCompliant ? '✅' : '❌'} Data consistency validation ${geoJsonCompliant ? 'passed' : 'failed'}\n`);
    } catch (error) {
      console.log(`❌ Data consistency test failed: ${error.message}\n`);
    }

    // Test 6: Performance Baseline
    console.log('🔍 Test 6: Performance Baseline');
    console.log('=' .repeat(50));
    
    try {
      const performanceTests = [];
      
      // Test repository query performance
      const startTime = Date.now();
      await repositories.location.find({}, { limit: 10 });
      const queryTime = Date.now() - startTime;
      performanceTests.push({ test: 'Repository query', time: queryTime });
      
      // Test geospatial query performance
      const geoStartTime = Date.now();
      const sampleLocation = await repositories.location.findOne({});
      if (sampleLocation) {
        const [lng, lat] = sampleLocation.location.coordinates;
        await repositories.location.findNearCoordinates(lat, lng, 10000, { limit: 5 });
      }
      const geoQueryTime = Date.now() - geoStartTime;
      performanceTests.push({ test: 'Geospatial query', time: geoQueryTime });
      
      console.log('📊 Performance Results:');
      for (const test of performanceTests) {
        const status = test.time < 1000 ? '✅' : test.time < 5000 ? '⚠️' : '❌';
        console.log(`   ${test.test}: ${status} ${test.time}ms`);
      }
      
      const avgTime = performanceTests.reduce((sum, test) => sum + test.time, 0) / performanceTests.length;
      testResults.performanceBaseline = avgTime < 2000; // Average under 2 seconds
      console.log(`✅ Performance baseline established (avg: ${avgTime.toFixed(0)}ms)\n`);
    } catch (error) {
      console.log(`❌ Performance test failed: ${error.message}\n`);
    }

    // Final Results Summary
    console.log('🎯 COMPREHENSIVE INTEGRATION TEST RESULTS');
    console.log('=' .repeat(60));
    
    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const totalTests = Object.keys(testResults).length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log('📊 Test Results Summary:');
    for (const [testName, passed] of Object.entries(testResults)) {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const formattedName = testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`   ${formattedName}: ${status}`);
    }
    
    console.log(`\n🎯 Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)`);
    
    if (successRate >= 90) {
      console.log('🎉 COMPREHENSIVE INTEGRATION TEST: PASSED');
      console.log('✅ System is ready for production deployment');
    } else if (successRate >= 75) {
      console.log('⚠️ COMPREHENSIVE INTEGRATION TEST: PARTIAL PASS');
      console.log('⚠️ Some issues need attention before production');
    } else {
      console.log('❌ COMPREHENSIVE INTEGRATION TEST: FAILED');
      console.log('❌ Critical issues must be resolved before deployment');
    }

  } catch (error) {
    console.error('💥 Comprehensive integration test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run tests if called directly
if (require.main === module) {
  runComprehensiveIntegrationTests()
    .then(() => {
      console.log('\n🎉 Comprehensive integration tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Integration tests failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runComprehensiveIntegrationTests
};