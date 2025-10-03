/**
 * Comprehensive CRUD Operations Tests
 * Tests CREATE, UPDATE, DELETE operations for all entities
 */

const request = require('supertest');
const mongoose = require('mongoose');
const Account = require('../../src/models/Account');
const Hazard = require('../../src/models/Hazard');
const Vulnerability = require('../../src/models/Vulnerability');

const BASE_URL = 'http://localhost:3001';

describe('🔨 CAT Modeling Platform - CRUD Operations Tests', () => {
  
  let createdAccountId;
  let createdHazardId;
  let createdVulnerabilityId;
  
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000
      });
    }
    console.log('✅ Connected to MongoDB for CRUD testing');
  });
  
  afterAll(async () => {
    // Cleanup test data
    if (createdAccountId) {
      await Account.deleteOne({ accountId: createdAccountId });
    }
    if (createdHazardId) {
      await Hazard.deleteOne({ hazardId: createdHazardId });
    }
    if (createdVulnerabilityId) {
      await Vulnerability.deleteOne({ vulnerabilityId: createdVulnerabilityId });
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB and cleaned up test data');
  });
  
  // ============================================================================
  // ACCOUNTS CRUD TESTS
  // ============================================================================
  
  describe('👥 Accounts CRUD Operations', () => {
    
    test('POST /api/v1/accounts - should create new account', async () => {
      const newAccount = {
        accountId: 'ACC-999001',
        accountName: 'Test Insurance Company',
        accountType: 'Primary',
        accountLevel: 1,
        totalExposure: 10000000,
        currency: 'USD',
        regions: ['North America'],
        riskProfile: 'Medium',
        status: 'Active',
        effectiveDate: '2024-01-01',
        expiryDate: '2024-12-31'
      };
      
      const response = await request(BASE_URL)
        .post('/api/v1/accounts')
        .send(newAccount)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('accountId', newAccount.accountId);
      expect(response.body.data).toHaveProperty('accountName', newAccount.accountName);
      
      createdAccountId = response.body.data.accountId;
      console.log(`   ✓ Created account: ${createdAccountId}`);
    });
    
    test('PUT /api/v1/accounts/:id - should update account', async () => {
      if (!createdAccountId) {
        console.log('   ⚠️  Skipping - no account created');
        return;
      }
      
      const updates = {
        totalExposure: 15000000,
        riskProfile: 'High'
      };
      
      const response = await request(BASE_URL)
        .put(`/api/v1/accounts/${createdAccountId}`)
        .send(updates)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.totalExposure).toBe(updates.totalExposure);
      expect(response.body.data.riskProfile).toBe(updates.riskProfile);
      
      console.log(`   ✓ Updated account: ${createdAccountId}, new exposure: $${updates.totalExposure.toLocaleString()}`);
    });
    
    test('DELETE /api/v1/accounts/:id - should delete account', async () => {
      if (!createdAccountId) {
        console.log('   ⚠️  Skipping - no account created');
        return;
      }
      
      const response = await request(BASE_URL)
        .delete(`/api/v1/accounts/${createdAccountId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      
      console.log(`   ✓ Deleted account: ${createdAccountId}`);
      
      // Verify deletion
      const verifyResponse = await request(BASE_URL)
        .get(`/api/v1/accounts/${createdAccountId}`)
        .expect(404);
      
      expect(verifyResponse.body.success).toBe(false);
      console.log('   ✓ Verified account deletion');
      
      createdAccountId = null; // Prevent double cleanup
    });
  });
  
  // ============================================================================
  // HAZARDS CRUD TESTS
  // ============================================================================
  
  describe('🌪️  Hazards CRUD Operations', () => {
    
    test('POST /api/v1/hazards - should create new hazard', async () => {
      const newHazard = {
        hazardId: 'HAZ-99900001',
        hazardName: 'Test Hurricane Event',
        hazardDescription: 'Test hurricane for CRUD testing',
        hazardType: 'Hurricane',
        hazardCategory: 'Natural',
        severity: 'Major',
        probability: 0.1,
        geographicFootprint: {
          centerLatitude: 25.7617,
          centerLongitude: -80.1918,
          radius: 100,
          radiusUnit: 'km',
          affectedRegions: ['North America'],
          affectedCountries: ['USA'],
          affectedStatesProvinces: ['Florida']
        },
        temporal: {
          startDate: '2024-08-01',
          endDate: '2024-08-02',
          duration: 1,
          durationUnit: 'days',
          season: 'Hurricane Season',
          startTime: '2024-08-01T12:00:00Z',
          peakTime: '2024-08-01T18:00:00Z'
        },
        footprint: {
          impactRadius: 100,
          impactRadiusUnit: 'km',
          shape: 'Circular',
          area: 31416,
          areaUnit: 'km2',
          centerLatitude: 25.7617,
          centerLongitude: -80.1918,
          radius: 100,
          unit: 'km'
        },
        intensityMetrics: {
          scale: 'Saffir-Simpson',
          value: 3,
          unit: 'Category',
          description: 'Category 3 hurricane'
        },
        isHistorical: false,
        isActive: true,
        status: 'Active'
      };
      
      const response = await request(BASE_URL)
        .post('/api/v1/hazards')
        .send(newHazard)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('hazardId', newHazard.hazardId);
      expect(response.body.data).toHaveProperty('hazardName', newHazard.hazardName);
      
      createdHazardId = response.body.data.hazardId;
      console.log(`   ✓ Created hazard: ${createdHazardId}`);
    });
    
    test('PUT /api/v1/hazards/:id - should update hazard', async () => {
      if (!createdHazardId) {
        console.log('   ⚠️  Skipping - no hazard created');
        return;
      }
      
      const updates = {
        severity: 'Severe',
        probability: 0.15
      };
      
      const response = await request(BASE_URL)
        .put(`/api/v1/hazards/${createdHazardId}`)
        .send(updates)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.severity).toBe(updates.severity);
      expect(response.body.data.probability).toBe(updates.probability);
      
      console.log(`   ✓ Updated hazard: ${createdHazardId}, new severity: ${updates.severity}`);
    });
    
    test('DELETE /api/v1/hazards/:id - should delete hazard', async () => {
      if (!createdHazardId) {
        console.log('   ⚠️  Skipping - no hazard created');
        return;
      }
      
      const response = await request(BASE_URL)
        .delete(`/api/v1/hazards/${createdHazardId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      
      console.log(`   ✓ Deleted hazard: ${createdHazardId}`);
      
      createdHazardId = null;
    });
  });
  
  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================
  
  describe('✅ Validation Tests', () => {
    
    test('POST /api/v1/accounts - should reject invalid account data', async () => {
      const invalidAccount = {
        accountId: 'INVALID', // Wrong format
        accountName: 'Test'
      };
      
      const response = await request(BASE_URL)
        .post('/api/v1/accounts')
        .send(invalidAccount)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      
      console.log('   ✓ Properly rejects invalid account data');
    });
    
    test('POST /api/v1/accounts - should reject duplicate account ID', async () => {
      // Use an existing account ID
      const duplicateAccount = {
        accountId: 'ACC-001001', // Existing ID from seed data
        accountName: 'Duplicate Test',
        accountType: 'Primary',
        totalExposure: 1000000,
        currency: 'USD',
        status: 'Active',
        effectiveDate: '2024-01-01',
        expiryDate: '2024-12-31'
      };
      
      const response = await request(BASE_URL)
        .post('/api/v1/accounts')
        .send(duplicateAccount)
        .expect(409);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('already exists');
      
      console.log('   ✓ Properly prevents duplicate account IDs');
    });
  });
  
  // ============================================================================
  // EDGE CASE TESTS
  // ============================================================================
  
  describe('🔍 Edge Cases', () => {
    
    test('PUT /api/v1/accounts/:id - should return 404 for non-existent account', async () => {
      const response = await request(BASE_URL)
        .put('/api/v1/accounts/ACC-999999')
        .send({ totalExposure: 1000000 })
        .expect(404);
      
      expect(response.body.success).toBe(false);
      console.log('   ✓ Properly handles update of non-existent account');
    });
    
    test('DELETE /api/v1/accounts/:id - should return 404 for non-existent account', async () => {
      const response = await request(BASE_URL)
        .delete('/api/v1/accounts/ACC-999999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      console.log('   ✓ Properly handles deletion of non-existent account');
    });
  });
});


