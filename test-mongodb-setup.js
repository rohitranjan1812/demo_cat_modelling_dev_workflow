#!/usr/bin/env node

console.log('🧪 Testing MongoDB Transaction Setup');
console.log('=' .repeat(40));

const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test?replicaSet=rs0');
    console.log('✅ Connected to MongoDB');
    
    // Test transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const testDoc = await mongoose.connection.db.collection('test').insertOne({
      test: 'real_transaction',
      timestamp: new Date()
    }, { session });
    
    await session.commitTransaction();
    await session.endSession();
    
    // Cleanup
    await mongoose.connection.db.collection('test').deleteOne({ _id: testDoc.insertedId });
    
    console.log('✅ REAL transaction test PASSED!');
    console.log('🎉 MongoDB is configured correctly for transactions');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('not running with --replSet')) {
      console.log('💡 Solution: Start MongoDB with replica set configuration');
      console.log('   Run: start-mongodb-replica.bat');
      console.log('   Then: mongo --eval "load(\'init-replica-set.js\')"');
    }
  }
}

testConnection();
