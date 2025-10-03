/**
 * Enhanced Mock Database Adapter
 * Provides sample data for development when MongoDB is not available
 */

const {
  sampleHazards,
  sampleVulnerabilities,
  sampleSimulations,
  sampleAccounts
} = require('./sample-data');

class EnhancedMockDatabase {
  constructor() {
    this.collections = new Map();
    this.idCounter = 1000;
    this.initializeCollections();
  }

  initializeCollections() {
    // Initialize with sample data
    this.collections.set('hazards', [...sampleHazards]);
    this.collections.set('hazard', [...sampleHazards]);
    this.collections.set('vulnerabilities', [...sampleVulnerabilities]);
    this.collections.set('vulnerability', [...sampleVulnerabilities]);
    this.collections.set('simulationruns', this.generateSimulationRuns());
    this.collections.set('simulationrun', this.generateSimulationRuns());
    this.collections.set('accounts', this.generateAccounts());
    this.collections.set('account', this.generateAccounts());
    this.collections.set('hazardevents', this.generateHazardEvents());
    this.collections.set('hazardevent', this.generateHazardEvents());
    this.collections.set('hazardzones', this.generateHazardZones());
    this.collections.set('hazardzone', this.generateHazardZones());
    this.collections.set('hazardscenarios', this.generateHazardScenarios());
    this.collections.set('hazardscenario', this.generateHazardScenarios());
    this.collections.set('locations', this.generateLocations());
    this.collections.set('location', this.generateLocations());
    this.collections.set('policies', this.generatePolicies());
    this.collections.set('policy', this.generatePolicies());
  }

  generateSimulationRuns() {
    return [
      {
        _id: 'SIMRUN-20250102-100001',
        simulationRunId: 'SIMRUN-20250102-100001',
        simulationName: 'Hurricane Season 2025 Analysis',
        simulationDescription: 'Comprehensive analysis of potential hurricane impacts for 2025 season',
        status: 'Completed',
        progress: 100,
        startedAt: new Date('2025-01-02T10:00:00Z'),
        completedAt: new Date('2025-01-02T10:30:00Z'),
        configuration: {
          startYear: 2025,
          endYear: 2025,
          timeHorizon: 1,
          timeHorizonUnit: 'years',
          hazardTypes: ['Hurricane'],
          geographicScope: {
            regions: ['North America', 'Caribbean']
          },
          exposureScope: {
            currency: 'USD',
            totalExposure: 150000000
          },
          modelingConfig: {
            numberOfSimulations: 10000,
            modelProvider: 'RMS',
            modelType: 'Probabilistic',
            resolution: 'High'
          }
        },
        results: {
          totalEvents: 450,
          totalLoss: 45000000,
          averageLoss: 100000,
          maxLoss: 5000000,
          probabilityExceedance: {
            '1%': 5000000,
            '5%': 2000000,
            '10%': 1000000,
            '50%': 100000
          }
        },
        createdBy: 'system',
        createdAt: new Date('2025-01-02T09:55:00Z'),
        updatedAt: new Date('2025-01-02T10:30:00Z')
      },
      {
        _id: 'SIMRUN-20250102-110001',
        simulationRunId: 'SIMRUN-20250102-110001',
        simulationName: 'California Earthquake Risk Assessment',
        simulationDescription: 'Seismic risk evaluation for California portfolio',
        status: 'Running',
        progress: 65,
        startedAt: new Date('2025-01-02T11:00:00Z'),
        configuration: {
          startYear: 2025,
          endYear: 2030,
          timeHorizon: 5,
          timeHorizonUnit: 'years',
          hazardTypes: ['Earthquake'],
          geographicScope: {
            regions: ['North America']
          },
          exposureScope: {
            currency: 'USD',
            totalExposure: 200000000
          },
          modelingConfig: {
            numberOfSimulations: 50000,
            modelProvider: 'AIR',
            modelType: 'Probabilistic',
            resolution: 'High'
          }
        },
        createdBy: 'system',
        createdAt: new Date('2025-01-02T10:55:00Z'),
        updatedAt: new Date('2025-01-02T11:15:00Z')
      },
      {
        _id: 'SIMRUN-20250101-140001',
        simulationRunId: 'SIMRUN-20250101-140001',
        simulationName: 'European Flood Scenario',
        simulationDescription: 'Multi-country flood impact assessment',
        status: 'Failed',
        progress: 23,
        error: 'Insufficient memory for large-scale simulation',
        startedAt: new Date('2025-01-01T14:00:00Z'),
        failedAt: new Date('2025-01-01T14:15:00Z'),
        configuration: {
          startYear: 2025,
          endYear: 2025,
          timeHorizon: 1,
          timeHorizonUnit: 'years',
          hazardTypes: ['Flood'],
          geographicScope: {
            regions: ['Europe']
          },
          modelingConfig: {
            numberOfSimulations: 100000,
            modelProvider: 'JBA',
            modelType: 'Hybrid'
          }
        },
        createdBy: 'system',
        createdAt: new Date('2025-01-01T13:55:00Z'),
        updatedAt: new Date('2025-01-01T14:15:00Z')
      }
    ];
  }

