#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 MongoDB Replica Set Setup for Transaction Support');
console.log('=' .repeat(60));

// Check if MongoDB is running
function isMongoDBRunning() {
  try {
    execSync('tasklist /FI "IMAGENAME eq mongod.exe"', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Stop existing MongoDB if running
function stopMongoDB() {
  try {
    console.log('🛑 Stopping existing MongoDB service...');
    execSync('net stop MongoDB', { stdio: 'inherit' });
    console.log('✅ MongoDB service stopped');
  } catch (error) {
    console.log('ℹ️  MongoDB service not running or not installed as service');
  }
  
  // Kill any mongod processes
  try {
    execSync('taskkill /F /IM mongod.exe', { stdio: 'pipe' });
    console.log('✅ Stopped mongod processes');
  } catch (error) {
    console.log('ℹ️  No mongod processes found');
  }
}

// Create MongoDB configuration for replica set
function createMongoConfig() {
  const configPath = path.join(__dirname, '..', 'mongodb-replica.conf');
  
  const config = `# MongoDB Replica Set Configuration
systemLog:
  destination: file
  logAppend: true
  path: ${path.join(__dirname, '..', 'logs', 'mongodb.log')}

storage:
  dbPath: ${path.join(__dirname, '..', 'data', 'mongodb')}
  journal:
    enabled: true

processManagement:
  fork: false

net:
  port: 27017
  bindIpAll: true

replication:
  replSetName: rs0
  oplogSizeMB: 100

setParameter:
  enableTestCommands: 1
`;

  // Ensure directories exist
  const logsDir = path.join(__dirname, '..', 'logs');
  const dataDir = path.join(__dirname, '..', 'data', 'mongodb');
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Created logs directory');
  }
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created data directory');
  }
  
  fs.writeFileSync(configPath, config);
  console.log(`✅ Created MongoDB config: ${configPath}`);
  
  return configPath;
}

// Start MongoDB with replica set configuration
function startMongoDBReplica(configPath) {
  console.log('🚀 Starting MongoDB with replica set configuration...');
  
  try {
    // Start MongoDB in background
    const command = `start "MongoDB Replica Set" mongod --config "${configPath}"`;
    execSync(command, { stdio: 'inherit' });
    console.log('✅ MongoDB replica set started');
    
    // Wait for startup
    console.log('⏳ Waiting for MongoDB to initialize...');
    setTimeout(() => {}, 3000);
    
  } catch (error) {
    console.error('❌ Failed to start MongoDB:', error.message);
    throw error;
  }
}

// Initialize replica set
function initializeReplicaSet() {
  console.log('🔄 Initializing replica set...');
  
  const initScript = `
const mongoose = require('mongoose');

async function initReplica() {
  try {
    await mongoose.connect('mongodb://localhost:27017/admin', {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const adminDb = mongoose.connection.db.admin();
    
    // Initialize replica set
    const result = await adminDb.command({
      replSetInitiate: {
        _id: 'rs0',
        members: [
          { _id: 0, host: 'localhost:27017', priority: 1 }
        ]
      }
    });
    
    console.log('✅ Replica set initialized:', result);
    
    // Wait for replica set to be ready
    console.log('⏳ Waiting for replica set to become primary...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const status = await adminDb.command({ replSetGetStatus: 1 });
        const primary = status.members.find(m => m.stateStr === 'PRIMARY');
        
        if (primary) {
          console.log('✅ Replica set is ready! Primary:', primary.name);
          break;
        }
        
        console.log('⏳ Still waiting for primary... attempt', attempts + 1);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        
      } catch (statusError) {
        console.log('⏳ Replica set not ready yet... attempt', attempts + 1);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Replica set did not become ready within timeout');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Failed to initialize replica set:', error.message);
    throw error;
  }
}

initReplica().catch(console.error);
`;
  
  fs.writeFileSync(path.join(__dirname, 'init-replica.js'), initScript);
  
  // Wait a bit for MongoDB to start
  setTimeout(() => {
    try {
      execSync(`node "${path.join(__dirname, 'init-replica.js')}"`, { 
        stdio: 'inherit',
        timeout: 60000
      });
      console.log('✅ Replica set initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize replica set:', error.message);
    }
  }, 5000);
}

// Main setup function
async function setupMongoDBReplica() {
  try {
    console.log('🔍 Checking current MongoDB status...');
    
    if (isMongoDBRunning()) {
      console.log('📋 MongoDB is currently running');
      stopMongoDB();
    }
    
    console.log('📝 Creating replica set configuration...');
    const configPath = createMongoConfig();
    
    console.log('🚀 Starting MongoDB with replica set...');
    startMongoDBReplica(configPath);
    
    console.log('⏳ Waiting for MongoDB startup...');
    setTimeout(() => {
      initializeReplicaSet();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Create startup scripts
function createStartupScripts() {
  const startScript = `@echo off
echo Starting MongoDB Replica Set for CAT Modeling...
mongod --config "${path.join(__dirname, '..', 'mongodb-replica.conf')}"
`;

  const stopScript = `@echo off
echo Stopping MongoDB...
taskkill /F /IM mongod.exe
echo MongoDB stopped
`;

  fs.writeFileSync(path.join(__dirname, '..', 'start-mongodb-replica.bat'), startScript);
  fs.writeFileSync(path.join(__dirname, '..', 'stop-mongodb.bat'), stopScript);
  
  console.log('✅ Created startup scripts:');
  console.log('   - start-mongodb-replica.bat');
  console.log('   - stop-mongodb.bat');
}

// Run setup
console.log('🏁 Starting MongoDB Replica Set Setup...');
createStartupScripts();
setupMongoDBReplica();