/**
 * Comprehensive Seed Data for CAT Modeling Platform
 * Populates MongoDB with realistic hazards, vulnerabilities, accounts, and simulation data
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Account = require('../models/Account');
const Hazard = require('../models/Hazard');
const HazardEvent = require('../models/HazardEvent');
const HazardZone = require('../models/HazardZone');
const HazardScenario = require('../models/HazardScenario');
const Vulnerability = require('../models/Vulnerability');
const SimulationRun = require('../models/SimulationRun');
const SimulationEvent = require('../models/SimulationEvent');

console.log('🌱 CAT Modeling Platform - Comprehensive Data Seeding');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Sample Accounts Data
 */
const accountsData = [
  {
    accountId: 'ACC-001',
    accountName: 'Global Insurance Corp - Primary',
    accountType: 'Primary',
    totalExposure: 50000000,
    currency: 'USD',
    regions: ['North America', 'Europe'],
    riskProfile: 'High',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    createdBy: 'system',
    lastModifiedBy: 'system',
    metadata: new Map([
      ['industry', 'Property & Casualty'],
      ['clientType', 'Corporate'],
      ['establishedYear', '1995']
    ])
  },
  {
    accountId: 'ACC-002',
    accountName: 'Regional Reinsurance Ltd',
    accountType: 'Reinsurance',
    parentAccountId: 'ACC-001',
    accountLevel: 2,
    totalExposure: 25000000,
    currency: 'USD',
    regions: ['North America'],
    riskProfile: 'Medium',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    createdBy: 'system',
    lastModifiedBy: 'system',
    metadata: new Map([
      ['industry', 'Reinsurance'],
      ['clientType', 'Corporate'],
      ['parentAccount', 'ACC-001']
    ])
  },
  {
    accountId: 'ACC-003',
    accountName: 'Florida Property Insurance',
    accountType: 'Primary',
    totalExposure: 15000000,
    currency: 'USD',
    regions: ['North America'],
    riskProfile: 'Very High',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    createdBy: 'system',
    lastModifiedBy: 'system',
    metadata: new Map([
      ['industry', 'Property Insurance'],
      ['clientType', 'Regional'],
      ['specialization', 'Hurricane Risk']
    ])
  },
  {
    accountId: 'ACC-004',
    accountName: 'California Earthquake Mutual',
    accountType: 'Mutual',
    totalExposure: 75000000,
    currency: 'USD',
    regions: ['North America'],
    riskProfile: 'Extreme',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    createdBy: 'system',
    lastModifiedBy: 'system',
    metadata: new Map([
      ['industry', 'Earthquake Insurance'],
      ['clientType', 'Mutual'],
      ['specialization', 'Seismic Risk']
    ])
  },
  {
    accountId: 'ACC-005',
    accountName: 'European Storm Insurance',
    accountType: 'Primary',
    totalExposure: 35000000,
    currency: 'EUR',
    regions: ['Europe'],
    riskProfile: 'High',
    status: 'Active',
    effectiveDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    createdBy: 'system',
    lastModifiedBy: 'system',
    metadata: new Map([
      ['industry', 'Storm Insurance'],
      ['clientType', 'Regional'],
      ['specialization', 'Windstorm Risk']
    ])
  }
];

/**
 * Sample Hazards Data
 */
