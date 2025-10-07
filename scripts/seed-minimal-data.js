/**
 * Minimal Seed Data Script
 * Creates essential data for basic application functionality
 */

const mongoose = require('mongoose');
const Account = require('../src/models/Account');
const Policy = require('../src/models/Policy');
const Location = require('../src/models/Location');
const Hazard = require('../src/models/Hazard');
const Vulnerability = require('../src/models/Vulnerability');
const Exposure = require('../src/models/Exposure');
const TransactionManager = require('../src/core/TransactionManager');
const { 
  PERIL_TYPE_VALUES,
  OCCUPANCY_TYPE_VALUES,
  CONSTRUCTION_TYPE_VALUES,
  EXPOSURE_TYPE_VALUES
} = require('../src/constants');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';

// Use the _VALUES arrays for iteration in seed script
const PERIL_TYPES = PERIL_TYPE_VALUES;
const OCCUPANCY_TYPES = OCCUPANCY_TYPE_VALUES;
const CONSTRUCTION_TYPES = CONSTRUCTION_TYPE_VALUES;
const EXPOSURE_TYPES = EXPOSURE_TYPE_VALUES;

/**
 * Generate coordinates for a given region
 */
function generateCoordinates(region) {
  const regionBounds = {
    'North America': { latMin: 25, latMax: 55, lngMin: -125, lngMax: -65 },
    'Europe': { latMin: 35, latMax: 70, lngMin: -10, lngMax: 40 },
    'Asia Pacific': { latMin: -40, latMax: 50, lngMin: 100, lngMax: 180 }
  };

  const bounds = regionBounds[region] || regionBounds['North America'];
  return {
    lat: bounds.latMin + Math.random() * (bounds.latMax - bounds.latMin),
    lng: bounds.lngMin + Math.random() * (bounds.lngMax - bounds.lngMin)
  };
}

/**
 * Seed accounts
 */
async function seedAccounts(session) {
  console.log('Seeding accounts...');
  
  const accounts = [
    {
      accountId: 'ACC-000001',
      accountName: 'Global Insurance Corp',
      accountType: 'Primary',
      accountLevel: 1,
      status: 'Active',
      totalExposure: 50000000,
      currency: 'USD',
      regions: ['North America'],
      riskProfile: 'Medium',
      hazardRiskProfile: {
        overallRiskLevel: 'Medium',
        primaryHazards: [
          {
            hazardType: 'Earthquake',
            riskLevel: 'High',
            exposureAmount: 20000000,
            lastAssessed: new Date()
          },
          {
            hazardType: 'Hurricane',
            riskLevel: 'Medium',
            exposureAmount: 15000000,
            lastAssessed: new Date()
          }
        ],
        lastRiskAssessment: new Date(),
        riskAssessmentMethod: 'Model'
      },
      effectiveDate: new Date(),
      createdBy: 'seed-script',
      lastModifiedBy: 'seed-script',
      metadata: new Map([['source', 'seed-data'], ['version', '1.0']])
    },
    {
      accountId: 'ACC-000002',
      accountName: 'Property Management LLC',
      accountType: 'Primary',
      accountLevel: 1,
      status: 'Active',
      totalExposure: 30000000,
      currency: 'USD',
      regions: ['North America'],
      riskProfile: 'Low',
      hazardRiskProfile: {
        overallRiskLevel: 'Low',
        primaryHazards: [
          {
            hazardType: 'Flood',
            riskLevel: 'Medium',
            exposureAmount: 10000000,
            lastAssessed: new Date()
          },
          {
            hazardType: 'Wildfire',
            riskLevel: 'Low',
            exposureAmount: 5000000,
            lastAssessed: new Date()
          }
        ],
        lastRiskAssessment: new Date(),
        riskAssessmentMethod: 'Hybrid'
      },
      effectiveDate: new Date(),
      createdBy: 'seed-script',
      lastModifiedBy: 'seed-script',
      metadata: new Map([['source', 'seed-data'], ['version', '1.0']])
    },
    {
      accountId: 'ACC-000003',
      accountName: 'Manufacturing International',
      accountType: 'Primary',
      accountLevel: 1,
      status: 'Active',
      totalExposure: 75000000,
      currency: 'USD',
      regions: ['Asia Pacific'],
      riskProfile: 'High',
      hazardRiskProfile: {
        overallRiskLevel: 'High',
        primaryHazards: [
          {
            hazardType: 'Earthquake',
            riskLevel: 'Very High',
            exposureAmount: 30000000,
            lastAssessed: new Date()
          },
          {
            hazardType: 'Typhoon',
            riskLevel: 'High',
            exposureAmount: 25000000,
            lastAssessed: new Date()
          },
          {
            hazardType: 'Tsunami',
            riskLevel: 'Medium',
            exposureAmount: 10000000,
            lastAssessed: new Date()
          }
        ],
        lastRiskAssessment: new Date(),
        riskAssessmentMethod: 'Model'
      },
      effectiveDate: new Date(),
      createdBy: 'seed-script',
      lastModifiedBy: 'seed-script',
      metadata: new Map([['source', 'seed-data'], ['version', '1.0']])
    }
  ];

  const createdAccounts = await Account.insertMany(accounts, { session });
  console.log(`✓ Created ${createdAccounts.length} accounts`);
  return createdAccounts;
}

