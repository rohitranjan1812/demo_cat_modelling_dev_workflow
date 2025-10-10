/**
 * Start Fresh Simulations Using CATSimulationEngine
 * 
 * This script properly starts simulations using the engine's startSimulation method
 */

const mongoose = require('mongoose');

// Import models first
require('../src/models/SimulationRun');
require('../src/models/Account');
require('../src/models/Hazard');
require('../src/models/Vulnerability');
require('../src/models/SimulationEvent');

const CATSimulationEngine = require('../src/services/CATSimulationEngine');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev';

class SimulationStarter {
  constructor() {
    this.engine = new CATSimulationEngine();
  }

  async connectDB() {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  }

  async startSimulation(config, name) {
    console.log(`\n🚀 Starting simulation: ${name}`);

    try {
      const result = await this.engine.startSimulation(config, 'system');

      console.log(`✅ Simulation started!`);
      console.log(`   Simulation ID: ${result.simulationRunId}`);
      console.log(`   Status: ${result.status}`);

      return result;

    } catch (error) {
      console.error(`❌ Failed to start simulation: ${error.message}`);
      return { error: error.message };
    }
  }

  async monitorSimulation(simulationRunId, maxWaitSeconds = 60) {
    console.log(`\n👁️  Monitoring simulation: ${simulationRunId}`);

    const SimulationRun = mongoose.model('SimulationRun');
    let attempts = 0;
    const maxAttempts = maxWaitSeconds;

    while (attempts < maxAttempts) {
      try {
        const simulation = await SimulationRun.findOne({ simulationRunId });

        if (!simulation) {
          console.log('⚠️  Simulation not found');
          return null;
        }

        const status = simulation.status;
        const progress = simulation.progress || 0;

        process.stdout.write(`\r   Status: ${status}, Progress: ${progress}%   `);

        if (status === 'Completed') {
          console.log('\n\n✅ Simulation completed!');
          console.log(`   Events: ${simulation.results?.totalEvents || 0}`);
          console.log(`   Total Loss: $${(simulation.results?.totalLoss || 0).toLocaleString()}`);
          console.log(`   AAL: $${(simulation.results?.averageAnnualLoss || 0).toLocaleString()}`);
          console.log(`   Max Event Loss: $${(simulation.results?.maxEventLoss || 0).toLocaleString()}`);
          return simulation;
        }

        if (status === 'Failed') {
          console.log(`\n\n❌ Simulation failed: ${simulation.errorMessage || 'Unknown error'}`);
          return simulation;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        console.error('\nError monitoring:', error.message);
        return null;
      }
    }

    console.log('\n\n⏱️  Monitoring timeout - simulation still running');
    console.log('   Check frontend for updates: http://localhost:3000/simulations');
    return null;
  }

  async run() {
    try {
      await this.connectDB();

      // Define test simulation configurations
      const simulations = [
        {
          name: 'Test-Earthquake-India-2024',
          config: {
            simulationName: 'Test-Earthquake-India-2024',
            simulationDescription: 'Testing earthquake risk with 5,000 exposure accounts and optimized frequencies',
            startYear: 2024,
            endYear: 2025,
            timeHorizon: 2,
            timeHorizonUnit: 'years',
            hazardTypes: ['Earthquake'],
            geographicScope: {
              regions: ['Asia Pacific'],
              countries: ['India'],
              boundingBox: {
                minLatitude: 8.0,
                maxLatitude: 35.0,
                minLongitude: 68.0,
                maxLongitude: 97.0
              }
            },
            exposureScope: {
              currency: 'USD',
              minExposure: 1000000,
              maxExposure: 500000000
            },
            modelingConfig: {
              modelProvider: 'Custom',
              modelVersion: '2.0',
              modelType: 'Probabilistic',
              resolution: 'Medium',
              numberOfSimulations: 1,
              iterations: 1
            }
          }
        },
        {
          name: 'Test-Multi-Hazard-India-2024',
          config: {
            simulationName: 'Test-Multi-Hazard-India-2024',
            simulationDescription: 'Testing multiple hazards (Earthquake, Flood, Cyclone) with realistic loss modeling',
            startYear: 2024,
            endYear: 2025,
            timeHorizon: 2,
            timeHorizonUnit: 'years',
            hazardTypes: ['Earthquake', 'Flood', 'Cyclone'],
            geographicScope: {
              regions: ['Asia Pacific'],
              countries: ['India'],
              boundingBox: {
                minLatitude: 8.0,
                maxLatitude: 35.0,
                minLongitude: 68.0,
                maxLongitude: 97.0
              }
            },
            exposureScope: {
              currency: 'USD'
            },
            modelingConfig: {
              modelProvider: 'Custom',
              modelType: 'Probabilistic',
              numberOfSimulations: 1
            }
          }
        }
      ];

      console.log('\n🎯 Starting test simulations...\n');
      console.log('='.repeat(60));

      const results = [];

      for (let i = 0; i < simulations.length; i++) {
        const sim = simulations[i];
        
        console.log(`\n[${i + 1}/${simulations.length}] ${sim.name}`);
        console.log('='.repeat(60));

        // Start the simulation
        const startResult = await this.startSimulation(sim.config, sim.name);

        if (startResult.error) {
          results.push({ 
            name: sim.name, 
            success: false, 
            error: startResult.error 
          });
          continue;
        }

        // Wait a moment for it to begin
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Monitor the simulation
        const monitorResult = await this.monitorSimulation(startResult.simulationRunId, 60);

        results.push({ 
          name: sim.name, 
          success: monitorResult?.status === 'Completed', 
          simulationRunId: startResult.simulationRunId,
          result: monitorResult 
        });

        // Small delay between simulations
        if (i < simulations.length - 1) {
          console.log('\n⏳ Waiting 2 seconds before next simulation...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('📊 EXECUTION SUMMARY');
      console.log('='.repeat(60));

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      console.log(`\n✅ Successful: ${successful.length}`);
      console.log(`❌ Failed: ${failed.length}`);

      if (successful.length > 0) {
        console.log('\n✅ Successful Simulations:');
        successful.forEach((r, index) => {
          console.log(`\n${index + 1}. ${r.name}`);
          console.log(`   Simulation ID: ${r.simulationRunId}`);
          if (r.result?.results) {
            console.log(`   Events: ${r.result.results.totalEvents || 0}`);
            console.log(`   Total Loss: $${(r.result.results.totalLoss || 0).toLocaleString()}`);
            console.log(`   AAL: $${(r.result.results.averageAnnualLoss || 0).toLocaleString()}`);
            console.log(`   Max Event Loss: $${(r.result.results.maxEventLoss || 0).toLocaleString()}`);
          }
        });
      }

      if (failed.length > 0) {
        console.log('\n❌ Failed Simulations:');
        failed.forEach((r, index) => {
          console.log(`\n${index + 1}. ${r.name}`);
          console.log(`   Error: ${r.error || 'Simulation did not complete'}`);
        });
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ All simulations processed!');
      console.log('\n🌐 View results in frontend:');
      console.log('   - Simulations: http://localhost:3000/simulations');
      console.log('   - Accounts: http://localhost:3000/accounts (all 5,000 should be visible!)');
      console.log('   - Events: Check individual simulation pages for event details');
      console.log('\n📊 Database Status:');
      const SimulationRun = mongoose.model('SimulationRun');
      const totalSims = await SimulationRun.countDocuments();
      const completedSims = await SimulationRun.countDocuments({ status: 'Completed' });
      const runningSims = await SimulationRun.countDocuments({ status: 'Running' });
      const failedSims = await SimulationRun.countDocuments({ status: 'Failed' });
      console.log(`   Total Simulations: ${totalSims}`);
      console.log(`   Completed: ${completedSims}`);
      console.log(`   Running: ${runningSims}`);
      console.log(`   Failed: ${failedSims}`);
      console.log('='.repeat(60) + '\n');

      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB\n');

    } catch (error) {
      console.error('\n❌ Fatal error:', error.message);
      console.error(error.stack);
      await mongoose.disconnect();
      process.exit(1);
    }
  }
}

// Run the script
const starter = new SimulationStarter();
starter.run();