const hazardsData = [
  {
    hazardId: 'HAZ-001',
    hazardName: 'Hurricane Katrina Historical Analysis',
    hazardType: 'Hurricane',
    hazardCategory: 'Natural',
    severity: 'Catastrophic',
    probability: 0.02,
    impactRadius: 500,
    peakIntensity: {
      scale: 'Saffir-Simpson',
      value: 5,
      unit: 'Category',
      description: 'Category 5 hurricane with sustained winds over 157 mph'
    },
    geographicFootprint: {
      centerLatitude: 29.951,
      centerLongitude: -90.0715,
      radius: 500,
      radiusUnit: 'km',
      affectedStates: ['Louisiana', 'Mississippi', 'Alabama'],
      shape: 'Circular'
    },
    affectedRegions: ['North America'],
    affectedCountries: ['USA'],
    economicImpact: {
      totalLoss: 125000000000,
      insuredLoss: 62500000000,
      currency: 'USD',
      impactTypes: ['Property Damage', 'Business Interruption', 'Infrastructure']
    },
    isHistorical: true,
    isSimulated: false,
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system',
    dataSources: [{
      sourceType: 'Historical Data',
      sourceName: 'NOAA Hurricane Database',
      reliability: 'Very High',
      lastUpdated: new Date('2024-01-01')
    }]
  },
  {
    hazardId: 'HAZ-002',
    hazardName: 'San Andreas Fault Major Earthquake',
    hazardType: 'Earthquake',
    hazardCategory: 'Natural',
    severity: 'Major',
    probability: 0.05,
    impactRadius: 300,
    peakIntensity: {
      scale: 'Richter',
      value: 7.8,
      unit: 'Magnitude',
      description: 'Major earthquake with significant ground shaking'
    },
    geographicFootprint: {
      centerLatitude: 34.0522,
      centerLongitude: -118.2437,
      radius: 300,
      radiusUnit: 'km',
      affectedStates: ['California'],
      shape: 'Elliptical'
    },
    affectedRegions: ['North America'],
    affectedCountries: ['USA'],
    economicImpact: {
      totalLoss: 200000000000,
      insuredLoss: 80000000000,
      currency: 'USD',
      impactTypes: ['Property Damage', 'Infrastructure', 'Business Interruption']
    },
    isHistorical: false,
    isSimulated: true,
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system',
    dataSources: [{
      sourceType: 'Model Output',
      sourceName: 'USGS Seismic Hazard Model',
      reliability: 'High',
      lastUpdated: new Date('2024-01-01')
    }]
  },
  {
    hazardId: 'HAZ-003',
    hazardName: 'European Windstorm Klaus',
    hazardType: 'Wind',
    hazardCategory: 'Natural',
    severity: 'Major',
    probability: 0.08,
    impactRadius: 400,
    peakIntensity: {
      scale: 'Beaufort',
      value: 11,
      unit: 'Scale',
      description: 'Violent storm with winds 103-117 km/h'
    },
    geographicFootprint: {
      centerLatitude: 46.2276,
      centerLongitude: 2.2137,
      radius: 400,
      radiusUnit: 'km',
      affectedStates: ['Multiple European Countries'],
      shape: 'Irregular'
    },
    affectedRegions: ['Europe'],
    affectedCountries: ['France', 'Germany', 'Switzerland', 'Austria'],
    economicImpact: {
      totalLoss: 8000000000,
      insuredLoss: 4000000000,
      currency: 'EUR',
      impactTypes: ['Property Damage', 'Forest Damage', 'Infrastructure']
    },
    isHistorical: true,
    isSimulated: false,
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system',
    dataSources: [{
      sourceType: 'Historical Data',
      sourceName: 'European Weather Database',
      reliability: 'High',
      lastUpdated: new Date('2024-01-01')
    }]
  },
  {
    hazardId: 'HAZ-004',
    hazardName: 'Pacific Northwest Wildfire Complex',
    hazardType: 'Wildfire',
    hazardCategory: 'Natural',
    severity: 'Severe',
    probability: 0.15,
    impactRadius: 150,
    peakIntensity: {
      scale: 'Custom',
      value: 8,
      unit: 'Intensity',
      description: 'High-intensity wildfire with rapid spread'
    },
    geographicFootprint: {
      centerLatitude: 45.5152,
      centerLongitude: -122.6784,
      radius: 150,
      radiusUnit: 'km',
      affectedStates: ['Oregon', 'Washington'],
      shape: 'Irregular'
    },
    affectedRegions: ['North America'],
    affectedCountries: ['USA'],
    economicImpact: {
      totalLoss: 5000000000,
      insuredLoss: 2500000000,
      currency: 'USD',
      impactTypes: ['Property Damage', 'Environmental', 'Business Interruption']
    },
    isHistorical: false,
    isSimulated: true,
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system',
    dataSources: [{
      sourceType: 'Satellite',
      sourceName: 'NASA Fire Detection System',
      reliability: 'High',
      lastUpdated: new Date('2024-01-01')
    }]
  },
  {
    hazardId: 'HAZ-005',
    hazardName: 'Midwest Tornado Outbreak',
    hazardType: 'Tornado',
    hazardCategory: 'Natural',
    severity: 'Major',
    probability: 0.12,
    impactRadius: 200,
    peakIntensity: {
      scale: 'Enhanced Fujita',
      value: 4,
      unit: 'Scale',
      description: 'EF4 tornado with winds 166-200 mph'
    },
    geographicFootprint: {
      centerLatitude: 39.8283,
      centerLongitude: -98.5795,
      radius: 200,
      radiusUnit: 'km',
      affectedStates: ['Kansas', 'Oklahoma', 'Nebraska'],
      shape: 'Linear'
    },
    affectedRegions: ['North America'],
    affectedCountries: ['USA'],
    economicImpact: {
      totalLoss: 3000000000,
      insuredLoss: 1800000000,
      currency: 'USD',
      impactTypes: ['Property Damage', 'Agricultural', 'Infrastructure']
    },
    isHistorical: false,
    isSimulated: true,
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system',
    dataSources: [{
      sourceType: 'Model Output',
      sourceName: 'NOAA Storm Prediction Center',
      reliability: 'High',
      lastUpdated: new Date('2024-01-01')
    }]
  }
];

