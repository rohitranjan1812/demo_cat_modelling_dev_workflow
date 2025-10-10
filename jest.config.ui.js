/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  // UI tests only run when explicitly requested
  testMatch: [
    '<rootDir>/tests/ui/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    process.env.TEST_UI !== '1' ? '/tests/ui/' : ''
  ],
  // Long timeout for browser tests
  testTimeout: 60000,
  // Skip by default unless TEST_UI=1
  bail: true,
  // Setup Selenium/Puppeteer
  setupFilesAfterEnv: ['<rootDir>/tests/setup/ui.js']
};