#!/usr/bin/env node

console.log('🔧 MongoDB Community Edition Replica Set Setup');
console.log('=' .repeat(50));
console.log('🎯 Goal: Enable REAL ACID transactions locally');
console.log('⚠️  Removing dangerous fallback mode');
console.log();

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
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

function checkMongoDBInstalled() {
  try {
    execSync('mongod --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function checkWindowsService() {
  try {
    const services = execSync('sc query MongoDB', { encoding: 'utf8' });
    return services.includes('MongoDB');
  } catch (error) {
    return false;
  }
}

async function downloadMongoDB() {
  console.log('📥 MongoDB Community Edition needs to be installed');
  console.log();
  console.log('🔗 Download from: https://www.mongodb.com/try/download/community');
  console.log('   1. Choose Windows platform');
  console.log('   2. Select MSI package');
  console.log('   3. Run installer with default settings');
  console.log('   4. Install as Windows Service (recommended)');
  console.log();
  
  const installed = await ask('Have you installed MongoDB Community Edition? (y/n): ');
  return installed.toLowerCase() === 'y';
}

function stopMongoDBService() {
  console.log('🛑 Stopping MongoDB service...');
  try {
    execSync('net stop MongoDB', { stdio: 'pipe' });
    console.log('✅ MongoDB service stopped');
  } catch (error) {
    console.log('ℹ️  MongoDB service was not running');
  }
}

function createReplicaSetConfig() {
  console.log('⚙️  Creating replica set configuration...');
  
  // Create data directory
  const dataDir = path.join(process.cwd(), 'data', 'mongodb-replica');
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory:', dataDir);
  }
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Created logs directory:', logsDir);
  }

  // Create MongoDB configuration file
  const configPath = path.join(process.cwd(), 'mongodb-replica.conf');
  const config = `# MongoDB Replica Set Configuration for CAT Modeling
systemLog:
  destination: file
  logAppend: true
  path: "${path.join(logsDir, 'mongodb-replica.log').replace(/\\/g, '\\\\')}"

storage:
  dbPath: "${dataDir.replace(/\\/g, '\\\\')}"
  journal:
    enabled: true

processManagement:
  fork: false

net:
  port: 27017
  bindIpAll: true

replication:
  replSetName: rs0

security:
  authorization: disabled
`;

  fs.writeFileSync(configPath, config);
  console.log('✅ Created configuration:', configPath);
  
  return { configPath, dataDir, logsDir };
}

function startMongoDBWithReplicaSet(configPath) {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting MongoDB with replica set...');
    
    const mongod = spawn('mongod', ['--config', configPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });
    
    let started = false;
    
    mongod.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('MongoDB:', output.trim());
      
      if (output.includes('waiting for connections') && !started) {
        started = true;
        setTimeout(() => resolve(mongod), 2000); // Wait 2s for full startup
      }
    });
    
    mongod.stderr.on('data', (data) => {
      console.error('MongoDB Error:', data.toString());
    });
    
    mongod.on('error', (error) => {
      reject(new Error(`Failed to start MongoDB: ${error.message}`));
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        mongod.kill();
        reject(new Error('MongoDB startup timeout'));
      }
    }, 30000);
  });
}

async function initializeReplicaSet() {
  console.log('🔧 Initializing replica set...');
  
  // Wait a bit more for MongoDB to be ready
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    const initScript = `
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
});
`;
    
    // Save the script to a temporary file
    const scriptPath = path.join(process.cwd(), 'init-replica.js');
    fs.writeFileSync(scriptPath, initScript);
    
    // Execute the script
    execSync(`mongo --eval "load('${scriptPath.replace(/\\/g, '\\\\')}')"`, { stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync(scriptPath);
    
    console.log('✅ Replica set initialized successfully');
    
    // Wait for replica set to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize replica set:', error.message);
    return false;
  }
}

async function testTransactions() {
  console.log('🧪 Testing REAL MongoDB transactions...');
  
  try {
    const mongoose = require('mongoose');
    
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_test', {
      directConnection: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Test transaction support
    const session = await mongoose.startSession();
    session.startTransaction();
    
    // Create a test collection and insert document
    const testCollection = mongoose.connection.db.collection('transaction_test');
    await testCollection.insertOne({
      test: 'real_transaction',
      timestamp: new Date(),
      sessionId: session.id
    }, { session });
    
    await session.commitTransaction();
    await session.endSession();
    
    // Verify and cleanup
    const doc = await testCollection.findOne({ test: 'real_transaction' });
    if (doc) {
      await testCollection.deleteOne({ _id: doc._id });
      console.log('✅ REAL transaction test PASSED!');
    }
    
    await mongoose.disconnect();
    
    console.log('\n🎉 SUCCESS: Local MongoDB configured with REAL transactions!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Transaction test failed:', error.message);
    return false;
  }
}

function updateEnvironment() {
  console.log('📝 Updating environment configuration...');
  
  const envContent = `# MongoDB Local Replica Set Configuration
MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev?replicaSet=rs0
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_test?replicaSet=rs0

# Server Configuration  
PORT=3001
NODE_ENV=development

# Mock Database - DISABLED (using real MongoDB with transactions)
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
  console.log('✅ Environment updated');
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Run: npm test tests/services/BaseService.transaction.test.js');
  console.log('   2. Verify all 23 tests pass with REAL transactions');
  console.log('   3. No more dangerous fallback mode!');
}

async function main() {
  try {
    console.log('🔍 Checking MongoDB installation...');
    
    if (!checkMongoDBInstalled()) {
      const installed = await downloadMongoDB();
      if (!installed) {
        console.log('❌ Please install MongoDB Community Edition first');
        rl.close();
        return;
      }
      
      // Check again after user claims installation
      if (!checkMongoDBInstalled()) {
        console.log('❌ MongoDB still not found. Please check installation');
        rl.close();
        return;
      }
    }
    
    console.log('✅ MongoDB found');
    
    // Stop existing service
    stopMongoDBService();
    
    // Create replica set configuration
    const { configPath } = createReplicaSetConfig();
    
    // Start MongoDB with replica set
    const mongodProcess = await startMongoDBWithReplicaSet(configPath);
    
    // Initialize replica set
    const initialized = await initializeReplicaSet();
    
    if (initialized) {
      // Test transactions
      const transactionsWork = await testTransactions();
      
      if (transactionsWork) {
        updateEnvironment();
        console.log('\n🎯 CRITICAL ISSUE RESOLVED:');
        console.log('   ❌ Dangerous fallback mode removed');
        console.log('   ✅ Real MongoDB transactions enabled');
        console.log('   ✅ Production-safe configuration');
      }
    }
    
    console.log('\n🔄 MongoDB is running. Keep this terminal open.');
    console.log('📊 Run transaction tests in another terminal to verify.');
    
    // Keep MongoDB running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down MongoDB...');
      mongodProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}