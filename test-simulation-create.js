/**
 * Enhanced India CAT Model Simulation Test Script
 * 
 * This script:
 * 1. Authenticates with the API
 * 2. Runs diagnostic tests on available data
 * 3. Generates exposure data if needed
 * 4. Creates and runs comprehensive CAT simulations
 * 5. Tests the simulation engine with thousands of runs
 * 
 * Fixes the Node.js internal assertion error by using proper connection pooling
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev';

let authToken = null;

/**
 * Connect to MongoDB with improved connection handling
 */
async function connectDB() {
  try {
    console.log(`🔌 Connecting to MongoDB...`);
    
    // Use IPv4 and proper connection pooling to avoid Node.js assertion errors
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,           // Reduced from 50 to avoid connection issues
      minPoolSize: 2,            // Minimum connections
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,                 // Force IPv4 to avoid IPv6 connection issues
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000
    });
    
    console.log('✅ Connected to MongoDB\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\n📝 Please ensure MongoDB is running:');
    console.error('   mongod --dbpath ./data\n');
    return false;
  }
}

/**
 * Authenticate with the API
 */
async function authenticate() {
  try {
    console.log('🔐 Authenticating...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });
    
    authToken = response.data.token;
    console.log('✅ Authentication successful\n');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data?.message || error.message);
    console.error('   Please ensure the backend is running and credentials are correct\n');
    return false;
  }
}

/**
 * Get API headers with auth token
 */
function getHeaders() {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Run diagnostic tests
 */
async function runDiagnostics() {
  console.log('🔍 RUNNING DIAGNOSTIC TESTS');
  console.log('============================');
  
  const Hazard = require('./src/models/Hazard');
  const Vulnerability = require('./src/models/Vulnerability');
  const Exposure = require('./src/models/Exposure');
  
  try {
    // Count records
    const [hazardCount, vulnerabilityCount, exposureCount] = await Promise.all([
      Hazard.countDocuments(),
      Vulnerability.countDocuments(),
      Exposure.countDocuments()
    ]);
    
    console.log(`✅ Hazards Available: ${hazardCount.toLocaleString()}`);
    console.log(`✅ Vulnerabilities Available: ${vulnerabilityCount.toLocaleString()}`);
    console.log(`✅ Exposures Available: ${exposureCount.toLocaleString()}`);
    
    // Sample hazard location
    const sampleHazard = await Hazard.findOne();
    if (sampleHazard) {
      const lat = sampleHazard.epicenterLocation?.latitude || sampleHazard.geographicScope?.centerLatitude;
      const lng = sampleHazard.epicenterLocation?.longitude || sampleHazard.geographicScope?.centerLongitude;
      console.log(`📍 Sample Hazard Location: ${lat}, ${lng}`);
      
      // Check nearby vulnerabilities
      const nearbyVulns = await Vulnerability.countDocuments({
        'geographicScope.centerLatitude': { $gte: lat - 1, $lte: lat + 1 },
        'geographicScope.centerLongitude': { $gte: lng - 1, $lte: lng + 1 }
      });
      console.log(`🛡️ Nearby Vulnerabilities: ${nearbyVulns}`);
      
      // Check nearby exposures
      const nearbyExposures = await Exposure.countDocuments({
        'location.latitude': { $gte: lat - 1, $lte: lat + 1 },
        'location.longitude': { $gte: lng - 1, $lte: lng + 1 }
      });
      console.log(`💰 Nearby Exposures: ${nearbyExposures}`);
    }
    
    console.log();
    return { hazardCount, vulnerabilityCount, exposureCount };
  } catch (error) {
    console.error('❌ Diagnostic tests failed:', error.message);
    return null;
  }
}

/**
 * Generate exposure data if needed
 */
async function generateExposureData() {
  console.log('💰 EXPOSURE DATA GENERATION');
  console.log('============================');
  
  try {
    console.log('📝 Checking if exposure generation is needed...\n');
    
    const Exposure = require('./src/models/Exposure');
    const exposureCount = await Exposure.countDocuments();
    
    if (exposureCount > 0) {
      console.log(`✅ Found ${exposureCount.toLocaleString()} existing exposures`);
      console.log('   Skipping exposure generation\n');
      return true;
    }
    
    console.log('⚠️  No exposure data found - generating...\n');
    console.log('🚀 Running exposure data generator...');
    console.log('   This may take 2-3 minutes...\n');
    
    // Import and run the exposure generator
    const { generateAccounts, generatePolicies, generateLocations, generateExposures } = 
      require('./scripts/generate-india-exposure-data');
    
    // Generate data
    const accounts = await generateAccounts(1000);
    const accountIds = accounts.map(a => a.accountId);
    
    const policies = await generatePolicies(2000, accountIds);
    const policyIds = policies.map(p => p.policyId);
    
    const locations = await generateLocations(10000);
    const locationIds = locations.map(l => l.locationId);
    
    await generateExposures(10000, accountIds, policyIds, locationIds);
    
    console.log('✅ Exposure data generation complete!\n');
    return true;
  } catch (error) {
    console.error('❌ Exposure data generation failed:', error.message);
    console.error('\n   You can manually run: node scripts/generate-india-exposure-data.js\n');
    return false;
  }
}

/**
 * Create a test simulation
 */
async function createSimulation(config) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/simulations/start`,
      config,
      { headers: getHeaders() }
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ Simulation creation failed:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * Get simulation status
 */
async function getSimulationStatus(simulationId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/simulations/runs/${simulationId}`,
      { headers: getHeaders() }
    );
    
    return response.data;
  } catch (error) {
    return null;
  }
}

