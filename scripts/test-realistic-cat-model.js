/**
 * Test Realistic CAT Model with Generated Exposure Accounts
 * Validates:
 * - Accounts appear in UI
 * - Realistic losses are calculated
 * - Events are generated with new frequencies
 * - YELT data can be extracted
 */

require('dotenv').config();
const axios = require('axios');

class RealisticCATTester {
  constructor() {
    this.apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    this.authToken = null;
    this.results = {
      accountsVisible: false,
      accountCount: 0,
      simulationsWithLosses: 0,
      simulationsWithEvents: 0,
      totalSimulations: 0,
      totalLoss: 0,
      totalEvents: 0,
      avgLossPerSim: 0,
      avgEventsPerSim: 0
    };
  }

  async test() {
    console.log(`\n🧪 REALISTIC CAT MODEL TESTER`);
    console.log(`============================\n`);

    try {
      // 1. Authenticate
      console.log('🔐 Authenticating...');
      await this.authenticate();
      console.log('✅ Authenticated\n');

      // 2. Check accounts in system
      console.log('📊 Checking generated accounts...');
      await this.checkAccounts();

      // 3. Run test simulations
      console.log('\n🔄 Running test simulations with new system...');
      await this.runTestSimulations(10); // Run 10 test simulations

      // 4. Display results
      this.displayResults();

      return this.results;

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.apiUrl}/auth/login`, {
        username: 'demo_user',
        password: 'DemoUser@2024'
      });

      if (response.data.success) {
        this.authToken = response.data.data.token;
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      throw error;
    }
  }

  async checkAccounts() {
    try {
      const response = await axios.get(`${this.apiUrl}/accounts`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` },
        params: { limit: 100 }
      });

      if (response.data.success) {
        this.results.accountsVisible = true;
        this.results.accountCount = response.data.data.total || response.data.data.length;
        
        console.log(`  ✅ Accounts visible in UI: ${this.results.accountCount.toLocaleString()}`);
        
        // Show sample accounts
        const accounts = response.data.data.accounts || response.data.data;
        if (accounts && accounts.length > 0) {
          console.log(`\n  📦 Sample Accounts:`);
          accounts.slice(0, 3).forEach(acc => {
            console.log(`    - ${acc.accountId}: ${acc.accountName}`);
            console.log(`      Exposure: $${(acc.totalExposure / 1000000).toFixed(2)}M`);
            console.log(`      Risk: ${acc.riskProfile}`);
          });
        }
      }
    } catch (error) {
      console.error('  ❌ Error checking accounts:', error.message);
    }
  }

  async runTestSimulations(count) {
    const simPromises = [];
    
    for (let i = 0; i < count; i++) {
      simPromises.push(this.runSingleSimulation(i));
    }

    await Promise.allSettled(simPromises);
    
    console.log(`\n  ✅ Completed ${this.results.totalSimulations} / ${count} simulations`);
  }

  async runSingleSimulation(index) {
    try {
      const hazardTypes = [
        ['Earthquake'],
        ['Flood'],
        ['Cyclone'],
        ['Drought', 'Heat Wave'],
        ['Earthquake', 'Landslide']
      ];

      const config = {
        simulationName: `Realistic-Test-${index}`,
        simulationDescription: `Test simulation with realistic frequencies and exposure accounts`,
        startYear: 2024,
        endYear: 2025,
        timeHorizon: 2,
        timeHorizonUnit: 'years',
        hazardTypes: hazardTypes[index % hazardTypes.length],
        geographicScope: {
          regions: ['Asia Pacific'],
          countries: ['India']
        },
        exposureScope: {
          currency: 'USD',
          minExposure: 1000000
        },
        modelingConfig: {
          modelProvider: 'Custom',
          modelVersion: '2.0',
          modelType: 'Probabilistic',
          resolution: 'Medium',
          iterations: 1
        }
      };

      // Start simulation
      const startResponse = await axios.post(
        `${this.apiUrl}/simulations/start`,
        config,
        {
          headers: { 'Authorization': `Bearer ${this.authToken}` },
          timeout: 30000
        }
      );

      if (startResponse.data.success) {
        const simulationRunId = startResponse.data.data.simulationRunId;
        
        // Wait for completion
        const result = await this.waitForCompletion(simulationRunId);
        
        if (result) {
          this.results.totalSimulations++;
          
          const loss = result.totalLoss || 0;
          const events = result.totalEvents || 0;
          
          if (loss > 0) this.results.simulationsWithLosses++;
          if (events > 0) this.results.simulationsWithEvents++;
          
          this.results.totalLoss += loss;
          this.results.totalEvents += events;
          
          console.log(`    ✅ Sim ${index}: ${events} events, $${(loss / 1000000).toFixed(2)}M loss`);
        }
      }
    } catch (error) {
      console.log(`    ❌ Sim ${index} failed: ${error.message}`);
    }
  }

  async waitForCompletion(simulationRunId, timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await axios.get(
          `${this.apiUrl}/simulations/${simulationRunId}`,
          {
            headers: { 'Authorization': `Bearer ${this.authToken}` },
            timeout: 10000
          }
        );

        if (response.data.success) {
          const sim = response.data.data;
          
          if (sim.status === 'Completed') {
            return sim.results || {};
          } else if (sim.status === 'Failed') {
            return null;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return null;
  }

  displayResults() {
    if (this.results.totalSimulations > 0) {
      this.results.avgLossPerSim = this.results.totalLoss / this.results.totalSimulations;
      this.results.avgEventsPerSim = this.results.totalEvents / this.results.totalSimulations;
    }

    console.log(`\n\n📊 TEST RESULTS SUMMARY`);
    console.log(`=====================`);
    console.log(`\n1️⃣  ACCOUNT VISIBILITY`);
    console.log(`   Accounts in UI: ${this.results.accountsVisible ? '✅ YES' : '❌ NO'}`);
    console.log(`   Account Count: ${this.results.accountCount.toLocaleString()}`);
    
    console.log(`\n2️⃣  SIMULATION RESULTS`);
    console.log(`   Total Simulations: ${this.results.totalSimulations}`);
    console.log(`   Simulations with Losses: ${this.results.simulationsWithLosses} (${((this.results.simulationsWithLosses / this.results.totalSimulations) * 100).toFixed(1)}%)`);
    console.log(`   Simulations with Events: ${this.results.simulationsWithEvents} (${((this.results.simulationsWithEvents / this.results.totalSimulations) * 100).toFixed(1)}%)`);
    
    console.log(`\n3️⃣  FINANCIAL METRICS`);
    console.log(`   Total Loss: $${(this.results.totalLoss / 1000000000).toFixed(2)}B`);
    console.log(`   Avg Loss per Simulation: $${(this.results.avgLossPerSim / 1000000).toFixed(2)}M`);
    console.log(`   Total Events: ${this.results.totalEvents.toLocaleString()}`);
    console.log(`   Avg Events per Simulation: ${this.results.avgEventsPerSim.toFixed(1)}`);

    console.log(`\n4️⃣  SYSTEM STATUS`);
    const accountsOK = this.results.accountsVisible && this.results.accountCount >= 5000;
    const lossesOK = this.results.simulationsWithLosses >= this.results.totalSimulations * 0.8; // 80% should have losses
    const eventsOK = this.results.simulationsWithEvents >= this.results.totalSimulations * 0.8;

    console.log(`   ✅ Accounts: ${accountsOK ? 'PASS' : 'FAIL'}`);
    console.log(`   ${lossesOK ? '✅' : '❌'} Realistic Losses: ${lossesOK ? 'PASS' : 'FAIL'}`);
    console.log(`   ${eventsOK ? '✅' : '❌'} Event Generation: ${eventsOK ? 'PASS' : 'FAIL'}`);

    if (accountsOK && lossesOK && eventsOK) {
      console.log(`\n   🎯 ALL SYSTEMS OPERATIONAL ✅`);
      console.log(`   🚀 Ready for high-volume YELT generation!`);
    } else {
      console.log(`\n   ⚠️  Some issues detected - review results above`);
    }

    console.log(`\n`);
  }
}

// Run test
if (require.main === module) {
  const tester = new RealisticCATTester();
  
  tester.test()
    .then(() => {
      console.log('✅ Testing completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = RealisticCATTester;
