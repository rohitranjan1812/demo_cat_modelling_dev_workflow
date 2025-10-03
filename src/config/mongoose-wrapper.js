/**
 * Mongoose Wrapper
 * Automatically uses enhanced mock database when USE_MOCK_DB is true
 */

const useMockDB = process.env.USE_MOCK_DB === 'true';

let mongooseInstance;

if (useMockDB) {
  // Use enhanced mock database
  mongooseInstance = require('./enhanced-mock-database');
} else {
  // Use real mongoose
  mongooseInstance = require('mongoose');
}

module.exports = mongooseInstance;
