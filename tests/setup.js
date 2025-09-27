const mongoose = require('mongoose');

// Setup test database connection
beforeAll(async () => {
  try {
    // Use a test database URI directly
    const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/cat_modeling_exposure_test';
    await mongoose.connect(testDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

// Clean up after each test
afterEach(async () => {
  try {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Test database disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from test database:', error);
  }
});
