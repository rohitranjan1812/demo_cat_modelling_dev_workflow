# Test Implementation Guide
**Companion to:** Comprehensive Testing Blueprint  
**Date:** October 10, 2025  
**Status:** Practical Implementation Roadmap  
**Version:** 1.0

---

## Purpose

This guide provides practical, step-by-step instructions for implementing the testing architecture defined in the Comprehensive Testing Blueprint. It maps the blueprint's theoretical structure to concrete implementation tasks.

---

## Quick Start: Test Development Cycle

### The TDD Approach

```
1. Write a failing test
   ↓
2. Write minimal code to pass
   ↓
3. Refactor while keeping tests green
   ↓
4. Commit and push
   ↓
5. Repeat
```

### Before You Start

**Prerequisites:**
- [ ] Read the Comprehensive Testing Blueprint
- [ ] Understand the application architecture
- [ ] Set up development environment
- [ ] Verify Jest is installed and configured
- [ ] Ensure database access (MongoDB)

---

## Phase 1 Implementation: Foundation & Core Units

### Week 1, Day 1-2: Test Infrastructure Setup

#### Task 1.1: Configure Jest
**File:** `jest.config.js`

Current configuration is basic. Enhance it:

```javascript
module.exports = {
  // Environment
  testEnvironment: 'node',
  testTimeout: 30000,
  
  // Test Discovery
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
    '**/tests/system/**/*.test.js'
  ],
  
  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Performance
  maxWorkers: '50%',
  
  // Paths
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleDirectories: ['node_modules', 'src'],
  
  // Ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/tests/'
  ],
  
  // Verbose output
  verbose: true
};
```

**Action Items:**
- [ ] Update `jest.config.js` with enhanced configuration
- [ ] Test configuration: `npx jest --showConfig`
- [ ] Commit: "Enhanced Jest configuration for comprehensive testing"

---

#### Task 1.2: Create Global Setup/Teardown
**File:** `tests/global-setup.js`

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async () => {
  // Start in-memory MongoDB for tests
  const mongod = new MongoMemoryServer();
  await mongod.start();
  
  const uri = mongod.getUri();
  global.__MONGOD__ = mongod;
  global.__MONGO_URI__ = uri;
  
  console.log('🚀 Global test setup: MongoDB started');
  console.log(`   URI: ${uri}`);
};
```

**File:** `tests/global-teardown.js`

```javascript
module.exports = async () => {
  // Stop in-memory MongoDB
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
    console.log('✅ Global test teardown: MongoDB stopped');
  }
};
```

**Action Items:**
- [ ] Create `tests/global-setup.js`
- [ ] Create `tests/global-teardown.js`
- [ ] Update `tests/setup.js` to use global MongoDB URI
- [ ] Test: `npx jest tests/models/Account.test.js`
- [ ] Commit: "Add global test setup/teardown with in-memory MongoDB"

---

#### Task 1.3: Enhanced Test Utilities
**File:** `tests/helpers/test-utils.js`

```javascript
const mongoose = require('mongoose');