/**
 * Sample Vulnerabilities Data
 */
const vulnerabilitiesData = [
  {
    vulnerabilityId: 'VUL-001',
    vulnerabilityName: 'Coastal Property Hurricane Vulnerability',
    vulnerabilityType: 'Physical',
    hazardType: 'Hurricane',
    location: {
      latitude: 25.7617,
      longitude: -80.1918,
      address: 'Miami, FL, USA'
    },
    vulnerabilityScore: 8.5,
    riskFactors: [
      {
        factor: 'Proximity to Coast',
        weight: 0.4,
        score: 9.0,
        description: 'Less than 1 mile from coastline'
      },
      {
        factor: 'Building Age',
        weight: 0.3,
        score: 7.5,
        description: 'Construction before modern hurricane codes'
      },
      {
        factor: 'Construction Type',
        weight: 0.3,
        score: 8.0,
        description: 'Wood frame construction with limited reinforcement'
      }
    ],
    mitigationMeasures: [
      {
        measure: 'Hurricane Shutters',
        effectiveness: 0.25,
        cost: 15000,
        implementationTime: '2 weeks'
      },
      {
        measure: 'Roof Reinforcement',
        effectiveness: 0.35,
        cost: 25000,
        implementationTime: '1 month'
      }
    ],
    assessmentDate: new Date('2024-01-15'),
    assessor: 'hurricane-specialist',
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    vulnerabilityId: 'VUL-002',
    vulnerabilityName: 'Seismic Building Vulnerability',
    vulnerabilityType: 'Structural',
    hazardType: 'Earthquake',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco, CA, USA'
    },
    vulnerabilityScore: 7.2,
    riskFactors: [
      {
        factor: 'Soft Story Construction',
        weight: 0.5,
        score: 8.5,
        description: 'Building has soft story with large openings'
      },
      {
        factor: 'Soil Type',
        weight: 0.3,
        score: 6.0,
        description: 'Built on landfill with potential liquefaction'
      },
      {
        factor: 'Building Height',
        weight: 0.2,
        score: 7.0,
        description: 'Mid-rise building with resonance risk'
      }
    ],
    mitigationMeasures: [
      {
        measure: 'Seismic Retrofitting',
        effectiveness: 0.6,
        cost: 150000,
        implementationTime: '6 months'
      },
      {
        measure: 'Base Isolation',
        effectiveness: 0.8,
        cost: 500000,
        implementationTime: '18 months'
      }
    ],
    assessmentDate: new Date('2024-02-01'),
    assessor: 'seismic-engineer',
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    vulnerabilityId: 'VUL-003',
    vulnerabilityName: 'Wildfire Interface Vulnerability',
    vulnerabilityType: 'Environmental',
    hazardType: 'Wildfire',
    location: {
      latitude: 34.2681,
      longitude: -118.7817,
      address: 'Malibu, CA, USA'
    },
    vulnerabilityScore: 9.1,
    riskFactors: [
      {
        factor: 'Vegetation Density',
        weight: 0.4,
        score: 9.5,
        description: 'Dense chaparral and eucalyptus surrounding property'
      },
      {
        factor: 'Slope Gradient',
        weight: 0.3,
        score: 8.5,
        description: 'Steep terrain accelerating fire spread'
      },
      {
        factor: 'Access Roads',
        weight: 0.3,
        score: 9.0,
        description: 'Limited evacuation routes and fire access'
      }
    ],
    mitigationMeasures: [
      {
        measure: 'Defensible Space',
        effectiveness: 0.4,
        cost: 25000,
        implementationTime: '3 months'
      },
      {
        measure: 'Fire-Resistant Landscaping',
        effectiveness: 0.3,
        cost: 40000,
        implementationTime: '6 months'
      }
    ],
    assessmentDate: new Date('2024-02-15'),
    assessor: 'fire-safety-expert',
    status: 'Active',
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
];

