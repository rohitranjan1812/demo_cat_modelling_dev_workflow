/**
 * Global Test Setup - Must be run before all tests
 * Handles database connection and provides fallback to mock database
 */

const mongoose = require('mongoose');
const { testEnv } = require('./test-environment');

// Global setup - run once before all tests
beforeAll(async () => {
  try {
    console.log('🚀 Initializing test environment...');
    
    // Initialize test database connection
    const dbConnected = await testEnv.initialize();
    
    if (dbConnected) {
      console.log('✅ Using real MongoDB for tests');
    } else {
      console.log('⚠️  Using mock database for tests');
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize test environment:', error);
    throw error;
  }
});

// Global cleanup - run once after all tests
afterAll(async () => {
  try {
    console.log('🧹 Cleaning up test environment...');
    await testEnv.cleanup();
    console.log('✅ Test environment cleaned up');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
});

// Clear database between tests if using real database
beforeEach(async () => {
  if (testEnv.isDatabaseConnected()) {
    try {
      // Clear all collections
      const collections = mongoose.connection.collections;
      for (let collection in collections) {
        await collections[collection].deleteMany({});
      }
    } catch (error) {
      console.warn('⚠️  Could not clear database between tests:', error.message);
    }
  }
});

// Increase timeout for database operations
jest.setTimeout(30000);

// Log test environment status
console.log('📋 Test Setup Configuration:');
console.log(`   - Test Timeout: 30000ms`);
console.log(`   - MongoDB URI: ${process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cat_modeling_exposure_test'}`);
console.log(`   - Environment: ${process.env.NODE_ENV || 'test'}`);