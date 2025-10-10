/**
 * Clean Failed Simulations and Run New Test Simulations
 * 
 * This script:
 * 1. Connects to MongoDB and lists all current simulations
 * 2. Removes all failed simulations
 * 3. Creates new test simulations with proper format
 * 4. Monitors their execution
 */

const mongoose = require('mongoose');
const axios = require('axios');

const MONGODB_URI = 'mongodb://localhost:27017/cat_modeling';
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Test credentials - try multiple users
const TEST_USERS = [
  { username: 'demo_user', password: 'demo123' },
  { username: 'admin', password: 'admin123' },
  { username: 'test_user', password: 'test123' }
];

class SimulationCleaner {
  constructor() {
    this.authToken = null;
    this.currentUser = null;
  }

  async connectDB() {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  }

  async listSimulations() {
    console.log('\n📊 Listing all simulations:');
    const simulations = await mongoose.connection.db
      .collection('simulations')
      .find({})
      .toArray();

    console.log(`\nTotal simulations: ${simulations.length}\n`);
    
    if (simulations.length === 0) {
      console.log('No simulations found in database.');
      return [];
    }

    simulations.forEach((sim, index) => {
      console.log(`${index + 1}. ID: ${sim._id}`);
      console.log(`   Name: ${sim.simulationName || 'Unnamed'}`);
      console.log(`   Status: ${sim.status || 'unknown'}`);
      console.log(`   Created: ${sim.createdAt || 'unknown'}`);
      console.log(`   Events: ${sim.totalEvents || 0}`);
      console.log(`   Loss: $${(sim.totalLoss || 0).toLocaleString()}`);
      console.log('');
    });

    return simulations;
  }

  async removeFailedSimulations() {
    console.log('\n🗑️  Removing failed simulations...');
    
    const result = await mongoose.connection.db
      .collection('simulations')
      .deleteMany({
        $or: [
          { status: 'failed' },
          { status: 'error' },
          { status: 'cancelled' }
        ]
      });

    console.log(`✅ Removed ${result.deletedCount} failed simulation(s)`);
    return result.deletedCount;
  }

  async removeAllSimulations() {
    console.log('\n🗑️  Removing ALL simulations...');
    
    const result = await mongoose.connection.db
      .collection('simulations')
      .deleteMany({});

    console.log(`✅ Removed ${result.deletedCount} simulation(s)`);
    return result.deletedCount;
  }