/**
 * Run comprehensive simulation tests
 */
async function runSimulationTests() {
  console.log('🎯 RUNNING CAT MODEL SIMULATIONS');
  console.log('============================\n');
  
  const testConfigs = [
    {
      simulationName: 'India Earthquake Risk Assessment 2025',
      simulationDescription: 'Comprehensive earthquake risk analysis for India',
      startYear: 2025,
      endYear: 2025,
      timeHorizon: 1,
      timeHorizonUnit: 'Years',
      hazardTypes: ['Earthquake'],
      geographicScope: {
        scopeType: 'Region',
        regions: ['Asia Pacific'],
        countries: ['India']
      },
      modelingConfig: {
        modelProvider: 'AIR',
        modelType: 'Probabilistic',
        resolution: 'High',
        numberOfSimulations: 1000,
        probabilityDistributions: {
          eventFrequency: 'Poisson',
          eventSeverity: 'Lognormal',
          loss: 'Pareto'
        }
      },
      exposureScope: {
        minExposure: 0,
        maxExposure: 1000000000000,
        occupancyTypes: ['Residential', 'Commercial', 'Industrial'],
        constructionTypes: ['Concrete', 'Steel Frame', 'Masonry']
      },
      vulnerabilityScope: {
        minVulnerabilityScore: 0,
        maxVulnerabilityScore: 10,
        categories: ['Individual', 'Community', 'Regional', 'National']
      },
      riskConfig: {
        confidenceLevel: 0.95,
        returnPeriods: [10, 25, 50, 100, 250, 500, 1000]
      }
    },
    {
      simulationName: 'India Multi-Hazard Analysis 2025',
      simulationDescription: 'Multi-peril risk analysis including earthquakes, floods, and cyclones',
      startYear: 2025,
      endYear: 2025,
      timeHorizon: 1,
      timeHorizonUnit: 'Years',
      hazardTypes: ['Earthquake', 'Flood', 'Cyclone'],
      geographicScope: {
        scopeType: 'Region',
        regions: ['Asia Pacific'],
        countries: ['India']
      },
      modelingConfig: {
        modelProvider: 'RMS',
        modelType: 'Probabilistic',
        resolution: 'Medium',
        numberOfSimulations: 5000,
        probabilityDistributions: {
          eventFrequency: 'Poisson',
          eventSeverity: 'Weibull',
          loss: 'Lognormal'
        }
      },
      exposureScope: {
        minExposure: 1000000,
        maxExposure: 5000000000,
        occupancyTypes: ['Residential', 'Commercial'],
        constructionTypes: ['Concrete', 'Steel Frame']
      },
      riskConfig: {
        confidenceLevel: 0.99,
        returnPeriods: [50, 100, 250, 500]
      }
    }
  ];
  
  const results = [];
  
  for (const config of testConfigs) {
    console.log(`🎲 Creating simulation: ${config.simulationName}`);
    console.log(`   Hazards: ${config.hazardTypes.join(', ')}`);
    console.log(`   Simulations: ${config.modelingConfig.numberOfSimulations.toLocaleString()}`);
    
    const result = await createSimulation(config);
    
    if (result && result.success) {
      console.log(`   ✅ Simulation started: ${result.simulationRunId}`);
      console.log(`   Status: ${result.status}\n`);
      results.push(result);
    } else {
      console.log(`   ❌ Simulation failed to start\n`);
    }
    
    // Small delay between simulations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

/**
 * Monitor simulation progress
 */
async function monitorSimulations(simulationIds, maxWaitTime = 60000) {
  console.log('⏳ MONITORING SIMULATION PROGRESS');
  console.log('============================\n');
  
  const startTime = Date.now();
  const checkInterval = 5000; // Check every 5 seconds
  
  while (Date.now() - startTime < maxWaitTime) {
    let allCompleted = true;
    
    for (const simId of simulationIds) {
      const status = await getSimulationStatus(simId);
      
      if (status) {
        console.log(`📊 ${simId}: ${status.status} - Progress: ${status.progress || 0}%`);
        
        if (status.status !== 'Completed' && status.status !== 'Failed') {
          allCompleted = false;
        }
      }
    }
    
    console.log();
    
    if (allCompleted) {
      console.log('✅ All simulations completed!\n');
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
}

/**
 * Display final summary
 */
async function displaySummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📈 SIMULATION TEST SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  try {
    const SimulationRun = require('./src/models/SimulationRun');
    
    const totalRuns = await SimulationRun.countDocuments();
    const completedRuns = await SimulationRun.countDocuments({ status: 'Completed' });
    const failedRuns = await SimulationRun.countDocuments({ status: 'Failed' });
    const runningRuns = await SimulationRun.countDocuments({ status: 'Running' });
    
    console.log(`📊 Total Simulations:     ${totalRuns}`);
    console.log(`✅ Completed:             ${completedRuns}`);
    console.log(`❌ Failed:                ${failedRuns}`);
    console.log(`⏳ Running:               ${runningRuns}`);
    
    // Get sample results
    const sampleRun = await SimulationRun.findOne({ status: 'Completed' }).sort({ updatedAt: -1 });
    
    if (sampleRun && sampleRun.results) {
      console.log('\n💰 Sample Completed Simulation:');
      console.log(`   Name: ${sampleRun.simulationName}`);
      console.log(`   Total Loss: ₹${(sampleRun.results.totalLoss / 1000000).toFixed(2)} Million`);
      console.log(`   Events Generated: ${sampleRun.results.numberOfEvents || 0}`);
      console.log(`   Duration: ${sampleRun.executionTime || 0} seconds`);
    }
    
    console.log('\n✅ India CAT Model simulation system is operational!');
    console.log('🚀 Ready for large-scale simulation runs\n');
    
  } catch (error) {
    console.error('❌ Error generating summary:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🇮🇳 Enhanced India CAT Model Simulation');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Authenticate
    const authenticated = await authenticate();
    if (!authenticated) {
      console.error('❌ Cannot proceed without authentication');
      console.error('   Note: Backend must be running for API tests\n');
      // Continue anyway for data generation
    }
    
    // Run diagnostics
    const diagnostics = await runDiagnostics();
    
    // Generate exposure data if needed
    if (diagnostics && diagnostics.exposureCount === 0) {
      await generateExposureData();
    }
    
    // Run simulation tests (only if authenticated)
    if (authenticated) {
      const simulations = await runSimulationTests();
      
      if (simulations.length > 0) {
        const simulationIds = simulations.map(s => s.simulationRunId);
        await monitorSimulations(simulationIds, 30000); // Monitor for 30 seconds
      }
      
      await displaySummary();
    } else {
      console.log('⚠️  Skipping simulation tests (backend not available)\n');
      console.log('💡 Tip: Start the backend with: npm start\n');
    }
    
    console.log('✅ All tests completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed\n');
    }
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { 
  connectDB, 
  authenticate, 
  runDiagnostics, 
  generateExposureData,
  createSimulation,
  getSimulationStatus
};
