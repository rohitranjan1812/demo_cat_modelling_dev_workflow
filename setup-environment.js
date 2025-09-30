#!/usr/bin/env node

/**
 * Environment Setup Script for CAT Modeling Platform
 * This script creates the necessary .env files for backend and frontend
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CAT Modeling Platform - Environment Setup\n');

// Backend .env configuration
const backendEnv = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/cat_modeling_exposure
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_exposure_test

# Server Configuration
PORT=3001
NODE_ENV=development

# Mock Database Configuration (set to true if MongoDB is not installed)
USE_MOCK_DB=true

# API Configuration
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Security
JWT_SECRET=your_jwt_secret_here_change_in_production_12345
BCRYPT_ROUNDS=12
`;

// Frontend .env configuration
const frontendEnv = `# API Configuration
REACT_APP_API_URL=http://localhost:3001/api/v1

# Map Configuration
REACT_APP_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Application Configuration
REACT_APP_NAME=CAT Modeling Platform
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG_MODE=true

# External Services
REACT_APP_WEATHER_API_URL=
REACT_APP_GEOCODING_API_URL=

# Authentication (if implemented)
REACT_APP_AUTH_DOMAIN=
REACT_APP_AUTH_CLIENT_ID=
REACT_APP_AUTH_AUDIENCE=
`;

// Create backend .env file
const backendEnvPath = path.join(__dirname, '.env');
try {
  if (fs.existsSync(backendEnvPath)) {
    console.log('⚠️  Backend .env file already exists. Creating backup...');
    fs.copyFileSync(backendEnvPath, path.join(__dirname, '.env.backup'));
    console.log('✅ Backup created as .env.backup');
  }
  
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Backend .env file created successfully');
} catch (error) {
  console.error('❌ Error creating backend .env file:', error.message);
}

// Create frontend .env file
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
try {
  if (fs.existsSync(frontendEnvPath)) {
    console.log('⚠️  Frontend .env file already exists. Creating backup...');
    fs.copyFileSync(frontendEnvPath, path.join(__dirname, 'frontend', '.env.backup'));
    console.log('✅ Backup created as frontend/.env.backup');
  }
  
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Frontend .env file created successfully\n');
} catch (error) {
  console.error('❌ Error creating frontend .env file:', error.message);
}

console.log('📋 Environment Configuration Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Backend:');
console.log('  - Port: 3001');
console.log('  - Database: Mock mode enabled (USE_MOCK_DB=true)');
console.log('  - CORS: localhost:3000, localhost:3001');
console.log('\nFrontend:');
console.log('  - Port: 3000');
console.log('  - API URL: http://localhost:3001/api/v1');
console.log('  - Debug Mode: Enabled');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 Next Steps:');
console.log('1. Review the generated .env files and adjust if needed');
console.log('2. If you have MongoDB installed, set USE_MOCK_DB=false in backend .env');
console.log('3. Run "npm run start:all" to start both backend and frontend');
console.log('\n✨ Environment setup complete!\n');
