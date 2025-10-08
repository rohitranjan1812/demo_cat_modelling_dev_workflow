/**
 * Verify Simulation Results Script
 * Checks the simulation results and provides detailed analysis
 * 
 * Author: GitHub Copilot
 * Date: October 8, 2025
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Login and get all simulation runs
async function verifySims() {
  console.log('🔍 Verifying Simulation Results');
  console.log('==============================');
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'demo',
      password: 'Demo123!'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    
    const client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get all simulation runs
    console.log('📊 Fetching simulation runs...');
    const simResponse = await client.get('/simulations/runs');
    
    const simulations = simResponse.data.data.simulationRuns || [];
    console.log(`✅ Found ${simulations.length} simulation runs`);
    
    console.log('\n📋 SIMULATION RUNS OVERVIEW');
    console.log('===========================');
    
    for (let i = 0; i < simulations.length; i++) {
      const sim = simulations[i];
      console.log(`\n${i + 1}. ${sim.simulationName || 'Unnamed Simulation'}`);
      console.log(`   ID: ${sim.simulationRunId}`);
      console.log(`   Status: ${sim.status}`);
      console.log(`   Progress: ${sim.progress || 0}%`);
      console.log(`   Started: ${new Date(sim.startTime).toLocaleString()}`);
      
      if (sim.endTime) {
        console.log(`   Completed: ${new Date(sim.endTime).toLocaleString()}`);
        const duration = (new Date(sim.endTime) - new Date(sim.startTime)) / 1000;
        console.log(`   Duration: ${duration.toFixed(1)} seconds`);
      }
      
      // Get detailed results for completed simulations
      if (sim.status === 'Completed') {
        try {
          console.log('\n   📈 DETAILED RESULTS:');
          const resultsResponse = await client.get(`/simulations/${sim.simulationRunId}/results`);
          const results = resultsResponse.data.data;
          
          if (results.results) {
            const res = results.results;
            console.log(`   • Total Loss: $${(res.totalLoss || 0).toLocaleString()}`);
            console.log(`   • Average Annual Loss: $${(res.averageAnnualLoss || 0).toLocaleString()}`);
            console.log(`   • Maximum Probable Loss: $${(res.maxProbableLoss || 0).toLocaleString()}`);
            console.log(`   • Return Periods Analyzed: ${res.returnPeriods ? res.returnPeriods.join(', ') : 'N/A'}`);
            console.log(`   • Events Processed: ${res.totalEvents || 0}`);
            console.log(`   • Confidence Level: ${(res.confidenceLevel || 0) * 100}%`);
          }
          
          if (results.statistics) {
            console.log(`   • Mean Loss: $${(results.statistics.meanLoss || 0).toLocaleString()}`);
            console.log(`   • Standard Deviation: $${(results.statistics.standardDeviation || 0).toLocaleString()}`);
          }
          
        } catch (error) {
          console.log(`   ⚠️ Error fetching detailed results: ${error.response?.data?.message || error.message}`);
        }
      }
      
      // Get simulation events/progress
      if (sim.status === 'Failed') {
        try {
          const eventsResponse = await client.get(`/simulations/${sim.simulationRunId}/events`);
          const events = eventsResponse.data.data;
          
          if (events && events.length > 0) {
            console.log('   📝 Recent Events:');
            events.slice(-3).forEach(event => {
              console.log(`   • ${event.eventType}: ${event.message}`);
            });
          }
        } catch (error) {
          console.log(`   ⚠️ No event details available`);
        }
      }
    }
    
    // Summary statistics
    console.log('\n📊 SIMULATION SUMMARY STATISTICS');
    console.log('================================');
    
    const statusCounts = {};
    simulations.forEach(sim => {
      statusCounts[sim.status] = (statusCounts[sim.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} simulations`);
    });
    
    const completedSims = simulations.filter(s => s.status === 'Completed');
    const failedSims = simulations.filter(s => s.status === 'Failed');
    const runningSims = simulations.filter(s => s.status === 'Running');
    
    console.log(`\n✅ Success Rate: ${((completedSims.length / simulations.length) * 100).toFixed(1)}%`);
    console.log(`⏱️ Average Duration: ${completedSims.length > 0 ? 
      (completedSims.reduce((acc, sim) => acc + (new Date(sim.endTime) - new Date(sim.startTime)), 0) / completedSims.length / 1000).toFixed(1) + ' seconds' : 'N/A'}`);
    
    // Test data availability
    console.log('\n🔍 DATA AVAILABILITY CHECK');
    console.log('==========================');
    
    const hazardResponse = await client.get('/hazards?limit=1');
    const vulnResponse = await client.get('/vulnerabilities?limit=1');
    
    console.log(`📊 Hazards Available: ${hazardResponse.data.data.pagination.total.toLocaleString()}`);
    console.log(`🛡️ Vulnerabilities Available: ${vulnResponse.data.data.pagination.total.toLocaleString()}`);
    console.log(`🇮🇳 Data Source: Generated India CAT modeling dataset`);
    console.log(`🎯 Status: Ready for comprehensive modeling and analysis`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  verifySims().catch(console.error);
}

module.exports = { verifySims };