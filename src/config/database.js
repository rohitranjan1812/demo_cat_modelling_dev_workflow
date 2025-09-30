const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.useMockDB = process.env.USE_MOCK_DB === 'true';
  }

  async connect() {
    try {
      // Use mock database if configured
      if (this.useMockDB) {
        console.log('🔧 Using Mock Database (MongoDB not required)');
        console.log('✅ Mock Database initialized successfully');
        return { isMock: true };
      }

      if (!process.env.MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not set. Falling back to mock database...');
        this.useMockDB = true;
        process.env.USE_MOCK_DB = 'true';
        console.log('✅ Mock Database initialized successfully');
        return { isMock: true };
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
      console.warn('⚠️  Falling back to mock database...');
      this.useMockDB = true;
      process.env.USE_MOCK_DB = 'true';
      console.log('✅ Mock Database initialized successfully');
      return { isMock: true };
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
