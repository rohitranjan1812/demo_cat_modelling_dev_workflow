/**
 * Production-Ready Seed Data for CAT Modeling Platform
 * Fully schema-compliant with all required fields
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Account = require('../models/Account');
const Hazard = require('../models/Hazard');
const Vulnerability = require('../models/Vulnerability');
const SimulationRun = require('../models/SimulationRun');

console.log('🌱 CAT Modeling Platform - Production Data Seeding');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Sample Accounts Data
 */
const accountsData = [
  {
    accountId: 'ACC-001001',
    accountName: 'Global Insurance Corp - Primary',
    accountType: 'Primary',
    accountLevel: 1,
    totalExposure: 50000000,
    currency: 'USD',
    regions: ['North America', 'Europe'],
    riskProfile: 'High',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    hazardRiskProfile: {
      overallRiskLevel: 'High',
      primaryHazards: [{
        hazardType: 'Hurricane',
        riskLevel: 'High',
        exposureAmount: 25000000
      }, {
        hazardType: 'Earthquake',
        riskLevel: 'Medium',
        exposureAmount: 15000000
      }]
    },
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    accountId: 'ACC-002002',
    accountName: 'Regional Reinsurance Ltd',
    accountType: 'Reinsurance',
    parentAccountId: 'ACC-001001',
    accountLevel: 2,
    totalExposure: 25000000,
    currency: 'USD',
    regions: ['North America'],
    riskProfile: 'Medium',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    hazardRiskProfile: {
      overallRiskLevel: 'Medium',
      primaryHazards: [{
        hazardType: 'Hurricane',
        riskLevel: 'Medium',
        exposureAmount: 25000000
      }]
    },
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    accountId: 'ACC-003003',
    accountName: 'Florida Property Insurance',
    accountType: 'Primary',
    accountLevel: 1,
    totalExposure: 15000000,
    currency: 'USD',
    regions: ['North America'],
    riskProfile: 'Very High',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    hazardRiskProfile: {
      overallRiskLevel: 'Very High',
      primaryHazards: [{
        hazardType: 'Hurricane',
        riskLevel: 'Very High',
        exposureAmount: 15000000
      }]
    },
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    accountId: 'ACC-004004',
    accountName: 'California Earthquake Pool',
    accountType: 'Pool',
    accountLevel: 1,
    totalExposure: 100000000,
    currency: 'USD',
    regions: ['North America'],
    riskProfile: 'Very High',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2025-12-31'),
    hazardRiskProfile: {
      overallRiskLevel: 'Very High',
      primaryHazards: [{
        hazardType: 'Earthquake',
        riskLevel: 'Very High',
        exposureAmount: 100000000
      }]
    },
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    accountId: 'ACC-005005',
    accountName: 'Asian Typhoon Syndicate',
    accountType: 'Syndicate',
    accountLevel: 1,
    totalExposure: 75000000,
    currency: 'USD',
    regions: ['Asia Pacific'],
    riskProfile: 'High',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    hazardRiskProfile: {
      overallRiskLevel: 'High',
      primaryHazards: [{
        hazardType: 'Typhoon',
        riskLevel: 'High',
        exposureAmount: 75000000
      }]
    },
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
];

/**
 * Sample Hazards Data - Schema Compliant
 */
const hazardsData = [
  {
    hazardId: 'HAZ-00100001',
    hazardName: 'Hurricane Katrina - Historical Analysis',
    hazardDescription: 'Historical analysis of Hurricane Katrina (2005) impact patterns for risk modeling',
    hazardType: 'Hurricane',
    hazardCategory: 'Natural',
    severity: 'Catastrophic',
    probability: 0.02,
    
    // Required footprint schema
    footprint: {
      centerLatitude: 29.951,
      centerLongitude: -90.0715,
      radius: 500,
      unit: 'km',
      affectedArea: 785398,
      areaUnit: 'km2'
    },
    
    // Required temporal schema
    temporal: {
      startTime: new Date('2005-08-29T06:00:00Z'),
      endTime: new Date('2005-08-31T00:00:00Z'),
      duration: 48,
      durationUnit: 'hours',
      peakIntensityTime: new Date('2005-08-29T12:00:00Z')
    },
    
    // Intensity metrics
    intensity: {
      scale: 'Saffir-Simpson',
      value: 5,
      unit: 'Category',
      description: 'Category 5 hurricane with sustained winds over 157 mph'
    },
    
    status: 'Historical',
    confidenceLevel: 'High',
    dataQuality: 'High',
    dataSource: 'NOAA Historical Records',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    hazardId: 'HAZ-00200002',
    hazardName: 'San Andreas Earthquake Scenario',
    hazardDescription: 'Probabilistic scenario for major San Andreas fault earthquake',
    hazardType: 'Earthquake',
    hazardCategory: 'Natural',
    severity: 'Severe',
    probability: 0.05,
    
    footprint: {
      centerLatitude: 34.0522,
      centerLongitude: -118.2437,
      radius: 300,
      unit: 'km',
      affectedArea: 282743,
      areaUnit: 'km2'
    },
    
    temporal: {
      startTime: new Date('2024-06-15T14:30:00Z'),
      duration: 2,
      durationUnit: 'minutes',
      peakIntensityTime: new Date('2024-06-15T14:30:30Z')
    },
    
    intensity: {
      scale: 'Richter',
      value: 7.8,
      unit: 'Magnitude',
      description: 'Major earthquake with significant damage potential'
    },
    
    status: 'Scenario',
    confidenceLevel: 'Medium',
    dataQuality: 'Medium',
    dataSource: 'USGS Seismic Hazard Maps',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    hazardId: 'HAZ-00300003',
    hazardName: 'Florida Wildfire Season 2024',
    hazardDescription: 'Active wildfire monitoring for Florida panhandle region',
    hazardType: 'Wildfire',
    hazardCategory: 'Natural',
    severity: 'Moderate',
    probability: 0.15,
    
    footprint: {
      centerLatitude: 30.4383,
      centerLongitude: -84.2807,
      radius: 50,
      unit: 'km',
      affectedArea: 7854,
      areaUnit: 'km2'
    },
    
    temporal: {
      startTime: new Date('2024-04-01T00:00:00Z'),
      endTime: new Date('2024-08-31T23:59:59Z'),
      duration: 153,
      durationUnit: 'days'
    },
    
    intensity: {
      scale: 'Custom',
      value: 6,
      unit: 'Scale',
      description: 'Moderate to high fire danger index'
    },
    
    status: 'Active',
    confidenceLevel: 'High',
    dataQuality: 'High',
    dataSource: 'National Wildfire Coordinating Group',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    hazardId: 'HAZ-00400004',
    hazardName: 'Tokyo Bay Typhoon Scenario',
    hazardDescription: 'Worst-case typhoon scenario for Tokyo metropolitan area',
    hazardType: 'Typhoon',
    hazardCategory: 'Natural',
    severity: 'Catastrophic',
    probability: 0.01,
    
    footprint: {
      centerLatitude: 35.6762,
      centerLongitude: 139.6503,
      radius: 200,
      unit: 'km',
      affectedArea: 125664,
      areaUnit: 'km2'
    },
    
    temporal: {
      startTime: new Date('2024-09-15T00:00:00Z'),
      endTime: new Date('2024-09-17T00:00:00Z'),
      duration: 48,
      durationUnit: 'hours',
      peakIntensityTime: new Date('2024-09-16T06:00:00Z')
    },
    
    intensity: {
      scale: 'Saffir-Simpson',
      value: 5,
      unit: 'Category',
      description: 'Super typhoon with extreme wind speeds'
    },
    
    status: 'Scenario',
    confidenceLevel: 'Medium',
    dataQuality: 'Medium',
    dataSource: 'Japan Meteorological Agency',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    hazardId: 'HAZ-00500005',
    hazardName: 'Mississippi River Flood 2024',
    hazardDescription: 'Spring flood scenario for Mississippi River basin',
    hazardType: 'Flood',
    hazardCategory: 'Natural',
    severity: 'Moderate',
    probability: 0.20,
    
    footprint: {
      centerLatitude: 38.6270,
      centerLongitude: -90.1994,
      radius: 400,
      unit: 'km',
      affectedArea: 502655,
      areaUnit: 'km2'
    },
    
    temporal: {
      startTime: new Date('2024-04-01T00:00:00Z'),
      endTime: new Date('2024-06-30T23:59:59Z'),
      duration: 91,
      durationUnit: 'days'
    },
    
    intensity: {
      scale: 'Custom',
      value: 4,
      unit: 'Scale',
      description: 'Moderate flooding with localized severe areas'
    },
    
    status: 'Scenario',
    confidenceLevel: 'High',
    dataQuality: 'High',
    dataSource: 'NOAA River Forecast Centers',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
];

/**
 * Sample Vulnerabilities Data - Schema Compliant
 */
const vulnerabilitiesData = [
  {
    vulnerabilityId: 'VUL-00100001',
    vulnerabilityName: 'Miami Coastal Infrastructure Vulnerability',
    vulnerabilityDescription: 'Assessment of coastal infrastructure vulnerability to hurricane storm surge and flooding',
    
    // Required geographic scope
    geographicScope: {
      centerLatitude: 25.7617,
      centerLongitude: -80.1918,
      radius: 50,
      radiusUnit: 'km',
      area: 7854,
      areaUnit: 'km2'
    },
    
    // Required scores
    overallVulnerabilityScore: 7.5,
    overallRiskLevel: 'High',
    confidenceLevel: 'High',
    
    // Vulnerability factors
    vulnerabilityFactors: [
      {
        factorType: 'Physical',
        factorName: 'Building Age',
        factorValue: 6.5,
        weight: 0.3,
        description: 'Average building age and structural resilience'
      },
      {
        factorType: 'Economic',
        factorName: 'Property Value Concentration',
        factorValue: 8.5,
        weight: 0.4,
        description: 'High concentration of valuable properties'
      },
      {
        factorType: 'Environmental',
        factorName: 'Elevation',
        factorValue: 7.0,
        weight: 0.3,
        description: 'Low elevation increases flood vulnerability'
      }
    ],
    
    // Linked hazards
    linkedHazards: [
      {
        hazardId: 'HAZ-00100001',
        hazardType: 'Hurricane',
        relationshipType: 'Primary'
      }
    ],
    
    status: 'Active',
    dataQuality: 'High',
    dataSource: 'FEMA Flood Maps, Local Building Records',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    vulnerabilityId: 'VUL-00200002',
    vulnerabilityName: 'San Francisco Seismic Vulnerability',
    vulnerabilityDescription: 'Earthquake vulnerability assessment for San Francisco Bay Area',
    
    geographicScope: {
      centerLatitude: 37.7749,
      centerLongitude: -122.4194,
      radius: 75,
      radiusUnit: 'km',
      area: 17671,
      areaUnit: 'km2'
    },
    
    overallVulnerabilityScore: 8.0,
    overallRiskLevel: 'Very High',
    confidenceLevel: 'High',
    
    vulnerabilityFactors: [
      {
        factorType: 'Physical',
        factorName: 'Soil Liquefaction Potential',
        factorValue: 8.5,
        weight: 0.4,
        description: 'High liquefaction risk in bay fill areas'
      },
      {
        factorType: 'Infrastructure',
        factorName: 'Bridge Vulnerability',
        factorValue: 7.5,
        weight: 0.3,
        description: 'Critical bridge infrastructure vulnerability'
      },
      {
        factorType: 'Social',
        factorName: 'Population Density',
        factorValue: 8.0,
        weight: 0.3,
        description: 'High population density increases casualty risk'
      }
    ],
    
    linkedHazards: [
      {
        hazardId: 'HAZ-00200002',
        hazardType: 'Earthquake',
        relationshipType: 'Primary'
      }
    ],
    
    status: 'Active',
    dataQuality: 'High',
    dataSource: 'USGS Seismic Hazard Maps, California Geological Survey',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    vulnerabilityId: 'VUL-00300003',
    vulnerabilityName: 'Tokyo Metro Typhoon Vulnerability',
    vulnerabilityDescription: 'Metropolitan Tokyo vulnerability to severe typhoons',
    
    geographicScope: {
      centerLatitude: 35.6762,
      centerLongitude: 139.6503,
      radius: 100,
      radiusUnit: 'km',
      area: 31416,
      areaUnit: 'km2'
    },
    
    overallVulnerabilityScore: 7.0,
    overallRiskLevel: 'High',
    confidenceLevel: 'Medium',
    
    vulnerabilityFactors: [
      {
        factorType: 'Economic',
        factorName: 'Economic Concentration',
        factorValue: 9.0,
        weight: 0.4,
        description: 'Extreme concentration of economic activity'
      },
      {
        factorType: 'Infrastructure',
        factorName: 'Subway System Vulnerability',
        factorValue: 6.5,
        weight: 0.3,
        description: 'Underground infrastructure flood risk'
      },
      {
        factorType: 'Physical',
        factorName: 'Building Resilience',
        factorValue: 5.0,
        weight: 0.3,
        description: 'Modern building codes provide good resilience'
      }
    ],
    
    linkedHazards: [
      {
        hazardId: 'HAZ-00400004',
        hazardType: 'Typhoon',
        relationshipType: 'Primary'
      }
    ],
    
    status: 'Active',
    dataQuality: 'Medium',
    dataSource: 'Japan Meteorological Agency, Tokyo Metropolitan Government',
    lastUpdated: new Date(),
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
];

/**
 * Sample Simulation Runs Data
 */
const simulationRunsData = [
  {
    simulationRunId: 'SIMRUN-20240301-001',
    simulationName: 'Hurricane Season 2024 - Gulf Coast Analysis',
    simulationDescription: 'Comprehensive simulation of 2024 hurricane season impacts on Gulf Coast properties',
    configuration: {
      startYear: 2024,
      endYear: 2024,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Hurricane'],
      geographicScope: {
        regions: ['North America'],
        countries: ['USA'],
        states: ['Florida', 'Louisiana', 'Texas']
      },
      exposureScope: {
        accountIds: ['ACC-001001', 'ACC-003003'],
        minExposureAmount: 1000000,
        currency: 'USD'
      },
      modelingConfig: {
        numberOfSimulations: 10000,
        modelProvider: 'RMS',
        modelType: 'Probabilistic',
        resolution: 'High',
        randomSeed: 12345
      }
    },
    status: 'Completed',
    progress: 100,
    currentStep: 'Completed successfully',
    startTime: new Date('2024-03-01T10:00:00Z'),
    endTime: new Date('2024-03-01T12:30:00Z'),
    results: {
      totalEvents: 10000,
      totalLoss: 450000000,
      averageLoss: 45000,
      maxLoss: 25000000,
      minLoss: 0,
      exceedanceProbabilities: {
        '100year': 15000000,
        '250year': 35000000,
        '500year': 55000000,
        '1000year': 85000000
      },
      affectedAccounts: ['ACC-001001', 'ACC-003003'],
      processingTime: 9000
    },
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    simulationRunId: 'SIMRUN-20240315-002',
    simulationName: 'California Earthquake Portfolio Analysis',
    simulationDescription: 'Multi-scenario earthquake analysis for California property portfolio',
    configuration: {
      startYear: 2024,
      endYear: 2024,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Earthquake'],
      geographicScope: {
        regions: ['North America'],
        countries: ['USA'],
        states: ['California']
      },
      exposureScope: {
        accountIds: ['ACC-004004'],
        minExposureAmount: 5000000,
        currency: 'USD'
      },
      modelingConfig: {
        numberOfSimulations: 50000,
        modelProvider: 'AIR',
        modelType: 'Probabilistic',
        resolution: 'High',
        randomSeed: 67890
      }
    },
    status: 'Completed',
    progress: 100,
    currentStep: 'Completed successfully',
    startTime: new Date('2024-03-15T08:00:00Z'),
    endTime: new Date('2024-03-15T14:30:00Z'),
    results: {
      totalEvents: 50000,
      totalLoss: 2500000000,
      averageLoss: 50000,
      maxLoss: 150000000,
      minLoss: 0,
      exceedanceProbabilities: {
        '100year': 75000000,
        '250year': 125000000,
        '500year': 200000000,
        '1000year': 350000000
      },
      affectedAccounts: ['ACC-004004'],
      processingTime: 23400
    },
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    simulationRunId: 'SIMRUN-20240320-003',
    simulationName: 'Multi-Peril North America Analysis',
    simulationDescription: 'Comprehensive multi-peril analysis including Hurricane, Earthquake, and Flood',
    configuration: {
      startYear: 2024,
      endYear: 2025,
      timeHorizon: 2,
      timeHorizonUnit: 'years',
      hazardTypes: ['Hurricane', 'Earthquake', 'Flood'],
      geographicScope: {
        regions: ['North America'],
        countries: ['USA']
      },
      exposureScope: {
        accountIds: ['ACC-001001', 'ACC-002002', 'ACC-003003', 'ACC-004004'],
        minExposureAmount: 500000,
        currency: 'USD'
      },
      modelingConfig: {
        numberOfSimulations: 100000,
        modelProvider: 'Multiple',
        modelType: 'Hybrid',
        resolution: 'High',
        randomSeed: 11111
      }
    },
    status: 'Running',
    progress: 65,
    currentStep: 'Processing correlation matrices for multi-peril dependencies',
    startTime: new Date('2024-03-20T06:00:00Z'),
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
];

/**
 * Database Connection Functions
 */
async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';
    console.log(`🔄 Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB successfully\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  try {
    await Account.deleteMany({});
    console.log('   ✓ Cleared accounts');
    
    await Hazard.deleteMany({});
    console.log('   ✓ Cleared hazards');
    
    await Vulnerability.deleteMany({});
    console.log('   ✓ Cleared vulnerabilities');
    
    await SimulationRun.deleteMany({});
    console.log('   ✓ Cleared simulation runs\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

async function seedAccounts() {
  console.log('👥 Seeding Accounts...');
  
  for (const accountData of accountsData) {
    try {
      await Account.create(accountData);
      console.log(`   ✓ Created account: ${accountData.accountName}`);
    } catch (error) {
      console.error(`   ❌ Error creating account ${accountData.accountId}:`, error.message);
    }
  }
  
  const count = await Account.countDocuments();
  console.log(`   📊 Total accounts created: ${count}\n`);
}

async function seedHazards() {
  console.log('🌪️  Seeding Hazards...');
  
  for (const hazardData of hazardsData) {
    try {
      await Hazard.create(hazardData);
      console.log(`   ✓ Created hazard: ${hazardData.hazardName}`);
    } catch (error) {
      console.error(`   ❌ Error creating hazard ${hazardData.hazardId}:`, error.message);
    }
  }
  
  const count = await Hazard.countDocuments();
  console.log(`   📊 Total hazards created: ${count}\n`);
}

async function seedVulnerabilities() {
  console.log('🏗️  Seeding Vulnerabilities...');
  
  for (const vulnData of vulnerabilitiesData) {
    try {
      await Vulnerability.create(vulnData);
      console.log(`   ✓ Created vulnerability: ${vulnData.vulnerabilityName}`);
    } catch (error) {
      console.error(`   ❌ Error creating vulnerability ${vulnData.vulnerabilityId}:`, error.message);
    }
  }
  
  const count = await Vulnerability.countDocuments();
  console.log(`   📊 Total vulnerabilities created: ${count}\n`);
}

async function seedSimulations() {
  console.log('🎲 Seeding Simulations...');
  
  for (const simData of simulationRunsData) {
    try {
      await SimulationRun.create(simData);
      console.log(`   ✓ Created simulation: ${simData.simulationName}`);
    } catch (error) {
      console.error(`   ❌ Error creating simulation ${simData.simulationRunId}:`, error.message);
    }
  }
  
  const count = await SimulationRun.countDocuments();
  console.log(`   📊 Total simulations created: ${count}\n`);
}

async function generateStatistics() {
  console.log('📈 Generating Statistics...');
  
  const accountCount = await Account.countDocuments();
  const hazardCount = await Hazard.countDocuments();
  const vulnerabilityCount = await Vulnerability.countDocuments();
  const simulationCount = await SimulationRun.countDocuments();
  
  const accounts = await Account.find({});
  const totalExposure = accounts.reduce((sum, acc) => sum + (acc.totalExposure || 0), 0);
  
  console.log(`   📊 Database Statistics:`);
  console.log(`   • Accounts: ${accountCount}`);
  console.log(`   • Hazards: ${hazardCount}`);
  console.log(`   • Vulnerabilities: ${vulnerabilityCount}`);
  console.log(`   • Simulations: ${simulationCount}`);
  console.log(`   • Total Exposure: $${totalExposure.toLocaleString()}\n`);
}

/**
 * Main Seeding Function
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');
    
    await connectDatabase();
    await clearDatabase();
    await seedAccounts();
    await seedHazards();
    await seedVulnerabilities();
    await seedSimulations();
    await generateStatistics();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✨ Your CAT Modeling Platform is now ready with comprehensive data!');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Start backend: npm run start:backend');
    console.log('   2. Start frontend: cd frontend && npm start');
    console.log('   3. Open: http://localhost:3000');
    console.log('');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting:', error.message);
    }
    process.exit(0);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

