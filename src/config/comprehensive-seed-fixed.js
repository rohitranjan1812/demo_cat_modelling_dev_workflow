/**
 * Comprehensive Seed Data for CAT Modeling Platform (Schema-Compliant Version)
 * Populates MongoDB with realistic hazards, vulnerabilities, accounts, and simulation data
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Account = require('../models/Account');
const Hazard = require('../models/Hazard');
const Vulnerability = require('../models/Vulnerability');
const SimulationRun = require('../models/SimulationRun');

console.log('🌱 CAT Modeling Platform - Comprehensive Data Seeding (Fixed)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Sample Accounts Data (Schema-Compliant)
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
  }
];

/**
 * Sample Hazards Data (Schema-Compliant)
 */
const hazardsData = [
  {
    hazardId: 'HAZ-00100001',
    hazardName: 'Hurricane Katrina Historical Analysis',
    hazardDescription: 'Historical analysis of Hurricane Katrina impact patterns and loss mechanisms',
    hazardType: 'Hurricane',
    hazardCategory: 'Natural',
    severity: 'Catastrophic',
    probability: 0.02,
    geographicFootprint: {
      centerLatitude: 29.951,
      centerLongitude: -90.0715,
      radius: 500,
      radiusUnit: 'km',
      affectedRegions: ['North America'],
      affectedCountries: ['USA'],
      affectedStatesProvinces: ['Louisiana', 'Mississippi', 'Alabama']
    },
    temporal: {
      startDate: new Date('2005-08-29'),
      endDate: new Date('2005-08-30'),
      duration: 1,
      durationUnit: 'days',
      season: 'Hurricane Season',
      peakTime: new Date('2005-08-29T12:00:00Z')
    },
    footprint: {
      impactRadius: 500,
      impactRadiusUnit: 'km',
      shape: 'Circular',
      area: 785398,
      areaUnit: 'km2'
    },
    intensityMetrics: {
      scale: 'Saffir-Simpson',
      value: 5,
      unit: 'Category',
      description: 'Category 5 hurricane with sustained winds over 157 mph',
      peakWindSpeed: 175,
      windSpeedUnit: 'mph',
      minimumPressure: 902,
      pressureUnit: 'mb'
    },
    economicImpact: {
      totalLoss: 125000000000,
      insuredLoss: 62500000000,
      currency: 'USD',
      impactTypes: ['Property Damage', 'Business Interruption', 'Infrastructure']
    },
    isHistorical: true,
    isActive: true,
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    hazardId: 'HAZ-00200002',
    hazardName: 'San Andreas Fault Major Earthquake',
    hazardDescription: 'Simulated major earthquake scenario on the San Andreas Fault system',
    hazardType: 'Earthquake',
    hazardCategory: 'Natural',
    severity: 'Major',
    probability: 0.05,
    geographicFootprint: {
      centerLatitude: 34.0522,
      centerLongitude: -118.2437,
      radius: 300,
      radiusUnit: 'km',
      affectedRegions: ['North America'],
      affectedCountries: ['USA'],
      affectedStatesProvinces: ['California']
    },
    temporal: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-01'),
      duration: 1,
      durationUnit: 'hours',
      season: 'Year Round',
      peakTime: new Date('2024-01-01T14:30:00Z')
    },
    footprint: {
      impactRadius: 300,
      impactRadiusUnit: 'km',
      shape: 'Elliptical',
      area: 282743,
      areaUnit: 'km2'
    },
    intensityMetrics: {
      scale: 'Richter',
      value: 7.8,
      unit: 'Magnitude',
      description: 'Major earthquake with significant ground shaking',
      peakGroundAcceleration: 0.8,
      accelerationUnit: 'g',
      focalDepth: 15,
      depthUnit: 'km'
    },
    economicImpact: {
      totalLoss: 200000000000,
      insuredLoss: 80000000000,
      currency: 'USD',
      impactTypes: ['Property Damage', 'Infrastructure', 'Business Interruption']
    },
    isHistorical: false,
    isActive: true,
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
];

/**
 * Sample Vulnerabilities Data (Schema-Compliant)
 */