/**
 * Sample Simulation Runs Data
 */
const simulationRunsData = [
  {
    simulationRunId: 'SIMRUN-20240101-001234',
    simulationName: 'Hurricane Season 2024 - Gulf Coast Analysis',
    simulationDescription: 'Comprehensive hurricane risk analysis for Gulf Coast properties covering Category 1-5 scenarios',
    configuration: {
      startYear: 2024,
      endYear: 2024,
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
        accountIds: ['ACC-001', 'ACC-003'],
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
    results: {
      summary: {
        totalEvents: 12,
        totalLoss: 45000000,
        maxSingleLoss: 15000000,
        avgLossPerEvent: 3750000
      },
      lossMetrics: {
        expectedLoss: 45000000,
        standardDeviation: 25000000,
        valueAtRisk95: 85000000,
        tailValueAtRisk95: 110000000
      },
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
    status: 'Completed',
    progress: 100,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T14:30:00Z'),
    duration: 270,
    durationUnit: 'minutes',
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    simulationRunId: 'SIMRUN-20240215-005678',
    simulationName: 'California Earthquake Portfolio Analysis',
    simulationDescription: 'Seismic risk assessment for California real estate portfolio including liquefaction analysis',
    configuration: {
      startYear: 2024,
      endYear: 2024,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Earthquake'],
      geographicScope: {
        regions: ['North America'],
        countries: ['USA'],
        boundingBox: {
          northEast: { latitude: 42.0, longitude: -114.0 },
          southWest: { latitude: 32.0, longitude: -124.0 }
        }
      },
      exposureScope: {
        accountIds: ['ACC-004'],
        minExposureAmount: 5000000,
        currency: 'USD'
      },
      modelingConfig: {
        numberOfSimulations: 25000,
        modelProvider: 'RMS',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    },
    results: {
      summary: {
        totalEvents: 8,
        totalLoss: 125000000,
        maxSingleLoss: 75000000,
        avgLossPerEvent: 15625000
      },
      lossMetrics: {
        expectedLoss: 125000000,
        standardDeviation: 60000000,
        valueAtRisk95: 200000000,
        tailValueAtRisk95: 280000000
      },
      eventSummary: {
        bySeverity: {
          Moderate: 2,
          Major: 3,
          Severe: 2,
          Catastrophic: 1
        },
        byRegion: {
          'Bay Area': 4,
          'Los Angeles': 3,
          'Central Valley': 1
        }
      }
    },
    status: 'Completed',
    progress: 100,
    startTime: new Date('2024-02-15T08:00:00Z'),
    endTime: new Date('2024-02-15T16:45:00Z'),
    duration: 525,
    durationUnit: 'minutes',
    createdBy: 'system',
    lastModifiedBy: 'system'
  },
  {
    simulationRunId: 'SIMRUN-20240301-009876',
    simulationName: 'Multi-Peril Portfolio Analysis - Q1 2024',
    simulationDescription: 'Comprehensive multi-peril analysis including Hurricane, Earthquake, and Wildfire for diversified portfolio',
    configuration: {
      startYear: 2024,
      endYear: 2024,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Hurricane', 'Earthquake', 'Wildfire'],
      geographicScope: {
        regions: ['North America'],
        countries: ['USA']
      },
      exposureScope: {
        accountIds: ['ACC-001', 'ACC-003', 'ACC-004'],
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
    status: 'Running',
    progress: 75,
    currentStep: 'Calculating correlation matrices for multi-peril dependencies',
    startTime: new Date('2024-03-01T06:00:00Z'),
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
    HazardEvent,
    HazardZone,
    HazardScenario,
    Vulnerability,
    SimulationRun,
    SimulationEvent
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