class TestUtils {
  /**
   * Check if database is available
   */
  static isDatabaseAvailable() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Connect to test database
   */
  static async connectDatabase() {
    const uri = global.__MONGO_URI__ || process.env.MONGODB_TEST_URI;
    if (!uri) {
      throw new Error('Test database URI not available');
    }
    
    if (mongoose.connection.readyState !== 0) {
      return; // Already connected
    }
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  /**
   * Disconnect from test database
   */
  static async disconnectDatabase() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  /**
   * Clear all collections
   */
  static async clearDatabase() {
    if (!this.isDatabaseAvailable()) {
      return;
    }
    
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  /**
   * Create test data
   */
  static async createTestData(model, data) {
    if (!this.isDatabaseAvailable()) {
      throw new Error('Database not available');
    }
    
    if (Array.isArray(data)) {
      return await model.insertMany(data);
    }
    return await model.create(data);
  }

  /**
   * Factory for generating test data
   */
  static generateMockData(type, overrides = {}) {
    const factories = {
      account: () => ({
        accountId: `ACC-${Date.now()}`,
        accountName: `Test Account ${Math.random().toString(36).substr(2, 9)}`,
        accountType: 'Primary',
        status: 'Active',
        region: 'North America',
        country: 'USA',
        currency: 'USD',
        ...overrides
      }),
      
      hazard: () => ({
        hazardId: `HAZ-${Date.now()}`,
        hazardName: `Test Hazard ${Math.random().toString(36).substr(2, 9)}`,
        perilType: 'Hurricane',
        severity: 'Medium',
        coordinates: {
          type: 'Point',
          coordinates: [-80.1918, 25.7617] // Miami
        },
        ...overrides
      }),
      
      vulnerability: () => ({
        vulnerabilityId: `VUL-${Date.now()}`,
        vulnerabilityName: `Test Vulnerability ${Math.random().toString(36).substr(2, 9)}`,
        assetType: 'Residential',
        constructionType: 'Wood Frame',
        vulnerabilityCurve: {
          intensityMetric: 'Wind Speed',
          damagePoints: [
            { intensity: 0, damageRatio: 0 },
            { intensity: 100, damageRatio: 0.5 },
            { intensity: 200, damageRatio: 1.0 }
          ]
        },
        ...overrides
      }),
      
      policy: (accountId) => ({
        policyId: `POL-${Date.now()}`,
        accountId: accountId || `ACC-${Date.now()}`,
        policyNumber: `PN${Date.now()}`,
        policyName: `Test Policy ${Math.random().toString(36).substr(2, 9)}`,
        policyType: 'Direct',
        totalLimit: 1000000,
        totalDeductible: 10000,
        currency: 'USD',
        effectiveDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        ...overrides
      }),
      
      location: (accountId) => ({
        locationId: `LOC-${Date.now()}`,
        accountId: accountId || `ACC-${Date.now()}`,
        locationName: `Test Location ${Math.random().toString(36).substr(2, 9)}`,
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        },
        coordinates: {
          latitude: 25.7617,
          longitude: -80.1918
        },
        totalInsuredValue: 500000,
        ...overrides
      })
    };
    
    const factory = factories[type];
    if (!factory) {
      throw new Error(`Unknown data type: ${type}`);
    }
    
    return factory();
  }

  /**
   * Wait for async operations
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Assert deep equality with better error messages
   */
  static assertDeepEqual(actual, expected, path = 'root') {
    if (actual === expected) return;
    
    if (typeof actual !== typeof expected) {
      throw new Error(`Type mismatch at ${path}: ${typeof actual} vs ${typeof expected}`);
    }
    
    if (actual === null || expected === null) {
      throw new Error(`Null mismatch at ${path}`);
    }
    
    if (typeof actual === 'object') {
      const actualKeys = Object.keys(actual);
      const expectedKeys = Object.keys(expected);
      
      const missingKeys = expectedKeys.filter(k => !actualKeys.includes(k));
      if (missingKeys.length > 0) {
        throw new Error(`Missing keys at ${path}: ${missingKeys.join(', ')}`);
      }
      
      for (const key of expectedKeys) {
        this.assertDeepEqual(actual[key], expected[key], `${path}.${key}`);
      }
    } else if (actual !== expected) {
      throw new Error(`Value mismatch at ${path}: ${actual} vs ${expected}`);
    }
  }
}

module.exports = TestUtils;
```

**Action Items:**
- [ ] Move existing `tests/test-utils.js` to `tests/helpers/test-utils.js`
- [ ] Enhance with factory methods
- [ ] Add assertion helpers
- [ ] Update imports in existing tests
- [ ] Commit: "Enhanced test utilities with factory methods"

---

#### Task 1.4: Mock Data Generators
**File:** `tests/helpers/mock-generators.js`

```javascript
const { faker } = require('@faker-js/faker');

class MockDataGenerator {
  /**
   * Generate multiple accounts with related data
   */
  static generateAccountWithHierarchy(depth = 2) {
    const parentAccount = {
      accountId: faker.string.uuid(),
      accountName: faker.company.name(),
      accountType: 'Primary',
      status: 'Active',
      region: faker.location.state(),
      country: 'USA',
      currency: 'USD'
    };
    
    if (depth > 0) {
      parentAccount.children = Array.from({ length: 2 }, () =>
        this.generateAccountWithHierarchy(depth - 1)
      );
    }
    
    return parentAccount;
  }

