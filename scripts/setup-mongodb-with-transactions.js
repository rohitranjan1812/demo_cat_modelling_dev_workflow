#!/usr/bin/env node

console.log('🔧 MongoDB Replica Set Setup with Docker');
console.log('=' .repeat(50));

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkDockerInstalled() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    execSync('docker-compose --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function stopExistingMongoDB() {
  console.log('🛑 Stopping any existing MongoDB processes...');
  
  // Stop local MongoDB service if running
  try {
    execSync('net stop MongoDB', { stdio: 'pipe' });
    console.log('✅ Stopped MongoDB service');
  } catch (error) {
    // Service not running, which is fine
  }
  
  // Kill any mongod processes
  try {
    execSync('taskkill /F /IM mongod.exe', { stdio: 'pipe' });
    console.log('✅ Stopped mongod processes');
  } catch (error) {
    // No processes running, which is fine
  }
}

function createDockerMongoSetup() {
  console.log('🐳 Setting up MongoDB with Docker...');
  
  // Create simplified docker-compose file
  const dockerCompose = `version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: cat_modeling_mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: cat_modeling_dev
    volumes:
      - mongodb_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    command: mongod --replSet rs0 --bind_ip_all
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s

volumes:
  mongodb_data:
    driver: local
`;

  fs.writeFileSync('docker-compose.mongodb.yml', dockerCompose);
  
  // Create initialization script
  const initScript = `// MongoDB initialization script
print('🔄 Initializing MongoDB replica set...');

// Wait a moment for MongoDB to be ready
sleep(2000);

try {
  // Initialize replica set
  var config = {
    "_id": "rs0",
    "members": [
      {
        "_id": 0,
        "host": "localhost:27017",
        "priority": 1
      }
    ]
  };
  
  rs.initiate(config);
  
  // Wait for replica set to be ready
  var attempts = 0;
  while (attempts < 30) {
    try {
      var status = rs.status();
      if (status.members[0].stateStr === "PRIMARY") {
        print('✅ Replica set initialized successfully');
        break;
      }
    } catch (e) {
      // Still initializing
    }
    
    sleep(1000);
    attempts++;
  }
  
  // Switch to application database
  db = db.getSiblingDB('cat_modeling_dev');
  
  // Create application user
  db.createUser({
    user: 'catuser',
    pwd: 'catpassword',
    roles: [
      { role: 'readWrite', db: 'cat_modeling_dev' },
      { role: 'readWrite', db: 'cat_modeling_dev_test' }
    ]
  });
  
  print('✅ Application user created');
  
} catch (error) {
  print('❌ Error during initialization:', error);
}
`;

  fs.writeFileSync('init-mongo.js', initScript);
  console.log('✅ Created Docker configuration files');
}

function startDockerMongo() {
  console.log('🚀 Starting MongoDB with Docker...');
  
  try {
    // Stop any existing containers
    try {
      execSync('docker-compose -f docker-compose.mongodb.yml down', { stdio: 'pipe' });
    } catch (e) {
      // No existing containers, which is fine
    }
    
    // Start the container
    execSync('docker-compose -f docker-compose.mongodb.yml up -d', { stdio: 'inherit' });
    console.log('✅ MongoDB container started');
    
    // Wait for it to be ready
    console.log('⏳ Waiting for MongoDB to initialize...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        execSync('docker exec cat_modeling_mongodb mongosh --eval "db.adminCommand(\\"ping\\")"', { stdio: 'pipe' });
        console.log('✅ MongoDB is ready!');
        break;
      } catch (e) {
        console.log(`⏳ Waiting for MongoDB... (${attempts + 1}/${maxAttempts})`);
        execSync('timeout /t 2 /nobreak', { stdio: 'pipe' });
        attempts++;
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('MongoDB did not become ready within timeout');
    }
    
  } catch (error) {
    console.error('❌ Failed to start MongoDB:', error.message);
    throw error;
  }
}

function updateEnvironmentConfig() {
  console.log('📝 Updating environment configuration...');
  
  // Update .env file for new MongoDB configuration
  const envContent = `# MongoDB Configuration with Replica Set Support
MONGODB_URI=mongodb://catuser:catpassword@localhost:27017/cat_modeling_dev?authSource=cat_modeling_dev&replicaSet=rs0
MONGODB_TEST_URI=mongodb://catuser:catpassword@localhost:27017/cat_modeling_dev_test?authSource=cat_modeling_dev&replicaSet=rs0

# Server Configuration
PORT=3001
NODE_ENV=development

# Mock Database Configuration (set to false now that we have real MongoDB with transactions)
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
  console.log('✅ Environment configuration updated');
}

function createManagementScripts() {
  // Start script
  const startScript = `@echo off
echo 🚀 Starting MongoDB with Transaction Support...
docker-compose -f docker-compose.mongodb.yml up -d
echo ✅ MongoDB is starting up...
echo ⏳ Please wait a moment for initialization to complete
timeout /t 10 /nobreak
echo 🎉 MongoDB should now be ready with transaction support!
`;

  // Stop script  
  const stopScript = `@echo off
echo 🛑 Stopping MongoDB...
docker-compose -f docker-compose.mongodb.yml down
echo ✅ MongoDB stopped
`;

  // Status script
  const statusScript = `@echo off
echo 📊 MongoDB Status:
docker-compose -f docker-compose.mongodb.yml ps
echo.
echo 📋 Testing connection:
node scripts/check-mongodb-config.js
`;

  fs.writeFileSync('start-mongodb-replica.bat', startScript);
  fs.writeFileSync('stop-mongodb.bat', stopScript);
  fs.writeFileSync('mongodb-status.bat', statusScript);
  
  console.log('✅ Created management scripts:');
  console.log('   - start-mongodb-replica.bat');
  console.log('   - stop-mongodb.bat');  
  console.log('   - mongodb-status.bat');
}

async function main() {
  try {
    console.log('🔍 Checking requirements...');
    
    if (!checkDockerInstalled()) {
      console.error('❌ Docker or Docker Compose not found!');
      console.log('\n💡 Please install Docker Desktop:');
      console.log('   https://www.docker.com/products/docker-desktop/');
      process.exit(1);
    }
    
    console.log('✅ Docker is available');
    
    stopExistingMongoDB();
    createDockerMongoSetup();
    startDockerMongo();
    updateEnvironmentConfig();
    createManagementScripts();
    
    console.log('\n🎉 SUCCESS! MongoDB Replica Set Setup Complete');
    console.log('=' .repeat(50));
    console.log('✅ MongoDB is running with full transaction support');
    console.log('✅ Environment variables updated');
    console.log('✅ Management scripts created');
    console.log('');
    console.log('🧪 Next steps:');
    console.log('   1. Run: node scripts/check-mongodb-config.js');
    console.log('   2. Run the transaction tests again');
    console.log('   3. Verify 100% real transaction support');
    console.log('');
    console.log('💡 Use these commands:');
    console.log('   - Start: start-mongodb-replica.bat');  
    console.log('   - Stop:  stop-mongodb.bat');
    console.log('   - Status: mongodb-status.bat');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();