const vulnerabilitiesData = [
  {
    vulnerabilityId: 'VUL-00100001',
    vulnerabilityName: 'Coastal Property Hurricane Vulnerability',
    vulnerabilityDescription: 'Comprehensive vulnerability assessment of coastal properties to hurricane damage',
    vulnerabilityType: 'Physical',
    vulnerabilityCategory: 'Regional',
    
    // Geographic scope
    geographicScope: {
      centerLatitude: 25.7617,
      centerLongitude: -80.1918,
      radius: 50,
      radiusUnit: 'km',
      area: 7854,
      areaUnit: 'km2',
      country: 'USA',
      region: 'North America',
      stateProvince: 'Florida',
      city: 'Miami',
      administrativeLevel: 'City'
    },
    
    // Vulnerability factors
    vulnerabilityFactors: [
      {
        factorType: 'Physical',
        factorName: 'Proximity to Coast',
        factorValue: 9.0,
        weight: 0.4,
        unit: 'score',
        description: 'Less than 1 mile from coastline',
        dataSource: 'GIS Analysis'
      },
      {
        factorType: 'Physical',
        factorName: 'Building Age',
        factorValue: 7.5,
        weight: 0.3,
        unit: 'score',
        description: 'Construction before modern hurricane codes',
        dataSource: 'Building Records'
      },
      {
        factorType: 'Physical',
        factorName: 'Construction Type',
        factorValue: 8.0,
        weight: 0.3,
        unit: 'score',
        description: 'Wood frame construction with limited reinforcement',
        dataSource: 'Site Survey'
      }
    ],
    
    // Overall scoring
    overallVulnerabilityScore: 8.5,
    overallRiskLevel: 'Very High',
    confidenceLevel: 'High',
    
    // Assessment details
    assessmentDate: new Date('2024-01-15'),
    assessmentPeriod: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    },
    assessmentFrequency: 'Annual',
    
    // Status
    status: 'Active',
    isValidated: true,
    lastValidationDate: new Date('2024-01-15'),
    
    // Metadata
    createdBy: 'system',
    lastModifiedBy: 'system',
    
    // Linked hazards
    linkedHazards: [{
      hazardId: 'HAZ-00100001',
      hazardType: 'Hurricane',
      linkStrength: 0.9,
      impactPotential: 'Very High'
    }],
    
    // Mitigation measures
    mitigationMeasures: [{
      measureName: 'Hurricane Shutters',
      measureType: 'Structural',
      effectiveness: 0.25,
      cost: 15000,
      currency: 'USD',
      implementationTime: 14, // days
      implementationComplexity: 'Medium',
      status: 'Recommended'
    }, {
      measureName: 'Roof Reinforcement',
      measureType: 'Structural',
      effectiveness: 0.35,
      cost: 25000,
      currency: 'USD',
      implementationTime: 30, // days
      implementationComplexity: 'High',
      status: 'Recommended'
    }]
  },
  {
    vulnerabilityId: 'VUL-00200002',
    vulnerabilityName: 'Seismic Building Vulnerability',
    vulnerabilityDescription: 'Structural vulnerability assessment for earthquake hazards',
    vulnerabilityType: 'Physical',
    vulnerabilityCategory: 'Community',
    
    // Geographic scope
    geographicScope: {
      centerLatitude: 37.7749,
      centerLongitude: -122.4194,
      radius: 25,
      radiusUnit: 'km',
      area: 1963,
      areaUnit: 'km2',
      country: 'USA',
      region: 'North America',
      stateProvince: 'California',
      city: 'San Francisco',
      administrativeLevel: 'City'
    },
    
    // Vulnerability factors
    vulnerabilityFactors: [
      {
        factorType: 'Physical',
        factorName: 'Soft Story Construction',
        factorValue: 8.5,
        weight: 0.5,
        unit: 'score',
        description: 'Building has soft story with large openings',
        dataSource: 'Structural Analysis'
      },
      {
        factorType: 'Environmental',
        factorName: 'Soil Type',
        factorValue: 6.0,
        weight: 0.3,
        unit: 'score',
        description: 'Built on landfill with potential liquefaction',
        dataSource: 'Geological Survey'
      },
      {
        factorType: 'Physical',
        factorName: 'Building Height',
        factorValue: 7.0,
        weight: 0.2,
        unit: 'score',
        description: 'Mid-rise building with resonance risk',
        dataSource: 'Building Plans'
      }
    ],
    
    // Overall scoring
    overallVulnerabilityScore: 7.2,
    overallRiskLevel: 'High',
    confidenceLevel: 'High',
    
    // Assessment details
    assessmentDate: new Date('2024-02-01'),
    assessmentPeriod: {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15')
    },
    assessmentFrequency: 'Biennial',
    
    // Status
    status: 'Active',
    isValidated: true,
    lastValidationDate: new Date('2024-02-01'),
    
    // Metadata
    createdBy: 'system',
    lastModifiedBy: 'system',
    
    // Linked hazards
    linkedHazards: [{
      hazardId: 'HAZ-00200002',
      hazardType: 'Earthquake',
      linkStrength: 0.95,
      impactPotential: 'Very High'
    }],
    
    // Mitigation measures
    mitigationMeasures: [{
      measureName: 'Seismic Retrofitting',
      measureType: 'Structural',
      effectiveness: 0.6,
      cost: 150000,
      currency: 'USD',
      implementationTime: 180, // days
      implementationComplexity: 'Very High',
      status: 'Under Consideration'
    }, {
      measureName: 'Base Isolation',
      measureType: 'Structural',
      effectiveness: 0.8,
      cost: 500000,
      currency: 'USD',
      implementationTime: 545, // days
      implementationComplexity: 'Very High',
      status: 'Future Planning'
    }]
  }
];

