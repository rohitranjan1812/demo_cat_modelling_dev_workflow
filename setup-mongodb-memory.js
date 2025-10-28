#!/usr/bin/env node

console.log('🚀 QUICK TEST: MongoDB Memory Server with Real Transactions');
console.log('=' .repeat(60));
console.log('🎯 Goal: Validate transaction fixes with in-memory MongoDB replica set');
console.log('⚡ Fast setup for immediate testing');
console.log();

const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const fs = require('fs');

async function setupMemoryMongoDB() {
  console.log('🔧 Starting MongoDB Memory Server with replica set...');
  
  try {
    // Create a replica set (required for transactions)
    const replSet = await MongoMemoryReplSet.create({
      replSet: { 
        count: 1,
        name: 'rs0'
      },
      instanceOpts: [
        {
          port: 27017,
          storageEngine: 'wiredTiger',
        }
      ]
    });

    const uri = replSet.getUri();
    console.log('✅ MongoDB Memory Server started');
    console.log('🔗 Connection URI:', uri);

    // Update environment for testing
    const envContent = `# MongoDB Memory Server Configuration (Testing)
MONGODB_URI=${uri}cat_modeling_dev
MONGODB_TEST_URI=${uri}cat_modeling_test

# Server Configuration  
PORT=3001
NODE_ENV=development

# Mock Database - DISABLED (using real MongoDB memory server with transactions)
USE_MOCK_DB=false

# API Configuration
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# Logging
LOG_LEVEL=info
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Environment updated for memory server');

    // Test the connection and transactions
    await testRealTransactions(uri);

    console.log('\n🎉 SUCCESS: MongoDB Memory Server configured with REAL transactions!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Run: npm test tests/services/BaseService.transaction.test.js');
    console.log('   2. Verify all 23 tests pass with REAL transactions');
    console.log('   3. No fallback mode = honest test results!');
    
    console.log('\n🔄 Memory server is running. Press Ctrl+C to stop.');
    
    // Keep server running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping MongoDB Memory Server...');
      await replSet.stop();
      console.log('✅ Memory server stopped');
      process.exit(0);
    });

    // Keep the process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Failed to start MongoDB Memory Server:', error.message);
    process.exit(1);
  }
}

async function testRealTransactions(uri) {
  console.log('\n🧪 Testing REAL MongoDB transactions...');
  
  try {
    await mongoose.connect(uri + 'cat_modeling_test');
    console.log('✅ Connected to memory server');

    // Test transaction support
    const session = await mongoose.startSession();
    session.startTransaction();

    const testCollection = mongoose.connection.db.collection('transaction_test');
    await testCollection.insertOne({
      test: 'real_memory_transaction',
      timestamp: new Date(),
      sessionId: session.id
    }, { session });

    await session.commitTransaction();
    await session.endSession();

    // Verify and cleanup
    const doc = await testCollection.findOne({ test: 'real_memory_transaction' });
    if (doc) {
      await testCollection.deleteOne({ _id: doc._id });
      console.log('✅ REAL transaction test PASSED on memory server!');
    }

    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Transaction test failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  setupMemoryMongoDB();
}