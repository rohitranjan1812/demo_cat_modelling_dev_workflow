/**
 * Backend API Integration Test
 * Tests all simulation-related endpoints directly
 * Bypasses frontend to isolate backend issues
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';
let authToken = '';

async function testAPI() {
  console.log('🚀 Starting Backend API Integration Test\n');
  console.log('=' .repeat(80));
  
  try {
    // Test 1: Health Check
    console.log('\n📍 TEST 1: Health Check');
    console.log('-'.repeat(80));
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log(`✅ Health Status: ${healthResponse.status} ${healthResponse.statusText}`);
      console.log(`   Response:`, JSON.stringify(healthResponse.data, null, 2));
    } catch (err) {
      console.log(`❌ Health check failed:`, err.message);
      return;
    }

    // Test 2: Login
    console.log('\n📍 TEST 2: User Authentication');
    console.log('-'.repeat(80));
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        username: 'riskmanager',
        password: 'RiskManager2025!'
      });
      console.log(`✅ Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
      console.log(`   Full response:`, JSON.stringify(loginResponse.data, null, 2));
      
      // Try different token locations
      authToken = loginResponse.data.token || 
                  loginResponse.data.data?.token || 
                  loginResponse.data.accessToken ||
                  loginResponse.data.data?.tokens?.accessToken;
      
      if (authToken) {
        console.log(`   Token received: ${authToken.substring(0, 50)}...`);
      } else {
        console.log(`   ⚠️  No token found in response`);
        return;
      }
      
      const user = loginResponse.data.user || loginResponse.data.data?.user;
      if (user) {
        console.log(`   User:`, JSON.stringify(user, null, 2));
      }
    } catch (err) {
      console.log(`❌ Login failed:`, err.response?.data || err.message);
      return;
    }

    // Setup auth headers
    const authHeaders = {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    // Test 3: Get Hazards
    console.log('\n📍 TEST 3: Get Hazards (required for simulation)');
    console.log('-'.repeat(80));
    try {
      const hazardsResponse = await axios.get(`${BASE_URL}/hazards`, authHeaders);
      console.log(`✅ Hazards Status: ${hazardsResponse.status}`);
      console.log(`   Found ${hazardsResponse.data.data?.length || 0} hazards`);
      if (hazardsResponse.data.data?.length > 0) {
        console.log(`   Sample hazard:`, JSON.stringify(hazardsResponse.data.data[0], null, 2));
      }
    } catch (err) {
      console.log(`❌ Get hazards failed:`, err.response?.data || err.message);
    }

    // Test 4: Get Vulnerabilities
    console.log('\n📍 TEST 4: Get Vulnerabilities (required for simulation)');
    console.log('-'.repeat(80));
    try {
      const vulnResponse = await axios.get(`${BASE_URL}/vulnerabilities`, authHeaders);
      console.log(`✅ Vulnerabilities Status: ${vulnResponse.status}`);
      console.log(`   Found ${vulnResponse.data.data?.length || 0} vulnerabilities`);
      if (vulnResponse.data.data?.length > 0) {
        console.log(`   Sample vulnerability:`, JSON.stringify(vulnResponse.data.data[0], null, 2));
      }
    } catch (err) {
      console.log(`❌ Get vulnerabilities failed:`, err.response?.data || err.message);
    }

    // Test 5: Get Existing Simulations
    console.log('\n📍 TEST 5: Get Existing Simulations');
    console.log('-'.repeat(80));
    try {
      const simsResponse = await axios.get(`${BASE_URL}/simulations/runs`, authHeaders);
      console.log(`✅ Simulations Status: ${simsResponse.status}`);
      console.log(`   Found ${simsResponse.data.data?.simulationRuns?.length || simsResponse.data.data?.length || 0} simulations`);
      const sims = simsResponse.data.data?.simulationRuns || simsResponse.data.data || [];
      if (sims.length > 0) {
        sims.forEach((sim, i) => {
          console.log(`   ${i + 1}. ${sim.simulationName} - Status: ${sim.status}`);
        });
      }
    } catch (err) {
      console.log(`❌ Get simulations failed:`, err.response?.data || err.message);
    }

    // Test 6: Create New Simulation (CRITICAL TEST)
    console.log('\n📍 TEST 6: Create New Simulation (CRITICAL)');
    console.log('-'.repeat(80));
    try {
      const simulationConfig = {
        simulationName: 'API Test Simulation',
        simulationDescription: 'Test simulation created via direct API call',
        startYear: 2024,
        endYear: 2024,
        timeHorizon: 1,
        timeHorizonUnit: 'years',
        hazardTypes: ['Earthquake'],
        geographicScope: {
          regions: ['Asia Pacific'],
          countries: ['India'],
          bounds: {
            north: 35.5,
            south: 8.1,
            east: 97.4,
            west: 68.2
          }
        },
        exposureScope: {
          currency: 'USD',
          totalExposure: 1000000,
          categories: {
            residential: 400000,
            commercial: 300000,
            industrial: 200000,
            infrastructure: 100000
          }
        },
        modelingConfig: {
          numberOfSimulations: 10,
          modelProvider: 'RMS',
          modelType: 'Probabilistic',
          resolution: 'Medium',
          randomSeed: 42,
          confidenceLevel: 95,
          returnPeriods: [10, 25, 50, 100, 250, 500, 1000],
          includeSecondaryPerils: false
        },
        advancedOptions: {
          detailedLossAnalysis: true,
          stochasticEventSet: true,
          demandSurge: false,
          postEventAmplification: false,
          uncertaintyAnalysis: true
        }
      };

      console.log('Sending simulation config:', JSON.stringify(simulationConfig, null, 2));
      
      const createResponse = await axios.post(
        `${BASE_URL}/simulations/start`,
        simulationConfig,
        authHeaders
      );
      
      console.log(`✅ Create Simulation Status: ${createResponse.status}`);
      console.log(`   Simulation created:`, JSON.stringify(createResponse.data, null, 2));
      
      // Get the simulation ID
      const simId = createResponse.data.data?.simulationRunId || createResponse.data.simulationRunId;
      
      if (simId) {
        // Test 7: Get Simulation Details
        console.log('\n📍 TEST 7: Get Simulation Details');
        console.log('-'.repeat(80));
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const detailsResponse = await axios.get(`${BASE_URL}/simulations/${simId}`, authHeaders);
        console.log(`✅ Get Simulation Details Status: ${detailsResponse.status}`);
        console.log(`   Simulation details:`, JSON.stringify(detailsResponse.data, null, 2));
      }
      
    } catch (err) {
      console.log(`❌ Create simulation failed:`, err.response?.data || err.message);
      if (err.response) {
        console.log(`   Status: ${err.response.status}`);
        console.log(`   Full error:`, JSON.stringify(err.response.data, null, 2));
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 API TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ Backend API is reachable and authenticated');
    console.log('📋 Check above for any failed tests');
    console.log('🔍 If simulation creation failed, that\'s the critical issue to fix');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
  }
}

testAPI();
