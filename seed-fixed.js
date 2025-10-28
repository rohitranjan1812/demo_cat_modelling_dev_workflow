/**
 * Fixed Extensive Data Seeding Script with proper validation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('./src/models/Account');
const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');
const Location = require('./src/models/Location');
const Exposure = require('./src/models/Exposure');
const Policy = require('./src/models/Policy');

// Reduced counts for faster debugging (can scale up after validation)
const SEED_COUNTS = {
  accounts: 1000,      // Start with 1K instead of 50K
  hazards: 500,        // Start with 500 instead of 30K
  vulnerabilities: 300, // Start with 300 instead of 20K
  locations: 2000,     // Start with 2K instead of 100K
  exposures: 3000,     // Start with 3K instead of 150K
  policies: 1500       // Start with 1.5K instead of 75K
};

const BATCH_SIZE = 100;
const AUDIT_USER = 'seed-script';

// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const COUNTRIES = ['USA', 'UK', 'Germany', 'France', 'Japan'];
const HAZARD_TYPES = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado'];
const CONSTRUCTION_TYPES = ['Wood Frame', 'Steel Frame', 'Concrete', 'Masonry'];
const OCCUPANCY_TYPES = ['Residential', 'Commercial', 'Industrial'];

async function seedData() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting Data Seeding (FIXED VERSION)');
    console.log('='.repeat(80));
    
    // Connect
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev';
    console.log('🔄 Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected\n');
    
    // Clear existing
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Account.deleteMany({}),
      Hazard.deleteMany({}),
      Vulnerability.deleteMany({}),
      Location.deleteMany({}),
      Exposure.deleteMany({}),
      Policy.deleteMany({})
    ]);
    console.log('✅ Cleared\n');
    
    // ACCOUNTS
    console.log(`📊 Seeding ${SEED_COUNTS.accounts} Accounts...`);
    const accounts = [];
    for (let i = 0; i < SEED_COUNTS.accounts; i++) {
      accounts.push({
        accountId: `ACC-${String(100001 + i).padStart(6, '0')}`,
        accountName: `Test Account ${i + 1}`,
        accountType: randomItem(['Primary', 'Reinsurance', 'Treaty']),
        totalExposure: randomFloat(1000000, 10000000, 0),
        createdBy: AUDIT_USER,
        lastModifiedBy: AUDIT_USER
      });
    }
    await Account.insertMany(accounts);
    console.log(`✅ Accounts: ${accounts.length}\n`);
    
    // HAZARDS
    console.log(`🌪️  Seeding ${SEED_COUNTS.hazards} Hazards...`);
    const hazards = [];
    for (let i = 0; i < SEED_COUNTS.hazards; i++) {
      const hazType = randomItem(HAZARD_TYPES);
      hazards.push({
        hazardId: `HAZ-${String(10000001 + i).padStart(8, '0')}`,
        hazardName: `${hazType} Event ${i + 1}`,
        hazardType: hazType,
        hazardCategory: randomItem(['Natural', 'Man-Made']),
        footprint: {
          type: 'Point',
          coordinates: [randomFloat(-120, -70), randomFloat(25, 45)]
        },
        temporal: {
          startDate: randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
          duration: randomInt(1, 48)
        },
        severity: {
          magnitude: randomFloat(3, 8),
          scale: 'Richter'
        },
        probability: {
          annualOccurrence: randomFloat(0.01, 0.5, 3),
          returnPeriod: randomInt(10, 500)
        },
        createdBy: AUDIT_USER,
        lastModifiedBy: AUDIT_USER
      });
    }
    await Hazard.insertMany(hazards);
    console.log(`✅ Hazards: ${hazards.length}\n`);
    
    // VULNERABILITIES
    console.log(`🏗️  Seeding ${SEED_COUNTS.vulnerabilities} Vulnerabilities...`);
    const vulnerabilities = [];
    for (let i = 0; i < SEED_COUNTS.vulnerabilities; i++) {
      vulnerabilities.push({
        vulnerabilityId: `VUL-${String(10000001 + i).padStart(8, '0')}`,
        vulnerabilityName: `Vulnerability Profile ${i + 1}`,
        vulnerabilityType: randomItem(['Structural', 'Non-Structural', 'Contents']),
        vulnerabilityCategory: randomItem(['Physical', 'Economic', 'Social']),
        geographicScope: {
          regions: [randomItem(['North America', 'Europe', 'Asia Pacific'])],
          countries: [randomItem(COUNTRIES)]
        },
        overallVulnerabilityScore: randomFloat(0, 1, 2),
        overallRiskLevel: randomItem(['Low', 'Medium', 'High']),
        confidenceLevel: randomFloat(0.7, 0.95, 2),
        createdBy: AUDIT_USER,
        lastModifiedBy: AUDIT_USER
      });
    }
    await Vulnerability.insertMany(vulnerabilities);
    console.log(`✅ Vulnerabilities: ${vulnerabilities.length}\n`);
    
    // LOCATIONS
    console.log(`📍 Seeding ${SEED_COUNTS.locations} Locations...`);
    const locations = [];
    for (let i = 0; i < SEED_COUNTS.locations; i++) {
      const accountId = randomItem(accounts).accountId;
      locations.push({
        locationId: `LOC-${String(10000001 + i).padStart(8, '0')}`,
        locationName: `Location ${i + 1}`,
        accountId,
        coordinates: {
          type: 'Point',
          coordinates: [randomFloat(-120, -70), randomFloat(25, 45)]
        },
        address: `${randomInt(1, 9999)} Main St`,
        propertyCharacteristics: {
          occupancyType: randomItem(OCCUPANCY_TYPES),
          constructionType: randomItem(CONSTRUCTION_TYPES),
          yearBuilt: randomInt(1950, 2024),
          numberOfStories: randomInt(1, 10),
          totalArea: randomInt(1000, 50000)
        },
        createdBy: AUDIT_USER,
        lastModifiedBy: AUDIT_USER
      });
    }
    await Location.insertMany(locations);
    console.log(`✅ Locations: ${locations.length}\n`);
    
    // POLICIES (needed before Exposures)
    console.log(`📄 Seeding ${SEED_COUNTS.policies} Policies...`);
    const policies = [];
    for (let i = 0; i < SEED_COUNTS.policies; i++) {
      const accountId = randomItem(accounts).accountId;
      const effectiveDate = randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31));
      const expiryDate = new Date(effectiveDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      policies.push({
        policyId: `POL-${String(10000001 + i).padStart(8, '0')}`,
        policyNumber: `PN-${String(100000 + i)}`,
        accountId,
        policyName: `Policy ${i + 1}`,
        policyType: randomItem(['Property', 'Casualty', 'Liability']),
        totalLimit: randomFloat(1000000, 10000000, 0),
        totalDeductible: randomFloat(10000, 100000, 0),
        premium: randomFloat(10000, 100000, 0),
        effectiveDate,
        expiryDate,
        createdBy: AUDIT_USER,
        lastModifiedBy: AUDIT_USER
      });
    }
    await Policy.insertMany(policies);
    console.log(`✅ Policies: ${policies.length}\n`);
    
    // EXPOSURES
    console.log(`💰 Seeding ${SEED_COUNTS.exposures} Exposures...`);
    const exposures = [];
    for (let i = 0; i < SEED_COUNTS.exposures; i++) {
      const accountId = randomItem(accounts).accountId;
      const locationId = randomItem(locations).locationId;
      const policyId = randomItem(policies).policyId;
      const effectiveDate = randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31));
      const expirationDate = new Date(effectiveDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      
      const buildingValue = randomFloat(100000, 5000000, 0);
      const contentsValue = randomFloat(50000, 1000000, 0);
      
      exposures.push({
        exposureId: `EXP-${String(1000000001 + i).padStart(10, '0')}`,
        accountId,
        policyId,
        locationId,
        totalInsuredValue: buildingValue + contentsValue,
        buildingValue,
        contentsValue,
        location: {
          latitude: randomFloat(25, 45, 6),
          longitude: randomFloat(-120, -70, 6),
          address: {
            street: `${randomInt(1, 9999)} Main St`,
            city: 'Test City',
            region: 'Test State',
            country: randomItem(COUNTRIES),
            postalCode: '12345'
          }
        },
        occupancyType: randomItem(OCCUPANCY_TYPES),
        constructionType: randomItem(CONSTRUCTION_TYPES),
        policyTerms: {
          effectiveDate,
          expirationDate,
          deductible: randomFloat(10000, 100000, 0),
          limit: randomFloat(1000000, 10000000, 0)
        }
      });
    }
    await Exposure.insertMany(exposures);
    console.log(`✅ Exposures: ${exposures.length}\n`);
    
    // Verify
    console.log('📊 Verifying counts...');
    const counts = await Promise.all([
      Account.countDocuments(),
      Hazard.countDocuments(),
      Vulnerability.countDocuments(),
      Location.countDocuments(),
      Exposure.countDocuments(),
      Policy.countDocuments()
    ]);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ SEEDING COMPLETE!');
    console.log('='.repeat(80));
    console.log(`Accounts:        ${counts[0].toLocaleString()}`);
    console.log(`Hazards:         ${counts[1].toLocaleString()}`);
    console.log(`Vulnerabilities: ${counts[2].toLocaleString()}`);
    console.log(`Locations:       ${counts[3].toLocaleString()}`);
    console.log(`Exposures:       ${counts[4].toLocaleString()}`);
    console.log(`Policies:        ${counts[5].toLocaleString()}`);
    console.log(`TOTAL:           ${counts.reduce((a,b) => a+b, 0).toLocaleString()}`);
    console.log('='.repeat(80));
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Time: ${elapsed}s`);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

seedData();
