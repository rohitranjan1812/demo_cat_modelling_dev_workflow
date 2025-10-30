/**
 * Automated Test Runner with Server Management
 * Starts servers, waits for them to be ready, then runs Selenium tests
 */

const { spawn } = require('child_process');
const axios = require('axios');
const fs = require('fs');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';
const MAX_WAIT_TIME = 120000; // 2 minutes
const CHECK_INTERVAL = 5000; // 5 seconds

let backendProcess = null;
let frontendProcess = null;

async function checkServer(url, name) {
  try {
    const response = await axios.get(url, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function waitForServer(url, name, maxWait = MAX_WAIT_TIME) {
  const startTime = Date.now();
  console.log(`⏳ Waiting for ${name} to start...`);
  
  while (Date.now() - startTime < maxWait) {
    const isRunning = await checkServer(url, name);
    if (isRunning) {
      console.log(`✅ ${name} is running!`);
      return true;
    }
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  console.log(`\n❌ ${name} did not start within ${maxWait/1000} seconds`);
  return false;
}

function startBackend() {
  console.log('🚀 Starting backend server...');
  backendProcess = spawn('npm', ['run', 'start:backend'], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'pipe'
  });
  
  backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running') || output.includes('listening')) {
      console.log('   ✓ Backend startup detected');
    }
  });
  
  backendProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('DeprecationWarning')) {
      console.error(`   Backend Error: ${error.substring(0, 100)}`);
    }
  });
  
  return backendProcess;
}

function startFrontend() {
  const path = require('path');
  console.log('🚀 Starting frontend server...');
  frontendProcess = spawn('npm', ['run', 'start:frontend'], {
    cwd: path.join(process.cwd(), 'frontend'),
    shell: true,
    stdio: 'pipe'
  });
  
  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Compiled') || output.includes('webpack')) {
      console.log('   ✓ Frontend compilation detected');
    }
  });
  
  frontendProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('DeprecationWarning')) {
      console.error(`   Frontend Error: ${error.substring(0, 100)}`);
    }
  });
  
  return frontendProcess;
}

async function cleanup() {
  console.log('\n🧹 Cleaning up processes...');
  if (backendProcess) {
    backendProcess.kill();
    console.log('   ✓ Backend process terminated');
  }
  if (frontendProcess) {
    frontendProcess.kill();
    console.log('   ✓ Frontend process terminated');
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('🧪 Automated Selenium Test Runner');
  console.log('='.repeat(80));
  console.log();
  
  try {
    // Check if servers are already running
    const backendRunning = await checkServer(`${BACKEND_URL}/api/v1/health`, 'Backend');
    const frontendRunning = await checkServer(FRONTEND_URL, 'Frontend');
    
    if (backendRunning && frontendRunning) {
      console.log('✅ Both servers are already running!');
      console.log('🚀 Running tests immediately...\n');
    } else {
      // Start servers if not running
      if (!backendRunning) {
        startBackend();
        await new Promise(resolve => setTimeout(resolve, 5000)); // Initial wait
      }
      
      if (!frontendRunning) {
        startFrontend();
        await new Promise(resolve => setTimeout(resolve, 5000)); // Initial wait
      }
      
      // Wait for servers to be ready
      const backendReady = await waitForServer(`${BACKEND_URL}/api/v1/health`, 'Backend', 60000);
      const frontendReady = await waitForServer(FRONTEND_URL, 'Frontend', 90000);
      
      if (!backendReady || !frontendReady) {
        console.log('\n❌ Servers failed to start. Please start them manually:');
        console.log('   Terminal 1: npm run start:backend');
        console.log('   Terminal 2: npm run start:frontend');
        console.log('   Terminal 3: node test-fixes-verification.js');
        process.exit(1);
      }
    }
    
    // Run the Selenium tests
    console.log('\n' + '='.repeat(80));
    console.log('🧪 Running Selenium Tests');
    console.log('='.repeat(80));
    console.log();
    
    const testProcess = spawn('node', ['test-fixes-verification.js'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      console.log(`\n✅ Test execution completed with exit code: ${code}`);
      cleanup();
      process.exit(code);
    });
    
    testProcess.on('error', (error) => {
      console.error(`\n❌ Test execution failed: ${error.message}`);
      cleanup();
      process.exit(1);
    });
    
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}`);
    cleanup();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Interrupted by user');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  cleanup();
  process.exit(1);
});

