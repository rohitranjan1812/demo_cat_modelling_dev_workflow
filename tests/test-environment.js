// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const { mockMongoose } = require('./mock-database');
const { createDatabaseIndexes } = require('../src/tools/database-indexes');

/**
 * Test Environment Manager
 * Handles database connections and provides fallback for tests
 */
class TestEnvironment {
  constructor() {
    this.isDatabaseAvailable = false;
    this.mockMode = false;
    this.originalMongoose = null;
  }

  async initialize() {
    try {
      // Try to connect to real MongoDB with replica set support
      const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/cat_modeling_exposure_test?replicaSet=rs0';
      
      await mongoose.connect(testDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // Increased from 5000
        connectTimeoutMS: 30000, // Increased from 10000
        socketTimeoutMS: 45000, // Add socket timeout
        maxPoolSize: 10,
        minPoolSize: 1,
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false // Disable mongoose buffering
      });
      
      // Create database indexes to ensure unique constraints work
      try {
        await createDatabaseIndexes();
        console.log('✅ Database indexes created');
      } catch (indexError) {
        console.warn('⚠️  Could not create database indexes:', indexError.message);
      }
      
      this.isDatabaseAvailable = true;
      console.log('✅ Real database connected for tests');
      return true;
    } catch (error) {
      console.warn('⚠️  Real database not available, using mock database');
      this.mockMode = true;
      this.setupMockDatabase();
      return false;
    }
  }

  setupMockDatabase() {
    // Store original mongoose
    this.originalMongoose = global.mongoose;
    
    // Replace mongoose with mock
    global.mongoose = mockMongoose;
    
    // Override require cache for mongoose
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    Module.prototype.require = function(id) {
      if (id === 'mongoose') {
        return mockMongoose;
      }
      return originalRequire.apply(this, arguments);
    };
  }

  async cleanup() {
    if (this.isDatabaseAvailable) {
      try {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.warn('⚠️  Error closing database connection:', error.message);
      }
    }
    
    if (this.mockMode) {
      // Restore original mongoose
      if (this.originalMongoose) {
        global.mongoose = this.originalMongoose;
      }
    }
  }

  isMockMode() {
    return this.mockMode;
  }

  isDatabaseConnected() {
    return this.isDatabaseAvailable;
  }
}

// Create global test environment
const testEnv = new TestEnvironment();

module.exports = { TestEnvironment, testEnv };