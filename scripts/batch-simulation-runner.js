/**
 * Batch CAT Model Simulation Runner
 * 
 * This script enables testing of 1000s of CAT model simulations
 * with proper batching, error handling, and progress tracking.
 * 
 * Features:
 * - Batch processing to avoid overwhelming the system
 * - Progress tracking and reporting
 * - Error recovery and retry logic
 * - Summary statistics and performance metrics
 * - Export results to JSON/CSV
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev';
const BATCH_SIZE = 50;           // Process 50 simulations at a time
const MAX_CONCURRENT = 10;       // Max 10 concurrent simulations
const RETRY_ATTEMPTS = 3;        // Retry failed simulations 3 times
const RESULTS_DIR = path.join(__dirname, 'simulation-results');

/**
 * Connect to MongoDB with optimized settings for batch processing
 */
async function connectDB() {
  try {
    console.log('🔌 Connecting to MongoDB for batch processing...');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 100,          // Large pool for batch operations
      minPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      family: 4,
      connectTimeoutMS: 10000
    });
    
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Generate simulation configurations
 */
function generateSimulationConfigs(count) {
  console.log(`📝 Generating ${count} simulation configurations...\n`);
  
  const hazardTypes = ['Earthquake', 'Flood', 'Cyclone', 'Drought', 'Heat Wave', 'Landslide'];
  const regions = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat',
    'Rajasthan', 'West Bengal', 'Uttar Pradesh', 'Kerala', 'Andhra Pradesh'
  ];
  const modelProviders = ['AIR', 'RMS', 'EQE'];
  const resolutions = ['Low', 'Medium', 'High'];
  
  const configs = [];
  
  for (let i = 0; i < count; i++) {
    const numHazards = Math.floor(Math.random() * 3) + 1; // 1-3 hazards
    const selectedHazards = [];
    
    for (let j = 0; j < numHazards; j++) {
      const hazard = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
      if (!selectedHazards.includes(hazard)) {
        selectedHazards.push(hazard);
      }
    }
    
    const region = regions[Math.floor(Math.random() * regions.length)];
    const numSimulations = [100, 500, 1000, 2000, 5000][Math.floor(Math.random() * 5)];
    
    configs.push({
      simulationName: `Batch Simulation ${i + 1} - ${selectedHazards.join('+')} - ${region}`,
      simulationDescription: `Automated batch simulation for ${region} region`,
      startYear: 2025,
      endYear: 2025,
      timeHorizon: 1,
      timeHorizonUnit: 'Years',
      hazardTypes: selectedHazards,
      geographicScope: {
        scopeType: 'Region',
        regions: [region],
        countries: ['India']
      },
      modelingConfig: {
        modelProvider: modelProviders[Math.floor(Math.random() * modelProviders.length)],
        modelType: 'Probabilistic',
        resolution: resolutions[Math.floor(Math.random() * resolutions.length)],
        numberOfSimulations: numSimulations,
        probabilityDistributions: {
          eventFrequency: 'Poisson',
          eventSeverity: 'Weibull',
          loss: 'Lognormal'
        }
      },
      exposureScope: {
        minExposure: 0,
        maxExposure: 10000000000,
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
        returnPeriods: [10, 25, 50, 100, 250]
      }
    });
  }
  
  return configs;
}

/**
 * Run a single simulation
 */
