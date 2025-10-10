/**
 * Run Pending Simulations Directly
 * 
 * This script finds pending simulations and executes them directly
 * using the CATSimulationEngine, bypassing authentication issues.
 */

const mongoose = require('mongoose');
const path = require('path');

// Import models
require('../src/models/SimulationRun');
require('../src/models/Account');
require('../src/models/Hazard');
require('../src/models/Vulnerability');

const CATSimulationEngine = require('../src/services/CATSimulationEngine');

const MONGODB_URI = 'mongodb://localhost:27017/cat_modeling';

class SimulationRunner {
  constructor() {
    this.engine = new CATSimulationEngine();
  }

  async connectDB() {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  }

  async findPendingSimulations() {
    console.log('\n🔍 Finding pending simulations...');
    
    const SimulationRun = mongoose.model('SimulationRun');
    const simulations = await SimulationRun.find({ status: 'pending' });

    console.log(`Found ${simulations.length} pending simulation(s)`);
    
    simulations.forEach((sim, index) => {
      console.log(`\n${index + 1}. ${sim.simulationName}`);
      console.log(`   ID: ${sim._id}`);
      console.log(`   Status: ${sim.status}`);
      console.log(`   Hazards: ${sim.hazardTypes.join(', ')}`);
    });

    return simulations;
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
      
      // Update status to failed
      simulation.status = 'failed';
      simulation.errorMessage = error.message;
      simulation.completedAt = new Date();
      await simulation.save();

      throw error;
    }
  }

  async run() {
    try {
      await this.connectDB();

      // Find pending simulations
      const pendingSimulations = await this.findPendingSimulations();

      if (pendingSimulations.length === 0) {
        console.log('\n⚠️  No pending simulations found');
        await mongoose.disconnect();
        return;
      }

      // Run each simulation
      console.log('\n🎯 Starting simulation execution...\n');

      const results = [];

      for (const simulation of pendingSimulations) {
        try {
          const result = await this.runSimulation(simulation);
          results.push({ simulation: simulation.simulationName, success: true, result });
        } catch (error) {
          results.push({ simulation: simulation.simulationName, success: false, error: error.message });
        }

        // Small delay between simulations
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      console.log('\n🌐 View results in frontend: http://localhost:3000/simulations');
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
const runner = new SimulationRunner();
runner.run();
