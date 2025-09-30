#!/usr/bin/env node

/**
 * Backend Startup Script for CAT Modeling Platform
 * Ensures proper environment setup before starting the server
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 CAT Modeling Platform - Backend Startup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Running environment setup...\n');
  const setupScript = require('./setup-environment.js');
  console.log('\n✅ Environment setup complete. Continuing with startup...\n');
}

// Display startup information
console.log('📋 Backend Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
require('dotenv').config();

console.log('  - Port:', process.env.PORT || '3001');
console.log('  - Environment:', process.env.NODE_ENV || 'development');
console.log('  - Mock Database:', process.env.USE_MOCK_DB === 'true' ? 'Enabled' : 'Disabled');
console.log('  - MongoDB URI:', process.env.USE_MOCK_DB === 'true' ? 'N/A (Mock Mode)' : (process.env.MONGODB_URI || 'Not Set'));
console.log('  - CORS Origins:', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Start the server
console.log('🔄 Starting backend server...\n');
require('./src/index.js');