/**
 * Sample Simulation Runs Data (Schema-Compliant)
 */
const simulationRunsData = [
  {
    simulationRunId: 'SIMRUN-20240101-001234',
    simulationName: 'Hurricane Season 2024 - Gulf Coast Analysis',
    simulationDescription: 'Comprehensive hurricane risk analysis for Gulf Coast properties covering Category 1-5 scenarios',
    
    // Configuration
    configuration: {
      startYear: 2024,
      endYear: 2025, // End year must be after start year
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Hurricane'],
      geographicScope: {
        regions: ['North America'],
        countries: ['USA'],
        boundingBox: {
          northEast: { latitude: 30.0, longitude: -80.0 },
          southWest: { latitude: 24.0, longitude: -95.0 }
        }
      },
      exposureScope: {
        accountIds: ['ACC-001001', 'ACC-003003'],
        minExposureAmount: 1000000,
        currency: 'USD'
      },
      modelingConfig: {
        numberOfSimulations: 10000,
        modelProvider: 'AIR',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    },
    
    // Complete Results structure
    results: {
      // Event Statistics (all required)
      totalEvents: 12,
      completedEvents: 12,
      failedEvents: 0,
      
      // Exposure Statistics (all required)
      totalExposure: 65000000,
      averageExposure: 5416667,
      maxExposure: 15000000,
      minExposure: 1000000,
      
      // Loss Statistics (all required)
      totalLoss: 45000000,
      averageLoss: 3750000,
      medianLoss: 2800000,
      minLoss: 500000,
      maxLoss: 15000000,
      standardDeviation: 25000000,
      expectedLoss: 45000000,
      
      // Risk Metrics (all required)
      concentrationRisk: 0.35,
      diversificationBenefit: 0.15,
      correlationRisk: 0.25,
      
      // Percentile Values (all required)
      percentile90: 68000000,
      percentile95: 85000000,
      percentile99: 125000000,
      percentile999: 180000000,
      
      // Value at Risk (all required)
      valueAtRisk95: 85000000,
      valueAtRisk99: 125000000,
      tailValueAtRisk95: 110000000,
      tailValueAtRisk99: 156000000,
      
      // Return Period Losses (all required)
      returnPeriodLosses: {
        year10: 25000000,
        year50: 55000000,
        year100: 85000000,
        year250: 125000000,
        year500: 165000000
      },
      
      // Additional summary data
      eventSummary: {
        bySeverity: {
          Minor: 3,
          Moderate: 4,
          Major: 3,
          Severe: 1,
          Catastrophic: 1
        },
        byRegion: {
          'Gulf Coast': 8,
          'Atlantic Coast': 4
        }
      }
    },
    
    // Status and timing
    status: 'Completed',
    progress: 100,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T14:30:00Z'),
    duration: 270,
    durationUnit: 'minutes',
    
    // Metadata
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    simulationRunId: 'SIMRUN-20240301-009876',
    simulationName: 'Multi-Peril Portfolio Analysis - Q1 2024',
    simulationDescription: 'Comprehensive multi-peril analysis including Hurricane and Earthquake for diversified portfolio',
    
    // Configuration
    configuration: {
      startYear: 2024,
      endYear: 2025,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Hurricane', 'Earthquake'],
      geographicScope: {
        regions: ['North America'],
        countries: ['USA']
      },
      exposureScope: {
        accountIds: ['ACC-001001', 'ACC-003003'],
        minExposureAmount: 500000,
        currency: 'USD'
      },
      modelingConfig: {
        numberOfSimulations: 50000,
        modelProvider: 'Multiple',
        modelType: 'Hybrid',
        resolution: 'High'
      }
    },
    
    // Status - running simulation
    status: 'Running',
    progress: 75,
    currentStep: 'Calculating correlation matrices for multi-peril dependencies',
    startTime: new Date('2024-03-01T06:00:00Z'),
    
    // Metadata
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
];

/**
 * Database Connection and Seeding Functions
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
    
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  const collections = [
    Account,
    Hazard,
    Vulnerability,
    SimulationRun
  ];
  
  for (const Collection of collections) {
    await Collection.deleteMany({});
    console.log(`   ✓ Cleared ${Collection.collection.name}`);
  }
}

async function seedAccounts() {
  console.log('👥 Seeding Accounts...');
  
  for (const accountData of accountsData) {
    try {
      const account = new Account(accountData);
      await account.save();
      console.log(`   ✓ Created account: ${accountData.accountName}`);
    } catch (error) {
      console.error(`   ❌ Error creating account ${accountData.accountId}:`, error.message);
    }
  }
  
  console.log(`   📊 Total accounts created: ${accountsData.length}`);
}

async function seedHazards() {
  console.log('🌪️  Seeding Hazards...');
  
  for (const hazardData of hazardsData) {
    try {
      const hazard = new Hazard(hazardData);
      await hazard.save();
      console.log(`   ✓ Created hazard: ${hazardData.hazardName}`);
    } catch (error) {
      console.error(`   ❌ Error creating hazard ${hazardData.hazardId}:`, error.message);
    }
  }
  
  console.log(`   📊 Total hazards created: ${hazardsData.length}`);
}

async function seedVulnerabilities() {
  console.log('🏗️  Seeding Vulnerabilities...');
  
  for (const vulnData of vulnerabilitiesData) {
    try {
      const vulnerability = new Vulnerability(vulnData);
      await vulnerability.save();
      console.log(`   ✓ Created vulnerability: ${vulnData.vulnerabilityName}`);
    } catch (error) {
      console.error(`   ❌ Error creating vulnerability ${vulnData.vulnerabilityId}:`, error.message);
    }
  }
  
  console.log(`   📊 Total vulnerabilities created: ${vulnerabilitiesData.length}`);
}

async function seedSimulations() {
  console.log('🎲 Seeding Simulations...');
  
  for (const simData of simulationRunsData) {
    try {
      const simulation = new SimulationRun(simData);
      await simulation.save();
      console.log(`   ✓ Created simulation: ${simData.simulationName}`);
    } catch (error) {
      console.error(`   ❌ Error creating simulation ${simData.simulationRunId}:`, error.message);
    }
  }
  
  console.log(`   📊 Total simulations created: ${simulationRunsData.length}`);
}

async function generateStatistics() {
  console.log('📈 Generating Statistics...');
  
  const accounts = await Account.countDocuments();
  const hazards = await Hazard.countDocuments();
  const vulnerabilities = await Vulnerability.countDocuments();
  const simulations = await SimulationRun.countDocuments();
  
  const totalExposure = await Account.aggregate([
    { $group: { _id: null, total: { $sum: '$totalExposure' } } }
  ]);
  
  const exposure = totalExposure[0]?.total || 0;
  
  console.log('   📊 Database Statistics:');
  console.log(`   • Accounts: ${accounts}`);
  console.log(`   • Hazards: ${hazards}`);
  console.log(`   • Vulnerabilities: ${vulnerabilities}`);
  console.log(`   • Simulations: ${simulations}`);
  console.log(`   • Total Exposure: $${exposure.toLocaleString()}`);
}

/**
 * Main Seeding Function
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');
    
    await connectDatabase();
    console.log();
    
    await clearDatabase();
    console.log();
    
    await seedAccounts();
    console.log();
    
    await seedHazards();
    console.log();
    
    await seedVulnerabilities();
    console.log();
    
    await seedSimulations();
    console.log();
    
    await generateStatistics();
    console.log();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✨ Your CAT Modeling Platform is now ready with comprehensive data!');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Update .env: Set USE_MOCK_DB=false');
    console.log('   2. Start backend: npm run start:backend');
    console.log('   3. Start frontend: npm run start:frontend');
    console.log('   4. Open: http://localhost:3000');
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

module.exports = {
  seedDatabase,
  accountsData,
  hazardsData,
  vulnerabilitiesData,
  simulationRunsData
};