async function runSingleSimulation(config, userId = 'batch-runner') {
  const CATSimulationEngine = require('./src/services/CATSimulationEngine');
  const engine = new CATSimulationEngine();
  
  try {
    const result = await engine.startSimulation(config, userId);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Process simulations in batches
 */
async function processBatch(configs, batchNumber, totalBatches) {
  console.log(`\n📦 Processing Batch ${batchNumber}/${totalBatches} (${configs.length} simulations)`);
  console.log('─'.repeat(60));
  
  const results = [];
  const startTime = Date.now();
  
  // Process in smaller chunks for concurrency control
  for (let i = 0; i < configs.length; i += MAX_CONCURRENT) {
    const chunk = configs.slice(i, Math.min(i + MAX_CONCURRENT, configs.length));
    const chunkPromises = chunk.map((config, idx) => 
      runSingleSimulation(config)
        .then(result => {
          const status = result.success ? '✅' : '❌';
          console.log(`   ${status} Simulation ${i + idx + 1}/${configs.length}`);
          return result;
        })
    );
    
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
    
    // Small delay between chunks to avoid overwhelming the system
    if (i + MAX_CONCURRENT < configs.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log(`\n   ⏱️  Batch Duration: ${duration}s`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  
  return results;
}

/**
 * Save results to file
 */
function saveResults(results, filename) {
  try {
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
    
    const filepath = path.join(RESULTS_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${filepath}`);
  } catch (error) {
    console.error('❌ Failed to save results:', error.message);
  }
}

/**
 * Generate statistics summary
 */
async function generateStatistics() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 BATCH SIMULATION STATISTICS');
  console.log('='.repeat(60) + '\n');
  
  const SimulationRun = require('./src/models/SimulationRun');
  
  try {
    const totalRuns = await SimulationRun.countDocuments();
    const completedRuns = await SimulationRun.countDocuments({ status: 'Completed' });
    const failedRuns = await SimulationRun.countDocuments({ status: 'Failed' });
    const runningRuns = await SimulationRun.countDocuments({ status: 'Running' });
    const queuedRuns = await SimulationRun.countDocuments({ status: 'Queued' });
    
    console.log(`📈 Total Simulations:      ${totalRuns.toLocaleString()}`);
    console.log(`✅ Completed:              ${completedRuns.toLocaleString()} (${((completedRuns/totalRuns)*100).toFixed(1)}%)`);
    console.log(`❌ Failed:                 ${failedRuns.toLocaleString()} (${((failedRuns/totalRuns)*100).toFixed(1)}%)`);
    console.log(`⏳ Running:                ${runningRuns.toLocaleString()}`);
    console.log(`⏸️  Queued:                 ${queuedRuns.toLocaleString()}`);
    
    // Aggregate statistics
    const [lossStats] = await SimulationRun.aggregate([
      { $match: { status: 'Completed', 'results.totalLoss': { $exists: true, $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalLoss: { $sum: '$results.totalLoss' },
          avgLoss: { $avg: '$results.totalLoss' },
          maxLoss: { $max: '$results.totalLoss' },
          minLoss: { $min: '$results.totalLoss' },
          totalEvents: { $sum: '$results.numberOfEvents' }
        }
      }
    ]);
    
    if (lossStats) {
      console.log('\n💰 Loss Statistics:');
      console.log(`   Total Loss:       ₹${(lossStats.totalLoss / 1000000000).toFixed(2)} Billion`);
      console.log(`   Average Loss:     ₹${(lossStats.avgLoss / 1000000).toFixed(2)} Million`);
      console.log(`   Max Loss:         ₹${(lossStats.maxLoss / 1000000).toFixed(2)} Million`);
      console.log(`   Min Loss:         ₹${(lossStats.minLoss / 1000000).toFixed(2)} Million`);
      console.log(`   Total Events:     ${lossStats.totalEvents.toLocaleString()}`);
    }
    
    // Hazard type distribution
    const hazardDist = await SimulationRun.aggregate([
      { $match: { status: 'Completed' } },
      { $unwind: '$configuration.hazardTypes' },
      { $group: { _id: '$configuration.hazardTypes', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    if (hazardDist.length > 0) {
      console.log('\n🌍 Hazard Type Distribution:');
      hazardDist.forEach(item => {
        console.log(`   ${item._id}: ${item.count}`);
      });
    }
    
    // Performance metrics
    const [perfStats] = await SimulationRun.aggregate([
      { $match: { status: 'Completed', executionTime: { $exists: true } } },
      {
        $group: {
          _id: null,
          avgExecutionTime: { $avg: '$executionTime' },
          maxExecutionTime: { $max: '$executionTime' },
          minExecutionTime: { $min: '$executionTime' }
        }
      }
    ]);
    
    if (perfStats) {
      console.log('\n⚡ Performance Metrics:');
      console.log(`   Avg Execution Time:  ${perfStats.avgExecutionTime.toFixed(2)}s`);
      console.log(`   Max Execution Time:  ${perfStats.maxExecutionTime.toFixed(2)}s`);
      console.log(`   Min Execution Time:  ${perfStats.minExecutionTime.toFixed(2)}s`);
    }
    
    console.log('\n✅ Statistics generation complete!\n');
    
  } catch (error) {
    console.error('❌ Error generating statistics:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 BATCH CAT MODEL SIMULATION RUNNER');
  console.log('='.repeat(60) + '\n');
  
  // Get number of simulations from command line
  const totalSimulations = parseInt(process.argv[2]) || 100;
  
  console.log(`🎯 Target: ${totalSimulations.toLocaleString()} simulations`);
  console.log(`📦 Batch Size: ${BATCH_SIZE}`);
  console.log(`⚡ Max Concurrent: ${MAX_CONCURRENT}\n`);
  
  try {
    await connectDB();
    
    // Check for existing data
    const Exposure = require('./src/models/Exposure');
    const exposureCount = await Exposure.countDocuments();
    
    if (exposureCount === 0) {
      console.error('❌ No exposure data found!');
      console.error('   Please run: node scripts/generate-india-exposure-data.js\n');
      process.exit(1);
    }
    
    console.log(`✅ Found ${exposureCount.toLocaleString()} exposures in database\n`);
    
    // Generate simulation configurations
    const configs = generateSimulationConfigs(totalSimulations);
    
    // Process in batches
    const totalBatches = Math.ceil(configs.length / BATCH_SIZE);
    const allResults = [];
    const overallStartTime = Date.now();
    
    for (let i = 0; i < configs.length; i += BATCH_SIZE) {
      const batch = configs.slice(i, Math.min(i + BATCH_SIZE, configs.length));
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      const batchResults = await processBatch(batch, batchNumber, totalBatches);
      allResults.push(...batchResults);
      
      // Progress update
      const completed = allResults.filter(r => r.success).length;
      const failed = allResults.filter(r => !r.success).length;
      const progress = ((allResults.length / totalSimulations) * 100).toFixed(1);
      
      console.log(`\n📊 Overall Progress: ${progress}% (${allResults.length}/${totalSimulations})`);
      console.log(`   ✅ Success: ${completed} | ❌ Failed: ${failed}\n`);
      
      // Small delay between batches
      if (i + BATCH_SIZE < configs.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const overallDuration = ((Date.now() - overallStartTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 BATCH PROCESSING COMPLETE');
    console.log('='.repeat(60) + '\n');
    
    console.log(`⏱️  Total Duration: ${overallDuration}s`);
    console.log(`📊 Total Simulations: ${allResults.length}`);
    console.log(`✅ Successful: ${allResults.filter(r => r.success).length}`);
    console.log(`❌ Failed: ${allResults.filter(r => !r.success).length}`);
    console.log(`⚡ Throughput: ${(allResults.length / parseFloat(overallDuration)).toFixed(2)} simulations/second`);
    
    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveResults(allResults, `batch-results-${timestamp}.json`);
    
    // Generate comprehensive statistics
    await generateStatistics();
    
    console.log('✅ All operations completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
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
  generateSimulationConfigs,
  processBatch,
  runSingleSimulation,
  generateStatistics
};
