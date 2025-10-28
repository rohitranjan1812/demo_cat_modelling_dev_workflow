#!/usr/bin/env node
/**
 * Extensive Data Seeding Script
 * Generates tens of thousands of records for each module
 * Creates realistic, diverse data for comprehensive testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('./src/models/Account');
const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');
const Location = require('./src/models/Location');
const Exposure = require('./src/models/Exposure');
const Policy = require('./src/models/Policy');

// Configuration
const SEED_COUNTS = {
  accounts: 50000,
  hazards: 30000,
  vulnerabilities: 20000,
  locations: 100000,
  exposures: 150000,
  policies: 75000
};

const BATCH_SIZE = 1000; // Insert in batches for performance

// Reference data
const COUNTRIES = ['USA', 'UK', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil', 'Australia', 'Canada', 'Mexico', 'Spain', 'Italy', 'South Korea', 'Indonesia'];
const US_STATES = ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'];
const CITIES = {
  USA: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  UK: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh'],
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'],
  Japan: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Kobe', 'Kyoto', 'Fukuoka', 'Kawasaki', 'Hiroshima'],
  China: ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Wuhan', 'Hangzhou', 'Xian', 'Nanjing', 'Tianjin']
};

const HAZARD_TYPES = [
  'Earthquake', 'Hurricane', 'Typhoon', 'Cyclone', 'Tornado', 'Flood', 'Wildfire', 
  'Hail', 'Wind', 'Storm Surge', 'Tsunami', 'Volcanic Eruption', 'Landslide',
  'Drought', 'Heat Wave', 'Cold Wave', 'Ice Storm', 'Blizzard'
];

const OCCUPANCY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed Use', 'Institutional', 'Recreational'];
const CONSTRUCTION_TYPES = ['Wood Frame', 'Steel Frame', 'Concrete', 'Masonry', 'Mixed', 'Prefabricated', 'Adobe'];
const INDUSTRY_SECTORS = ['Manufacturing', 'Technology', 'Finance', 'Healthcare', 'Retail', 'Energy', 'Real Estate', 'Agriculture', 'Transportation'];
const ACCOUNT_TYPES = ['Primary', 'Reinsurance', 'Facultative', 'Treaty'];

// Utility functions
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateLatLon(country) {
  const bounds = {
    'USA': { latMin: 25, latMax: 49, lonMin: -125, lonMax: -66 },
    'UK': { latMin: 50, latMax: 59, lonMin: -8, lonMax: 2 },
    'India': { latMin: 8, latMax: 35, lonMin: 68, lonMax: 97 },
    'Japan': { latMin: 30, latMax: 45, lonMin: 130, lonMax: 145 },
    'China': { latMin: 18, latMax: 53, lonMin: 73, lonMax: 135 }
  };
  
  const bound = bounds[country] || { latMin: -60, latMax: 60, lonMin: -180, lonMax: 180 };
  return {
    latitude: randomFloat(bound.latMin, bound.latMax, 6),
    longitude: randomFloat(bound.lonMin, bound.lonMax, 6)
  };
}

// Data generators
async function generateAccounts(count) {
  console.log(`\n📊 Generating ${count.toLocaleString()} Accounts...`);
  const accounts = [];
  const startId = 100001;
  
  for (let i = 0; i < count; i++) {
    const country = randomItem(COUNTRIES);
    const accountId = `ACC-${String(startId + i).padStart(6, '0')}`;
    
    accounts.push({
      accountId,
      accountName: `${randomItem(INDUSTRY_SECTORS)} Corp ${i + 1}`,
      accountType: randomItem(ACCOUNT_TYPES),
      status: randomItem(['Active', 'Active', 'Active', 'Pending', 'Inactive']),
      effectiveDate: randomDate(new Date(2010, 0, 1), new Date(2024, 11, 31)),
      expiryDate: randomDate(new Date(2025, 0, 1), new Date(2030, 11, 31)),
      totalExposure: randomFloat(1000000, 100000000, 0),
      currency: 'USD',
      regions: [randomItem(['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'])],
      riskProfile: randomItem(['Low', 'Medium', 'High', 'Very High']),
      hazardRiskProfile: {
        overallRiskLevel: randomItem(['Low', 'Medium', 'High', 'Very High', 'Extreme']),
        primaryHazards: [],
        lastRiskAssessment: randomDate(new Date(2023, 0, 1), new Date(2024, 11, 31)),
        riskAssessmentMethod: randomItem(['Model', 'Expert', 'Historical', 'Hybrid'])
      },
      // Required audit fields
      createdBy: 'seed-script',
      lastModifiedBy: 'seed-script'
    });

    if ((i + 1) % 5000 === 0) {
      console.log(`   Generated ${(i + 1).toLocaleString()} accounts...`);
    }
  }
  
  return accounts;
}

async function generateHazards(count) {
  console.log(`\n🌪️  Generating ${count.toLocaleString()} Hazards...`);
  const hazards = [];
  const startId = 10000001;
  
  for (let i = 0; i < count; i++) {
    const hazardType = randomItem(HAZARD_TYPES);
    const country = randomItem(COUNTRIES);
    const coords = generateLatLon(country);
    
    hazards.push({
      hazardId: `HAZ-${String(startId + i).padStart(8, '0')}`,
      hazardName: `${hazardType} Zone ${country} ${i + 1}`,
      hazardType,
      description: `${hazardType} risk zone in ${country}`,
      geographicFootprint: {
        type: 'Polygon',
        coordinates: [[
          [coords.longitude, coords.latitude],
          [coords.longitude + 0.1, coords.latitude],
          [coords.longitude + 0.1, coords.latitude + 0.1],
          [coords.longitude, coords.latitude + 0.1],
          [coords.longitude, coords.latitude]
        ]]
      },
      intensity: {
        scale: randomItem(['Richter', 'Saffir-Simpson', 'Fujita', 'MMI']),
        value: randomFloat(1, 10),
        unit: randomItem(['magnitude', 'category', 'scale'])
      },
      probability: {
        annualProbability: randomFloat(0.001, 0.5, 4),
        returnPeriod: randomInt(10, 1000),
        confidenceLevel: randomFloat(0.7, 0.99, 2)
      },
      historicalData: {
        lastOccurrence: randomDate(new Date(1900, 0, 1), new Date(2024, 11, 31)),
        frequency: randomInt(1, 100),
        averageLoss: randomFloat(100000, 100000000, 0)
      },
      status: randomItem(['Active', 'Active', 'Active', 'Inactive', 'Under Review'])
    });

    if ((i + 1) % 5000 === 0) {
      console.log(`   Generated ${(i + 1).toLocaleString()} hazards...`);
    }
  }
  
  return hazards;
}

async function generateVulnerabilities(count) {
  console.log(`\n🏚️  Generating ${count.toLocaleString()} Vulnerabilities...`);
  const vulnerabilities = [];
  const startId = 10000001;
  
  for (let i = 0; i < count; i++) {
    const hazardType = randomItem(HAZARD_TYPES);
    const occupancyType = randomItem(OCCUPANCY_TYPES);
    
    vulnerabilities.push({
      vulnerabilityId: `VUL-${String(startId + i).padStart(8, '0')}`,
      vulnerabilityName: `${occupancyType} ${hazardType} Vulnerability ${i + 1}`,
      hazardType,
      description: `Vulnerability assessment for ${occupancyType} structures against ${hazardType}`,
      structureType: occupancyType,
      constructionType: randomItem(CONSTRUCTION_TYPES),
      yearBuilt: randomInt(1950, 2024),
      damageStates: [
        {
          state: 'Minor',
          damageRatio: randomFloat(0.01, 0.1, 3),
          repairCost: randomFloat(1000, 50000, 0),
          downtimedays: randomInt(1, 30)
        },
        {
          state: 'Moderate',
          damageRatio: randomFloat(0.1, 0.3, 3),
          repairCost: randomFloat(50000, 200000, 0),
          downtimedays: randomInt(30, 90)
        },
        {
          state: 'Severe',
          damageRatio: randomFloat(0.3, 0.7, 3),
          repairCost: randomFloat(200000, 1000000, 0),
          downtimedays: randomInt(90, 365)
        },
        {
          state: 'Complete',
          damageRatio: randomFloat(0.7, 1.0, 3),
          repairCost: randomFloat(1000000, 10000000, 0),
          downtimedays: randomInt(365, 730)
        }
      ],
      vulnerabilityCurve: {
        curveType: 'Fragility',
        parameters: {
          beta: randomFloat(0.3, 0.8, 2),
          median: randomFloat(0.1, 0.5, 2)
        }
      },
      mitigationMeasures: [
        {
          measure: randomItem(['Retrofitting', 'Reinforcement', 'Foundation improvement', 'Structural upgrade']),
          effectiveness: randomFloat(0.2, 0.8, 2),
          cost: randomFloat(10000, 500000, 0)
        }
      ],
      status: randomItem(['Active', 'Active', 'Active', 'Inactive', 'Under Review'])
    });

    if ((i + 1) % 5000 === 0) {
      console.log(`   Generated ${(i + 1).toLocaleString()} vulnerabilities...`);
    }
  }
  
  return vulnerabilities;
}

async function generateLocations(count, accountIds) {
  console.log(`\n📍 Generating ${count.toLocaleString()} Locations...`);
  const locations = [];
  const startId = 10000001;
  
  for (let i = 0; i < count; i++) {
    const country = randomItem(COUNTRIES);
    const coords = generateLatLon(country);
    const accountId = randomItem(accountIds);
    
    locations.push({
      locationId: `LOC-${String(startId + i).padStart(8, '0')}`,
      accountId,
      locationName: `Location ${i + 1}`,
      address: {
        street: `${randomInt(1, 9999)} Main Street`,
        city: randomItem(CITIES[country] || ['City']),
        state: country === 'USA' ? randomItem(US_STATES) : '',
        postalCode: String(10000 + randomInt(0, 89999)),
        country
      },
      coordinates: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        elevation: randomFloat(0, 3000, 1)
      },
      propertyCharacteristics: {
        occupancyType: randomItem(OCCUPANCY_TYPES),
        constructionType: randomItem(CONSTRUCTION_TYPES),
        yearBuilt: randomInt(1950, 2024),
        numberOfStories: randomInt(1, 50),
        totalArea: randomFloat(1000, 100000, 0),
        replacementValue: randomFloat(500000, 50000000, 0)
      },
      riskFactors: {
        floodZone: randomItem(['A', 'AE', 'AO', 'X', 'V', 'VE']),
        earthquakeZone: randomInt(1, 4),
        windSpeed: randomInt(90, 200),
        fireProtectionClass: randomInt(1, 10)
      },
      status: randomItem(['Active', 'Active', 'Active', 'Inactive'])
    });

    if ((i + 1) % 10000 === 0) {
      console.log(`   Generated ${(i + 1).toLocaleString()} locations...`);
    }
  }
  
  return locations;
}

async function generateExposures(count, accountIds, locationIds) {
  console.log(`\n💰 Generating ${count.toLocaleString()} Exposures...`);
  const exposures = [];
  const startId = 1000000001;
  
  for (let i = 0; i < count; i++) {
    const accountId = randomItem(accountIds);
    const locationId = randomItem(locationIds);
    const tiv = randomFloat(100000, 100000000, 0);
    
    exposures.push({
      exposureId: `EXP-${String(startId + i).padStart(10, '0')}`,
      accountId,
      locationId,
      policyNumber: `POL-${String(10000001 + i).padStart(8, '0')}`,
      exposureType: randomItem(['Property', 'Business Interruption', 'Contents', 'Time Element']),
      coverageDetails: {
        coverage: randomItem(['All Risk', 'Named Perils', 'Earthquake', 'Flood', 'Wind', 'Fire']),
        limit: tiv * randomFloat(0.8, 1.0, 2),
        deductible: tiv * randomFloat(0.01, 0.1, 2),
        coinsurance: randomFloat(0.8, 1.0, 2)
      },
      values: {
        totalInsuredValue: tiv,
        buildingValue: tiv * randomFloat(0.5, 0.7, 2),
        contentsValue: tiv * randomFloat(0.2, 0.3, 2),
        businessInterruptionValue: tiv * randomFloat(0.1, 0.2, 2),
        currency: 'USD'
      },
      policyTerms: {
        effectiveDate: randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
        expirationDate: randomDate(new Date(2025, 0, 1), new Date(2030, 11, 31)),
        premium: tiv * randomFloat(0.001, 0.05, 0)
      },
      riskCharacteristics: {
        occupancy: randomItem(OCCUPANCY_TYPES),
        construction: randomItem(CONSTRUCTION_TYPES),
        protectionClass: randomInt(1, 10),
        yearBuilt: randomInt(1950, 2024)
      }
    });

    if ((i + 1) % 10000 === 0) {
      console.log(`   Generated ${(i + 1).toLocaleString()} exposures...`);
    }
  }
  
  return exposures;
}

async function generatePolicies(count, accountIds, exposureIds) {
  console.log(`\n📄 Generating ${count.toLocaleString()} Policies...`);
  const policies = [];
  const startId = 10000001;
  
  for (let i = 0; i < count; i++) {
    const accountId = randomItem(accountIds);
    const effectiveDate = randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31));
    const expirationDate = new Date(effectiveDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    const premium = randomFloat(10000, 1000000, 0);
    
    policies.push({
      policyId: `POL-${String(startId + i).padStart(8, '0')}`,
      policyNumber: `PN${String(1000000 + i).slice(-7)}`,
      accountId,
      policyType: randomItem(['Property', 'Casualty', 'Package', 'Excess', 'Umbrella']),
      policyStatus: randomItem(['Active', 'Active', 'Active', 'Pending', 'Expired', 'Cancelled']),
      effectiveDate,
      expirationDate,
      premium: {
        totalPremium: premium,
        basePremium: premium * 0.8,
        taxes: premium * 0.1,
        fees: premium * 0.1,
        currency: 'USD'
      },
      limits: {
        perOccurrence: randomFloat(1000000, 100000000, 0),
        aggregate: randomFloat(5000000, 500000000, 0),
        currency: 'USD'
      },
      deductibles: {
        perOccurrence: randomFloat(10000, 500000, 0),
        aggregate: randomFloat(50000, 2000000, 0),
        currency: 'USD'
      },
      coverages: [
        {
          coverageType: randomItem(['Property Damage', 'Business Interruption', 'Liability', 'Equipment Breakdown']),
          limit: randomFloat(1000000, 50000000, 0),
          deductible: randomFloat(10000, 250000, 0)
        }
      ],
      hazardCoverage: {
        coveredHazards: [randomItem(HAZARD_TYPES), randomItem(HAZARD_TYPES)],
        effectiveDate
      }
    });

    if ((i + 1) % 10000 === 0) {
      console.log(`   Generated ${(i + 1).toLocaleString()} policies...`);
    }
  }
  
  return policies;
}

// Batch insert function
async function batchInsert(Model, data, batchSize, modelName) {
  const totalBatches = Math.ceil(data.length / batchSize);
  console.log(`\n💾 Inserting ${data.length.toLocaleString()} ${modelName} in ${totalBatches} batches...`);
  
  let inserted = 0;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await Model.insertMany(batch, { ordered: false });
    inserted += batch.length;
    console.log(`   Inserted ${inserted.toLocaleString()} / ${data.length.toLocaleString()} ${modelName}...`);
  }
  
  console.log(`✅ Completed inserting ${data.length.toLocaleString()} ${modelName}`);
}

// Main seeding function
async function seedExtensiveData() {
  const startTime = Date.now();
  
  console.log('🚀 Starting Extensive Data Seeding');
  console.log('=' .repeat(80));
  console.log(`Target counts:`);
  console.log(`  - Accounts: ${SEED_COUNTS.accounts.toLocaleString()}`);
  console.log(`  - Hazards: ${SEED_COUNTS.hazards.toLocaleString()}`);
  console.log(`  - Vulnerabilities: ${SEED_COUNTS.vulnerabilities.toLocaleString()}`);
  console.log(`  - Locations: ${SEED_COUNTS.locations.toLocaleString()}`);
  console.log(`  - Exposures: ${SEED_COUNTS.exposures.toLocaleString()}`);
  console.log(`  - Policies: ${SEED_COUNTS.policies.toLocaleString()}`);
  console.log('=' .repeat(80));

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev';
    console.log(`\n🔄 Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out to keep existing data)
    console.log('\n🗑️  Clearing existing data...');
    await Promise.all([
      Account.deleteMany({}),
      Hazard.deleteMany({}),
      Vulnerability.deleteMany({}),
      Location.deleteMany({}),
      Exposure.deleteMany({}),
      Policy.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Generate and insert Accounts
    const accounts = await generateAccounts(SEED_COUNTS.accounts);
    await batchInsert(Account, accounts, BATCH_SIZE, 'Accounts');
    const accountIds = accounts.map(a => a.accountId);

    // Generate and insert Hazards
    const hazards = await generateHazards(SEED_COUNTS.hazards);
    await batchInsert(Hazard, hazards, BATCH_SIZE, 'Hazards');

    // Generate and insert Vulnerabilities
    const vulnerabilities = await generateVulnerabilities(SEED_COUNTS.vulnerabilities);
    await batchInsert(Vulnerability, vulnerabilities, BATCH_SIZE, 'Vulnerabilities');

    // Generate and insert Locations
    const locations = await generateLocations(SEED_COUNTS.locations, accountIds);
    await batchInsert(Location, locations, BATCH_SIZE, 'Locations');
    const locationIds = locations.map(l => l.locationId);

    // Generate and insert Exposures
    const exposures = await generateExposures(SEED_COUNTS.exposures, accountIds, locationIds);
    await batchInsert(Exposure, exposures, BATCH_SIZE, 'Exposures');
    const exposureIds = exposures.map(e => e.exposureId);

    // Generate and insert Policies
    const policies = await generatePolicies(SEED_COUNTS.policies, accountIds, exposureIds);
    await batchInsert(Policy, policies, BATCH_SIZE, 'Policies');

    // Verify counts
    console.log('\n📊 Verifying inserted data...');
    const counts = await Promise.all([
      Account.countDocuments(),
      Hazard.countDocuments(),
      Vulnerability.countDocuments(),
      Location.countDocuments(),
      Exposure.countDocuments(),
      Policy.countDocuments()
    ]);

    console.log('\n✅ DATA SEEDING COMPLETE');
    console.log('=' .repeat(80));
    console.log('Final counts in database:');
    console.log(`  Accounts: ${counts[0].toLocaleString()}`);
    console.log(`  Hazards: ${counts[1].toLocaleString()}`);
    console.log(`  Vulnerabilities: ${counts[2].toLocaleString()}`);
    console.log(`  Locations: ${counts[3].toLocaleString()}`);
    console.log(`  Exposures: ${counts[4].toLocaleString()}`);
    console.log(`  Policies: ${counts[5].toLocaleString()}`);
    console.log(`  TOTAL RECORDS: ${counts.reduce((a, b) => a + b, 0).toLocaleString()}`);
    console.log('=' .repeat(80));

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Total time: ${elapsed} seconds`);
    console.log(`📈 Average rate: ${Math.round(counts.reduce((a, b) => a + b, 0) / elapsed).toLocaleString()} records/second`);

    // Close MongoDB connection properly
    console.log('\n🔌 Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    console.error(error.stack);
    
    // Ensure connection is closed on error too
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run seeding
seedExtensiveData();