/**
 * Seed locations for accounts
 */
async function seedLocations(accounts, session) {
  console.log('Seeding locations...');
  
  const locations = [];
  let locationCounter = 1;
  
  for (const account of accounts) {
    // Create 3-5 locations per account
    const numLocations = Math.floor(Math.random() * 3) + 3;
    
    // Get region from account
    const accountRegion = account.regions[0] || 'North America';
    
    for (let i = 0; i < numLocations; i++) {
      const coords = generateCoordinates(accountRegion);
      const locationId = `LOC-${String(locationCounter).padStart(8, '0')}`;
      
      locations.push({
        locationId,
        locationName: `${account.accountName} - Location ${i + 1}`,
        coordinates: {
          latitude: coords.lat,
          longitude: coords.lng,
          elevation: Math.floor(Math.random() * 500)
        },
        address: {
          street: `${Math.floor(Math.random() * 9999)} Main Street`,
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: accountRegion === 'North America' ? 'USA' : accountRegion === 'Europe' ? 'UK' : 'Japan',
          region: accountRegion
        },
        riskZones: [
          {
            zoneType: 'Earthquake',
            zoneCode: `EQ-ZONE-${i + 1}`,
            zoneDescription: 'Seismic zone',
            riskLevel: ['Low', 'Medium', 'High'][i % 3]
          },
          {
            zoneType: 'Flood',
            zoneCode: `FL-ZONE-${i + 1}`,
            zoneDescription: 'Flood zone',
            riskLevel: ['Low', 'Medium'][i % 2]
          }
        ],
        riskFactors: [
          {
            peril: 'Earthquake',
            riskScore: 3 + Math.random() * 4,
            probability: 0.01 + Math.random() * 0.05,
            expectedLoss: 100000 + Math.random() * 400000,
            lastUpdated: new Date()
          },
          {
            peril: 'Flood',
            riskScore: 2 + Math.random() * 5,
            probability: 0.02 + Math.random() * 0.08,
            expectedLoss: 50000 + Math.random() * 300000,
            lastUpdated: new Date()
          }
        ],
        hazardExposure: [],
        hazardZones: [],
        propertyCharacteristics: {
          occupancyType: ['Residential', 'Commercial', 'Industrial'][i % 3],
          constructionType: ['Concrete', 'Steel', 'Frame', 'Masonry'][Math.floor(Math.random() * 4)],
          yearBuilt: 1980 + Math.floor(Math.random() * 40),
          numberOfStories: Math.floor(Math.random() * 10) + 1,
          squareFootage: 5000 + Math.floor(Math.random() * 45000),
          replacementCost: 500000 + Math.floor(Math.random() * 4500000),
          marketValue: 400000 + Math.floor(Math.random() * 3600000)
        },
        totalExposure: 0,  // Will be calculated from policies (set to 0 initially)
        currency: account.currency,
        associatedPolicies: [],  // Will be populated later if needed
        catModelData: {
          modelProvider: 'RMS',
          modelVersion: '2024.1',
          lastModelUpdate: new Date(),
          modelResults: new Map()
        },
        status: 'Active',
        createdBy: 'seed-script',
        lastModifiedBy: 'seed-script',
        metadata: new Map([['source', 'seed-data'], ['accountId', account.accountId]])
      });
      
      locationCounter++;
    }
  }

  // Set accountId in metadata instead of as field since Location doesn't have accountId field
  const createdLocations = await Location.insertMany(locations, { session });
  console.log(`✓ Created ${createdLocations.length} locations`);
  
  // Return locations with accountId for exposure linking
  return createdLocations.map(loc => ({
    ...loc.toObject(),
    accountId: loc.metadata.get('accountId')  // Extract accountId from metadata for exposure linking
  }));
}

