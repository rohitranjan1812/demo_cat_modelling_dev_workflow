#!/usr/bin/env node

console.log('🎯 SIMPLE MongoDB Setup - Real Transactions');
console.log('=' .repeat(50));
console.log('✅ Fallback mode already removed from BaseService');
console.log('🔧 Setting up minimal MongoDB with replica set');
console.log();

const fs = require('fs');
const path = require('path');

// Check available options
console.log('📋 Available MongoDB Setup Options:');
console.log();

console.log('1. 🚀 MongoDB Community Edition (Recommended)');
console.log('   - Download: https://www.mongodb.com/try/download/community');
console.log('   - Select Windows MSI installer');
console.log('   - Install with default settings');
console.log();

console.log('2. 🐳 Docker MongoDB (If Docker available)');
console.log('   - Run: docker-compose -f docker-compose.mongodb.yml up');
console.log('   - Automatic replica set configuration');
console.log();

console.log('3. ☁️ MongoDB Atlas (Cloud - Free)');
console.log('   - Sign up: https://cloud.mongodb.com/');
console.log('   - Create M0 free cluster');
console.log('   - Built-in replica set');
console.log();

console.log('4. 📦 Portable MongoDB (No installation)');
console.log('   - Download MongoDB portable');
console.log('   - Run with our configuration');
console.log();

// Create configuration files for each option
createMongoDBConfigs();

function createMongoDBConfigs() {
  console.log('📝 Creating configuration files...');
  
  // 1. MongoDB Community Edition config
  const configContent = `# MongoDB Replica Set Configuration
systemLog:
  destination: file
  logAppend: true
  path: "${path.join(process.cwd(), 'logs', 'mongodb.log').replace(/\\/g, '/')}"

storage:
  dbPath: "${path.join(process.cwd(), 'data', 'mongodb-replica').replace(/\\/g, '/')}"
  journal:
    enabled: true

net:
  port: 27017
  bindIpAll: true

replication:
  replSetName: rs0

security:
  authorization: disabled
`;

  // Create directories
  const dataDir = path.join(process.cwd(), 'data', 'mongodb-replica');
  const logsDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  fs.writeFileSync('mongodb-replica.conf', configContent);
  console.log('✅ Created: mongodb-replica.conf');

  // 2. Startup script
  const startupScript = `@echo off
echo 🚀 Starting MongoDB with Replica Set...
echo 📊 MongoDB will run on port 27017
echo 🔄 Data directory: data/mongodb-replica
echo 📝 Logs: logs/mongodb.log
echo.
mongod --config mongodb-replica.conf
`;

  fs.writeFileSync('start-mongodb-replica.bat', startupScript);
  console.log('✅ Created: start-mongodb-replica.bat');

  // 3. Replica set initialization script
  const initScript = `// MongoDB Replica Set Initialization
print("🔧 Initializing replica set...");

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
});

print("✅ Replica set initialized");
print("🧪 Testing transactions...");

// Test transaction capability
var session = db.getMongo().startSession();
session.startTransaction();
try {
  db.test.insertOne({test: "transaction", timestamp: new Date()}, {session: session});
  session.commitTransaction();
  print("✅ Transaction test PASSED - ACID transactions enabled!");
  db.test.deleteOne({test: "transaction"});
} catch (e) {
  session.abortTransaction();
  print("❌ Transaction test failed:", e);
}
session.endSession();
`;

  fs.writeFileSync('init-replica-set.js', initScript);
  console.log('✅ Created: init-replica-set.js');

  // 4. Environment configuration
  const envContent = `# MongoDB Local Configuration - REAL TRANSACTIONS
MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev?replicaSet=rs0
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_test?replicaSet=rs0

# Server Configuration
PORT=3001
NODE_ENV=development

# Mock Database - DISABLED (using real MongoDB transactions)
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
  console.log('✅ Created: .env');

  // 5. Quick test script
  const testScript = `#!/usr/bin/env node

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
      console.log('   Then: mongo --eval "load(\\'init-replica-set.js\\')"');
    }
  }
}

testConnection();
`;

  fs.writeFileSync('test-mongodb-setup.js', testScript);
  console.log('✅ Created: test-mongodb-setup.js');

  console.log();
  console.log('🎉 Configuration files created successfully!');
  console.log();
  console.log('📋 Quick Start Instructions:');
  console.log();
  console.log('If MongoDB is installed:');
  console.log('  1. Run: start-mongodb-replica.bat');
  console.log('  2. In another terminal: mongo --eval "load(\'init-replica-set.js\')"');
  console.log('  3. Test: node test-mongodb-setup.js');
  console.log('  4. Run tests: npm test tests/services/BaseService.transaction.test.js');
  console.log();
  console.log('If MongoDB not installed:');
  console.log('  1. Download: https://www.mongodb.com/try/download/community');
  console.log('  2. Install with default settings');
  console.log('  3. Follow steps above');
  console.log();
  console.log('🎯 Expected Result: All 23 transaction tests pass with REAL MongoDB');
  console.log('❌ No more dangerous fallback mode!');
  console.log('✅ Production-safe transaction testing');
}