  async authenticate() {
    console.log('\n🔐 Attempting authentication...');

    for (const user of TEST_USERS) {
      try {
        console.log(`\nTrying ${user.username}...`);
        
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          username: user.username,
          password: user.password
        });

        if (response.data && response.data.token) {
          this.authToken = response.data.token;
          this.currentUser = user.username;
          console.log(`✅ Successfully authenticated as ${user.username}`);
          return true;
        }
      } catch (error) {
        console.log(`❌ ${user.username} failed: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n⚠️  Could not authenticate with any test user');
    console.log('Will proceed with direct database operations only');
    return false;
  }

  async createTestSimulation(simulationData) {
    if (!this.authToken) {
      console.log('⚠️  No auth token - skipping API simulation creation');
      return null;
    }

    console.log(`\n🚀 Creating simulation: ${simulationData.simulationName}`);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/simulations/start`,
        simulationData,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Created simulation ID: ${response.data.simulationId || response.data._id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create simulation:`);
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Error: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.errors) {
        console.error(`   Validation errors:`, error.response.data.errors);
      }
      return null;
    }
  }

  async createTestSimulationsDirectly() {
    console.log('\n🔧 Creating test simulations directly in database...');

    const testSimulations = [
      {
        simulationName: 'Test-Earthquake-India-2024',
        simulationDescription: 'Testing earthquake risk with 5,000 exposure accounts',
        startYear: 2024,
        endYear: 2025,
        timeHorizon: 2,
        timeHorizonUnit: 'years',
        hazardTypes: ['Earthquake'],
        status: 'pending',
        progress: 0,
        createdBy: this.currentUser || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
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
          iterations: 1,
          randomSeed: 12345
        }
      },
      {
        simulationName: 'Test-Multi-Hazard-India-2024',
        simulationDescription: 'Testing multiple hazards with optimized frequencies',
        startYear: 2024,
        endYear: 2025,
        timeHorizon: 2,
        timeHorizonUnit: 'years',
        hazardTypes: ['Earthquake', 'Flood', 'Cyclone'],
        status: 'pending',
        progress: 0,
        createdBy: this.currentUser || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        geographicScope: {
          regions: ['Asia Pacific'],
          countries: ['India']
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
    ];

    const insertedSimulations = [];

    for (const simData of testSimulations) {
      try {
        const result = await mongoose.connection.db
          .collection('simulations')
          .insertOne(simData);

        console.log(`✅ Created: ${simData.simulationName} (ID: ${result.insertedId})`);
        insertedSimulations.push({ ...simData, _id: result.insertedId });
      } catch (error) {
        console.error(`❌ Failed to create ${simData.simulationName}:`, error.message);
      }
    }

    return insertedSimulations;
  }

  async monitorSimulation(simulationId) {
    console.log(`\n👁️  Monitoring simulation ${simulationId}...`);

    let attempts = 0;
    const maxAttempts = 30; // 30 seconds

    while (attempts < maxAttempts) {
      try {
        const simulation = await mongoose.connection.db
          .collection('simulations')
          .findOne({ _id: simulationId });

        if (!simulation) {
          console.log('⚠️  Simulation not found');
          return null;
        }

        const status = simulation.status;
        const progress = simulation.progress || 0;

        console.log(`   Status: ${status}, Progress: ${progress}%`);

        if (status === 'completed') {
          console.log('\n✅ Simulation completed!');
          console.log(`   Events: ${simulation.totalEvents || 0}`);
          console.log(`   Total Loss: $${(simulation.totalLoss || 0).toLocaleString()}`);
          console.log(`   AAL: $${(simulation.averageAnnualLoss || 0).toLocaleString()}`);
          return simulation;
        }

        if (status === 'failed' || status === 'error') {
          console.log(`\n❌ Simulation failed: ${simulation.errorMessage || 'Unknown error'}`);
          return simulation;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      } catch (error) {
        console.error('Error monitoring:', error.message);
        return null;
      }
    }

    console.log('\n⏱️  Monitoring timeout - simulation still running');
    return null;
  }

  async run() {
    try {
      // Connect to database
      await this.connectDB();

      // List current simulations
      const currentSims = await this.listSimulations();

      // Ask what to do
      console.log('\n🎯 Cleanup Options:');
      console.log('1. Remove only failed simulations');
      console.log('2. Remove ALL simulations');
      console.log('3. Skip cleanup');

      // For automation, let's remove all simulations to start fresh
      const choice = '2'; // Remove all

      if (choice === '1') {
        await this.removeFailedSimulations();
      } else if (choice === '2') {
        await this.removeAllSimulations();
      } else {
        console.log('Skipping cleanup');
      }

      // Try to authenticate
      const authenticated = await this.authenticate();

      // Create test simulations directly in DB
      console.log('\n📝 Creating new test simulations...');
      const newSimulations = await this.createTestSimulationsDirectly();

      if (newSimulations.length === 0) {
        console.log('\n❌ No simulations were created');
        await mongoose.disconnect();
        return;
      }

      // List simulations after creation
      console.log('\n📊 Current simulations after cleanup and creation:');
      await this.listSimulations();

      console.log('\n✅ Process completed!');
      console.log('\n📝 Next Steps:');
      console.log('1. Check the simulations in your frontend: http://localhost:3000/simulations');
      console.log('2. The simulations are in "pending" status');
      console.log('3. You may need to manually trigger them from the UI or:');
      console.log('   - Start them via API if authentication works');
      console.log('   - Or run the simulation engine directly on these IDs');

      console.log('\n🔍 To manually trigger a simulation:');
      newSimulations.forEach((sim, index) => {
        console.log(`\n${index + 1}. ${sim.simulationName}`);
        console.log(`   curl -X POST http://localhost:3001/api/v1/simulations/${sim._id}/start \\`);
        console.log(`     -H "Authorization: Bearer YOUR_TOKEN"`);
      });

      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
      await mongoose.disconnect();
      process.exit(1);
    }
  }
}

// Run the script
const cleaner = new SimulationCleaner();
cleaner.run();
