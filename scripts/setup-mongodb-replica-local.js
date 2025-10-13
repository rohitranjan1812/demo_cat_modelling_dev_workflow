#!/usr/bin/env node

console.log('🔧 MongoDB Replica Set Setup (Local Installation)');
console.log('=' .repeat(55));

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkMongoDBInstalled() {
  try {
    execSync('mongod --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function stopExistingMongoDB() {
  console.log('🛑 Stopping any existing MongoDB processes...');
  
  // Stop MongoDB service if running
  try {
    execSync('net stop MongoDB', { stdio: 'pipe' });
    console.log('✅ Stopped MongoDB service');
  } catch (error) {
    // Service not running
  }
  
  // Kill any mongod processes
  try {
    execSync('taskkill /F /IM mongod.exe', { stdio: 'pipe' });
    console.log('✅ Stopped mongod processes');
  } catch (error) {
    // No processes running
  }
}

function createDirectories() {
  const baseDir = path.join(__dirname, '..');
  const dataDir = path.join(baseDir, 'data', 'mongodb-replica');
  const logsDir = path.join(baseDir, 'logs');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('📁 Created MongoDB data directory');
  }
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 Created logs directory');
  }
  
  return { dataDir, logsDir };
}

function createMongoDBConfig(dataDir, logsDir) {
  const configPath = path.join(__dirname, '..', 'mongodb-replica.conf');
  
  const config = `# MongoDB Replica Set Configuration for CAT Modeling
systemLog:
  destination: file
  logAppend: true
  path: ${path.join(logsDir, 'mongodb.log').replace(/\\/g, '/')}

storage:
  dbPath: ${dataDir.replace(/\\/g, '/')}
  journal:
    enabled: true

processManagement:
  fork: false

net:
  port: 27017
  bindIpAll: true

replication:
  replSetName: rs0

setParameter:
  enableTestCommands: 1
`;

  fs.writeFileSync(configPath, config);
  console.log(`✅ Created MongoDB config: ${configPath}`);
  
  return configPath;
}

async function startMongoDB(configPath) {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting MongoDB with replica set configuration...');
    
    // Start MongoDB as a child process
    const mongod = spawn('mongod', ['--config', configPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });
    
    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        mongod.kill();
        reject(new Error('MongoDB startup timeout'));
      }
    }, 30000);
    
    mongod.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('MongoDB:', output.trim());
      
      if (output.includes('Waiting for connections') || output.includes('waiting for connections')) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          console.log('✅ MongoDB started successfully');
          resolve(mongod);
        }
      }
    });
    
    mongod.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('MongoDB Error:', error.trim());
      
      if (error.includes('Address already in use')) {
        reject(new Error('Port 27017 is already in use'));
      }
    });
    
    mongod.on('close', (code) => {
      if (code !== 0 && !started) {
        reject(new Error(`MongoDB exited with code ${code}`));
      }
    });
    
    mongod.on('error', (error) => {
      reject(error);
    });
  });
}