  /**
   * Generate hazard with related events and zones
   */
  static generateHazardWithEvents(eventCount = 5) {
    const hazard = {
      hazardId: faker.string.uuid(),
      hazardName: `${faker.location.city()} ${faker.helpers.arrayElement(['Hurricane', 'Earthquake', 'Flood'])}`,
      perilType: faker.helpers.arrayElement(['Hurricane', 'Earthquake', 'Flood', 'Wildfire']),
      severity: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Extreme']),
      coordinates: {
        type: 'Point',
        coordinates: [
          parseFloat(faker.location.longitude()),
          parseFloat(faker.location.latitude())
        ]
      }
    };
    
    hazard.events = Array.from({ length: eventCount }, (_, i) => ({
      eventId: faker.string.uuid(),
      hazardId: hazard.hazardId,
      eventDate: faker.date.recent(),
      intensity: faker.number.float({ min: 0, max: 10, precision: 0.1 }),
      affectedArea: faker.number.int({ min: 100, max: 10000 })
    }));
    
    return hazard;
  }

  /**
   * Generate portfolio with accounts, policies, and locations
   */
  static generatePortfolio(accountCount = 3) {
    const accounts = Array.from({ length: accountCount }, () => {
      const account = {
        accountId: faker.string.uuid(),
        accountName: faker.company.name(),
        accountType: 'Primary',
        status: 'Active',
        region: faker.location.state(),
        country: 'USA',
        currency: 'USD'
      };
      
      account.policies = Array.from({ length: 2 }, () => ({
        policyId: faker.string.uuid(),
        accountId: account.accountId,
        policyNumber: faker.string.alphanumeric(10),
        policyName: `${faker.commerce.productName()} Policy`,
        policyType: 'Direct',
        totalLimit: faker.number.int({ min: 100000, max: 10000000 }),
        totalDeductible: faker.number.int({ min: 1000, max: 100000 }),
        currency: 'USD',
        effectiveDate: faker.date.past(),
        expiryDate: faker.date.future()
      }));
      
      account.locations = Array.from({ length: 3 }, () => ({
        locationId: faker.string.uuid(),
        accountId: account.accountId,
        locationName: faker.location.streetAddress(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          zipCode: faker.location.zipCode(),
          country: 'USA'
        },
        coordinates: {
          latitude: parseFloat(faker.location.latitude()),
          longitude: parseFloat(faker.location.longitude())
        },
        totalInsuredValue: faker.number.int({ min: 100000, max: 5000000 })
      }));
      
      return account;
    });
    
    return accounts;
  }

