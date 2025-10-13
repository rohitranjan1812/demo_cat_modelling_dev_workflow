#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function checkMongoDBConfig() {
  console.log('🔍 MongoDB Configuration Analysis');
  console.log('=' .repeat(50));
  
  try {
    // Check environment variables
    console.log('📋 Environment Configuration:');
    console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
    console.log(`MONGODB_TEST_URI: ${process.env.MONGODB_TEST_URI}`);
    console.log(`USE_MOCK_DB: ${process.env.USE_MOCK_DB}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log();

    // Determine which URI to use
    const mongoUri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;
    
    console.log(`🔗 Attempting connection to: ${mongoUri}`);
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Check replica set status
    console.log('\n🏗️ Checking MongoDB Configuration:');
    
    try {
      const adminDb = mongoose.connection.db.admin();
      const replSetStatus = await adminDb.command({ replSetGetStatus: 1 });
      
      console.log('✅ Replica Set Configuration:');
      console.log(`  Set Name: ${replSetStatus.set}`);
      console.log(`  Members: ${replSetStatus.members.length}`);
      console.log('  Transaction Support: ✅ AVAILABLE');
      
      // List members
      console.log('\n📋 Replica Set Members:');
      replSetStatus.members.forEach((member, index) => {
        console.log(`  ${index + 1}. ${member.name} - ${member.stateStr} ${member.health === 1 ? '✅' : '❌'}`);
      });
      
    } catch (replError) {
      console.log('❌ Replica Set Status Check Failed:');
      console.log(`  Error: ${replError.message}`);
      console.log('  MongoDB Configuration: STANDALONE');
      console.log('  Transaction Support: ❌ NOT AVAILABLE');
      
      // Check if we can create a simple replica set
      console.log('\n🛠️ Checking if we can initialize a replica set...');
      
      try {
        // Try to initialize replica set (only works if none exists)
        const initResult = await mongoose.connection.db.admin().command({
          replSetInitiate: {
            _id: 'rs0',
            members: [
              { _id: 0, host: 'localhost:27017' }
            ]
          }
        });
        console.log('✅ Successfully initialized replica set:', initResult);
      } catch (initError) {
        console.log(`❌ Cannot initialize replica set: ${initError.message}`);
        
        if (initError.message.includes('already initialized')) {
          console.log('ℹ️  Replica set may already exist but not properly configured');
        } else if (initError.message.includes('not authorized')) {
          console.log('ℹ️  Need admin privileges to configure replica set');
        }
      }
    }
    
    // Test basic operations
    console.log('\n🧪 Testing Basic Operations:');
    
    // Test collection operations
    const testCollection = mongoose.connection.db.collection('test_connectivity');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Insert operation successful');
    
    const doc = await testCollection.findOne({ test: 'connection' });
    console.log('✅ Query operation successful');
    
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Delete operation successful');
    
    // Test transaction capability
    console.log('\n🔄 Testing Transaction Capability:');
    
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      
      // Simple transaction test
      await testCollection.insertOne({ test: 'transaction' }, { session });
      await session.commitTransaction();
      await session.endSession();
      
      console.log('✅ Transaction operations successful');
      
      // Clean up
      await testCollection.deleteOne({ test: 'transaction' });
      
    } catch (txError) {
      console.log(`❌ Transaction test failed: ${txError.message}`);
      
      if (txError.message.includes('Transaction numbers are only allowed on a replica set member')) {
        console.log('💡 SOLUTION: MongoDB needs to be configured as a replica set for transactions');
        console.log('   Current setup is standalone MongoDB which doesn\'t support transactions');
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 DIAGNOSIS: MongoDB is not running');
      console.log('   Please start MongoDB service');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 DIAGNOSIS: Authentication issue');
      console.log('   Check MongoDB credentials');
    }
    
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
}

// Run the check
checkMongoDBConfig().catch(console.error);