/**
 * Seed policies for accounts
 */
async function seedPolicies(accounts, session) {
  console.log('Seeding policies...');
  
  const policies = [];
  let policyCounter = 1;
  
  for (const account of accounts) {
    // Create 2-4 policies per account
    const numPolicies = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numPolicies; i++) {
      const policyId = `POL-${String(policyCounter).padStart(8, '0')}`;
      const effectiveDate = new Date();
      const expiryDate = new Date(effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const totalLimit = 5000000 + Math.floor(Math.random() * 20000000);
      const totalDeductible = 10000 + Math.floor(Math.random() * 90000);
      
      policies.push({
        policyId,
        policyNumber: `PN-${policyId}`,
        accountId: account.accountId,  // Use accountId string, not _id
        policyName: `${account.accountName} - Policy ${i + 1}`,
        policyType: ['Direct', 'Reinsurance', 'Facultative'][i % 3],  // Must match enum!
        coverages: [
          {
            coverageType: ['Property', 'Liability', 'Business Interruption'][i % 3],
            coverageLimit: totalLimit * 0.8,
            deductible: totalDeductible,
            coveragePercentage: 100
          }
        ],
        totalLimit,
        totalDeductible,
        premium: 50000 + Math.floor(Math.random() * 200000),
        currency: account.currency,  // Match account currency
        effectiveDate,  // Changed from inceptionDate
        expiryDate,
        status: 'Active',
        createdBy: 'seed-script',
        lastModifiedBy: 'seed-script',
        metadata: new Map([['source', 'seed-data']])
      });
      
      policyCounter++;
    }
  }

  const createdPolicies = await Policy.insertMany(policies, { session });
  console.log(`✓ Created ${createdPolicies.length} policies`);
  return createdPolicies;
}

/**
 * Seed exposures for accounts, policies, and locations
 */
