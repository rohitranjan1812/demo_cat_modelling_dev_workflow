/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  // Integration tests use in-memory MongoDB
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/ui/',
    '/tests/e2e/'
  ],
  // Higher timeout for DB operations
  testTimeout: 30000,
  // Setup MongoDB Memory Server
  setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.js'],
  // Global setup/teardown for MongoDB instance
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js'
};