  generateAccounts() {
    return [
      {
        _id: 'acc_001',
        accountId: 'ACC-2025-001',
        accountName: 'Global Insurance Corporation',
        accountType: 'Corporate',
        industry: 'Financial Services',
        region: 'North America',
        country: 'USA',
        status: 'Active',
        riskProfile: {
          overallRiskScore: 72,
          riskLevel: 'Medium-High',
          lastAssessmentDate: new Date('2025-01-01')
        },
        exposure: {
          totalExposure: 150000000,
          currency: 'USD',
          byHazardType: {
            Hurricane: 50000000,
            Earthquake: 40000000,
            Flood: 30000000,
            Other: 30000000
          }
        },
        policies: 125,
        locations: 45,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-02')
      },
      {
        _id: 'acc_002',
        accountId: 'ACC-2025-002',
        accountName: 'European Reinsurance Group',
        accountType: 'Reinsurance',
        industry: 'Insurance',
        region: 'Europe',
        country: 'Germany',
        status: 'Active',
        riskProfile: {
          overallRiskScore: 68,
          riskLevel: 'Medium',
          lastAssessmentDate: new Date('2025-01-01')
        },
        exposure: {
          totalExposure: 200000000,
          currency: 'EUR',
          byHazardType: {
            Flood: 80000000,
            Wind: 60000000,
            Earthquake: 30000000,
            Other: 30000000
          }
        },
        policies: 200,
        locations: 75,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2025-01-02')
      },
      {
        _id: 'acc_003',
        accountId: 'ACC-2025-003',
        accountName: 'Asia Pacific Holdings',
        accountType: 'Corporate',
        industry: 'Real Estate',
        region: 'Asia Pacific',
        country: 'Japan',
        status: 'Active',
        riskProfile: {
          overallRiskScore: 85,
          riskLevel: 'High',
          lastAssessmentDate: new Date('2024-12-15')
        },
        exposure: {
          totalExposure: 300000000,
          currency: 'JPY',
          byHazardType: {
            Earthquake: 150000000,
            Typhoon: 100000000,
            Tsunami: 30000000,
            Other: 20000000
          }
        },
        policies: 85,
        locations: 30,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2025-01-01')
      }
    ];
  }

  generateHazardEvents() {
    return [
      {
        _id: 'event_001',
        hazardId: 'hazard_1',
        eventName: 'Hurricane Maria Landfall',
        eventDate: new Date('2025-09-15'),
        eventMagnitude: 4,
        eventIntensity: 'Category 4',
        affectedAreas: ['Puerto Rico', 'US Virgin Islands'],
        estimatedLoss: 15000000,
        actualLoss: null,
        status: 'Projected',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02')
      },
      {
        _id: 'event_002',
        hazardId: 'hazard_2',
        eventName: 'San Andreas Fault Activity',
        eventDate: new Date('2024-12-20'),
        eventMagnitude: 6.8,
        eventIntensity: 'Strong',
        affectedAreas: ['Los Angeles', 'San Francisco'],
        estimatedLoss: 50000000,
        actualLoss: 48500000,
        status: 'Historical',
        createdAt: new Date('2024-12-21'),
        updatedAt: new Date('2024-12-25')
      }
    ];
  }