async function seedExposures(accounts, policies, locations, session) {
  console.log('Seeding exposures...');
  
  const exposures = [];
  let exposureCounter = 1;
  
  // Group locations by accountId STRING (not _id)
  const locationsByAccount = {};
  for (const location of locations) {
    const accId = location.accountId;  // This is already a string like 'ACC-000001'
    if (!locationsByAccount[accId]) {
      locationsByAccount[accId] = [];
    }
    locationsByAccount[accId].push(location);
  }
  
  // Group policies by accountId STRING
  const policiesByAccount = {};
  for (const policy of policies) {
    if (!policiesByAccount[policy.accountId]) {
      policiesByAccount[policy.accountId] = [];
    }
    policiesByAccount[policy.accountId].push(policy);
  }
  
  for (const account of accounts) {
    const accountLocations = locationsByAccount[account.accountId] || [];
    const accountPolicies = policiesByAccount[account.accountId] || [];
    
    if (accountLocations.length === 0 || accountPolicies.length === 0) continue;
    
    // Create 2-3 exposures per location
    for (const location of accountLocations) {
      const numExposures = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numExposures; i++) {
        const exposureId = `EXP-${String(exposureCounter).padStart(8, '0')}`;
        const policy = accountPolicies[i % accountPolicies.length];
        const totalInsuredValue = 500000 + Math.floor(Math.random() * 4500000);
        const replacementValue = totalInsuredValue * (1.1 + Math.random() * 0.2);
        
        // Select random occupancy and construction from our standardized types
        const occupancyType = OCCUPANCY_TYPES[Math.floor(Math.random() * OCCUPANCY_TYPES.length)];
        const constructionType = CONSTRUCTION_TYPES[Math.floor(Math.random() * CONSTRUCTION_TYPES.length)];
        const exposureType = EXPOSURE_TYPES[i % EXPOSURE_TYPES.length];
        
        // Generate peril exposures (2-4 perils per exposure)
        const numPerils = Math.floor(Math.random() * 3) + 2;
        const selectedPerils = [];
        const availablePerils = [...PERIL_TYPES];
        
        for (let p = 0; p < numPerils && availablePerils.length > 0; p++) {
          const perilIndex = Math.floor(Math.random() * availablePerils.length);
          const peril = availablePerils.splice(perilIndex, 1)[0];
          const exposureAmount = totalInsuredValue * (0.7 + Math.random() * 0.3);
          const deductible = exposureAmount * 0.02; // 2% deductible
          
          selectedPerils.push({
            peril,
            exposureAmount,
            deductible,
            limit: exposureAmount * 1.5
          });
        }
        
        const effectiveDate = new Date();
        const expiryDate = new Date(effectiveDate.getTime() + 365 * 24 * 60 * 60 * 1000);
        
        exposures.push({
          exposureId,
          exposureType,
          accountId: account.accountId,  // Use accountId string
          policyId: policy.policyId,
          locationId: location.locationId,
          totalInsuredValue,
          replacementValue,
          currency: account.currency,  // Match account currency
          perilExposures: selectedPerils,
          location: {
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude
          },
          occupancyType,
          constructionType,
          yearBuilt: 1980 + Math.floor(Math.random() * 40),
          effectiveDate,
          expiryDate,
          status: 'Active',
          createdBy: 'seed-script',
          lastModifiedBy: 'seed-script'
        });
        
        exposureCounter++;
      }
    }
  }

  const createdExposures = await Exposure.insertMany(exposures, { session });
  console.log(`✓ Created ${createdExposures.length} exposures`);
  return createdExposures;
}

/**
 * Seed hazard events
 */
