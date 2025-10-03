module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/frontend/'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};