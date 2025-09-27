/**
 * Mock Database Service for Testing
 * Provides in-memory database functionality for tests that don't require MongoDB
 */
class MockDatabase {
  constructor() {
    this.collections = new Map();
    this.idCounter = 1;
  }

  // Create a collection
  createCollection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, []);
    }
    return this.collections.get(name);
  }

  // Insert a document
  insertOne(collectionName, document) {
    const collection = this.createCollection(collectionName);
    const doc = {
      _id: this.generateId(),
      ...document,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    collection.push(doc);
    return { insertedId: doc._id, acknowledged: true };
  }

  // Insert multiple documents
  insertMany(collectionName, documents) {
    const collection = this.createCollection(collectionName);
    const docs = documents.map(doc => ({
      _id: this.generateId(),
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    collection.push(...docs);
    return { insertedIds: docs.map(d => d._id), acknowledged: true };
  }

  // Find documents
  find(collectionName, query = {}) {
    const collection = this.createCollection(collectionName);
    return collection.filter(doc => this.matchesQuery(doc, query));
  }

  // Find one document
  findOne(collectionName, query = {}) {
    const collection = this.createCollection(collectionName);
    return collection.find(doc => this.matchesQuery(doc, query)) || null;
  }

  // Update documents
  updateOne(collectionName, query, update) {
    const collection = this.createCollection(collectionName);
    const index = collection.findIndex(doc => this.matchesQuery(doc, query));
    if (index !== -1) {
      collection[index] = { ...collection[index], ...update, updatedAt: new Date() };
      return { modifiedCount: 1, acknowledged: true };
    }
    return { modifiedCount: 0, acknowledged: true };
  }

  // Update multiple documents
  updateMany(collectionName, query, update) {
    const collection = this.createCollection(collectionName);
    let modifiedCount = 0;
    collection.forEach((doc, index) => {
      if (this.matchesQuery(doc, query)) {
        collection[index] = { ...doc, ...update, updatedAt: new Date() };
        modifiedCount++;
      }
    });
    return { modifiedCount, acknowledged: true };
  }

  // Delete documents
  deleteOne(collectionName, query) {
    const collection = this.createCollection(collectionName);
    const index = collection.findIndex(doc => this.matchesQuery(doc, query));
    if (index !== -1) {
      collection.splice(index, 1);
      return { deletedCount: 1, acknowledged: true };
    }
    return { deletedCount: 0, acknowledged: true };
  }

  // Delete multiple documents
  deleteMany(collectionName, query = {}) {
    const collection = this.createCollection(collectionName);
    const originalLength = collection.length;
    const filtered = collection.filter(doc => !this.matchesQuery(doc, query));
    collection.splice(0, collection.length, ...filtered);
    return { deletedCount: originalLength - collection.length, acknowledged: true };
  }

  // Count documents
  countDocuments(collectionName, query = {}) {
    const collection = this.createCollection(collectionName);
    return collection.filter(doc => this.matchesQuery(doc, query)).length;
  }

  // Clear all collections
  clear() {
    this.collections.clear();
    this.idCounter = 1;
  }

  // Generate unique ID
  generateId() {
    return `mock_${this.idCounter++}_${Date.now()}`;
  }

  // Simple query matching
  matchesQuery(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      if (key === '_id') {
        if (doc._id !== value) return false;
      } else if (typeof value === 'object' && value !== null) {
        if (value.$in && !value.$in.includes(doc[key])) return false;
        if (value.$gt && doc[key] <= value.$gt) return false;
        if (value.$lt && doc[key] >= value.$lt) return false;
        if (value.$gte && doc[key] < value.$gte) return false;
        if (value.$lte && doc[key] > value.$lte) return false;
        if (value.$ne && doc[key] === value.$ne) return false;
        if (value.$regex && !new RegExp(value.$regex).test(doc[key])) return false;
      } else {
        if (doc[key] !== value) return false;
      }
    }
    return true;
  }
}

// Create global mock database instance
const mockDb = new MockDatabase();

// Mock mongoose methods
const mockMongoose = {
  connection: {
    readyState: 1,
    db: {
      dropDatabase: () => Promise.resolve({ ok: 1 })
    },
    close: () => Promise.resolve()
  },
  Schema: function() { return this; },
  model: function(name, schema) {
    const collectionName = name.toLowerCase() + 's';
    
    return {
      create: (docs) => {
        if (Array.isArray(docs)) {
          return Promise.resolve(mockDb.insertMany(collectionName, docs));
        } else {
          return Promise.resolve(mockDb.insertOne(collectionName, docs));
        }
      },
      save: function() {
        return Promise.resolve(mockDb.insertOne(collectionName, this.toObject()));
      },
      find: (query) => Promise.resolve(mockDb.find(collectionName, query)),
      findOne: (query) => Promise.resolve(mockDb.findOne(collectionName, query)),
      findById: (id) => Promise.resolve(mockDb.findOne(collectionName, { _id: id })),
      findByIdAndUpdate: (id, update) => Promise.resolve(mockDb.updateOne(collectionName, { _id: id }, update)),
      findByIdAndDelete: (id) => Promise.resolve(mockDb.deleteOne(collectionName, { _id: id })),
      updateOne: (query, update) => Promise.resolve(mockDb.updateOne(collectionName, query, update)),
      updateMany: (query, update) => Promise.resolve(mockDb.updateMany(collectionName, query, update)),
      deleteOne: (query) => Promise.resolve(mockDb.deleteOne(collectionName, query)),
      deleteMany: (query) => Promise.resolve(mockDb.deleteMany(collectionName, query)),
      insertMany: (docs) => Promise.resolve(mockDb.insertMany(collectionName, docs)),
      countDocuments: (query) => Promise.resolve(mockDb.countDocuments(collectionName, query)),
      aggregate: () => Promise.resolve([])
    };
  },
  connect: () => Promise.resolve(),
  disconnect: () => Promise.resolve()
};

module.exports = { MockDatabase, mockDb, mockMongoose };