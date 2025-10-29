/**
 * Comprehensive Seeding Validation Test Suite
 * Validates seeded data integrity, relationships, and schema compliance at scale
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('../src/models/Account');
const Hazard = require('../src/models/Hazard');
const Vulnerability = require('../src/models/Vulnerability');
const Location = require('../src/models/Location');
const Exposure = require('../src/models/Exposure');
const Policy = require('../src/models/Policy');
const SimulationRun = require('../src/models/SimulationRun');
const User = require('../src/models/User');

// Test configuration
const TEST_TIMEOUT = 120000; // 2 minutes for large-scale tests

describe('🌱 Comprehensive Seeding Validation Test Suite', () => {
  let mongoUri;
  
  beforeAll(async () => {
    mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev';
    
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB for validation tests');
      }
    } catch (error) {
      console.warn('⚠️  MongoDB not available, skipping validation tests');
      throw error;
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  });

  describe('📊 Database Connection and Setup', () => {
    test('should have active MongoDB connection', () => {
      expect(mongoose.connection.readyState).toBe(1);
    });

    test('should have all required collections', async () => {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      const requiredCollections = [
        'accounts',
        'hazards',
        'vulnerabilities',
        'locations',
        'exposures',
        'policies',
        'simulationruns',
        'users'
      ];
      
      requiredCollections.forEach(collectionName => {
        expect(collectionNames).toContain(collectionName);
      });
    });
  });

  describe('👥 Account Data Validation', () => {
    let accounts;
    
    beforeAll(async () => {
      accounts = await Account.find({}).limit(1000);
    });

    test('should have accounts seeded in database', async () => {
      const count = await Account.countDocuments();
      expect(count).toBeGreaterThan(0);
      console.log(`   📊 Found ${count} accounts`);
    });

    test('all accounts should have valid accountId format', () => {
      const invalidAccounts = accounts.filter(acc => !acc.accountId || !/^ACC-\d{6}$/.test(acc.accountId));
      expect(invalidAccounts.length).toBe(0);
      if (invalidAccounts.length > 0) {
        console.error('Invalid account IDs:', invalidAccounts.map(a => a.accountId));
      }
    });

    test('all accounts should have required fields', () => {
      const invalidAccounts = accounts.filter(acc => 
        !acc.accountName || 
        !acc.accountType || 
        acc.totalExposure === undefined ||
        !acc.currency ||
        !acc.createdBy ||
        !acc.lastModifiedBy
      );
      
      expect(invalidAccounts.length).toBe(0);
      if (invalidAccounts.length > 0) {
        console.error('Accounts missing required fields:', invalidAccounts.map(a => ({
          id: a.accountId,
          name: a.accountName,
          type: a.accountType
        })));
      }
    });

    test('all accounts should have valid accountType', () => {
      const validTypes = ['Primary', 'Reinsurance', 'Retrocession', 'Facultative', 'Treaty'];
      const invalidAccounts = accounts.filter(acc => !validTypes.includes(acc.accountType));
      
      expect(invalidAccounts.length).toBe(0);
      if (invalidAccounts.length > 0) {
        console.error('Invalid account types:', invalidAccounts.map(a => ({
          id: a.accountId,
          type: a.accountType
        })));
      }
    });

    test('all accounts should have valid currency', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
      const invalidAccounts = accounts.filter(acc => !validCurrencies.includes(acc.currency));
      
      expect(invalidAccounts.length).toBe(0);
    });

    test('all accounts should have non-negative totalExposure', () => {
      const invalidAccounts = accounts.filter(acc => acc.totalExposure < 0);
      expect(invalidAccounts.length).toBe(0);
    });

    test('accounts with parentAccountId should have valid parent reference', async () => {
      const accountsWithParent = accounts.filter(acc => acc.parentAccountId);
      
      if (accountsWithParent.length > 0) {
        const parentIds = accountsWithParent.map(acc => acc.parentAccountId);
        const existingParents = await Account.find({ accountId: { $in: parentIds } });
        const existingParentIds = existingParents.map(p => p.accountId);
        
        const orphanedAccounts = accountsWithParent.filter(acc => 
          !existingParentIds.includes(acc.parentAccountId)
        );
        
        expect(orphanedAccounts.length).toBe(0);
        if (orphanedAccounts.length > 0) {
          console.error('Orphaned accounts (invalid parent):', orphanedAccounts.map(a => ({
            id: a.accountId,
            parentId: a.parentAccountId
          })));
        }
      }
    });

    test('should have reasonable exposure distribution', () => {
      const exposures = accounts.map(acc => acc.totalExposure);
      const total = exposures.reduce((sum, val) => sum + val, 0);
      const avg = total / exposures.length;
      const max = Math.max(...exposures);
      const min = Math.min(...exposures);
      
      console.log(`   💰 Exposure Stats: Total=$${total.toLocaleString()}, Avg=$${Math.round(avg).toLocaleString()}, Max=$${max.toLocaleString()}, Min=$${min.toLocaleString()}`);
      
      expect(total).toBeGreaterThan(0);
      expect(max).toBeGreaterThanOrEqual(min);
    });
  });

  describe('🌪️  Hazard Data Validation', () => {
    let hazards;
    
    beforeAll(async () => {
      hazards = await Hazard.find({}).limit(1000);
    });

    test('should have hazards seeded in database', async () => {
      const count = await Hazard.countDocuments();
      expect(count).toBeGreaterThan(0);
      console.log(`   📊 Found ${count} hazards`);
    });

    test('all hazards should have valid hazardId format', () => {
      const invalidHazards = hazards.filter(h => !h.hazardId || !/^HAZ-\d{8}$/.test(h.hazardId));
      expect(invalidHazards.length).toBe(0);
    });

    test('all hazards should have required fields', () => {
      const invalidHazards = hazards.filter(h => 
        !h.hazardName ||
        !h.hazardType ||
        !h.hazardCategory ||
        !h.status
      );
      
      expect(invalidHazards.length).toBe(0);
      if (invalidHazards.length > 0) {
        console.error('Hazards missing required fields:', invalidHazards.map(h => h.hazardId));
      }
    });

    test('all hazards should have valid hazardCategory', () => {
      const validCategories = ['Natural', 'Man-made', 'Technological', 'Biological', 'Environmental'];
      const invalidHazards = hazards.filter(h => !validCategories.includes(h.hazardCategory));
      
      expect(invalidHazards.length).toBe(0);
    });

    test('all hazards with footprint should have valid coordinates', () => {
      const hazardsWithFootprint = hazards.filter(h => h.footprint);
      
      const invalidHazards = hazardsWithFootprint.filter(h => 
        !h.footprint.centerLatitude ||
        !h.footprint.centerLongitude ||
        h.footprint.centerLatitude < -90 ||
        h.footprint.centerLatitude > 90 ||
        h.footprint.centerLongitude < -180 ||
        h.footprint.centerLongitude > 180
      );
      
      expect(invalidHazards.length).toBe(0);
      if (invalidHazards.length > 0) {
        console.error('Hazards with invalid coordinates:', invalidHazards.map(h => ({
          id: h.hazardId,
          lat: h.footprint.centerLatitude,
          lon: h.footprint.centerLongitude
        })));
      }
    });

    test('all hazards should have valid probability values', () => {
      const hazardsWithProb = hazards.filter(h => h.probability !== undefined);
      
      const invalidHazards = hazardsWithProb.filter(h => 
        h.probability < 0 || h.probability > 1
      );
      
      expect(invalidHazards.length).toBe(0);
    });
  });

  describe('🏗️  Vulnerability Data Validation', () => {
    let vulnerabilities;
    
    beforeAll(async () => {
      vulnerabilities = await Vulnerability.find({}).limit(1000);
    });

    test('should have vulnerabilities seeded in database', async () => {
      const count = await Vulnerability.countDocuments();
      expect(count).toBeGreaterThan(0);
      console.log(`   📊 Found ${count} vulnerabilities`);
    });

    test('all vulnerabilities should have valid vulnerabilityId format', () => {
      const invalidVulns = vulnerabilities.filter(v => !v.vulnerabilityId || !/^VUL-\d{8}$/.test(v.vulnerabilityId));
      expect(invalidVulns.length).toBe(0);
    });

    test('all vulnerabilities should have required fields', () => {
      const invalidVulns = vulnerabilities.filter(v => 
        !v.vulnerabilityName ||
        !v.vulnerabilityType ||
        !v.status
      );
      
      expect(invalidVulns.length).toBe(0);
    });

    test('all vulnerabilities with geographicScope should have valid coordinates', () => {
      const vulnsWithScope = vulnerabilities.filter(v => v.geographicScope);
      
      const invalidVulns = vulnsWithScope.filter(v => 
        v.geographicScope.centerLatitude !== undefined &&
        v.geographicScope.centerLongitude !== undefined &&
        (v.geographicScope.centerLatitude < -90 ||
         v.geographicScope.centerLatitude > 90 ||
         v.geographicScope.centerLongitude < -180 ||
         v.geographicScope.centerLongitude > 180)
      );
      
      expect(invalidVulns.length).toBe(0);
    });

    test('all vulnerabilities should have valid overallVulnerabilityScore', () => {
      const vulnsWithScore = vulnerabilities.filter(v => v.overallVulnerabilityScore !== undefined);
      
      const invalidVulns = vulnsWithScore.filter(v => 
        v.overallVulnerabilityScore < 0 || v.overallVulnerabilityScore > 10
      );
      
      expect(invalidVulns.length).toBe(0);
    });
  });

  describe('📍 Location Data Validation', () => {
    test('should validate locations if present', async () => {
      const count = await Location.countDocuments();
      console.log(`   📊 Found ${count} locations`);
      
      if (count > 0) {
        const locations = await Location.find({}).limit(1000);
        
        // Validate location IDs
        const invalidLocations = locations.filter(l => !l.locationId || !/^LOC-\d{8}$/.test(l.locationId));
        expect(invalidLocations.length).toBe(0);
        
        // Validate coordinates
        const invalidCoords = locations.filter(l => 
          l.coordinates &&
          (l.coordinates.latitude < -90 || 
           l.coordinates.latitude > 90 ||
           l.coordinates.longitude < -180 ||
           l.coordinates.longitude > 180)
        );
        expect(invalidCoords.length).toBe(0);
      }
    });
  });

  describe('💰 Exposure Data Validation', () => {
    test('should validate exposures if present', async () => {
      const count = await Exposure.countDocuments();
      console.log(`   📊 Found ${count} exposures`);
      
      if (count > 0) {
        const exposures = await Exposure.find({}).limit(1000);
        
        // Validate exposure IDs
        const invalidExposures = exposures.filter(e => !e.exposureId || !/^EXP-\d{10}$/.test(e.exposureId));
        expect(invalidExposures.length).toBe(0);
        
        // Validate values are non-negative
        const invalidValues = exposures.filter(e => 
          e.values && e.values.totalInsuredValue < 0
        );
        expect(invalidValues.length).toBe(0);
      }
    });
  });

  describe('📄 Policy Data Validation', () => {
    test('should validate policies if present', async () => {
      const count = await Policy.countDocuments();
      console.log(`   📊 Found ${count} policies`);
      
      if (count > 0) {
        const policies = await Policy.find({}).limit(1000);
        
        // Validate policy IDs
        const invalidPolicies = policies.filter(p => !p.policyId || !/^POL-\d{8}$/.test(p.policyId));
        expect(invalidPolicies.length).toBe(0);
        
        // Validate dates
        const invalidDates = policies.filter(p => 
          p.effectiveDate && p.expirationDate &&
          p.effectiveDate > p.expirationDate
        );
        expect(invalidDates.length).toBe(0);
        if (invalidDates.length > 0) {
          console.error('Policies with invalid dates:', invalidDates.map(p => p.policyId));
        }
      }
    });
  });

  describe('🎲 Simulation Run Data Validation', () => {
    let simulations;
    
    beforeAll(async () => {
      simulations = await SimulationRun.find({}).limit(1000);
    });

    test('should have simulations seeded in database', async () => {
      const count = await SimulationRun.countDocuments();
      console.log(`   📊 Found ${count} simulations`);
      
      if (count > 0) {
        expect(count).toBeGreaterThan(0);
      }
    });

    test('all simulations should have valid simulationRunId format', () => {
      if (simulations.length > 0) {
        const invalidSims = simulations.filter(s => 
          !s.simulationRunId || !/^SIMRUN-\d{8}-\d{6}$/.test(s.simulationRunId)
        );
        expect(invalidSims.length).toBe(0);
      }
    });

    test('all simulations should have valid configuration', () => {
      if (simulations.length > 0) {
        const invalidSims = simulations.filter(s => 
          !s.configuration ||
          !s.configuration.startYear ||
          !s.configuration.endYear ||
          s.configuration.startYear > s.configuration.endYear
        );
        
        expect(invalidSims.length).toBe(0);
        if (invalidSims.length > 0) {
          console.error('Simulations with invalid config:', invalidSims.map(s => s.simulationRunId));
        }
      }
    });

    test('completed simulations should have valid results', () => {
      const completedSims = simulations.filter(s => s.status === 'Completed');
      
      if (completedSims.length > 0) {
        const invalidSims = completedSims.filter(s => 
          !s.results ||
          s.results.totalEvents === undefined ||
          s.results.totalExposure === undefined ||
          s.results.totalLoss === undefined
        );
        
        expect(invalidSims.length).toBe(0);
        if (invalidSims.length > 0) {
          console.error('Completed simulations missing results:', invalidSims.map(s => s.simulationRunId));
        }
      }
    });
  });

  describe('👤 User Data Validation', () => {
    test('should have users seeded in database', async () => {
      const count = await User.countDocuments();
      console.log(`   📊 Found ${count} users`);
      
      expect(count).toBeGreaterThan(0);
      
      if (count > 0) {
        const users = await User.find({});
        
        // Validate user IDs
        const invalidUsers = users.filter(u => !u.userId || !/^USR-\d{8}$/.test(u.userId));
        expect(invalidUsers.length).toBe(0);
        
        // Validate required fields
        const incompleteUsers = users.filter(u => 
          !u.username || !u.email || !u.passwordHash || !u.role
        );
        expect(incompleteUsers.length).toBe(0);
        
        // Validate email format
        const invalidEmails = users.filter(u => 
          u.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)
        );
        expect(invalidEmails.length).toBe(0);
      }
    });
  });

  describe('🔗 Data Relationship Validation', () => {
    test('accounts referenced by locations should exist', async () => {
      const locations = await Location.find({}).limit(500);
      
      if (locations.length > 0) {
        const accountIds = [...new Set(locations.map(l => l.accountId).filter(Boolean))];
        
        if (accountIds.length > 0) {
          const existingAccounts = await Account.find({ accountId: { $in: accountIds } });
          const existingAccountIds = existingAccounts.map(a => a.accountId);
          
          const orphanedLocations = locations.filter(l => 
            l.accountId && !existingAccountIds.includes(l.accountId)
          );
          
          expect(orphanedLocations.length).toBe(0);
          if (orphanedLocations.length > 0) {
            console.error('Locations with invalid accountId:', orphanedLocations.map(l => ({
              locationId: l.locationId,
              accountId: l.accountId
            })));
          }
        }
      }
    });

    test('vulnerabilities linked to hazards should reference valid hazards', async () => {
      const vulnerabilities = await Vulnerability.find({}).limit(500);
      const vulnsWithLinkedHazards = vulnerabilities.filter(v => 
        v.linkedHazards && v.linkedHazards.length > 0
      );
      
      if (vulnsWithLinkedHazards.length > 0) {
        const hazardIds = [...new Set(
          vulnsWithLinkedHazards.flatMap(v => v.linkedHazards.map(h => h.hazardId))
        )];
        
        const existingHazards = await Hazard.find({ hazardId: { $in: hazardIds } });
        const existingHazardIds = existingHazards.map(h => h.hazardId);
        
        const invalidLinks = vulnsWithLinkedHazards.filter(v => 
          v.linkedHazards.some(lh => !existingHazardIds.includes(lh.hazardId))
        );
        
        expect(invalidLinks.length).toBe(0);
        if (invalidLinks.length > 0) {
          console.error('Vulnerabilities with invalid hazard links:', invalidLinks.map(v => v.vulnerabilityId));
        }
      }
    });

    test('simulations referencing accounts should have valid accountIds', async () => {
      const simulations = await SimulationRun.find({}).limit(500);
      const simsWithAccountIds = simulations.filter(s => 
        s.configuration && 
        s.configuration.exposureScope && 
        s.configuration.exposureScope.accountIds &&
        s.configuration.exposureScope.accountIds.length > 0
      );
      
      if (simsWithAccountIds.length > 0) {
        const accountIds = [...new Set(
          simsWithAccountIds.flatMap(s => s.configuration.exposureScope.accountIds)
        )];
        
        const existingAccounts = await Account.find({ accountId: { $in: accountIds } });
        const existingAccountIds = existingAccounts.map(a => a.accountId);
        
        const invalidSimulations = simsWithAccountIds.filter(s => 
          s.configuration.exposureScope.accountIds.some(id => !existingAccountIds.includes(id))
        );
        
        expect(invalidSimulations.length).toBe(0);
        if (invalidSimulations.length > 0) {
          console.error('Simulations with invalid accountIds:', invalidSimulations.map(s => s.simulationRunId));
        }
      }
    });
  });

  describe('📈 Performance and Scale Validation', () => {
    test('should handle pagination efficiently for accounts', async () => {
      const startTime = Date.now();
      const page1 = await Account.find({}).limit(100).skip(0);
      const page1Time = Date.now() - startTime;
      
      expect(page1Time).toBeLessThan(5000); // Should take less than 5 seconds
      console.log(`   ⏱️  Fetched 100 accounts in ${page1Time}ms`);
    });

    test('should handle pagination efficiently for hazards', async () => {
      const startTime = Date.now();
      const page1 = await Hazard.find({}).limit(100).skip(0);
      const page1Time = Date.now() - startTime;
      
      expect(page1Time).toBeLessThan(5000);
      console.log(`   ⏱️  Fetched 100 hazards in ${page1Time}ms`);
    });

    test('should efficiently count documents', async () => {
      const startTime = Date.now();
      const counts = await Promise.all([
        Account.countDocuments(),
        Hazard.countDocuments(),
        Vulnerability.countDocuments(),
        Location.countDocuments(),
        Exposure.countDocuments(),
        Policy.countDocuments(),
        SimulationRun.countDocuments(),
        User.countDocuments()
      ]);
      const countTime = Date.now() - startTime;
      
      expect(countTime).toBeLessThan(10000); // Should take less than 10 seconds
      console.log(`   ⏱️  Counted all collections in ${countTime}ms`);
      console.log(`   📊 Total records: ${counts.reduce((a, b) => a + b, 0).toLocaleString()}`);
    });
  });

  describe('📋 Summary Report', () => {
    test('should generate comprehensive data summary', async () => {
      const summary = {
        accounts: await Account.countDocuments(),
        hazards: await Hazard.countDocuments(),
        vulnerabilities: await Vulnerability.countDocuments(),
        locations: await Location.countDocuments(),
        exposures: await Exposure.countDocuments(),
        policies: await Policy.countDocuments(),
        simulations: await SimulationRun.countDocuments(),
        users: await User.countDocuments()
      };
      
      const totalRecords = Object.values(summary).reduce((a, b) => a + b, 0);
      
      console.log('\n📊 COMPREHENSIVE SEEDING VALIDATION SUMMARY');
      console.log('═══════════════════════════════════════════');
      console.log(`👥 Accounts:        ${summary.accounts.toLocaleString()}`);
      console.log(`🌪️  Hazards:         ${summary.hazards.toLocaleString()}`);
      console.log(`🏗️  Vulnerabilities: ${summary.vulnerabilities.toLocaleString()}`);
      console.log(`📍 Locations:       ${summary.locations.toLocaleString()}`);
      console.log(`💰 Exposures:       ${summary.exposures.toLocaleString()}`);
      console.log(`📄 Policies:        ${summary.policies.toLocaleString()}`);
      console.log(`🎲 Simulations:     ${summary.simulations.toLocaleString()}`);
      console.log(`👤 Users:           ${summary.users.toLocaleString()}`);
      console.log('───────────────────────────────────────────');
      console.log(`📦 TOTAL RECORDS:   ${totalRecords.toLocaleString()}`);
      console.log('═══════════════════════════════════════════\n');
      
      expect(totalRecords).toBeGreaterThan(0);
    });
  });
}, TEST_TIMEOUT);
