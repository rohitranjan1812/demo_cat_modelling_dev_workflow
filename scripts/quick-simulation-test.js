/**
 * Quick Simulation Test - Generate simulations visible in frontend
 * Uses the optimized simulation engine with realistic accounts
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

// Test users from your system
const TEST_USERS = [
  { username: 'demo_user', password: 'DemoUser@2024' },
  { username: 'admin', password: 'Admin@123456' },
  { username: 'analyst_user', password: 'Analyst@2024' }
];

class QuickSimulationTest {
  constructor() {
    this.authToken = null;
    this.simulationIds = [];
  }

  async authenticate() {
    console.log('\n🔐 Authenticating...');
    
    for (const user of TEST_USERS) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, user, {
          timeout: 5000
        });
        
        if (response.data.success && response.data.data.token) {
          this.authToken = response.data.data.token;
          console.log(`✅ Authenticated as: ${user.username}`);
          return true;
        }
      } catch (error) {
        console.log(`  ⚠️ Failed with ${user.username}: ${error.message}`);
      }
    }
    
    throw new Error('All authentication attempts failed');
  }

  async createSimulation(index) {
    const configs = [
      {
        name: `Test-Earthquake-${index}`,
        hazards: ['Earthquake'],
        description: 'Testing Earthquake simulation with realistic accounts'
      },
      {
        name: `Test-Flood-${index}`,
        hazards: ['Flood'],
        description: 'Testing Flood simulation with realistic accounts'
      },
      {
        name: `Test-Cyclone-${index}`,
        hazards: ['Cyclone'],
        description: 'Testing Cyclone simulation with realistic accounts'
      },
      {
        name: `Test-MultiHazard-${index}`,
        hazards: ['Earthquake', 'Flood', 'Cyclone'],
        description: 'Testing multi-hazard simulation with realistic accounts'
      }
    ];

    const config = configs[index % configs.length];

    const simulationConfig = {
      simulationName: config.name,
      simulationDescription: config.description,
      startYear: 2024,
      endYear: 2025,
      timeHorizon: 2,
      timeHorizonUnit: 'years',
      hazardTypes: config.hazards,
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
      vulnerabilityScope: {
        includeHistorical: true,
        includePredicted: false
      },
      modelingConfig: {
        modelProvider: 'Custom',
        modelVersion: '2.0',
        modelType: 'Probabilistic',
        resolution: 'Medium',
        iterations: 1,
        randomSeed: index,
        useClimateScenarios: false
      }
    };

    try {
      const response = await axios.post(
        `${API_URL}/simulations/start`,
        simulationConfig,
        {
          headers: { 'Authorization': `Bearer ${this.authToken}` },
          timeout: 30000
        }
      );

      if (response.data.success) {
        const simId = response.data.data.simulationRunId;
        this.simulationIds.push(simId);
        console.log(`  ✅ Created: ${config.name} (${simId})`);
        return simId;
      } else {
        console.log(`  ❌ Failed to create ${config.name}`);
        return null;
      }
    } catch (error) {
      console.log(`  ❌ Error creating ${config.name}: ${error.message}`);
      return null;
    }
  }

  async run(count = 10) {
    console.log(`\n🚀 QUICK SIMULATION TEST`);
    console.log(`=======================`);
    console.log(`Creating ${count} simulations for frontend display\n`);

    try {
      // Authenticate
      await this.authenticate();

      // Create simulations
      console.log(`\n📊 Creating simulations...`);
      const promises = [];
      for (let i = 0; i < count; i++) {
        promises.push(this.createSimulation(i));
      }

      await Promise.all(promises);

      console.log(`\n✅ SIMULATION CREATION COMPLETE`);
      console.log(`==============================`);
      console.log(`Total Created: ${this.simulationIds.length}/${count}`);
      console.log(`\n📋 Simulation IDs:`);
      this.simulationIds.forEach((id, idx) => {
        console.log(`  ${idx + 1}. ${id}`);
      });

      console.log(`\n🎯 NEXT STEPS:`);
      console.log(`1. Go to Frontend: http://localhost:3000/simulations`);
      console.log(`2. You should see the new simulations`);
      console.log(`3. They will process automatically (may take 10-30 seconds each)`);
      console.log(`4. Refresh the page to see completed results with realistic losses\n`);

      console.log(`💡 TIP: Check the Accounts page to see all 5,000 accounts!`);
      console.log(`   URL: http://localhost:3000/accounts\n`);

      return this.simulationIds;

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      throw error;
    }
  }
}

// Run test
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 10;
  
  const test = new QuickSimulationTest();
  test.run(count)
    .then(() => {
      console.log('✅ Test completed - Check frontend!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = QuickSimulationTest;