  generateHazardZones() {
    return [
      {
        _id: 'zone_001',
        zoneName: 'Gulf Coast Hurricane Zone',
        zoneType: 'Hurricane',
        riskLevel: 'Very High',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-97.5, 25.8], [-97.5, 30.5], [-81.0, 30.5], [-81.0, 25.8], [-97.5, 25.8]]]
        },
        affectedStates: ['Texas', 'Louisiana', 'Mississippi', 'Alabama', 'Florida'],
        annualProbability: 0.35,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        _id: 'zone_002',
        zoneName: 'California Seismic Zone',
        zoneType: 'Earthquake',
        riskLevel: 'High',
        geometry: {
          type: 'Polygon',
          coordinates: [[[-124.5, 32.5], [-124.5, 42.0], [-114.0, 42.0], [-114.0, 32.5], [-124.5, 32.5]]]
        },
        affectedStates: ['California'],
        annualProbability: 0.25,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }

  generateHazardScenarios() {
    return [
      {
        _id: 'scenario_001',
        scenarioName: 'Category 5 Hurricane - Miami Direct Hit',
        scenarioType: 'Hurricane',
        probability: 0.02,
        estimatedLoss: 75000000,
        affectedAccounts: 45,
        affectedPolicies: 1250,
        description: 'Direct landfall of Category 5 hurricane on Miami metropolitan area',
        status: 'Active',
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-06-01')
      },
      {
        _id: 'scenario_002',
        scenarioName: 'M8.0 San Andreas Earthquake',
        scenarioType: 'Earthquake',
        probability: 0.005,
        estimatedLoss: 200000000,
        affectedAccounts: 120,
        affectedPolicies: 5000,
        description: 'Major earthquake along San Andreas fault affecting Los Angeles basin',
        status: 'Active',
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-06-01')
      }
    ];
  }

  generateLocations() {
    return [
      {
        _id: 'loc_001',
        locationId: 'LOC-001',
        accountId: 'acc_001',
        locationName: 'Miami Office Complex',
        address: '1000 Biscayne Blvd, Miami, FL 33132',
        latitude: 25.7617,
        longitude: -80.1918,
        buildingValue: 25000000,
        contentsValue: 5000000,
        businessInterruptionValue: 10000000,
        occupancy: 'Commercial Office',
        construction: 'Reinforced Concrete',
        yearBuilt: 2010,
        stories: 25,
        squareFootage: 250000,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        _id: 'loc_002',
        locationId: 'LOC-002',
        accountId: 'acc_002',
        locationName: 'Frankfurt Data Center',
        address: 'Hanauer Landstraße 150, 60314 Frankfurt',
        latitude: 50.1109,
        longitude: 8.6821,
        buildingValue: 50000000,
        contentsValue: 100000000,
        businessInterruptionValue: 25000000,
        occupancy: 'Data Center',
        construction: 'Steel Frame',
        yearBuilt: 2015,
        stories: 5,
        squareFootage: 100000,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      }
    ];
  }

  generatePolicies() {
    return [
      {
        _id: 'pol_001',
        policyNumber: 'POL-2025-001',
        accountId: 'acc_001',
        policyType: 'Property',
        coverageType: 'All Risk',
        effectiveDate: new Date('2025-01-01'),
        expirationDate: new Date('2025-12-31'),
        limit: 50000000,
        deductible: 100000,
        premium: 250000,
        status: 'Active',
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date('2024-12-15')
      },
      {
        _id: 'pol_002',
        policyNumber: 'POL-2025-002',
        accountId: 'acc_002',
        policyType: 'Catastrophe XOL',
        coverageType: 'Named Perils',
        effectiveDate: new Date('2025-01-01'),
        expirationDate: new Date('2025-12-31'),
        limit: 100000000,
        attachment: 50000000,
        premium: 1500000,
        status: 'Active',
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-20')
      }
    ];
  }

  getCollection(name) {
    const collectionName = name.toLowerCase();
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, []);
    }
    return this.collections.get(collectionName);
  }

  generateId() {
    return `mock_${Date.now()}_${this.idCounter++}`;
  }

  matchesQuery(doc, query) {
    if (!query || Object.keys(query).length === 0) return true;
    
    return Object.keys(query).every(key => {
      if (key === '$or') {
        return query[key].some(orQuery => this.matchesQuery(doc, orQuery));
      }
      if (key === '$and') {
        return query[key].every(andQuery => this.matchesQuery(doc, andQuery));
      }
      if (typeof query[key] === 'object' && query[key] !== null) {
        if (query[key].$in) {
          return query[key].$in.includes(doc[key]);
        }
        if (query[key].$regex) {
          const regex = new RegExp(query[key].$regex, query[key].$options || '');
          return regex.test(doc[key]);
        }
        if (query[key].$gte !== undefined || query[key].$lte !== undefined || 
            query[key].$gt !== undefined || query[key].$lt !== undefined) {
          const value = doc[key];
          if (query[key].$gte !== undefined && value < query[key].$gte) return false;
          if (query[key].$lte !== undefined && value > query[key].$lte) return false;
          if (query[key].$gt !== undefined && value <= query[key].$gt) return false;
          if (query[key].$lt !== undefined && value >= query[key].$lt) return false;
          return true;
        }
      }
      return doc[key] === query[key];
    });
  }

  // Simulate Mongoose Schema
  Schema(definition) {
    const schema = {
      definition,
      methods: {},
      statics: {},
      virtual: () => ({ get: () => {} }),
      plugin: () => {},
      index: () => {},
      pre: () => {},
      post: () => {},
      set: () => {}
    };
    return schema;
  }

  // Simulate Mongoose Model
  model(name, schema) {
    const collectionName = name.toLowerCase();
    const self = this;
    
    const MockModel = function(data) {
      this._id = data._id || self.generateId();
      Object.assign(this, data);
      this.createdAt = this.createdAt || new Date();
      this.updatedAt = this.updatedAt || new Date();
      
      this.save = async () => {
        const collection = self.getCollection(collectionName);
        const existingIndex = collection.findIndex(doc => doc._id === this._id);
        if (existingIndex >= 0) {
          this.updatedAt = new Date();
          collection[existingIndex] = { ...this };
        } else {
          collection.push({ ...this });
        }
        return this;
      };

      this.toObject = () => ({ ...this });
      this.toJSON = () => ({ ...this });
    };

    // Static methods
    MockModel.find = async (query = {}, options = {}) => {
      const collection = self.getCollection(collectionName);
      let results = collection.filter(doc => self.matchesQuery(doc, query));
      
      // Handle sorting
      if (options.sort) {
        const sortKeys = Object.keys(options.sort);
        results.sort((a, b) => {
          for (const key of sortKeys) {
            const order = options.sort[key];
            if (a[key] < b[key]) return order === 1 ? -1 : 1;
            if (a[key] > b[key]) return order === 1 ? 1 : -1;
          }
          return 0;
        });
      }
      
      // Handle limit
      if (options.limit) {
        results = results.slice(0, options.limit);
      }
      
      // Handle skip
      if (options.skip) {
        results = results.slice(options.skip);
      }
      
      // Return chainable query object
      return {
        sort: function(sortOptions) {
          if (sortOptions) {
            const sortKeys = Object.keys(sortOptions);
            results.sort((a, b) => {
              for (const key of sortKeys) {
                const order = sortOptions[key];
                if (a[key] < b[key]) return order === 1 ? -1 : 1;
                if (a[key] > b[key]) return order === 1 ? 1 : -1;
              }
              return 0;
            });
          }
          return this;
        },
        limit: function(n) {
          results = results.slice(0, n);
          return this;
        },
        skip: function(n) {
          results = results.slice(n);
          return this;
        },
        populate: function() {
          return this;
        },
        exec: async function() {
          return results;
        },
        then: function(resolve, reject) {
          return Promise.resolve(results).then(resolve, reject);
        }
      };
    };

    MockModel.findOne = async (query = {}) => {
      const collection = self.getCollection(collectionName);
      return collection.find(doc => self.matchesQuery(doc, query)) || null;
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
      const collection = self.getCollection(collectionName);
      const docIndex = collection.findIndex(doc => doc._id === id);
      
      if (docIndex === -1) {
        if (options.upsert) {
          const newDoc = new MockModel({ _id: id, ...update });
          return newDoc.save();
        }
        return null;
      }
      
      const updatedDoc = { 
        ...collection[docIndex], 
        ...update,
        updatedAt: new Date()
      };
      collection[docIndex] = updatedDoc;
      
      return options.new ? updatedDoc : collection[docIndex];
    };

    MockModel.findByIdAndDelete = async (id) => {
      const collection = self.getCollection(collectionName);
      const docIndex = collection.findIndex(doc => doc._id === id);
      
      if (docIndex === -1) return null;
      
      const deleted = collection[docIndex];
      collection.splice(docIndex, 1);
      return deleted;
    };

    MockModel.deleteOne = async (query) => {
      const collection = self.getCollection(collectionName);
      const docIndex = collection.findIndex(doc => self.matchesQuery(doc, query));
      
      if (docIndex === -1) return { deletedCount: 0 };
      
      collection.splice(docIndex, 1);
      return { deletedCount: 1 };
    };

    MockModel.deleteMany = async (query = {}) => {
      const collection = self.getCollection(collectionName);
      const initialLength = collection.length;
      const remaining = collection.filter(doc => !self.matchesQuery(doc, query));
      self.collections.set(collectionName, remaining);
      return { deletedCount: initialLength - remaining.length };
    };

    MockModel.countDocuments = async (query = {}) => {
      const collection = self.getCollection(collectionName);
      return collection.filter(doc => self.matchesQuery(doc, query)).length;
    };

    MockModel.aggregate = async (pipeline) => {
      const collection = self.getCollection(collectionName);
      let results = [...collection];
      
      // Simple aggregate implementation
      for (const stage of pipeline) {
        if (stage.$match) {
          results = results.filter(doc => self.matchesQuery(doc, stage.$match));
        } else if (stage.$group) {
          // Simple grouping implementation
          const groups = {};
          results.forEach(doc => {
            const key = stage.$group._id === null ? 'null' : doc[stage.$group._id];
            if (!groups[key]) {
              groups[key] = { _id: key };
            }
            // Handle count
            if (stage.$group.count) {
              groups[key].count = (groups[key].count || 0) + 1;
            }
          });
          results = Object.values(groups);
        }
      }
      
      return results;
    };

    MockModel.insertMany = async (docs) => {
      const savedDocs = [];
      for (const doc of docs) {
        const newDoc = new MockModel(doc);
        await newDoc.save();
        savedDocs.push(newDoc);
      }
      return savedDocs;
    };

    return MockModel;
  }

  // Additional helper methods
  Types = {
    ObjectId: () => this.generateId()
  };

  connect = async () => {
    console.log('🔧 Enhanced Mock Database connected with sample data');
    return this;
  };

  disconnect = async () => {
    console.log('🔌 Enhanced Mock Database disconnected');
  };

  dropDatabase = async () => {
    this.collections.clear();
    this.initializeCollections();
  };
}

// Create singleton instance
const enhancedMockDB = new EnhancedMockDatabase();

// Mongoose compatibility layer
enhancedMockDB.connection = {
  readyState: 1,
  on: () => {},
  once: () => {}
};

// Add Schema constructor with Types
enhancedMockDB.Schema = function(definition) {
  const schema = {
    definition,
    methods: {},
    statics: {},
    virtual: () => ({ get: () => {} }),
    plugin: () => {},
    index: () => {},
    pre: () => {},
    post: () => {},
    set: () => {}
  };
  return schema;
};

// Add Schema Types for compatibility
enhancedMockDB.Schema.Types = {
  Mixed: 'Mixed',
  ObjectId: 'ObjectId',
  String: String,
  Number: Number,
  Boolean: Boolean,
  Array: Array,
  Date: Date,
  Buffer: Buffer,
  Map: Map
};

module.exports = enhancedMockDB;