async function seedHazards(session) {
  console.log('Seeding hazard events...');
  
  // Use valid hazardTypes from Hazard.js enum
  const hazardTypes = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Wind'];
  const regions = ['North America', 'Europe', 'Asia Pacific'];
  const hazards = [];
  
  const currentYear = new Date().getFullYear();
  let hazardCounter = 1;
  
  // Create 20 hazard events (reduce from 120 to keep it minimal)
  for (let i = 0; i < 20; i++) {
    const hazardType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const coords = generateCoordinates(region);
    
    const year = currentYear - Math.floor(Math.random() * 5);
    const eventDate = new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const endDate = new Date(eventDate.getTime() + (1 + Math.random() * 10) * 24 * 60 * 60 * 1000);
    
    const hazardId = `HAZ-${String(hazardCounter).padStart(8, '0')}`;
    
    hazards.push({
      hazardId,
      hazardName: `${hazardType} Event ${year}-${String(i).padStart(2, '0')}`,
      hazardType: hazardType,
      hazardCategory: 'Natural',
      
      // Intensities
      intensities: [
        {
          scale: hazardType === 'Earthquake' ? 'Richter' : hazardType === 'Hurricane' ? 'Saffir-Simpson' : 'Custom',
          value: 3 + Math.random() * 7,
          unit: hazardType === 'Earthquake' ? 'Magnitude' : 'Category',
          description: `Peak intensity for ${hazardType}`
        }
      ],
      
      // Footprint (required)
      footprint: {
        centerLatitude: coords.lat,
        centerLongitude: coords.lng,
        radius: 50 + Math.random() * 200,
        unit: 'km',
        affectedArea: (50 + Math.random() * 200) * Math.PI,
        areaUnit: 'km2'
      },
      
      // Temporal (required)
      temporal: {
        startTime: eventDate,
        endTime: endDate,
        duration: (endDate - eventDate) / (1000 * 60 * 60), // hours
        durationUnit: 'hours',
        peakIntensityTime: new Date(eventDate.getTime() + Math.random() * (endDate - eventDate))
      },
      
      // Severity (required)
      severity: ['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic'][Math.floor(Math.random() * 5)],
      
      // Probability (required)
      probability: 0.001 + Math.random() * 0.1,
      
      returnPeriod: 10 + Math.floor(Math.random() * 90),
      returnPeriodUnit: 'years',
      
      // Economic Impact
      economicImpact: [
        {
          estimatedLoss: 1000000 + Math.floor(Math.random() * 99000000),
          currency: 'USD',
          confidenceLevel: 60 + Math.floor(Math.random() * 30),
          lossType: 'Total',
          methodology: 'Catastrophe Model'
        }
      ],
      
      // Affected Regions
      affectedRegions: [region],
      affectedCountries: [region === 'North America' ? 'USA' : region === 'Europe' ? 'UK' : 'Japan'],
      
      // Status (must use valid enum)
      status: 'Active',
      isHistorical: true,
      isSimulated: false,
      
      // Audit fields (required)
      createdBy: 'seed-script',
      lastModifiedBy: 'seed-script',
      
      metadata: new Map([
        ['source', 'seed-data'],
        ['confidence', String(0.7 + Math.random() * 0.3)],
        ['year', String(year)]
      ])
    });
    
    hazardCounter++;
  }

  const createdHazards = await Hazard.insertMany(hazards, { session });
  console.log(`✓ Created ${createdHazards.length} hazard events`);
  return createdHazards;
}

/**
 * Seed vulnerabilities
 */
