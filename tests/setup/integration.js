// Jest setup file for integration tests
const mongoose = require('mongoose');

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Disconnect after all tests complete
afterAll(async () => {
  await mongoose.disconnect();
});