async function initializeReplicaSet() {
  console.log('🔄 Initializing replica set...');
  
  const mongoose = require('mongoose');
  
  try {
    // Wait a bit for MongoDB to be fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await mongoose.connect('mongodb://localhost:27017/admin', {
      serverSelectionTimeoutMS: 15000,
    });
    
    console.log('✅ Connected to MongoDB for initialization');
    
    const adminDb = mongoose.connection.db.admin();
    
    // Check if replica set is already initialized
    try {
      const status = await adminDb.command({ replSetGetStatus: 1 });
      console.log('ℹ️  Replica set already initialized');
      await mongoose.disconnect();
      return true;
    } catch (statusError) {
      // Replica set not initialized yet, continue with initialization
    }
    
    // Initialize replica set
    const result = await adminDb.command({
      replSetInitiate: {
        _id: 'rs0',
        members: [
          { _id: 0, host: 'localhost:27017', priority: 1 }
        ]
      }
    });
    
    console.log('✅ Replica set initialization command sent:', result.ok === 1 ? 'SUCCESS' : 'FAILED');
    
    // Wait for replica set to be ready
    console.log('⏳ Waiting for replica set to become active...');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const status = await adminDb.command({ replSetGetStatus: 1 });
        const primary = status.members.find(m => m.stateStr === 'PRIMARY');
        
        if (primary) {
          console.log(`✅ Replica set is ready! Primary: ${primary.name}`);
          console.log(`✅ Set name: ${status.set}`);
          break;
        }
        
        console.log(\`⏳ Still waiting for primary... (attempt \${attempts + 1}/\${maxAttempts})\`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        
      } catch (statusError) {
        console.log(\`⏳ Replica set initializing... (attempt \${attempts + 1}/\${maxAttempts})\`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Replica set did not become ready within timeout');
    }
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize replica set:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    throw error;
  }
}

function updateEnvironmentConfig() {
  console.log('📝 Updating environment configuration...');
  
  // Read current .env file
  let currentEnv = '';
  try {
    currentEnv = fs.readFileSync('.env', 'utf8');
  } catch (error) {
    // File doesn't exist, we'll create new
  }
  
  // Update MongoDB URIs to include replica set
  const envContent = \`# MongoDB Configuration with Replica Set Support
MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev?replicaSet=rs0
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_dev_test?replicaSet=rs0

# Server Configuration
PORT=3001
NODE_ENV=development

# Mock Database Configuration (set to false - we now have real MongoDB with transactions)
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
\`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ Environment configuration updated');
}

function createManagementScripts(configPath) {
  // Start script
  const startScript = \`@echo off
echo 🚀 Starting MongoDB with Transaction Support...
echo 📋 Config file: ${configPath}
mongod --config "${configPath}"
\`;

  // Stop script  
  const stopScript = \`@echo off
echo 🛑 Stopping MongoDB...
taskkill /F /IM mongod.exe 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ MongoDB stopped
) else (
    echo ℹ️  MongoDB was not running
)
\`;

  // Status script
  const statusScript = \`@echo off
echo 📊 MongoDB Status:
echo.
tasklist /FI "IMAGENAME eq mongod.exe" | find "mongod.exe" >nul
if %ERRORLEVEL% == 0 (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is not running
)
echo.
echo 📋 Testing connection and transaction support:
node scripts/check-mongodb-config.js
\`;

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
    
    if (!checkMongoDBInstalled()) {
      console.error('❌ MongoDB not found!');
      console.log('\\n💡 Please install MongoDB Community Server:');
      console.log('   https://www.mongodb.com/try/download/community');
      console.log('   Make sure mongod.exe is in your PATH');
      process.exit(1);
    }
    
    console.log('✅ MongoDB is available');
    
    stopExistingMongoDB();
    
    const { dataDir, logsDir } = createDirectories();
    const configPath = createMongoDBConfig(dataDir, logsDir);
    
    // Start MongoDB
    const mongodProcess = await startMongoDB(configPath);
    
    // Initialize replica set
    await initializeReplicaSet();
    
    // Update environment
    updateEnvironmentConfig();
    
    // Create management scripts
    createManagementScripts(configPath);
    
    console.log('\\n🎉 SUCCESS! MongoDB Replica Set Setup Complete');
    console.log('=' .repeat(50));
    console.log('✅ MongoDB is running with full transaction support');
    console.log('✅ Replica set initialized and ready');
    console.log('✅ Environment variables updated');
    console.log('✅ Management scripts created');
    console.log('');
    console.log('🧪 Next steps:');
    console.log('   1. Leave this terminal open (MongoDB is running)');
    console.log('   2. Open a new terminal and run: node scripts/check-mongodb-config.js');
    console.log('   3. Run the transaction tests with REAL transaction support');
    console.log('');
    console.log('💡 Management commands:');
    console.log('   - Status: mongodb-status.bat');
    console.log('   - Stop: stop-mongodb.bat (or Ctrl+C here)');
    console.log('   - Start: start-mongodb-replica.bat');
    
    // Keep the process alive
    console.log('\\n🔄 MongoDB is running... Press Ctrl+C to stop');
    
    process.on('SIGINT', () => {
      console.log('\\n🛑 Stopping MongoDB...');
      mongodProcess.kill();
      process.exit(0);
    });
    
    // Keep process alive
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.message.includes('Port 27017 is already in use')) {
      console.log('\\n💡 Another MongoDB instance is running. Please:');
      console.log('   1. Stop existing MongoDB: net stop MongoDB');
      console.log('   2. Kill mongod processes: taskkill /F /IM mongod.exe');
      console.log('   3. Run this script again');
    }
    
    process.exit(1);
  }
}

main();
