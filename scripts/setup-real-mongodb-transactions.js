#!/usr/bin/env node

console.log('🔧 Setting up MongoDB with Real Transaction Support');
console.log('=' .repeat(55));

const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

async function checkCurrentMongoDB() {
  console.log('🔍 Checking current MongoDB configuration...');
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev';
    console.log(`Connecting to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check if it's a replica set
    try {
      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.command({ replSetGetStatus: 1 });
      
      console.log(`✅ REPLICA SET DETECTED!`);
      console.log(`   Set Name: ${result.set}`);
      console.log(`   Members: ${result.members.length}`);
      console.log('   🎉 Transaction support: AVAILABLE');
      
      await mongoose.disconnect();
      return { hasReplicaSet: true, setName: result.set };
      
    } catch (replError) {
      console.log('❌ No replica set detected');
      console.log(`   Error: ${replError.message}`);
      console.log('   🚫 Transaction support: NOT AVAILABLE');
      
      await mongoose.disconnect();
      return { hasReplicaSet: false };
    }
    
  } catch (connectionError) {
    console.log(`❌ Cannot connect to MongoDB: ${connectionError.message}`);
    return { hasReplicaSet: false, connectionFailed: true };
  }
}

function stopExistingMongoDB() {
  console.log('\n🛑 Stopping existing MongoDB processes...');
  
  try {
    execSync('net stop MongoDB', { stdio: 'pipe' });
    console.log('✅ Stopped MongoDB service');
  } catch (error) {
    console.log('ℹ️  MongoDB service not running');
  }
  
  try {
    execSync('taskkill /F /IM mongod.exe', { stdio: 'pipe' });
    console.log('✅ Stopped mongod processes');
  } catch (error) {
    console.log('ℹ️  No mongod processes found');
  }
}

function updateEnvironmentForReplicaSet() {
  console.log('\n📝 Updating environment for replica set...');
  
  const envContent = `# MongoDB Configuration with Replica Set Support
MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev?replicaSet=rs0
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_dev_test?replicaSet=rs0

# Server Configuration
PORT=3001
NODE_ENV=development

# Mock Database Configuration - DISABLED (using real MongoDB with transactions)
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
  console.log('✅ Environment updated for replica set support');
}

async function testTransactionSupport() {
  console.log('\n🧪 Testing transaction support...');
  
  // Reload environment
  delete require.cache[require.resolve('dotenv')];
  require('dotenv').config();
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected with replica set URI');
    
    // Test transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    // Create a test collection and document
    const testCollection = mongoose.connection.db.collection('transaction_test');
    await testCollection.insertOne({ test: 'transaction', timestamp: new Date() }, { session });
    
    await session.commitTransaction();
    await session.endSession();
    
    // Clean up
    await testCollection.deleteOne({ test: 'transaction' });
    
    console.log('🎉 TRANSACTION TEST PASSED!');
    console.log('✅ Real MongoDB transactions are working');
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.log(`❌ Transaction test failed: ${error.message}`);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    return false;
  }
}

function createStartupBatch() {
  const batchContent = `@echo off
echo 🚀 Starting MongoDB Replica Set for CAT Modeling
echo.
echo 📋 This will start MongoDB with transaction support
echo ⚠️  Make sure MongoDB is installed and no other instance is running
echo.

REM Create directories
if not exist "data\\mongodb-replica" mkdir "data\\mongodb-replica"
if not exist "logs" mkdir "logs"

REM Start MongoDB with replica set
echo 🔧 Starting MongoDB with replica set configuration...
start "MongoDB Replica Set" mongod --replSet rs0 --dbpath "data\\mongodb-replica" --logpath "logs\\mongodb.log" --port 27017

echo.
echo ⏳ Waiting for MongoDB to start...
timeout /t 5 /nobreak > nul

echo 🔄 Initializing replica set...
mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"

echo.
echo ✅ MongoDB Replica Set setup complete!
echo 🧪 Testing configuration...
node scripts/check-mongodb-config.js

echo.
echo 💡 MongoDB is now running with transaction support
echo    Use 'stop-mongodb.bat' to stop the server
pause
`;

  require('fs').writeFileSync('start-mongodb-replica.bat', batchContent);
  console.log('✅ Created start-mongodb-replica.bat');
}

function createStopBatch() {
  const batchContent = `@echo off
echo 🛑 Stopping MongoDB...
taskkill /F /IM mongod.exe 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ MongoDB stopped successfully
) else (
    echo ℹ️  MongoDB was not running
)
pause
`;

  require('fs').writeFileSync('stop-mongodb.bat', batchContent);
  console.log('✅ Created stop-mongodb.bat');
}

