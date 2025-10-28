/**
 * Database Index Management
 * Ensures all required indexes are created for proper database operation
 */

const mongoose = require('mongoose');

/**
 * Create all required database indexes
 */
async function createDatabaseIndexes() {
  try {
    console.log('🔍 Creating database indexes...');
    
    const db = mongoose.connection.db;
    
    // Users collection indexes
    await db.collection('users').createIndex({ userId: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ User indexes created');
    
    // Accounts collection indexes
    await db.collection('accounts').createIndex({ accountId: 1 }, { unique: true });
    await db.collection('accounts').createIndex({ accountName: 1 });
    await db.collection('accounts').createIndex({ regions: 1 });
    console.log('✅ Account indexes created');
    
    // Hazards collection indexes
    await db.collection('hazards').createIndex({ hazardId: 1 }, { unique: true });
    await db.collection('hazards').createIndex({ hazardType: 1 });
    await db.collection('hazards').createIndex({ severity: 1 });
    await db.collection('hazards').createIndex({ 'footprint.centerLatitude': 1, 'footprint.centerLongitude': 1 });
    console.log('✅ Hazard indexes created');
    
    // HazardEvents collection indexes
    await db.collection('hazardevents').createIndex({ eventId: 1 }, { unique: true });
    await db.collection('hazardevents').createIndex({ hazardType: 1 });
    await db.collection('hazardevents').createIndex({ eventStatus: 1 });
    await db.collection('hazardevents').createIndex({ 'temporal.startTime': 1 });
    console.log('✅ HazardEvent indexes created');
    
    // Vulnerabilities collection indexes
    await db.collection('vulnerabilities').createIndex({ vulnerabilityId: 1 }, { unique: true });
    await db.collection('vulnerabilities').createIndex({ vulnerabilityType: 1 });
    await db.collection('vulnerabilities').createIndex({ overallRiskLevel: 1 });
    await db.collection('vulnerabilities').createIndex({ 'location.latitude': 1, 'location.longitude': 1 });
    console.log('✅ Vulnerability indexes created');
    
    // Simulations collection indexes
    await db.collection('simulations').createIndex({ simulationId: 1 }, { unique: true });
    await db.collection('simulations').createIndex({ status: 1 });
    await db.collection('simulations').createIndex({ simulationType: 1 });
    console.log('✅ Simulation indexes created');
    
    console.log('🎉 All database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    throw error;
  }
}

/**
 * Drop all indexes for fresh setup (use with caution)
 */
async function dropAllIndexes() {
  try {
    console.log('🗑️  Dropping all database indexes...');
    
    const db = mongoose.connection.db;
    const collections = ['users', 'accounts', 'hazards', 'hazardevents', 'vulnerabilities', 'simulations'];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).dropIndexes();
        console.log(`✅ Dropped indexes for ${collectionName}`);
      } catch (error) {
        // Collection might not exist, that's okay
        console.log(`⚠️  Collection ${collectionName} might not exist`);
      }
    }
    
    console.log('✅ All indexes dropped');
    
  } catch (error) {
    console.error('❌ Error dropping indexes:', error);
    throw error;
  }
}

/**
 * List all existing indexes
 */
async function listAllIndexes() {
  try {
    console.log('📋 Listing all database indexes...');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`\n📁 ${collection.name}:`);
      indexes.forEach(index => {
        console.log(`   - ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing indexes:', error);
    throw error;
  }
}

module.exports = {
  createDatabaseIndexes,
  dropAllIndexes,
  listAllIndexes
};