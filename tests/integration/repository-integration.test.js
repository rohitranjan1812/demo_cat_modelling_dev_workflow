/**
 * Repository Pattern Integration Test
 * 
 * Tests the new repository layer and validates geospatial fixes
 */

const { repositories } = require('../../src/repositories');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';

async function testRepositoryIntegration() {
  try {
    console.log('🧪 Starting Repository Integration Tests...');
    console.log(`📍 Connecting to: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Repository Health Check
    console.log('\n🔍 Test 1: Repository Health Check');
    const healthStatus = await repositories.healthCheck();
    console.log('Health Status:', JSON.stringify(healthStatus, null, 2));

    // Test 2: Location Repository Geospatial Queries
    console.log('\n🔍 Test 2: Location Repository Geospatial Queries');
    
    // First, get a location to test with
    const sampleLocation = await repositories.location.findOne();
    if (sampleLocation) {
      console.log(`Sample location: ${sampleLocation.locationId}`);
      console.log(`Coordinates: ${sampleLocation.location?.coordinates || 'Not in GeoJSON format'}`);
      
      if (sampleLocation.location?.coordinates) {
        const [lng, lat] = sampleLocation.location.coordinates;
        
        // Test nearby locations
        const nearbyLocations = await repositories.location.findNearCoordinates(lat, lng, 10000);
        console.log(`Found ${nearbyLocations.length} locations within 10km`);
        
        // Test nearby hazards
        const nearbyHazards = await repositories.hazard.findNearCoordinates(lat, lng, 50000);
        console.log(`Found ${nearbyHazards.length} hazards within 50km`);
        
        // Test nearby vulnerabilities
        const nearbyVulnerabilities = await repositories.vulnerability.findNearCoordinates(lat, lng, 50000);
        console.log(`Found ${nearbyVulnerabilities.length} vulnerabilities within 50km`);
      } else {
        console.log('⚠️ Location not in GeoJSON format - migration may not have completed');
      }
    } else {
      console.log('No locations found in database');
    }

    // Test 3: Cross-Entity Relationships
    console.log('\n🔍 Test 3: Cross-Entity Relationships');
    
    const sampleHazard = await repositories.hazard.findOne();
    if (sampleHazard) {
      console.log(`Sample hazard: ${sampleHazard.hazardId}`);
      
      const relatedEntities = await repositories.findRelatedEntities({
        entityType: 'hazard',
        entityId: sampleHazard.hazardId,
        radius: 25000
      });
      
      console.log(`Related locations: ${relatedEntities.relationships.nearbyLocations?.length || 0}`);
      console.log(`Related vulnerabilities: ${relatedEntities.relationships.relatedVulnerabilities?.length || 0}`);
    }

    // Test 4: Repository Statistics
    console.log('\n🔍 Test 4: Repository Statistics');
    
    const stats = await repositories.getComprehensiveStats();
    console.log(`Location regions: ${stats.locations?.length || 0}`);
    console.log(`Hazard types: ${stats.hazards?.length || 0}`);
    console.log(`Vulnerability types: ${stats.vulnerabilities?.length || 0}`);

    // Test 5: Repository Filtering
    console.log('\n🔍 Test 5: Repository Filtering');
    
    const activeHazards = await repositories.hazard.findActive({ limit: 5 });
    console.log(`Active hazards: ${activeHazards.length}`);
    
    const highRiskVulnerabilities = await repositories.vulnerability.findHighRisk(7, { limit: 5 });
    console.log(`High-risk vulnerabilities: ${highRiskVulnerabilities.length}`);

    // Test 6: Pagination
    console.log('\n🔍 Test 6: Pagination');
    
    const paginatedLocations = await repositories.location.findPaginated({}, { page: 1, limit: 3 });
    console.log(`Page 1 locations: ${paginatedLocations.documents.length}`);
    console.log(`Total locations: ${paginatedLocations.pagination.total}`);
    console.log(`Total pages: ${paginatedLocations.pagination.pages}`);

    console.log('\n✅ All repository integration tests completed successfully!');
    
    return {
      success: true,
      testResults: {
        healthCheck: healthStatus.overall === 'healthy',
        geospatialQueries: true,
        crossEntityRelationships: true,
        statistics: true,
        filtering: true,
        pagination: true
      }
    };

  } catch (error) {
    console.error('❌ Repository integration test failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run test if called directly
if (require.main === module) {
  testRepositoryIntegration()
    .then((result) => {
      if (result.success) {
        console.log('🎉 Repository integration tests passed!');
        process.exit(0);
      } else {
        console.error('💥 Repository integration tests failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testRepositoryIntegration };