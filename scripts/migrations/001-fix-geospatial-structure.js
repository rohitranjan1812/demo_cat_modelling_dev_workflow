/**
 * Migration Script: Fix Geospatial Data Structure
 * 
 * Issue: Current models use separate lat/lng fields which are incompatible with MongoDB 2dsphere indexes
 * Fix: Convert to GeoJSON Point format for all location-based data
 * 
 * Date: October 6, 2025
 * Priority: CRITICAL - All proximity queries currently fail
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';

async function runGeospatialMigration() {
  try {
    console.log('🚀 Starting Geospatial Data Structure Migration...');
    console.log(`📍 Connecting to: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // 1. Migrate Location Collection
    console.log('\n📍 Migrating Location collection...');
    const locationStats = await migrateLocationCollection(db);
    
    // 2. Migrate Hazard Collection  
    console.log('\n🌪️ Migrating Hazard collection...');
    const hazardStats = await migrateHazardCollection(db);
    
    // 3. Migrate Vulnerability Collection
    console.log('\n🛡️ Migrating Vulnerability collection...');
    const vulnerabilityStats = await migrateVulnerabilityCollection(db);
    
    // 4. Migrate Exposure Collection (if has location data)
    console.log('\n🏢 Migrating Exposure collection...');
    const exposureStats = await migrateExposureCollection(db);
    
    // 4. Create/Update Geospatial Indexes
    console.log('\n🔍 Creating geospatial indexes...');
    await createGeospatialIndexes(db);
    
    // 5. Validation
    console.log('\n✅ Validating migration...');
    await validateMigration(db);
    
    // Summary
    console.log('\n🎉 Migration Complete!');
    console.log('📊 Migration Summary:');
    console.log(`   Locations migrated: ${locationStats.modified}`);
    console.log(`   Hazards migrated: ${hazardStats.modified}`);
    console.log(`   Exposures migrated: ${exposureStats.modified}`);
    console.log(`   Indexes created: 3`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

async function migrateLocationCollection(db) {
  const collection = db.collection('locations');
  let modified = 0;
  
  // Get all locations with old coordinate structure
  const locations = await collection.find({
    'coordinates.latitude': { $exists: true },
    'coordinates.longitude': { $exists: true }
  }).toArray();
  
  console.log(`   Found ${locations.length} locations to migrate`);
  
  for (const location of locations) {
    const { latitude, longitude, elevation = 0 } = location.coordinates;
    
    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.warn(`   ⚠️ Skipping invalid coordinates for location ${location._id}`);
      continue;
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.warn(`   ⚠️ Skipping out-of-range coordinates for location ${location._id}`);
      continue;
    }
    
    // Update to GeoJSON format
    await collection.updateOne(
      { _id: location._id },
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
          },
          elevation: elevation
        },
        $unset: {
          coordinates: 1 // Remove old structure
        }
      }
    );
    
    modified++;
    
    if (modified % 100 === 0) {
      console.log(`   📍 Migrated ${modified} locations...`);
    }
  }
  
  return { total: locations.length, modified };
}

async function migrateHazardCollection(db) {
  const collection = db.collection('hazards');
  let modified = 0;
  
  // Get all hazards with old footprint structure
  const hazards = await collection.find({
    'footprint.centerLatitude': { $exists: true },
    'footprint.centerLongitude': { $exists: true }
  }).toArray();
  
  console.log(`   Found ${hazards.length} hazards to migrate`);
  
  for (const hazard of hazards) {
    const { centerLatitude, centerLongitude, ...footprintRest } = hazard.footprint;
    
    // Validate coordinates
    if (typeof centerLatitude !== 'number' || typeof centerLongitude !== 'number') {
      console.warn(`   ⚠️ Skipping invalid coordinates for hazard ${hazard._id}`);
      continue;
    }
    
    if (centerLatitude < -90 || centerLatitude > 90 || centerLongitude < -180 || centerLongitude > 180) {
      console.warn(`   ⚠️ Skipping out-of-range coordinates for hazard ${hazard._id}`);
      continue;
    }
    
    // Update to GeoJSON format
    await collection.updateOne(
      { _id: hazard._id },
      {
        $set: {
          'footprint.center': {
            type: 'Point',
            coordinates: [centerLongitude, centerLatitude] // GeoJSON format: [lng, lat]
          }
        },
        $unset: {
          'footprint.centerLatitude': 1,
          'footprint.centerLongitude': 1
        }
      }
    );
    
    modified++;
    
    if (modified % 100 === 0) {
      console.log(`   🌪️ Migrated ${modified} hazards...`);
    }
  }
  
  return { total: hazards.length, modified };
}

async function migrateExposureCollection(db) {
  const collection = db.collection('exposures');
  let modified = 0;
  
  // Check if exposures have location data that needs migration
  const exposures = await collection.find({
    $or: [
      { 'location.latitude': { $exists: true } },
      { 'coordinates.latitude': { $exists: true } }
    ]
  }).toArray();
  
  console.log(`   Found ${exposures.length} exposures to migrate`);
  
  for (const exposure of exposures) {
    let updateObj = {};
    let unsetObj = {};
    
    // Handle location field
    if (exposure.location && exposure.location.latitude && exposure.location.longitude) {
      updateObj['location'] = {
        type: 'Point',
        coordinates: [exposure.location.longitude, exposure.location.latitude]
      };
      if (exposure.location.elevation) {
        updateObj['elevation'] = exposure.location.elevation;
      }
    }
    
    // Handle coordinates field (if exists)
    if (exposure.coordinates && exposure.coordinates.latitude && exposure.coordinates.longitude) {
      updateObj['coordinates'] = {
        type: 'Point',
        coordinates: [exposure.coordinates.longitude, exposure.coordinates.latitude]
      };
      if (exposure.coordinates.elevation) {
        updateObj['elevation'] = exposure.coordinates.elevation;
      }
    }
    
    if (Object.keys(updateObj).length > 0) {
      await collection.updateOne(
        { _id: exposure._id },
        {
          $set: updateObj,
          $unset: unsetObj
        }
      );
      modified++;
    }
  }
  
  return { total: exposures.length, modified };
}

async function migrateVulnerabilityCollection(db) {
  const collection = db.collection('vulnerabilities');
  let modified = 0;
  
  // Get all vulnerabilities with old geographicScope structure
  const vulnerabilities = await collection.find({
    'geographicScope.centerLatitude': { $exists: true },
    'geographicScope.centerLongitude': { $exists: true }
  }).toArray();
  
  console.log(`   Found ${vulnerabilities.length} vulnerabilities to migrate`);
  
  for (const vulnerability of vulnerabilities) {
    const { centerLatitude, centerLongitude, ...scopeRest } = vulnerability.geographicScope;
    
    // Validate coordinates
    if (typeof centerLatitude !== 'number' || typeof centerLongitude !== 'number') {
      console.warn(`   ⚠️ Skipping invalid coordinates for vulnerability ${vulnerability._id}`);
      continue;
    }
    
    if (centerLatitude < -90 || centerLatitude > 90 || centerLongitude < -180 || centerLongitude > 180) {
      console.warn(`   ⚠️ Skipping out-of-range coordinates for vulnerability ${vulnerability._id}`);
      continue;
    }
    
    // Update to GeoJSON format
    await collection.updateOne(
      { _id: vulnerability._id },
      {
        $set: {
          'geographicScope.center': {
            type: 'Point',
            coordinates: [centerLongitude, centerLatitude] // GeoJSON format: [lng, lat]
          }
        },
        $unset: {
          'geographicScope.centerLatitude': 1,
          'geographicScope.centerLongitude': 1
        }
      }
    );
    
    modified++;
    
    if (modified % 100 === 0) {
      console.log(`   🛡️ Migrated ${modified} vulnerabilities...`);
    }
  }
  
  return { total: vulnerabilities.length, modified };
}

async function createGeospatialIndexes(db) {
  try {
    // Create 2dsphere index on Location.location
    await db.collection('locations').createIndex(
      { location: '2dsphere' },
      { name: 'location_2dsphere', background: true }
    );
    console.log('   ✅ Created 2dsphere index on locations.location');
    
    // Create 2dsphere index on Hazard.footprint.center
    await db.collection('hazards').createIndex(
      { 'footprint.center': '2dsphere' },
      { name: 'footprint_center_2dsphere', background: true }
    );
    console.log('   ✅ Created 2dsphere index on hazards.footprint.center');
    
    // Create 2dsphere index on Vulnerability.geographicScope.center
    await db.collection('vulnerabilities').createIndex(
      { 'geographicScope.center': '2dsphere' },
      { name: 'geographic_scope_center_2dsphere', background: true }
    );
    console.log('   ✅ Created 2dsphere index on vulnerabilities.geographicScope.center');
    
    // Create 2dsphere index on Exposure.location (if exists)
    const exposureIndexExists = await db.collection('exposures').indexExists('location_2dsphere');
    if (!exposureIndexExists) {
      await db.collection('exposures').createIndex(
        { location: '2dsphere' },
        { name: 'location_2dsphere', background: true, sparse: true }
      );
      console.log('   ✅ Created 2dsphere index on exposures.location');
    }
    
  } catch (error) {
    console.error('   ❌ Error creating indexes:', error.message);
    throw error;
  }
}

async function validateMigration(db) {
  try {
    // Test Location queries
    const locationCount = await db.collection('locations').countDocuments({
      location: { $exists: true, $ne: null }
    });
    console.log(`   📍 Locations with GeoJSON: ${locationCount}`);
    
    // Test Hazard queries
    const hazardCount = await db.collection('hazards').countDocuments({
      'footprint.center': { $exists: true, $ne: null }
    });
    console.log(`   🌪️ Hazards with GeoJSON: ${hazardCount}`);
    
    // Test Vulnerability queries
    const vulnerabilityCount = await db.collection('vulnerabilities').countDocuments({
      'geographicScope.center': { $exists: true, $ne: null }
    });
    console.log(`   🛡️ Vulnerabilities with GeoJSON: ${vulnerabilityCount}`);
    
    // Test a simple geospatial query
    const testLocation = await db.collection('locations').findOne({
      location: { $exists: true }
    });
    
    if (testLocation) {
      const nearbyLocations = await db.collection('locations').find({
        location: {
          $near: {
            $geometry: testLocation.location,
            $maxDistance: 10000 // 10km
          }
        }
      }).limit(5).toArray();
      
      console.log(`   🔍 Test proximity query found ${nearbyLocations.length} nearby locations`);
    }
    
    console.log('   ✅ Migration validation passed');
    
  } catch (error) {
    console.error('   ❌ Validation failed:', error.message);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runGeospatialMigration()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runGeospatialMigration,
  migrateLocationCollection,
  migrateHazardCollection,
  migrateVulnerabilityCollection,
  migrateExposureCollection,
  createGeospatialIndexes,
  validateMigration
};