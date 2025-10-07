/**
 * Phase 5 Test Data Seeder
 * Creates necessary test data for E2E integration testing:
 * - Policies linked to existing accounts
 * - Locations
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/cat_modeling_exposure';

// Define schemas inline for seeding
const PolicySchema = new mongoose.Schema({
  policyId: { type: String, required: true, unique: true },
  accountId: { type: String, required: true },
  policyNumber: String,
  policyType: String,
  effectiveDate: Date,
  expiryDate: Date,
  status: String,
  totalLimit: Number,
  currency: String
}, { timestamps: true });

const LocationSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true },
  accountId: String,
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  locationType: String,
  status: String
}, { timestamps: true });

async function seedTestData() {
  console.log('🌱 Seeding Phase 5 test data...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get or create models
    const Policy = mongoose.models.Policy || mongoose.model('Policy', PolicySchema);
    const Location = mongoose.models.Location || mongoose.model('Location', LocationSchema);
    
    // Test Policies
    const policies = [
      {
        policyId: 'POL-87654321',
        accountId: 'ACC-000001', // Global Insurance Corp
        policyNumber: 'POL-2025-001',
        policyType: 'Commercial Property',
        effectiveDate: new Date('2025-01-01'),
        expiryDate: new Date('2025-12-31'),
        status: 'Active',
        totalLimit: 10000000,
        currency: 'USD'
      },
      {
        policyId: 'POL-12345678',
        accountId: 'ACC-000002', // Property Management LLC
        policyNumber: 'POL-2025-002',
        policyType: 'Property',
        effectiveDate: new Date('2025-01-01'),
        expiryDate: new Date('2025-12-31'),
        status: 'Active',
        totalLimit: 5000000,
        currency: 'USD'
      },
      {
        policyId: 'POL-11111111',
        accountId: 'ACC-000003', // Manufacturing International
        policyNumber: 'POL-2025-003',
        policyType: 'Industrial',
        effectiveDate: new Date('2025-01-01'),
        expiryDate: new Date('2025-12-31'),
        status: 'Active',
        totalLimit: 20000000,
        currency: 'USD'
      }
    ];
    
    // Test Locations
    const locations = [
      {
        locationId: 'LOC-11223344',
        accountId: 'ACC-000001',
        address: {
          street: '123 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        coordinates: {
          latitude: 34.0522,
          longitude: -118.2437
        },
        locationType: 'Commercial',
        status: 'Active'
      },
      {
        locationId: 'LOC-22334455',
        accountId: 'ACC-000002',
        address: {
          street: '456 Oak Avenue',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94102',
          country: 'USA'
        },
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194
        },
        locationType: 'Commercial',
        status: 'Active'
      },
      {
        locationId: 'LOC-33445566',
        accountId: 'ACC-000003',
        address: {
          street: '789 Industrial Blvd',
          city: 'Tokyo',
          state: 'Tokyo',
          postalCode: '100-0001',
          country: 'Japan'
        },
        coordinates: {
          latitude: 35.6762,
          longitude: 139.6503
        },
        locationType: 'Industrial',
        status: 'Active'
      }
    ];
    
    // Insert policies
    console.log('📋 Creating test policies...');
    for (const policy of policies) {
      try {
        await Policy.updateOne(
          { policyId: policy.policyId },
          { $set: policy },
          { upsert: true }
        );
        console.log(`   ✅ Policy created: ${policy.policyId}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ℹ️  Policy already exists: ${policy.policyId}`);
        } else {
          console.log(`   ❌ Error creating policy ${policy.policyId}:`, error.message);
        }
      }
    }
    
    console.log('\n📍 Creating test locations...');
    for (const location of locations) {
      try {
        await Location.updateOne(
          { locationId: location.locationId },
          { $set: location },
          { upsert: true }
        );
        console.log(`   ✅ Location created: ${location.locationId}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ℹ️  Location already exists: ${location.locationId}`);
        } else {
          console.log(`   ❌ Error creating location ${location.locationId}:`, error.message);
        }
      }
    }
    
    console.log('\n✅ Test data seeding complete!');
    console.log('\nTest Data Summary:');
    console.log(`   - Accounts: 3 (already exist from main seed)`);
    console.log(`   - Policies: ${policies.length}`);
    console.log(`   - Locations: ${locations.length}`);
    console.log('\nYou can now run the E2E tests with:');
    console.log('   node tests/integration/phase5-exposure-e2e-test.js\n');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run seeder
seedTestData();
