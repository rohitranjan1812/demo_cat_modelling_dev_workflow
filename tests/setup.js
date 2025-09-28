const { testEnv } = require('./test-environment');

// Setup test environment
beforeAll(async () => {
  await testEnv.initialize();
});

// Clean up after each test
afterEach(async () => {
  try {
    if (testEnv.isDatabaseConnected()) {
      // Clear all collections in real database
      const mongoose = require('mongoose');
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        try {
          await collection.deleteMany({});
        } catch (error) {
          console.warn(`Warning: Could not clean collection ${key}:`, error.message);
        }
      }
    } else if (testEnv.isMockMode()) {
      // Clear mock database
      const { mockDb } = require('./mock-database');
      mockDb.clear();
    }
  } catch (error) {
    console.warn('Warning: Error during test cleanup:', error.message);
  }
});

// Close database connection after all tests
afterAll(async () => {
  await testEnv.cleanup();
});