  /**
   * Generate simulation configuration
   */
  static generateSimulationConfig() {
    return {
      simulationName: `Test Simulation ${faker.string.alphanumeric(6)}`,
      simulationDescription: faker.lorem.sentence(),
      perils: faker.helpers.arrayElements(['Hurricane', 'Earthquake', 'Flood'], 2),
      numIterations: faker.number.int({ min: 1000, max: 10000 }),
      geographicScope: {
        type: 'Circle',
        center: {
          latitude: parseFloat(faker.location.latitude()),
          longitude: parseFloat(faker.location.longitude())
        },
        radius: faker.number.int({ min: 10, max: 500 })
      },
      temporalScope: {
        startDate: faker.date.past(),
        endDate: faker.date.future()
      }
    };
  }
}

module.exports = MockDataGenerator;
```

**Action Items:**
- [ ] Install `@faker-js/faker`: `npm install --save-dev @faker-js/faker`
- [ ] Create `tests/helpers/mock-generators.js`
- [ ] Test generators in a simple test
- [ ] Commit: "Add mock data generators using faker"

---

### Week 1, Day 3-5: Model Unit Tests

#### Task 2.1: Account Model Tests
**File:** `tests/unit/models/Account.test.js`

```javascript
const mongoose = require('mongoose');
const Account = require('../../../src/models/Account');
const TestUtils = require('../../helpers/test-utils');

describe('Account Model - Unit Tests', () => {
  beforeAll(async () => {
    await TestUtils.connectDatabase();
  });

  afterAll(async () => {
    await TestUtils.disconnectDatabase();
  });

  beforeEach(async () => {
    await TestUtils.clearDatabase();
  });

  describe('Schema Validation', () => {
    it('should create account with valid data', async () => {
      const accountData = TestUtils.generateMockData('account');
      const account = await Account.create(accountData);
      
      expect(account).toBeDefined();
      expect(account._id).toBeDefined();
      expect(account.accountId).toBe(accountData.accountId);
      expect(account.accountName).toBe(accountData.accountName);
    });

    it('should require accountId', async () => {
      const accountData = TestUtils.generateMockData('account');
      delete accountData.accountId;
      
      await expect(Account.create(accountData)).rejects.toThrow();
    });

    it('should require accountName', async () => {
      const accountData = TestUtils.generateMockData('account');
      delete accountData.accountName;
      
      await expect(Account.create(accountData)).rejects.toThrow();
    });

    it('should enforce unique accountId', async () => {
      const accountData = TestUtils.generateMockData('account');
      await Account.create(accountData);
      
      await expect(Account.create(accountData)).rejects.toThrow();
    });

    it('should validate accountType enum', async () => {
      const accountData = TestUtils.generateMockData('account', {
        accountType: 'InvalidType'
      });
      
      await expect(Account.create(accountData)).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const accountData = TestUtils.generateMockData('account', {
        status: 'InvalidStatus'
      });
      
      await expect(Account.create(accountData)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    it('should calculate total exposure correctly', async () => {
      const account = await TestUtils.createTestData(
        Account,
        TestUtils.generateMockData('account')
      );
      
      // Test method (if it exists in the model)
      if (typeof account.calculateTotalExposure === 'function') {
        const exposure = await account.calculateTotalExposure();
        expect(typeof exposure).toBe('number');
        expect(exposure).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Static Methods', () => {
    it('should find accounts by region', async () => {
      const region = 'North America';
      await TestUtils.createTestData(Account, [
        TestUtils.generateMockData('account', { region }),
        TestUtils.generateMockData('account', { region: 'Europe' }),
        TestUtils.generateMockData('account', { region })
      ]);
      
      const accounts = await Account.find({ region });
      expect(accounts).toHaveLength(2);
      accounts.forEach(acc => expect(acc.region).toBe(region));
    });

    it('should find active accounts only', async () => {
      await TestUtils.createTestData(Account, [
        TestUtils.generateMockData('account', { status: 'Active' }),
        TestUtils.generateMockData('account', { status: 'Inactive' }),
        TestUtils.generateMockData('account', { status: 'Active' })
      ]);
      
      const activeAccounts = await Account.find({ status: 'Active' });
      expect(activeAccounts).toHaveLength(2);
    });
  });

  describe('Relationships', () => {
    it('should support parent-child relationships', async () => {
      const parent = await TestUtils.createTestData(
        Account,
        TestUtils.generateMockData('account')
      );
      
      const child = await TestUtils.createTestData(
        Account,
        TestUtils.generateMockData('account', {
          parentAccountId: parent.accountId
        })
      );
      
      expect(child.parentAccountId).toBe(parent.accountId);
      
      // Verify we can query children
      const children = await Account.find({ parentAccountId: parent.accountId });
      expect(children).toHaveLength(1);
      expect(children[0]._id.toString()).toBe(child._id.toString());
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty optional fields', async () => {
      const minimalData = {
        accountId: `ACC-${Date.now()}`,
        accountName: 'Minimal Account',
        accountType: 'Primary',
        status: 'Active'
      };
      
      const account = await Account.create(minimalData);
      expect(account).toBeDefined();
    });

    it('should trim whitespace from string fields', async () => {
      const accountData = TestUtils.generateMockData('account', {
        accountName: '  Test Account  '
      });
      
      const account = await Account.create(accountData);
      expect(account.accountName).toBe('Test Account');
    });
  });
});
```

**Action Items:**
- [ ] Create directory: `tests/unit/models/`
- [ ] Create `tests/unit/models/Account.test.js`
- [ ] Run test: `npx jest tests/unit/models/Account.test.js`
- [ ] Fix any failures
- [ ] Achieve >90% coverage for Account model
- [ ] Commit: "Add comprehensive unit tests for Account model"

**Repeat similar pattern for:**
- [ ] `tests/unit/models/Policy.test.js`
- [ ] `tests/unit/models/Location.test.js`
- [ ] `tests/unit/models/Hazard.test.js`
- [ ] `tests/unit/models/Vulnerability.test.js`
- [ ] `tests/unit/models/SimulationRun.test.js`

---

### Week 2, Day 1-3: Service Unit Tests

#### Task 3.1: Financial Calculation Service Tests
**File:** `tests/unit/services/FinancialCalculationService.test.js`

```javascript
const FinancialCalculationService = require('../../../src/services/FinancialCalculationService');

describe('FinancialCalculationService - Unit Tests', () => {
  let service;

  beforeEach(() => {
    service = new FinancialCalculationService();
  });

  describe('Currency Conversion', () => {
    it('should convert USD to EUR correctly', () => {
      const result = service.convertCurrency(100, 'USD', 'EUR');
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('should return same amount for same currency', () => {
      const result = service.convertCurrency(100, 'USD', 'USD');
      expect(result).toBe(100);
    });

    it('should handle zero amount', () => {
      const result = service.convertCurrency(0, 'USD', 'EUR');
      expect(result).toBe(0);
    });

    it('should throw error for invalid currency', () => {
      expect(() => {
        service.convertCurrency(100, 'USD', 'INVALID');
      }).toThrow();
    });
  });

  describe('Expected Loss Calculation', () => {
    it('should calculate expected loss for event list', () => {
      const events = [
        { loss: 1000, probability: 0.1 },
        { loss: 2000, probability: 0.2 },
        { loss: 3000, probability: 0.05 }
      ];
      
      const el = service.calculateExpectedLoss(events);
      // EL = 1000*0.1 + 2000*0.2 + 3000*0.05 = 650
      expect(el).toBeCloseTo(650, 2);
    });

    it('should return 0 for empty event list', () => {
      const el = service.calculateExpectedLoss([]);
      expect(el).toBe(0);
    });

    it('should handle single event', () => {
      const events = [{ loss: 1000, probability: 1.0 }];
      const el = service.calculateExpectedLoss(events);
      expect(el).toBe(1000);
    });
  });

  describe('Value at Risk (VaR) Calculation', () => {
    it('should calculate VaR at 95% confidence', () => {
      const losses = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      const var95 = service.calculateVaR(losses, 0.95);
      
      expect(var95).toBeGreaterThan(0);
      expect(var95).toBeLessThanOrEqual(Math.max(...losses));
    });

    it('should calculate VaR at 99% confidence', () => {
      const losses = Array.from({ length: 100 }, (_, i) => (i + 1) * 100);
      const var99 = service.calculateVaR(losses, 0.99);
      
      expect(var99).toBeGreaterThan(0);
    });

    it('should handle identical values', () => {
      const losses = Array(100).fill(1000);
      const var95 = service.calculateVaR(losses, 0.95);
      expect(var95).toBe(1000);
    });

    it('should throw error for invalid confidence level', () => {
      expect(() => {
        service.calculateVaR([100, 200], 1.5);
      }).toThrow();
    });
  });

  describe('Tail Value at Risk (TVaR) Calculation', () => {
    it('should calculate TVaR correctly', () => {
      const losses = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      const tvar95 = service.calculateTVaR(losses, 0.95);
      
      expect(tvar95).toBeGreaterThan(0);
      expect(tvar95).toBeGreaterThanOrEqual(service.calculateVaR(losses, 0.95));
    });

    it('should be greater than or equal to VaR', () => {
      const losses = Array.from({ length: 100 }, (_, i) => (i + 1) * 100);
      const var99 = service.calculateVaR(losses, 0.99);
      const tvar99 = service.calculateTVaR(losses, 0.99);
      
      expect(tvar99).toBeGreaterThanOrEqual(var99);
    });
  });

  describe('Portfolio Risk Metrics', () => {
    it('should calculate comprehensive risk metrics', () => {
      const events = Array.from({ length: 1000 }, (_, i) => ({
        loss: Math.random() * 10000,
        probability: 1 / 1000
      }));
      
      const metrics = service.calculatePortfolioRiskMetrics(events);
      
      expect(metrics).toHaveProperty('expectedLoss');
      expect(metrics).toHaveProperty('var95');
      expect(metrics).toHaveProperty('var99');
      expect(metrics).toHaveProperty('tvar95');
      expect(metrics).toHaveProperty('tvar99');
      expect(metrics).toHaveProperty('standardDeviation');
      
      expect(metrics.expectedLoss).toBeGreaterThan(0);
      expect(metrics.var99).toBeGreaterThanOrEqual(metrics.var95);
      expect(metrics.tvar99).toBeGreaterThanOrEqual(metrics.var99);
    });
  });

  describe('Loss Adjustment Calculations', () => {
    it('should apply deductible correctly', () => {
      const grossLoss = 10000;
      const deductible = 1000;
      
      const netLoss = service.applyDeductible(grossLoss, deductible);
      expect(netLoss).toBe(9000);
    });

    it('should return 0 if loss below deductible', () => {
      const grossLoss = 500;
      const deductible = 1000;
      
      const netLoss = service.applyDeductible(grossLoss, deductible);
      expect(netLoss).toBe(0);
    });

    it('should apply policy limit correctly', () => {
      const grossLoss = 2000000;
      const limit = 1000000;
      
      const cappedLoss = service.applyLimit(grossLoss, limit);
      expect(cappedLoss).toBe(1000000);
    });

    it('should not modify loss below limit', () => {
      const grossLoss = 500000;
      const limit = 1000000;
      
      const cappedLoss = service.applyLimit(grossLoss, limit);
      expect(cappedLoss).toBe(500000);
    });

    it('should apply deductible and limit together', () => {
      const grossLoss = 1500000;
      const deductible = 100000;
      const limit = 1000000;
      
      const netLoss = service.applyPolicyTerms(grossLoss, deductible, limit);
      // After deductible: 1400000, after limit: 1000000
      expect(netLoss).toBe(1000000);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle negative losses', () => {
      expect(() => {
        service.calculateExpectedLoss([{ loss: -1000, probability: 0.5 }]);
      }).toThrow();
    });

    it('should handle invalid probabilities', () => {
      expect(() => {
        service.calculateExpectedLoss([{ loss: 1000, probability: 1.5 }]);
      }).toThrow();
    });

    it('should handle very large numbers', () => {
      const largeEvents = [
        { loss: 1e12, probability: 0.001 },
        { loss: 1e11, probability: 0.01 }
      ];
      
      const el = service.calculateExpectedLoss(largeEvents);
      expect(el).toBeGreaterThan(0);
      expect(isFinite(el)).toBe(true);
    });

    it('should handle very small probabilities', () => {
      const events = [
        { loss: 1000000, probability: 1e-10 },
        { loss: 500000, probability: 1e-9 }
      ];
      
      const el = service.calculateExpectedLoss(events);
      expect(el).toBeGreaterThanOrEqual(0);
      expect(isFinite(el)).toBe(true);
    });
  });
});
```

**Action Items:**
- [ ] Create directory: `tests/unit/services/`
- [ ] Create comprehensive tests for FinancialCalculationService
- [ ] Achieve >90% coverage
- [ ] Commit: "Add comprehensive unit tests for FinancialCalculationService"

**Repeat for other services:**
- [ ] ProbabilityDistributionService
- [ ] AccountService
- [ ] HazardService
- [ ] VulnerabilityService

---

## Phase 2 Implementation: Integration Tests

### Week 2, Day 4-5: Controller Integration Tests

#### Task 4.1: Account Controller Integration Tests
**File:** `tests/integration/controllers/accountController.test.js`

```javascript
const request = require('supertest');
const app = require('../../../src/app');
const Account = require('../../../src/models/Account');
const TestUtils = require('../../helpers/test-utils');

describe('AccountController - Integration Tests', () => {
  beforeAll(async () => {
    await TestUtils.connectDatabase();
  });

  afterAll(async () => {
    await TestUtils.disconnectDatabase();
  });

  beforeEach(async () => {
    await TestUtils.clearDatabase();
  });

  describe('POST /api/v1/accounts', () => {
    it('should create a new account', async () => {
      const accountData = TestUtils.generateMockData('account');
      
      const response = await request(app)
        .post('/api/v1/accounts')
        .send(accountData)
        .expect(201);
      
      expect(response.body).toHaveProperty('accountId');
      expect(response.body.accountName).toBe(accountData.accountName);
      
      // Verify in database
      const dbAccount = await Account.findOne({ accountId: accountData.accountId });
      expect(dbAccount).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidData = { accountName: 'Test' }; // Missing accountId
      
      await request(app)
        .post('/api/v1/accounts')
        .send(invalidData)
        .expect(400);
    });

    it('should prevent duplicate accountId', async () => {
      const accountData = TestUtils.generateMockData('account');
      
      await request(app)
        .post('/api/v1/accounts')
        .send(accountData)
        .expect(201);
      
      // Try to create again
      await request(app)
        .post('/api/v1/accounts')
        .send(accountData)
        .expect(409); // Conflict or 400
    });
  });

  describe('GET /api/v1/accounts', () => {
    it('should return all accounts', async () => {
      // Create test accounts
      await TestUtils.createTestData(Account, [
        TestUtils.generateMockData('account'),
        TestUtils.generateMockData('account'),
        TestUtils.generateMockData('account')
      ]);
      
      const response = await request(app)
        .get('/api/v1/accounts')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });

    it('should return empty array when no accounts', async () => {
      const response = await request(app)
        .get('/api/v1/accounts')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should support pagination', async () => {
      // Create 10 accounts
      const accounts = Array.from({ length: 10 }, () =>
        TestUtils.generateMockData('account')
      );
      await TestUtils.createTestData(Account, accounts);
      
      const response = await request(app)
        .get('/api/v1/accounts')
        .query({ page: 1, limit: 5 })
        .expect(200);
      
      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/v1/accounts/:accountId', () => {
    it('should return account by ID', async () => {
      const account = await TestUtils.createTestData(
        Account,
        TestUtils.generateMockData('account')
      );
      
      const response = await request(app)
        .get(`/api/v1/accounts/${account.accountId}`)
        .expect(200);
      
      expect(response.body.accountId).toBe(account.accountId);
      expect(response.body.accountName).toBe(account.accountName);
    });

    it('should return 404 for non-existent account', async () => {
      await request(app)
        .get('/api/v1/accounts/NON-EXISTENT')
        .expect(404);
    });
  });

  describe('PUT /api/v1/accounts/:accountId', () => {
    it('should update account', async () => {
      const account = await TestUtils.createTestData(
        Account,
        TestUtils.generateMockData('account')
      );
      
      const updateData = { accountName: 'Updated Name' };
      
      const response = await request(app)
        .put(`/api/v1/accounts/${account.accountId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.accountName).toBe('Updated Name');
      
      // Verify in database
      const updated = await Account.findOne({ accountId: account.accountId });
      expect(updated.accountName).toBe('Updated Name');
    });

    it('should return 404 for non-existent account', async () => {
      await request(app)
        .put('/api/v1/accounts/NON-EXISTENT')
        .send({ accountName: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/accounts/:accountId', () => {
    it('should delete account', async () => {
      const account = await TestUtils.createTestData(
        Account,
        TestUtils.generateMockData('account')
      );
      
      await request(app)
        .delete(`/api/v1/accounts/${account.accountId}`)
        .expect(200);
      
      // Verify deleted from database
      const deleted = await Account.findOne({ accountId: account.accountId });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent account', async () => {
      await request(app)
        .delete('/api/v1/accounts/NON-EXISTENT')
        .expect(404);
    });
  });

  describe('GET /api/v1/accounts/statistics', () => {
    it('should return account statistics', async () => {
      await TestUtils.createTestData(Account, [
        TestUtils.generateMockData('account', { status: 'Active' }),
        TestUtils.generateMockData('account', { status: 'Active' }),
        TestUtils.generateMockData('account', { status: 'Inactive' })
      ]);
      
      const response = await request(app)
        .get('/api/v1/accounts/statistics')
        .expect(200);
      
      expect(response.body).toHaveProperty('total');
      expect(response.body.total).toBe(3);
    });
  });

  describe('GET /api/v1/accounts/region/:region', () => {
    it('should filter accounts by region', async () => {
      const region = 'North America';
      await TestUtils.createTestData(Account, [
        TestUtils.generateMockData('account', { region }),
        TestUtils.generateMockData('account', { region: 'Europe' }),
        TestUtils.generateMockData('account', { region })
      ]);
      
      const response = await request(app)
        .get(`/api/v1/accounts/region/${encodeURIComponent(region)}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      response.body.forEach(acc => expect(acc.region).toBe(region));
    });
  });
});
```

**Action Items:**
- [ ] Create `tests/integration/controllers/accountController.test.js`
- [ ] Run tests and verify they pass
- [ ] Achieve >80% coverage for controller
- [ ] Commit: "Add integration tests for Account controller"

---

## Phase 3 Implementation: System & E2E Tests

### Week 3: End-to-End Workflow Tests

#### Task 5.1: Simulation Workflow E2E Test
**File:** `tests/system/e2e/simulation-workflow.test.js`

```javascript
const request = require('supertest');
const app = require('../../../src/app');
const TestUtils = require('../../helpers/test-utils');
const MockDataGenerator = require('../../helpers/mock-generators');

describe('E2E: Complete Simulation Workflow', () => {
  beforeAll(async () => {
    await TestUtils.connectDatabase();
  });

  afterAll(async () => {
    await TestUtils.disconnectDatabase();
  });

  beforeEach(async () => {
    await TestUtils.clearDatabase();
  });

  it('should complete full simulation lifecycle', async () => {
    // Step 1: Create test data (accounts, hazards, vulnerabilities)
    const portfolio = MockDataGenerator.generatePortfolio(2);
    
    // Create accounts
    for (const account of portfolio) {
      await request(app)
        .post('/api/v1/accounts')
        .send(account)
        .expect(201);
    }
    
    // Create hazard
    const hazard = MockDataGenerator.generateHazardWithEvents(1);
    const hazardResponse = await request(app)
      .post('/api/v1/hazards')
      .send(hazard)
      .expect(201);
    
    // Step 2: Configure simulation
    const simulationConfig = {
      simulationName: 'E2E Test Simulation',
      perils: ['Hurricane'],
      numIterations: 100,
      accountIds: portfolio.map(a => a.accountId)
    };
    
    // Step 3: Start simulation
    const startResponse = await request(app)
      .post('/api/v1/simulations/start')
      .send(simulationConfig)
      .expect(201);
    
    expect(startResponse.body).toHaveProperty('simulationRunId');
    const runId = startResponse.body.simulationRunId;
    
    // Step 4: Wait for simulation to complete
    await TestUtils.wait(2000); // Wait 2 seconds
    
    // Step 5: Check simulation status
    const statusResponse = await request(app)
      .get(`/api/v1/simulations/runs/${runId}`)
      .expect(200);
    
    expect(statusResponse.body).toHaveProperty('status');
    expect(['Running', 'Completed']).toContain(statusResponse.body.status);
    
    // Step 6: Get simulation results
    const resultsResponse = await request(app)
      .get(`/api/v1/simulations/runs/${runId}/results`)
      .expect(200);
    
    expect(resultsResponse.body).toHaveProperty('results');
    
    // Step 7: Verify results structure
    const results = resultsResponse.body.results;
    expect(results).toHaveProperty('summary');
    expect(results.summary).toHaveProperty('totalEvents');
    expect(results.summary).toHaveProperty('totalLoss');
    
    // Step 8: Export results
    const exportResponse = await request(app)
      .get(`/api/v1/simulations/runs/${runId}/export`)
      .query({ format: 'json' })
      .expect(200);
    
    expect(exportResponse.body).toBeDefined();
  }, 30000); // 30 second timeout for E2E test
});
```

**Action Items:**
- [ ] Create `tests/system/e2e/simulation-workflow.test.js`
- [ ] Test the full workflow
- [ ] Add error scenario tests
- [ ] Commit: "Add E2E test for complete simulation workflow"

---

## NPM Scripts for Test Execution

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:system": "jest tests/system",
    "test:e2e": "jest tests/system/e2e",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## Continuous Integration Setup

### GitHub Actions Workflow
**File:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop, copilot/** ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

---

## Summary Checklist

### Foundation Phase
- [ ] Enhanced Jest configuration
- [ ] Global setup/teardown
- [ ] Enhanced test utilities
- [ ] Mock data generators
- [ ] Test helper functions

### Unit Tests Phase
- [ ] All model tests (6 models)
- [ ] All service tests (7 services)
- [ ] Utility function tests
- [ ] Middleware tests
- [ ] >90% coverage achieved

### Integration Tests Phase
- [ ] Controller integration tests (5 controllers)
- [ ] Service integration tests
- [ ] API endpoint tests
- [ ] Database integration tests
- [ ] >85% coverage achieved

### System Tests Phase
- [ ] E2E workflow tests (3 major workflows)
- [ ] API system tests
- [ ] UI component tests
- [ ] >80% coverage achieved

### CI/CD Integration
- [ ] GitHub Actions workflow
- [ ] Automated test execution
- [ ] Coverage reporting
- [ ] Test result artifacts

---

**Next Steps:**
1. Start with Phase 1, Task 1.1
2. Work sequentially through tasks
3. Commit after each completed task
4. Review coverage after each phase
5. Adjust targets as needed

**Document Version:** 1.0  
**Last Updated:** October 10, 2025
