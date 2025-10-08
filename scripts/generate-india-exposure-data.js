/**
 * Generate Comprehensive Exposure Data for India CAT Modeling
 * 
 * This script generates:
 * - 1,000 Accounts (insurance accounts)
 * - 2,000 Policies (linked to accounts)
 * - 10,000 Locations (across India, matching hazard distribution)
 * - 10,000 Exposures (linked to accounts, policies, and locations)
 * 
 * Addresses the critical issue where simulations return 0 losses due to missing exposure data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('../src/models/Account');
const Policy = require('../src/models/Policy');
const Location = require('../src/models/Location');
const Exposure = require('../src/models/Exposure');

// India geographic bounds
const INDIA_BOUNDS = {
  minLat: 6.76,   // Southern tip (Kanyakumari)
  maxLat: 37.08,  // Northern tip (Kashmir)
  minLng: 68.11,  // Western tip (Gujarat)
  maxLng: 97.39   // Eastern tip (Arunachal Pradesh)
};

// Indian states and major cities for realistic data
const INDIAN_STATES = [
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
  { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangalore'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
  { state: 'Delhi', cities: ['New Delhi', 'Dwarka', 'Rohini'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Siliguri', 'Durgapur'] },
  { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Agra'] },
  { state: 'Kerala', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'] },
  { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur'] }
];

const OCCUPANCY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Institutional'];
const CONSTRUCTION_TYPES = ['Concrete', 'Steel Frame', 'Masonry', 'Wood Frame', 'Mixed'];
const ACCOUNT_TYPES = ['Primary', 'Reinsurance', 'Retrocession', 'Facultative', 'Treaty'];
const COVERAGE_TYPES = ['Property', 'Liability', 'Business Interruption', 'Cyber', 'Marine', 'Aviation', 'Energy'];

let generatedIds = {
  accounts: [],
  policies: [],
  locations: []
};

/**
 * Connect to MongoDB with proper error handling
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev';
    console.log(`🔌 Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 50,           // Increase pool size
      minPoolSize: 10,           // Maintain minimum connections
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4                  // Use IPv4 to avoid IPv6 issues
    });
    
    console.log('✅ Connected to MongoDB successfully\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('   1. Ensure MongoDB is running: mongod --dbpath ./data');
    console.error('   2. Check MONGODB_URI in .env file');
    console.error('   3. Verify network connectivity\n');
    throw error;
  }
}

/**
 * Generate random number in range
 */
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer in range
 */
function randomInt(min, max) {
  return Math.floor(randomInRange(min, max));
}

/**
 * Select random element from array
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random coordinates within India
 */
function generateIndianCoordinates() {
  return {
    latitude: randomInRange(INDIA_BOUNDS.minLat, INDIA_BOUNDS.maxLat),
    longitude: randomInRange(INDIA_BOUNDS.minLng, INDIA_BOUNDS.maxLng),
    elevation: randomInt(0, 3000)
  };
}

/**
 * Generate Accounts
 */
async function generateAccounts(count) {
  console.log(`📊 Generating ${count} Accounts...`);
  const accounts = [];
  
  for (let i = 0; i < count; i++) {
    const accountId = `ACC-${String(100000 + i).substring(0, 6)}`;
    const stateInfo = randomChoice(INDIAN_STATES);
    
    const account = {
      accountId,
      accountName: `${stateInfo.state} Insurance Account ${i + 1}`,
      accountType: randomChoice(ACCOUNT_TYPES),
      accountLevel: 1,
      totalExposure: randomInRange(10000000, 500000000),
      currency: 'INR',
      status: 'Active',
      contactInfo: {
        primaryContact: `Contact ${i + 1}`,
        email: `account${i + 1}@insurance.in`,
        phone: `+91-${randomInt(6000000000, 9999999999)}`,
        address: `${randomChoice(stateInfo.cities)}, ${stateInfo.state}, India`
      },
      createdBy: 'data-generator',
      lastModifiedBy: 'data-generator'
    };
    
    accounts.push(account);
  }
  
  // Batch insert
  const result = await Account.insertMany(accounts, { ordered: false });
  generatedIds.accounts = result.map(a => a.accountId);
  console.log(`   ✅ Created ${result.length} accounts\n`);
  return result;
}

/**
 * Generate Policies (2 policies per account on average)
 */
