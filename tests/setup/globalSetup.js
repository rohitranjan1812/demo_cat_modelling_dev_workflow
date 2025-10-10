const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

module.exports = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Store for use in tests
  process.env.MONGODB_URI = uri;
  
  // Create the MongoDB Memory Server
  await mongoose.connect(uri);
  
  // Add to global for cleanup
  global.__MONGOD__ = mongod;
};