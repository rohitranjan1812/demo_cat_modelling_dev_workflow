#!/usr/bin/env node

console.log('🔧 MongoDB Replica Set Initializer');
console.log('=' .repeat(40));

const { MongoClient } = require('mongodb');

async function initializeReplicaSet() {
  const client = new MongoClient('mongodb://localhost:27017', {
    directConnection: true,
    serverSelectionTimeoutMS: 5000
  });

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully');

    const adminDb = client.db('admin');
    
    // Check if replica set is already initialized
    try {
      const status = await adminDb.command({ replSetGetStatus: 1 });
      console.log('✅ Replica set already initialized');
      console.log(`   Set Name: ${status.set}`);
      console.log(`   Members: ${status.members.length}`);
      return true;
    } catch (error) {
      if (error.codeName === 'NotYetInitialized' || error.code === 94) {
        console.log('🔧 Initializing replica set...');
        
        const config = {
          _id: 'rs0',
          members: [
            { _id: 0, host: 'localhost:27017' }
          ]
        };
        
        const result = await adminDb.command({ replSetInitiate: config });
        console.log('✅ Replica set initialized successfully');
        console.log('⏳ Waiting for replica set to be ready...');
        
        // Wait for replica set to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Failed to initialize replica set:', error.message);
    return false;
  } finally {
    await client.close();
  }
}

async function testTransactions() {
  console.log('\n🧪 Testing REAL MongoDB transactions...');
  
  const client = new MongoClient('mongodb://localhost:27017/?replicaSet=rs0');
  
  try {
    await client.connect();
    console.log('✅ Connected with replica set');
    
    // Test transaction
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        const db = client.db('cat_modeling_test');
        const collection = db.collection('transaction_test');
        
        await collection.insertOne({
          test: 'real_transaction',
          timestamp: new Date(),
          sessionId: session.id
        }, { session });
        
        console.log('✅ Document inserted in transaction');
      });
      
      console.log('✅ REAL transaction test PASSED!');
      
      // Cleanup
      const db = client.db('cat_modeling_test');
      await db.collection('transaction_test').deleteMany({ test: 'real_transaction' });
      
    } finally {
      await session.endSession();
    }
    
  } catch (error) {
    console.error('❌ Transaction test failed:', error.message);
    return false;
  } finally {
    await client.close();
  }
  
  return true;
}

async function main() {
  const initialized = await initializeReplicaSet();
  
  if (initialized) {
    const transactionsWork = await testTransactions();
    
    if (transactionsWork) {
      console.log('\n🎉 SUCCESS: MongoDB configured with REAL transactions!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Run: npm test tests/services/BaseService.transaction.test.js');
      console.log('   2. Verify all 23 tests pass with REAL MongoDB transactions');
      console.log('   3. No more dangerous fallback mode!');
      console.log('\n🎯 Critical Issue RESOLVED:');
      console.log('   ❌ Fallback mode removed');
      console.log('   ✅ Real ACID transactions enabled');
      console.log('   ✅ Production-safe testing');
    }
  }
}

main();