const mongoose = require('mongoose');

// Global test database connection state
let isConnected = false;

// Setup test database connection
beforeAll(async () => {
  try {
    // Only connect if not already connected
    if (!isConnected) {
      const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cat_modeling_exposure_test';
      await mongoose.connect(testDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
        connectTimeoutMS: 10000, // 10 second timeout
        bufferCommands: false // Disable mongoose buffering
      });
      isConnected = true;
      console.log('✅ Test database connected');
    }
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    // Don't throw error, just log it for now
    console.log('⚠️  Tests will run without database connection');
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      // Clear all collections
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        try {
          await collection.deleteMany({});
        } catch (error) {
          // Ignore cleanup errors
          console.warn(`Warning: Could not clean collection ${key}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.warn('Warning: Error during test cleanup:', error.message);
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    if (isConnected && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('✅ Test database disconnected');
    }
  } catch (error) {
    console.warn('❌ Error disconnecting from test database:', error.message);
  }
});
