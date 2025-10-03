const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.useMockDB = process.env.USE_MOCK_DB === 'true';
  }

  async connect() {
    try {
      // Use enhanced mock database if configured
      if (this.useMockDB) {
        const enhancedMockDB = require('./enhanced-mock-database');
        console.log('🔧 Using Enhanced Mock Database with sample data');
        await enhancedMockDB.connect();
        console.log('✅ Enhanced Mock Database initialized successfully');
        
        // Replace mongoose with mock for model creation
        global.mockMongoose = enhancedMockDB;
        
        return { isMock: true, connection: enhancedMockDB };
      }

      if (!process.env.MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not set. Falling back to enhanced mock database...');
        this.useMockDB = true;
        process.env.USE_MOCK_DB = 'true';
        const enhancedMockDB = require('./enhanced-mock-database');
        await enhancedMockDB.connect();
        console.log('✅ Enhanced Mock Database initialized successfully');
        global.mockMongoose = enhancedMockDB;
        return { isMock: true, connection: enhancedMockDB };
      }
      
      const mongoUri = process.env.NODE_ENV === 'test' 
        ? process.env.MONGODB_TEST_URI 
        : process.env.MONGODB_URI;

      console.log(`🔄 Attempting to connect to MongoDB: ${mongoUri}`);

      this.connection = await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ Connected to MongoDB: ${mongoUri}`);
      
      // Set up connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      console.warn('⚠️  Falling back to enhanced mock database...');
      this.useMockDB = true;
      process.env.USE_MOCK_DB = 'true';
      const enhancedMockDB = require('./enhanced-mock-database');
      await enhancedMockDB.connect();
      console.log('✅ Enhanced Mock Database initialized successfully');
      global.mockMongoose = enhancedMockDB;
      return { isMock: true, connection: enhancedMockDB };
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new DatabaseConnection();
