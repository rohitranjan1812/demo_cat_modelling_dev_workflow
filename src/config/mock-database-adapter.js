/**
 * Mock Database Adapter
 * Provides a simple in-memory database for development when MongoDB is not available
 */

class MockDatabaseAdapter {
  constructor() {
    this.collections = new Map();
    this.idCounter = 1;
  }

  // Simulate Mongoose Schema
  Schema(definition) {
    return {
      definition,
      pre: () => {},
      post: () => {},
      methods: {},
      statics: {},
      virtual: () => ({ get: () => {}, set: () => {} })
    };
  }

  // Simulate Mongoose Model
  model(name, schema) {
    const collectionName = name.toLowerCase();
    
    const MockModel = function(data) {
      this._id = data._id || `mock_${MockDatabaseAdapter.generateId()}`;
      Object.assign(this, data);
      this.createdAt = this.createdAt || new Date();
      this.updatedAt = this.updatedAt || new Date();
      
      this.save = async () => {
        const collection = MockDatabaseAdapter.getCollection(collectionName);
        const existingIndex = collection.findIndex(doc => doc._id === this._id);
        if (existingIndex >= 0) {
          collection[existingIndex] = { ...this };
        } else {
          collection.push({ ...this });
        }
        return this;
      };

      this.toObject = () => ({ ...this });
      this.toJSON = () => ({ ...this });
    };

    // Add static methods to the constructor
    MockModel.find = async (query = {}) => {
      const collection = MockDatabaseAdapter.getCollection(collectionName);
      return collection.filter(doc => MockDatabaseAdapter.matchesQuery(doc, query));
    };

    MockModel.findOne = async (query = {}) => {
      const collection = MockDatabaseAdapter.getCollection(collectionName);
      return collection.find(doc => MockDatabaseAdapter.matchesQuery(doc, query)) || null;
    };

    MockModel.findById = async (id) => {
      return MockModel.findOne({ _id: id });
    };

    MockModel.create = async (data) => {
      if (Array.isArray(data)) {
        return Promise.all(data.map(item => new MockModel(item).save()));
      } else {
        return new MockModel(data).save();
      }
    };

    MockModel.findByIdAndUpdate = async (id, update, options = {}) => {
      const doc = await MockModel.findById(id);
      if (doc) {
        Object.assign(doc, update);
        doc.updatedAt = new Date();
        await new MockModel(doc).save();
        return options.new === false ? doc : { ...doc, ...update };
      }
      return null;
    };

    MockModel.findByIdAndDelete = async (id) => {
      const collection = MockDatabaseAdapter.getCollection(collectionName);
      const index = collection.findIndex(doc => doc._id === id);
      if (index >= 0) {
        return collection.splice(index, 1)[0];
      }
      return null;
    };

    MockModel.deleteOne = async (query) => {
      const collection = MockDatabaseAdapter.getCollection(collectionName);
      const index = collection.findIndex(doc => MockDatabaseAdapter.matchesQuery(doc, query));
      if (index >= 0) {
        collection.splice(index, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    };

    MockModel.deleteMany = async (query = {}) => {
      const collection = MockDatabaseAdapter.getCollection(collectionName);
      const originalLength = collection.length;
      const filtered = collection.filter(doc => !MockDatabaseAdapter.matchesQuery(doc, query));
      collection.splice(0, collection.length, ...filtered);
      return { deletedCount: originalLength - collection.length };
    };

    MockModel.countDocuments = async (query = {}) => {
      const collection = MockDatabaseAdapter.getCollection(collectionName);
      return collection.filter(doc => MockDatabaseAdapter.matchesQuery(doc, query)).length;
    };

    MockModel.aggregate = async () => {
      return [];
    };

    return MockModel;
  }

  static getCollection(name) {
    if (!MockDatabaseAdapter.instance) {
      MockDatabaseAdapter.instance = new MockDatabaseAdapter();
    }
    if (!MockDatabaseAdapter.instance.collections.has(name)) {
      MockDatabaseAdapter.instance.collections.set(name, []);
    }
    return MockDatabaseAdapter.instance.collections.get(name);
  }

  static generateId() {
    if (!MockDatabaseAdapter.instance) {
      MockDatabaseAdapter.instance = new MockDatabaseAdapter();
    }
    return MockDatabaseAdapter.instance.idCounter++;
  }

  static matchesQuery(doc, query) {
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

  static clear() {
    if (MockDatabaseAdapter.instance) {
      MockDatabaseAdapter.instance.collections.clear();
      MockDatabaseAdapter.instance.idCounter = 1;
    }
  }
}

module.exports = new MockDatabaseAdapter();