async function generatePolicies(count, accountIds) {
  console.log(`📋 Generating ${count} Policies...`);
  const policies = [];
  
  for (let i = 0; i < count; i++) {
    const policyId = `POL-${String(10000000 + i).substring(0, 8)}`;
    const accountId = randomChoice(accountIds);
    
    const effectiveDate = new Date(2024, randomInt(0, 6), randomInt(1, 28));
    const expirationDate = new Date(effectiveDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    const totalLimit = randomInRange(5000000, 200000000);
    const totalDeductible = totalLimit * randomInRange(0.01, 0.05);
    
    const coverages = [];
    const numCoverages = randomInt(1, 4);
    const selectedCoverageTypes = [];
    
    for (let j = 0; j < numCoverages; j++) {
      let coverageType;
      do {
        coverageType = randomChoice(COVERAGE_TYPES);
      } while (selectedCoverageTypes.includes(coverageType));
      selectedCoverageTypes.push(coverageType);
      
      coverages.push({
        coverageType,
        coverageLimit: totalLimit / numCoverages,
        deductible: totalDeductible / numCoverages,
        coveragePercentage: 100
      });
    }
    
    const policy = {
      policyId,
      policyNumber: `POL-IN-${Date.now()}-${i}`,
      accountId,
      policyType: randomChoice(['Property', 'Casualty', 'Package', 'Specialty']),
      effectiveDate,
      expirationDate,
      status: 'Active',
      totalLimit,
      totalDeductible,
      currency: 'INR',
      coverages,
      createdBy: 'data-generator',
      lastModifiedBy: 'data-generator'
    };
    
    policies.push(policy);
  }
  
  // Batch insert
  const result = await Policy.insertMany(policies, { ordered: false });
  generatedIds.policies = result.map(p => p.policyId);
  console.log(`   ✅ Created ${result.length} policies\n`);
  return result;
}

/**
 * Generate Locations across India
 */
async function generateLocations(count) {
  console.log(`📍 Generating ${count} Locations across India...`);
  const locations = [];
  
  for (let i = 0; i < count; i++) {
    const locationId = `LOC-${String(1000000000 + i).substring(0, 10)}`;
    const stateInfo = randomChoice(INDIAN_STATES);
    const city = randomChoice(stateInfo.cities);
    const coords = generateIndianCoordinates();
    
    const location = {
      locationId,
      locationName: `${city} Property ${i + 1}`,
      locationType: randomChoice(['Primary', 'Secondary', 'Branch', 'Warehouse', 'Office']),
      coordinates: coords,
      address: {
        street: `${randomInt(1, 999)} Main Street`,
        city,
        state: stateInfo.state,
        postalCode: `${randomInt(100000, 999999)}`,
        country: 'India',
        region: stateInfo.state
      },
      occupancyType: randomChoice(OCCUPANCY_TYPES),
      constructionType: randomChoice(CONSTRUCTION_TYPES),
      yearBuilt: randomInt(1960, 2024),
      numberOfStories: randomInt(1, 50),
      buildingArea: randomInRange(1000, 50000),
      buildingAreaUnit: 'sqm',
      status: 'Active',
      createdBy: 'data-generator',
      lastModifiedBy: 'data-generator'
    };
    
    locations.push(location);
  }
  
  // Batch insert in chunks to avoid memory issues
  const chunkSize = 500;
  const results = [];
  
  for (let i = 0; i < locations.length; i += chunkSize) {
    const chunk = locations.slice(i, i + chunkSize);
    const result = await Location.insertMany(chunk, { ordered: false });
    results.push(...result);
    console.log(`   ⏳ Progress: ${results.length}/${count} locations created`);
  }
  
  generatedIds.locations = results.map(l => l.locationId);
  console.log(`   ✅ Created ${results.length} locations\n`);
  return results;
}

/**
 * Generate Exposures (linking accounts, policies, and locations)
 */
async function generateExposures(count, accountIds, policyIds, locationIds) {
  console.log(`💰 Generating ${count} Exposures...`);
  const exposures = [];
  
  // Pre-fetch some accounts, policies, and locations for enrichment
  const accountsData = await Account.find({ accountId: { $in: accountIds.slice(0, 100) } });
  const policiesData = await Policy.find({ policyId: { $in: policyIds.slice(0, 200) } });
  const locationsData = await Location.find({ locationId: { $in: locationIds.slice(0, 1000) } });
  
  for (let i = 0; i < count; i++) {
    const exposureId = `EXP-${String(1000000000 + i).substring(0, 10)}`;
    
    // Select related entities
    const location = randomChoice(locationsData);
    const policy = randomChoice(policiesData);
    const account = accountsData.find(a => a.accountId === policy.accountId) || randomChoice(accountsData);
    
    const buildingValue = randomInRange(2000000, 100000000);
    const contentsValue = randomInRange(500000, 20000000);
    const biValue = randomInRange(0, 10000000);
    const totalInsuredValue = buildingValue + contentsValue + biValue;
    
    const exposure = {
      exposureId,
      accountId: account.accountId,
      policyId: policy.policyId,
      locationId: location.locationId,
      totalInsuredValue,
      buildingValue,
      contentsValue,
      businessInterruptionValue: biValue,
      timeElementValue: 0,
      otherValue: 0,
      currency: 'INR',
      location: {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        elevation: location.coordinates.elevation || 0,
        address: {
          street: location.address.street,
          city: location.address.city,
          state: location.address.state,
          postalCode: location.address.postalCode,
          country: location.address.country,
          region: location.address.region
        }
      },
      buildingCharacteristics: {
        occupancyType: location.occupancyType,
        constructionType: location.constructionType,
        yearBuilt: location.yearBuilt,
        numberOfStories: location.numberOfStories,
        buildingArea: location.buildingArea,
        buildingAreaUnit: location.buildingAreaUnit
      },
      policyTerms: {
        effectiveDate: policy.effectiveDate,
        expirationDate: policy.expirationDate,
        deductible: policy.totalDeductible,
        limit: policy.totalLimit,
        coinsurance: randomInRange(90, 100)
      },
      riskCharacteristics: {
        floodZone: randomChoice(['Low', 'Moderate', 'High']),
        earthquakeZone: randomChoice(['Low', 'Moderate', 'High', 'Very High']),
        cycloneZone: randomChoice(['Low', 'Moderate', 'High']),
        fireProtectionClass: randomInt(1, 10)
      },
      status: 'Active',
      dataQuality: {
        completeness: randomInt(85, 100),
        accuracy: randomInt(85, 100),
        validationStatus: 'Validated',
        validationErrors: []
      },
      createdBy: 'data-generator',
      updatedBy: 'data-generator',
      dataSource: 'Calculation'
    };
    
    exposures.push(exposure);
  }
  
  // Batch insert in chunks
  const chunkSize = 500;
  const results = [];
  
  for (let i = 0; i < exposures.length; i += chunkSize) {
    const chunk = exposures.slice(i, i + chunkSize);
    const result = await Exposure.insertMany(chunk, { ordered: false });
    results.push(...result);
    console.log(`   ⏳ Progress: ${results.length}/${count} exposures created`);
  }
  
  console.log(`   ✅ Created ${results.length} exposures\n`);
  return results;
}

/**
 * Display summary statistics
 */
async function displaySummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📈 DATA GENERATION SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const [accountCount, policyCount, locationCount, exposureCount] = await Promise.all([
    Account.countDocuments(),
    Policy.countDocuments(),
    Location.countDocuments(),
    Exposure.countDocuments()
  ]);
  
  const [totalExposureValue] = await Exposure.aggregate([
    { $group: { _id: null, total: { $sum: '$totalInsuredValue' } } }
  ]);
  
  const exposureValue = totalExposureValue?.total || 0;
  
  console.log(`📊 Accounts:       ${accountCount.toLocaleString()}`);
  console.log(`📋 Policies:       ${policyCount.toLocaleString()}`);
  console.log(`📍 Locations:      ${locationCount.toLocaleString()}`);
  console.log(`💰 Exposures:      ${exposureCount.toLocaleString()}`);
  console.log(`\n💵 Total Insured Value: ₹${(exposureValue / 1000000000).toFixed(2)} Billion INR`);
  console.log(`💵 Average Exposure:    ₹${(exposureValue / exposureCount / 1000000).toFixed(2)} Million INR`);
  
  // Geographic distribution
  const stateDistribution = await Exposure.aggregate([
    { $group: { _id: '$location.address.state', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  console.log('\n🗺️  Top 5 States by Exposure Count:');
  stateDistribution.forEach((item, idx) => {
    console.log(`   ${idx + 1}. ${item._id}: ${item.count.toLocaleString()}`);
  });
  
  console.log('\n✅ Data generation completed successfully!');
  console.log('🚀 Ready for CAT model simulations\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🇮🇳 INDIA CAT MODELING - EXPOSURE DATA GENERATOR');
  console.log('='.repeat(60) + '\n');
  
  try {
    await connectDB();
    
    // Check if data already exists
    const existingExposures = await Exposure.countDocuments();
    if (existingExposures > 0) {
      console.log(`⚠️  Found ${existingExposures} existing exposures`);
      console.log('   Do you want to delete and regenerate? (Ctrl+C to cancel)\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🧹 Clearing existing data...');
      await Promise.all([
        Exposure.deleteMany({ createdBy: 'data-generator' }),
        Location.deleteMany({ createdBy: 'data-generator' }),
        Policy.deleteMany({ createdBy: 'data-generator' }),
        Account.deleteMany({ createdBy: 'data-generator' })
      ]);
      console.log('   ✅ Cleared old data\n');
    }
    
    // Generate data in proper order (respecting dependencies)
    const accounts = await generateAccounts(1000);
    const policies = await generatePolicies(2000, generatedIds.accounts);
    const locations = await generateLocations(10000);
    const exposures = await generateExposures(10000, generatedIds.accounts, generatedIds.policies, generatedIds.locations);
    
    // Display summary
    await displaySummary();
    
  } catch (error) {
    console.error('\n❌ Error during data generation:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateAccounts, generatePolicies, generateLocations, generateExposures };