async function quickSetupWithMongosh() {
  console.log('\n🚀 Quick Setup: Using mongosh to initialize replica set...');
  
  try {
    // Check if mongosh is available
    execSync('mongosh --version', { stdio: 'pipe' });
    
    // Try to initialize replica set directly
    console.log('🔄 Initializing replica set with mongosh...');
    
    const initCommand = `mongosh --eval "
      try {
        rs.initiate({
          _id: 'rs0',
          members: [{
            _id: 0,
            host: 'localhost:27017'
          }]
        });
        print('✅ Replica set initialized');
      } catch (e) {
        if (e.message.includes('already initialized')) {
          print('ℹ️  Replica set already exists');
        } else {
          print('❌ Error:', e.message);
        }
      }
    "`;
    
    execSync(initCommand, { stdio: 'inherit' });
    
    // Wait for it to be ready
    console.log('⏳ Waiting for replica set to be ready...');
    
    let attempts = 0;
    while (attempts < 10) {
      try {
        execSync('mongosh --eval "rs.status()" --quiet', { stdio: 'pipe' });
        console.log('✅ Replica set is active!');
        return true;
      } catch (e) {
        console.log(`⏳ Waiting... (${attempts + 1}/10)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }
    
    return false;
    
  } catch (error) {
    console.log(`❌ mongosh not available or setup failed: ${error.message}`);
    return false;
  }
}

async function main() {
  try {
    // Check current MongoDB status
    const status = await checkCurrentMongoDB();
    
    if (status.hasReplicaSet) {
      console.log('\n🎉 GREAT! MongoDB replica set is already configured');
      console.log('✅ Transaction support is available');
      
      // Update environment to use replica set URIs
      updateEnvironmentForReplicaSet();
      
      // Test transactions
      const transactionWorks = await testTransactionSupport();
      
      if (transactionWorks) {
        console.log('\n🎉 SUCCESS! MongoDB is properly configured with transactions');
        console.log('\n📋 Summary:');
        console.log('   ✅ MongoDB replica set: ACTIVE');
        console.log('   ✅ Transaction support: WORKING');
        console.log('   ✅ Environment: UPDATED');
        console.log('\n🧪 Now run the transaction tests with REAL transaction support:');
        console.log('   npx jest tests/services/BaseService.transaction.test.js --verbose');
        return;
      }
    }
    
    if (status.connectionFailed) {
      console.log('\n💡 MongoDB is not running. Starting setup process...');
      
      // Try quick setup
      console.log('\n🔧 Attempting to start MongoDB with replica set...');
      
      try {
        // Check if MongoDB is installed
        execSync('mongod --version', { stdio: 'pipe' });
        console.log('✅ MongoDB is installed');
        
        // Create startup scripts
        createStartupBatch();
        createStopBatch();
        
        console.log('\n📋 Setup complete! Next steps:');
        console.log('   1. Run: start-mongodb-replica.bat');
        console.log('   2. Wait for initialization to complete');
        console.log('   3. Run: node scripts/check-mongodb-config.js');
        console.log('   4. Run transaction tests');
        
      } catch (mongoError) {
        console.log('❌ MongoDB not installed');
        console.log('\n💡 Please install MongoDB Community Server:');
        console.log('   https://www.mongodb.com/try/download/community');
      }
      
    } else {
      console.log('\n🔄 MongoDB is running but without replica set');
      console.log('   We need to stop it and restart with replica set configuration');
      
      stopExistingMongoDB();
      
      console.log('\n⏳ Waiting a moment...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try quick setup
      const quickSetup = await quickSetupWithMongosh();
      
      if (quickSetup) {
        updateEnvironmentForReplicaSet();
        const transactionWorks = await testTransactionSupport();
        
        if (transactionWorks) {
          console.log('\n🎉 SUCCESS! Quick setup completed');
          return;
        }
      }
      
      // Fallback to batch file approach
      createStartupBatch();
      createStopBatch();
      
      console.log('\n📋 Manual setup required:');
      console.log('   1. Run: start-mongodb-replica.bat');
      console.log('   2. Wait for setup to complete');
      console.log('   3. Run transaction tests');
    }
    
    // Final instructions
    console.log('\n🎯 IMPORTANT: Once MongoDB replica set is running:');
    console.log('   ❌ Remove fallback mode from BaseService');
    console.log('   ✅ Run tests with REAL transaction support');
    console.log('   ✅ Verify 100% test coverage with actual MongoDB transactions');
    
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

main();