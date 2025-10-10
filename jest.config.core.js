/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  // Core tests focus on pure logic, no DB or UI dependencies
  testMatch: [
    '<rootDir>/tests/services/**/*.test.js',
    '<rootDir>/tests/models/**/*.test.js',
    '<rootDir>/tests/utils/**/*.test.js'
  ],
  // Skip slow or infrastructure-heavy tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/integration/',
    '/tests/ui/',
    '/tests/e2e/'
  ],
  // Fast fail on first error in CI
  bail: process.env.CI === 'true',
  // Higher timeout for model tests that may use DB
  testTimeout: 30000,
  // Setup files for all tests
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/core.js',
    '<rootDir>/tests/setup/model-test.js'
  ]
};