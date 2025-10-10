/**
 * Move simulations from 'simulations' to 'simulationruns' collection
 * and run them using CATSimulationEngine
 */

const mongoose = require('mongoose');

// Import models first
require('../src/models/SimulationRun');
require('../src/models/Account');
require('../src/models/Hazard');
require('../src/models/Vulnerability');
require('../src/models/SimulationEvent');

const CATSimulationEngine = require('../src/services/CATSimulationEngine');

const MONGODB_URI = 'mongodb://localhost:27017/cat_modeling';

class SimulationMigrator {
  constructor() {
    this.engine = new CATSimulationEngine();
  }

  async connectDB() {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  }

  async migrateSimulations() {
    console.log('\n🔄 Migrating simulations to correct collection...');

    // Get from 'simulations' collection
    const oldSims = await mongoose.connection.db
      .collection('simulations')
      .find({})
      .toArray();

    console.log(`Found ${oldSims.length} simulation(s) in 'simulations' collection`);

    if (oldSims.length === 0) {
      console.log('No simulations to migrate');
      return [];
    }

    const SimulationRun = mongoose.model('SimulationRun');
    const migratedSims = [];

    for (const oldSim of oldSims) {
      try {
        // Create new SimulationRun document with proper structure
        const newSim = new SimulationRun({
          simulationName: oldSim.simulationName,
          simulationDescription: oldSim.simulationDescription,
          startYear: oldSim.startYear,
          endYear: oldSim.endYear,
          timeHorizon: oldSim.timeHorizon,
          timeHorizonUnit: oldSim.timeHorizonUnit,
          hazardTypes: oldSim.hazardTypes,
          geographicScope: oldSim.geographicScope,
          exposureScope: oldSim.exposureScope,
          vulnerabilityScope: oldSim.vulnerabilityScope,
          modelingConfig: oldSim.modelingConfig,
          status: 'pending',
          progress: 0,
          createdBy: oldSim.createdBy || 'system',
          createdAt: oldSim.createdAt || new Date(),
          updatedAt: new Date()
        });

        await newSim.save();
        console.log(`✅ Migrated: ${newSim.simulationName} (New ID: ${newSim._id})`);
        migratedSims.push(newSim);

      } catch (error) {
        console.error(`❌ Failed to migrate ${oldSim.simulationName}:`, error.message);
      }
    }

    // Delete old simulations
    await mongoose.connection.db.collection('simulations').deleteMany({});
    console.log(`✅ Removed ${oldSims.length} simulation(s) from old collection`);

    return migratedSims;
  }

  async runSimulation(simulation) {
    console.log(`\n🚀 Running simulation: ${simulation.simulationName}`);
    console.log(`   ID: ${simulation._id}`);

    try {
      // Update status to running
      simulation.status = 'running';
      simulation.startedAt = new Date();
      await simulation.save();

      console.log('   Status: running');
      console.log('   This may take 10-30 seconds...');

      // Run the simulation
      const results = await this.engine.runSimulation(simulation._id.toString());

      console.log('\n✅ Simulation completed!');
      console.log(`   Events Generated: ${results.totalEvents || 0}`);
      console.log(`   Total Loss: $${(results.totalLoss || 0).toLocaleString()}`);
      console.log(`   Average Annual Loss: $${(results.averageAnnualLoss || 0).toLocaleString()}`);
      console.log(`   Max Event Loss: $${(results.maxEventLoss || 0).toLocaleString()}`);
      console.log(`   Accounts Affected: ${results.accountsAffected || 0}`);

      return results;

    } catch (error) {
      console.error(`\n❌ Simulation failed: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      
      // Update status to failed
      simulation.status = 'failed';
      simulation.errorMessage = error.message;
      simulation.completedAt = new Date();
      await simulation.save();

      return { error: error.message };
    }
  }

  async run() {
    try {
      await this.connectDB();

      // Migrate simulations to correct collection
      const simulations = await this.migrateSimulations();

      if (simulations.length === 0) {
        console.log('\n⚠️  No simulations to run');
        await mongoose.disconnect();
        return;
      }

      // Run each simulation
      console.log('\n🎯 Starting simulation execution...\n');
      console.log('='.repeat(60));

      const results = [];

      for (let i = 0; i < simulations.length; i++) {
        const simulation = simulations[i];
        
        console.log(`\n[${i + 1}/${simulations.length}] ${simulation.simulationName}`);
        console.log('='.repeat(60));

        try {
          const result = await this.runSimulation(simulation);
          results.push({ 
            simulation: simulation.simulationName, 
            success: !result.error, 
            result 
          });
        } catch (error) {
          results.push({ 
            simulation: simulation.simulationName, 
            success: false, 
            error: error.message 
          });
        }

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
          console.log(`\n${index + 1}. ${r.simulation}`);
          console.log(`   Events: ${r.result.totalEvents || 0}`);
          console.log(`   Total Loss: $${(r.result.totalLoss || 0).toLocaleString()}`);
          console.log(`   AAL: $${(r.result.averageAnnualLoss || 0).toLocaleString()}`);
          console.log(`   Max Event Loss: $${(r.result.maxEventLoss || 0).toLocaleString()}`);
        });
      }

      if (failed.length > 0) {
        console.log('\n❌ Failed Simulations:');
        failed.forEach((r, index) => {
          console.log(`\n${index + 1}. ${r.simulation}`);
          console.log(`   Error: ${r.error}`);
        });
      }

      console.log('\n' + '='.repeat(60));
      console.log('✅ All simulations processed!');
      console.log('\n🌐 View results in frontend:');
      console.log('   - Simulations: http://localhost:3000/simulations');
      console.log('   - Accounts: http://localhost:3000/accounts');
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
const migrator = new SimulationMigrator();
migrator.run();
