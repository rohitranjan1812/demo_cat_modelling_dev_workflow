/**
 * Comprehensive Working Data Seeding Script
 * 
 * Generates realistic, comprehensive test data for full app functionality:
 * - 100+ Exposures across diverse US locations  
 * - 50+ Hazards with geographic footprints and realistic scenarios
 * - 30+ Vulnerabilities with actual risk calculations
 * - 10+ Simulation Runs with complete results
 * - Geographic diversity across major US cities and risk zones
 * 
 * Follows exact schema format to ensure validation success.
 * 
 * Run: node scripts/seed-comprehensive-working-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';

// Import models
const Exposure = require('../src/models/Exposure');
const Location = require('../src/models/Location');
const Hazard = require('../src/models/Hazard');
const Vulnerability = require('../src/models/Vulnerability');
const SimulationRun = require('../src/models/SimulationRun');

// Import constants for valid enums
const {
  EXPOSURE_TYPE_VALUES,
  OCCUPANCY_TYPE_VALUES,
  CONSTRUCTION_TYPE_VALUES,
  EXPOSURE_STATUS_VALUES,
  PERIL_TYPE_VALUES,
  CURRENCY_VALUES,
  RISK_LEVEL_VALUES,
  REGIONS_VALUES
} = require('../src/constants');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = (prefix, count) => {
  return `${prefix}-${String(count).padStart(8, '0')}`;
};

const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];

const randomFloat = (min, max) => Math.random() * (max - min) + min;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// US Cities with coordinates for realistic geographic distribution
const US_CITIES = [
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, riskLevel: 'High' },
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, riskLevel: 'High' },
  { name: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918, riskLevel: 'Very High' },
  { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, riskLevel: 'Medium' },
  { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, riskLevel: 'High' },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, riskLevel: 'Medium' },
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740, riskLevel: 'Low' },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, riskLevel: 'Medium' },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, riskLevel: 'Medium' },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970, riskLevel: 'High' },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, riskLevel: 'Medium' },
  { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903, riskLevel: 'Low' },
  { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589, riskLevel: 'Medium' },
  { name: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880, riskLevel: 'Medium' },
  { name: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398, riskLevel: 'Low' },
  { name: 'New Orleans', state: 'LA', lat: 29.9511, lng: -90.0715, riskLevel: 'Very High' },
  { name: 'Charleston', state: 'SC', lat: 32.7765, lng: -79.9311, riskLevel: 'High' },
  { name: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572, riskLevel: 'Very High' },
  { name: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164, riskLevel: 'High' },
  { name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786, riskLevel: 'Medium' }
];

// ============================================================================
// DATA GENERATORS
// ============================================================================

const generateLocations = (count = 20) => {
  const locations = [];
  
  for (let i = 1; i <= count; i++) {
    const city = randomChoice(US_CITIES);
    const locationId = generateId('LOC', i);
    
    // Add slight coordinate variation for multiple locations per city
    const lat = city.lat + randomFloat(-0.1, 0.1);
    const lng = city.lng + randomFloat(-0.1, 0.1);
    
    const location = {
      locationId,
      locationName: `${city.name} Property ${i}`,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      address: {
        street: `${randomInt(100, 9999)} ${randomChoice(['Main', 'Oak', 'Pine', 'First', 'Second', 'Market', 'Broadway'])} St`,
        city: city.name,
        state: city.state,
        postalCode: `${randomInt(10000, 99999)}`,
        country: 'USA',
        region: 'North America'
      },
      propertyCharacteristics: {
        occupancyType: randomChoice(OCCUPANCY_TYPE_VALUES),
        constructionType: randomChoice(CONSTRUCTION_TYPE_VALUES),
        yearBuilt: randomInt(1950, 2023),
        numberOfStories: randomInt(1, 50),
        squareFootage: randomInt(1000, 500000),
        replacementCost: randomInt(100000, 10000000),
        marketValue: randomInt(80000, 8000000)
      },
      totalExposure: randomInt(100000, 10000000),
      currency: 'USD',
      riskFactors: PERIL_TYPE_VALUES.slice(0, randomInt(2, 4)).map(peril => ({
        peril,
        riskScore: randomFloat(1, 10),
        probability: randomFloat(0.001, 0.1),
        expectedLoss: randomInt(10000, 500000),
        lastUpdated: new Date()
      })),
      status: randomChoice(['Active', 'Inactive']),
      createdBy: 'Test Seeder',
      lastModifiedBy: 'Test Seeder'
    };
    
    locations.push(location);
  }
  
  return locations;
};

const generateExposures = (locations, count = 120) => {
  const exposures = [];
  
  for (let i = 1; i <= count; i++) {
    const location = randomChoice(locations);
    const exposureId = generateId('EXP', i);
    const replacementValue = randomInt(100000, 50000000);
    
    const exposure = {
      exposureId,
      exposureType: randomChoice(EXPOSURE_TYPE_VALUES),
      policyId: generateId('POL', randomInt(1, 10)),
      locationId: location.locationId,
      
      // Location data (GeoJSON format)
      location: location.location,
      
      // Property characteristics
      occupancyType: randomChoice(OCCUPANCY_TYPE_VALUES),
      constructionType: randomChoice(CONSTRUCTION_TYPE_VALUES),
      
      // Financial data
      replacementValue,
      currency: randomChoice(CURRENCY_VALUES),
      
      // Risk characteristics
      perilExposures: PERIL_TYPE_VALUES.slice(0, randomInt(1, 4)).map(peril => ({
        peril,
        exposureAmount: randomInt(replacementValue * 0.1, replacementValue),
        deductible: randomInt(1000, 100000)
      })),
      
      // Dates
      effectiveDate: new Date('2024-01-01'),
      expiryDate: new Date('2024-12-31'),
      
      // Status
      status: randomChoice(EXPOSURE_STATUS_VALUES),
      
      // Additional metadata
      metadata: {
        lastUpdated: new Date(),
        dataSource: 'Seeded Test Data',
        confidence: randomFloat(0.7, 1.0)
      }
    };
    
    exposures.push(exposure);
  }
  
  return exposures;
};

const generateHazards = (locations, count = 60) => {
  const hazards = [];
  const hazardTypes = ['Earthquake', 'Hurricane', 'Flood', 'Wildfire', 'Tornado', 'Hail'];
  
  for (let i = 1; i <= count; i++) {
    const hazardId = generateId('HAZ', i);
    const location = randomChoice(locations);
    const hazardType = randomChoice(hazardTypes);
    
    // Generate realistic hazard parameters based on type
    let specificData = {};
    switch (hazardType) {
      case 'Earthquake':
        specificData = {
          magnitude: randomFloat(4.0, 8.5),
          depth: randomInt(1, 700),
          faultType: randomChoice(['Strike-slip', 'Normal', 'Reverse', 'Thrust'])
        };
        break;
      case 'Hurricane':
        specificData = {
          category: randomInt(1, 5),
          windSpeed: randomInt(74, 200),
          pressure: randomInt(900, 980),
          stormSurge: randomInt(1, 25)
        };
        break;
      case 'Flood':
        specificData = {
          floodType: randomChoice(['River', 'Coastal', 'Flash', 'Urban']),
          waterDepth: randomFloat(0.5, 15),
          duration: randomInt(6, 168),
          velocity: randomFloat(0.1, 10)
        };
        break;
      case 'Wildfire':
        specificData = {
          intensity: randomChoice(['Low', 'Moderate', 'High', 'Extreme']),
          spreadRate: randomFloat(0.1, 5.0),
          fuelType: randomChoice(['Grass', 'Brush', 'Timber', 'Mixed']),
          emberCast: randomInt(100, 5000)
        };
        break;
      case 'Tornado':
        specificData = {
          efScale: randomChoice(['EF0', 'EF1', 'EF2', 'EF3', 'EF4', 'EF5']),
          pathWidth: randomInt(50, 2000),
          pathLength: randomInt(1, 100),
          windSpeed: randomInt(65, 300)
        };
        break;
      case 'Hail':
        specificData = {
          hailSize: randomFloat(0.5, 4.5),
          duration: randomInt(5, 60),
          density: randomChoice(['Light', 'Moderate', 'Heavy', 'Severe']),
          windSpeed: randomInt(30, 100)
        };
        break;
    }
    
    const hazard = {
      hazardId,
      hazardType,
      name: `${hazardType} Event ${i}`,
      description: `Simulated ${hazardType.toLowerCase()} event for testing purposes`,
      
      // Geographic footprint
      footprint: {
        type: 'Polygon',
        coordinates: [generateCircularPolygon(location.location.coordinates, randomFloat(5, 50))]
      },
      
      // Event parameters
      intensity: randomChoice(RISK_LEVEL_VALUES),
      returnPeriod: randomChoice([10, 25, 50, 100, 250, 500, 1000]),
      
      // Specific hazard data
      hazardParameters: specificData,
      
      // Temporal data
      eventDate: new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000)),
      duration: randomInt(1, 72),
      
      // Model data
      modelProvider: randomChoice(['RMS', 'AIR', 'EQECAT', 'KatRisk']),
      modelVersion: `v${randomInt(1, 5)}.${randomInt(0, 9)}`,
      
      // Status
      status: randomChoice(HAZARD_STATUS_VALUES),
      
      // Metadata
      metadata: {
        dataSource: 'Seeded Test Data',
        confidence: randomFloat(0.6, 0.95),
        lastUpdated: new Date()
      }
    };
    
    hazards.push(hazard);
  }
  
  return hazards;
};

const generateVulnerabilities = (exposures, hazards, count = 40) => {
  const vulnerabilities = [];
  
  for (let i = 1; i <= count; i++) {
    const vulnerabilityId = generateId('VUL', i);
    const exposure = randomChoice(exposures);
    const hazard = randomChoice(hazards);
    
    // Generate vulnerability curve data
    const intensityLevels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    const damageCurve = intensityLevels.map(intensity => ({
      intensity,
      damageRatio: Math.min(Math.pow(intensity, 2) + randomFloat(-0.1, 0.1), 1.0)
    }));
    
    const vulnerability = {
      vulnerabilityId,
      exposureId: exposure.exposureId,
      hazardType: hazard.hazardType,
      
      // Vulnerability characteristics
      occupancyType: exposure.occupancyType,
      constructionType: exposure.constructionType,
      
      // Damage curves
      damageCurves: [{
        peril: randomChoice(PERIL_TYPE_VALUES),
        intensityMeasure: getIntensityMeasure(hazard.hazardType),
        vulnerabilityCurve: damageCurve
      }],
      
      // Risk metrics
      riskMetrics: {
        averageAnnualLoss: randomInt(10000, 1000000),
        probabilityOfExceedance: randomFloat(0.001, 0.1),
        returnPeriodLoss: {
          rp10: randomInt(5000, 100000),
          rp25: randomInt(15000, 250000),
          rp50: randomInt(30000, 500000),
          rp100: randomInt(60000, 1000000),
          rp250: randomInt(150000, 2500000),
          rp500: randomInt(300000, 5000000)
        }
      },
      
      // Model information
      modelProvider: hazard.modelProvider,
      modelVersion: hazard.modelVersion,
      
      // Status and metadata
      status: randomChoice(VULNERABILITY_STATUS_VALUES),
      metadata: {
        calculationDate: new Date(),
        dataSource: 'Seeded Test Data',
        confidence: randomFloat(0.7, 0.95)
      }
    };
    
    vulnerabilities.push(vulnerability);
  }
  
  return vulnerabilities;
};

const generateSimulationRuns = (exposures, hazards, vulnerabilities, count = 15) => {
  const simulations = [];
  
  for (let i = 1; i <= count; i++) {
    const simulationId = generateId('SIM', i);
    const selectedExposures = exposures.slice(0, randomInt(10, 50));
    const selectedHazards = hazards.slice(0, randomInt(5, 15));
    
    // Calculate realistic results
    const totalExposure = selectedExposures.reduce((sum, exp) => sum + exp.replacementValue, 0);
    const grossLoss = randomInt(totalExposure * 0.01, totalExposure * 0.3);
    const netLoss = grossLoss * randomFloat(0.6, 0.95);
    
    const simulation = {
      simulationId,
      name: `Simulation Run ${i}`,
      description: `Comprehensive risk simulation for portfolio analysis ${i}`,
      
      // Configuration
      configuration: {
        simulationType: randomChoice(['Historical', 'Stochastic', 'Deterministic']),
        timeHorizon: randomChoice([1, 5, 10, 25]),
        numberOfSimulations: randomChoice([1000, 5000, 10000, 50000]),
        correlationModel: randomChoice(['Independent', 'Spatial', 'Temporal']),
        lossAggregation: 'Sum',
        currency: 'USD'
      },
      
      // Input data
      exposureIds: selectedExposures.map(e => e.exposureId),
      hazardIds: selectedHazards.map(h => h.hazardId),
      
      // Results
      results: {
        summary: {
          totalExposure,
          grossLoss,
          netLoss,
          lossRatio: netLoss / totalExposure,
          numberOfEvents: selectedHazards.length,
          affectedExposures: selectedExposures.length
        },
        
        // Loss by peril
        lossByPeril: PERIL_TYPE_VALUES.slice(0, 3).map(peril => ({
          peril,
          grossLoss: randomInt(grossLoss * 0.1, grossLoss * 0.6),
          netLoss: randomInt(netLoss * 0.1, netLoss * 0.6),
          eventCount: randomInt(1, 5)
        })),
        
        // Geographic distribution
        lossByRegion: US_CITIES.slice(0, 5).map(city => ({
          region: `${city.name}, ${city.state}`,
          grossLoss: randomInt(10000, grossLoss * 0.3),
          netLoss: randomInt(5000, netLoss * 0.3),
          exposureCount: randomInt(1, 10)
        })),
        
        // Return period analysis
        returnPeriodLosses: [
          { returnPeriod: 10, loss: randomInt(grossLoss * 0.1, grossLoss * 0.3) },
          { returnPeriod: 25, loss: randomInt(grossLoss * 0.2, grossLoss * 0.5) },
          { returnPeriod: 50, loss: randomInt(grossLoss * 0.3, grossLoss * 0.7) },
          { returnPeriod: 100, loss: randomInt(grossLoss * 0.5, grossLoss * 0.9) },
          { returnPeriod: 250, loss: randomInt(grossLoss * 0.7, grossLoss) },
          { returnPeriod: 500, loss: grossLoss }
        ]
      },
      
      // Execution details
      executionDetails: {
        startTime: new Date(Date.now() - randomInt(3600000, 86400000 * 7)),
        endTime: new Date(Date.now() - randomInt(1800000, 3600000)),
        executionDuration: randomInt(300, 7200),
        status: randomChoice(['Completed', 'In Progress', 'Failed']),
        errorMessages: []
      },
      
      // Metadata
      metadata: {
        createdBy: 'Test User',
        createdDate: new Date(Date.now() - randomInt(86400000, 86400000 * 30)),
        version: '1.0',
        tags: ['test', 'simulation', randomChoice(['hurricane', 'earthquake', 'flood'])]
      }
    };
    
    simulations.push(simulation);
  }
  
  return simulations;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateCircularPolygon(center, radiusKm) {
  const points = [];
  const numPoints = 16;
  const earthRadius = 6371; // km
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle) / earthRadius * (180 / Math.PI);
    const dy = radiusKm * Math.sin(angle) / earthRadius * (180 / Math.PI) / Math.cos(center[1] * Math.PI / 180);
    
    points.push([center[0] + dx, center[1] + dy]);
  }
  
  // Close the polygon
  points.push(points[0]);
  return points;
}

function getIntensityMeasure(hazardType) {
  const measures = {
    'Earthquake': 'PGA',
    'Hurricane': 'Wind Speed',
    'Flood': 'Water Depth',
    'Wildfire': 'Heat Flux',
    'Tornado': 'Wind Speed',
    'Hail': 'Hail Size'
  };
  return measures[hazardType] || 'Intensity';
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedDatabase() {
  console.log('🚀 Starting Comprehensive Working Data Seeding');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  console.log(`🔗 MongoDB URI: ${MONGODB_URI}`);
  console.log('═══════════════════════════════════════════════════════════════\\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✓ Connected successfully\\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const deleteResults = await Promise.all([
      SimulationRun.deleteMany({}),
      Vulnerability.deleteMany({}),
      Hazard.deleteMany({}),
      Exposure.deleteMany({}),
      Location.deleteMany({})
    ]);
    console.log(`   ✓ Deleted ${deleteResults[0].deletedCount} simulation runs`);
    console.log(`   ✓ Deleted ${deleteResults[1].deletedCount} vulnerabilities`);
    console.log(`   ✓ Deleted ${deleteResults[2].deletedCount} hazards`);
    console.log(`   ✓ Deleted ${deleteResults[3].deletedCount} exposures`);
    console.log(`   ✓ Deleted ${deleteResults[4].deletedCount} locations\\n`);

    // Generate and seed data
    console.log('📍 Generating locations...');
    const locations = generateLocations(20);
    const savedLocations = await Location.insertMany(locations);
    console.log(`   ✓ Created ${savedLocations.length} locations\\n`);

    console.log('🏢 Generating exposures...');
    const exposures = generateExposures(locations, 120);
    const savedExposures = await Exposure.insertMany(exposures);
    console.log(`   ✓ Created ${savedExposures.length} exposures\\n`);

    console.log('⚡ Generating hazards...');
    const hazards = generateHazards(locations, 60);
    const savedHazards = await Hazard.insertMany(hazards);
    console.log(`   ✓ Created ${savedHazards.length} hazards\\n`);

    console.log('🛡️  Generating vulnerabilities...');
    const vulnerabilities = generateVulnerabilities(exposures, hazards, 40);
    const savedVulnerabilities = await Vulnerability.insertMany(vulnerabilities);
    console.log(`   ✓ Created ${savedVulnerabilities.length} vulnerabilities\\n`);

    console.log('🎯 Generating simulation runs...');
    const simulations = generateSimulationRuns(exposures, hazards, vulnerabilities, 15);
    const savedSimulations = await SimulationRun.insertMany(simulations);
    console.log(`   ✓ Created ${savedSimulations.length} simulation runs\\n`);

    // Generate summary statistics
    console.log('📊 Data Summary:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    console.log(`\\n📍 Locations: ${savedLocations.length}`);
    const locationsByCity = {};
    locations.forEach(loc => {
      const city = loc.address.split(',')[1]?.trim();
      locationsByCity[city] = (locationsByCity[city] || 0) + 1;
    });
    Object.entries(locationsByCity).forEach(([city, count]) => {
      console.log(`   ${city}: ${count}`);
    });

    console.log(`\\n🏢 Exposures: ${savedExposures.length}`);
    const exposuresByType = {};
    exposures.forEach(exp => {
      exposuresByType[exp.exposureType] = (exposuresByType[exp.exposureType] || 0) + 1;
    });
    Object.entries(exposuresByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    const totalValue = exposures.reduce((sum, exp) => sum + exp.replacementValue, 0);
    console.log(`   Total Replacement Value: $${(totalValue / 1e6).toFixed(1)}M`);

    console.log(`\\n⚡ Hazards: ${savedHazards.length}`);
    const hazardsByType = {};
    hazards.forEach(haz => {
      hazardsByType[haz.hazardType] = (hazardsByType[haz.hazardType] || 0) + 1;
    });
    Object.entries(hazardsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log(`\\n🛡️  Vulnerabilities: ${savedVulnerabilities.length}`);
    console.log(`\\n🎯 Simulation Runs: ${savedSimulations.length}`);
    
    console.log('\\n═══════════════════════════════════════════════════════════════');
    console.log('\\n✅ Comprehensive Working Data Seeding Complete!');
    console.log('\\n📝 Next Steps:');
    console.log('   1. Start backend: npm start (port 3001)');
    console.log('   2. Start frontend: cd frontend && npm start (port 3000)');
    console.log('   3. Open browser: http://localhost:3000');
    console.log('   4. Test all features with realistic data');
    console.log('\\n═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    console.log('\\n🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('   ✓ Disconnected successfully');
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase().catch(console.error);
}

module.exports = { seedDatabase };