async function seedVulnerabilities(session) {
  console.log('Seeding vulnerabilities...');
  
  // Use valid hazardTypes from Vulnerability.js enum
  const hazardTypes = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Wind'];
  const constructionTypes = ['Concrete', 'Steel', 'Frame', 'Masonry'];
  const occupancyTypes = ['Residential', 'Commercial', 'Industrial'];
  const regions = ['North America', 'Europe', 'Asia Pacific'];
  
  const vulnerabilities = [];
  let vulnCounter = 1;
  
  // Create 24 vulnerabilities (6 hazards x 4 construction types, simplified)
  for (const hazardType of hazardTypes) {
    for (const construction of constructionTypes) {
      const region = regions[vulnCounter % regions.length];
      const coords = generateCoordinates(region);
      const vulnerabilityId = `VUL-${String(vulnCounter).padStart(8, '0')}`;
      
      vulnerabilities.push({
        vulnerabilityId,
        vulnerabilityName: `${hazardType} - ${construction} Structures`,
        vulnerabilityDescription: `Vulnerability assessment for ${construction} construction exposed to ${hazardType} hazards`,
        
        // Classification (required)
        vulnerabilityType: 'Physical',
        vulnerabilityCategory: 'Community',
        
        // Geographic scope (required)
        geographicScope: {
          centerLatitude: coords.lat,
          centerLongitude: coords.lng,
          radius: 50 + Math.random() * 100,
          radiusUnit: 'km',
          area: (50 + Math.random() * 100) * Math.PI,
          areaUnit: 'km2',
          administrativeLevel: 'State/Province',
          country: region === 'North America' ? 'USA' : region === 'Europe' ? 'UK' : 'Japan',
          region: region
        },
        
        // Overall assessment (required)
        overallVulnerabilityScore: 3 + Math.random() * 5,
        overallRiskLevel: ['Low', 'Medium', 'High', 'Very High'][Math.floor(Math.random() * 4)],
        confidenceLevel: ['Medium', 'High', 'Very High'][Math.floor(Math.random() * 3)],
        
        // Vulnerability factors
        vulnerabilityFactors: [
          {
            factorType: 'Physical',
            factorName: 'Structural Integrity',
            factorValue: 3 + Math.random() * 5,
            weight: 0.4,
            description: `${construction} structural vulnerability to ${hazardType}`
          },
          {
            factorType: 'Economic',
            factorName: 'Replacement Cost',
            factorValue: 4 + Math.random() * 4,
            weight: 0.3,
            unit: 'USD per sqft'
          }
        ],
        
        // Hazard-specific vulnerabilities
        hazardVulnerabilities: [
          {
            hazardType: hazardType,
            vulnerabilityScore: 3 + Math.random() * 5,
            confidenceLevel: 'High',
            methodology: 'Engineering analysis',
            specificFactors: []
          }
        ],
        
        // Temporal (required)
        assessmentDate: new Date(),
        validFrom: new Date(),
        validTo: null,
        
        // Data sources
        dataSources: [
          {
            sourceType: 'Academic',
            sourceName: 'Vulnerability Assessment Database',
            reliability: 'High'
          }
        ],
        
        // Status (required)
        status: 'Active',
        
        // Audit fields (required)
        createdBy: 'seed-script',
        lastModifiedBy: 'seed-script',
        
        metadata: new Map([
          ['source', 'seed-data'],
          ['version', '1.0'],
          ['construction', construction],
          ['hazard', hazardType]
        ])
      });
      
      vulnCounter++;
    }
  }

  const createdVulnerabilities = await Vulnerability.insertMany(vulnerabilities, { session });
  console.log(`✓ Created ${createdVulnerabilities.length} vulnerabilities`);
  return createdVulnerabilities;
}

/**
 * Main seed function
 */
async function seedMinimalData() {
  console.log('========================================');
  console.log('Starting Minimal Data Seeding');
  console.log('========================================\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check if data already exists
    const accountCount = await Account.countDocuments();
    if (accountCount > 0) {
      console.log('⚠ Data already exists. Clearing existing data...');
      await Account.deleteMany({});
      await Policy.deleteMany({});
      await Location.deleteMany({});
      await Exposure.deleteMany({});
      await Hazard.deleteMany({});
      await Vulnerability.deleteMany({});
      console.log('✓ Cleared existing data\n');
    }

    // Execute seeding without transaction (standalone MongoDB doesn't support transactions)
    const accounts = await seedAccounts(null);
    const locations = await seedLocations(accounts, null);
    const policies = await seedPolicies(accounts, null);
    const exposures = await seedExposures(accounts, policies, locations, null);
    const hazards = await seedHazards(null);
    const vulnerabilities = await seedVulnerabilities(null);

    console.log('\n========================================');
    console.log('✓ Minimal Data Seeding Complete!');
    console.log('========================================');
    console.log(`Accounts: ${accounts.length}`);
    console.log(`Locations: ${locations.length}`);
    console.log(`Policies: ${policies.length}`);
    console.log(`Exposures: ${exposures.length}`);
    console.log(`Hazards: ${hazards.length}`);
    console.log(`Vulnerabilities: ${vulnerabilities.length}`);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedMinimalData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedMinimalData };
