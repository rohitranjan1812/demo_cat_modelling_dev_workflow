#!/usr/bin/env node

console.log('🚨 CRITICAL: Setting up REAL MongoDB Transaction Testing');
console.log('=' .repeat(60));
console.log('⚠️  Removing dangerous fallback mode that masks production issues');
console.log('✅ Implementing MongoDB Atlas for real transaction testing');
console.log();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupMongoDBAtlas() {
  console.log('🔧 MongoDB Atlas Setup for Real Transaction Testing');
  console.log('=' .repeat(50));
  
  console.log('📋 MongoDB Atlas provides:');
  console.log('   ✅ Built-in replica set (transaction support)');
  console.log('   ✅ Production-grade configuration');
  console.log('   ✅ No local installation issues');
  console.log('   ✅ Real ACID transaction testing');
  console.log();
  
  console.log('🚀 Quick Setup Steps:');
  console.log('   1. Go to: https://cloud.mongodb.com/');
  console.log('   2. Sign up for free account');
  console.log('   3. Create a new cluster (M0 free tier)');
  console.log('   4. Create database user');
  console.log('   5. Whitelist IP address (0.0.0.0/0 for development)');
  console.log('   6. Get connection string');
  console.log();
  
  const proceed = await ask('Have you set up MongoDB Atlas? (y/n): ');
  
  if (proceed.toLowerCase() !== 'y') {
    console.log('📋 Please set up MongoDB Atlas first, then run this script again');
    rl.close();
    return;
  }
  
  console.log();
  const connectionString = await ask('Enter your MongoDB Atlas connection string: ');
  
  if (!connectionString || !connectionString.includes('mongodb+srv://')) {
    console.log('❌ Invalid connection string. Should start with mongodb+srv://');
    rl.close();
    return;
  }
  
  // Update environment
  const envContent = `# MongoDB Atlas Configuration - REAL TRANSACTION SUPPORT
MONGODB_URI=${connectionString.replace('/test', '/cat_modeling_dev')}
MONGODB_TEST_URI=${connectionString.replace('/test', '/cat_modeling_dev_test')}

# Server Configuration
PORT=3001
NODE_ENV=development

# Mock Database - DISABLED (using real MongoDB Atlas with transactions)
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

  require('fs').writeFileSync('.env', envContent);
  console.log('✅ Environment updated for MongoDB Atlas');
  
  rl.close();
  
  // Test the connection
  console.log('\n🧪 Testing MongoDB Atlas connection...');
  await testAtlasConnection();
}

async function testAtlasConnection() {
  const mongoose = require('mongoose');
  
  try {
    // Reload environment
    delete require.cache[require.resolve('dotenv')];
    require('dotenv').config();
    
    const mongoUri = process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Check replica set
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.command({ replSetGetStatus: 1 });
    
    console.log('🎉 REPLICA SET CONFIRMED!');
    console.log(`   Set Name: ${result.set}`);
    console.log(`   Members: ${result.members.length}`);
    console.log('   Transaction Support: ✅ AVAILABLE');
    
    // Test actual transaction
    console.log('\n🔄 Testing REAL transaction...');
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    const testCollection = mongoose.connection.db.collection('transaction_test');
    await testCollection.insertOne({ 
      test: 'real_transaction', 
      timestamp: new Date(),
      transactionId: session.id 
    }, { session });
    
    await session.commitTransaction();
    await session.endSession();
    
    // Verify and clean up
    const doc = await testCollection.findOne({ test: 'real_transaction' });
    if (doc) {
      await testCollection.deleteOne({ _id: doc._id });
      console.log('✅ REAL TRANSACTION TEST PASSED!');
    }
    
    await mongoose.disconnect();
    
    console.log('\n🎉 SUCCESS: MongoDB Atlas is configured with real transactions!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Remove fallback mode from BaseService');
    console.log('   2. Run transaction tests with REAL MongoDB');
    console.log('   3. Verify 100% real transaction coverage');
    
    return true;
    
  } catch (error) {
    console.error(`❌ MongoDB Atlas test failed: ${error.message}`);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Check:');
      console.log('   - Database user credentials');
      console.log('   - IP whitelist settings');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    return false;
  }
}

// Alternative: Create local .env with Atlas template
async function createAtlasTemplate() {
  console.log('\n📝 Creating MongoDB Atlas template...');
  
  const templateEnv = `# MongoDB Atlas Configuration Template
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cat_modeling_dev?retryWrites=true&w=majority
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/cat_modeling_dev_test?retryWrites=true&w=majority

# Instructions:
# 1. Sign up at https://cloud.mongodb.com/
# 2. Create a free M0 cluster  
# 3. Create database user
# 4. Whitelist IP (0.0.0.0/0 for development)
# 5. Replace connection strings above

# Server Configuration
PORT=3001
NODE_ENV=development

# Mock Database - MUST be false for real transaction testing
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

  require('fs').writeFileSync('.env.atlas-template', templateEnv);
  console.log('✅ Created .env.atlas-template');
  console.log('\n📋 Instructions:');
  console.log('   1. Set up MongoDB Atlas account');
  console.log('   2. Edit .env.atlas-template with your connection strings');
  console.log('   3. Copy to .env');
  console.log('   4. Run: node scripts/check-mongodb-config.js');
}

async function main() {
  console.log('\n🎯 CRITICAL ISSUE: Fallback mode masking production problems');
  console.log('🎯 SOLUTION: Real MongoDB Atlas transaction testing');
  console.log();
  
  const choice = await ask('Choose setup method:\n1. Interactive MongoDB Atlas setup\n2. Create template for manual setup\nEnter choice (1 or 2): ');
  
  if (choice === '1') {
    await setupMongoDBAtlas();
  } else if (choice === '2') {
    await createAtlasTemplate();
    rl.close();
  } else {
    console.log('Invalid choice');
    rl.close();
  }
}

main();