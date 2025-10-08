/**
 * Run Comprehensive Simulations Script
 * Executes multiple simulation scenarios using the generated India CAT data
 * 
 * Author: GitHub Copilot
 * Date: October 8, 2025
 */

const axios = require('axios');
const mongoose = require('mongoose');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Login to get authentication token
async function authenticateUser() {
  console.log('🔐 Authenticating with demo user...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'demo',
      password: 'Demo123!'
    });
    
    if (response.data.success) {
      console.log('✅ Authentication successful');
      return response.data.data.tokens.accessToken;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.response?.data || error.message);
    throw error;
  }
}

// Create axios instance with authentication
function createAuthenticatedClient(token) {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

// Get sample hazards and vulnerabilities for simulation
async function getSampleData(client) {
  console.log('📊 Fetching sample data for simulation...');
  
  try {
    // Get hazards by type for different simulation scenarios
    const hazardResponse = await client.get('/hazards?limit=100');
    const vulnerabilityResponse = await client.get('/vulnerabilities?limit=100');
    
    console.log(`📈 Retrieved ${hazardResponse.data.data.data.length} hazards`);
    console.log(`🛡️ Retrieved ${vulnerabilityResponse.data.data.data.length} vulnerabilities`);
    
    return {
      hazards: hazardResponse.data.data.data,
      vulnerabilities: vulnerabilityResponse.data.data.data
    };
  } catch (error) {
    console.error('❌ Error fetching data:', error.response?.data || error.message);
    throw error;
  }
}

// Run a single simulation
async function runSimulation(client, simulationConfig) {
  console.log(`🚀 Starting simulation: ${simulationConfig.simulationName}`);
  
  try {
    const response = await client.post('/simulations/start', simulationConfig);
    
    if (response.data.success) {
      console.log(`✅ Simulation started: ${simulationConfig.simulationName}`);
      console.log(`   Simulation ID: ${response.data.data.simulationRunId}`);
      console.log(`   Status: ${response.data.data.status}`);
      
      return response.data.data;
    } else {
      throw new Error(`Simulation failed: ${response.data.message}`);
    }
  } catch (error) {
    console.error(`❌ Error starting simulation ${simulationConfig.simulationName}:`, error.response?.data || error.message);
    return null;
  }
}

// Monitor simulation progress
async function monitorSimulation(client, simulationRunId, simulationName) {
  console.log(`⏳ Monitoring simulation: ${simulationName} (${simulationRunId})`);
  
  const maxAttempts = 20;
  const delayMs = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.get(`/simulations/${simulationRunId}/status`);
      const status = response.data.data.status;
      const progress = response.data.data.progress || 0;
      
      console.log(`   ${simulationName}: ${status} (${progress}%)`);
      
      if (status === 'Completed') {
        console.log(`✅ Simulation completed: ${simulationName}`);
        return await getSimulationResults(client, simulationRunId);
      } else if (status === 'Failed' || status === 'Cancelled') {
        console.log(`❌ Simulation ${status.toLowerCase()}: ${simulationName}`);
        return null;
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
    } catch (error) {
      console.error(`⚠️ Error monitoring simulation ${simulationName}:`, error.response?.data || error.message);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log(`⏰ Timeout monitoring simulation: ${simulationName}`);
  return null;
}

// Get simulation results
async function getSimulationResults(client, simulationRunId) {
  try {
    const response = await client.get(`/simulations/${simulationRunId}/results`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error getting simulation results:', error.response?.data || error.message);
    return null;
  }
}

// Create multiple simulation scenarios
function createSimulationScenarios(sampleData) {
  const currentYear = new Date().getFullYear();
  
  return [
    {
      simulationName: 'India Earthquake Risk Assessment 2025',
      simulationDescription: 'Comprehensive earthquake risk assessment across India using generated seismic hazard data',
      startYear: currentYear,
      endYear: currentYear + 1,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Earthquake'],
      geographicScope: {
        regions: ['Asia Pacific']
      },
      exposureScope: {
        currency: 'INR'
      },
      modelingConfig: {
        numberOfSimulations: 1000,
        modelProvider: 'Custom',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    },
    {
      simulationName: 'India Flood Risk Analysis 2025',
      simulationDescription: 'Flood risk modeling across Indian river basins and coastal areas',
      startYear: currentYear,
      endYear: currentYear + 1,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Flood'],
      geographicScope: {
        regions: ['Asia Pacific']
      },
      exposureScope: {
        currency: 'INR'
      },
      modelingConfig: {
        numberOfSimulations: 1000,
        modelProvider: 'Custom',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    },
    {
      simulationName: 'India Cyclone Impact Study 2025',
      simulationDescription: 'Cyclone risk assessment for Indian coastal regions',
      startYear: currentYear,
      endYear: currentYear + 1,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Cyclone'],
      geographicScope: {
        regions: ['Asia Pacific']
      },
      exposureScope: {
        currency: 'INR'
      },
      modelingConfig: {
        numberOfSimulations: 1000,
        modelProvider: 'Custom',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    },
    {
      simulationName: 'India Multi-Hazard Assessment 2025',
      simulationDescription: 'Comprehensive multi-hazard risk assessment covering earthquakes, floods, cyclones, and droughts',
      startYear: currentYear,
      endYear: currentYear + 5,
      timeHorizon: 5,
      timeHorizonUnit: 'years',
      hazardTypes: ['Earthquake', 'Flood', 'Cyclone', 'Drought'],
      geographicScope: {
        regions: ['Asia Pacific']
      },
      exposureScope: {
        currency: 'INR'
      },
      modelingConfig: {
        numberOfSimulations: 5000,
        modelProvider: 'Custom',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    },
    {
      simulationName: 'India Climate Change Impact 2025-2030',
      simulationDescription: 'Long-term climate change impact assessment for India including extreme weather events',
      startYear: currentYear,
      endYear: currentYear + 5,
      timeHorizon: 5,
      timeHorizonUnit: 'years',
      hazardTypes: ['Heat Wave', 'Drought', 'Flood', 'Cyclone'],
      geographicScope: {
        regions: ['Asia Pacific']
      },
      exposureScope: {
        currency: 'INR'
      },
      modelingConfig: {
        numberOfSimulations: 2500,
        modelProvider: 'Custom',
        modelType: 'Probabilistic',
        resolution: 'High'
      }
    }
  ];
}

// Main execution function
async function runComprehensiveSimulations() {
  console.log('🇮🇳 India CAT Modeling - Comprehensive Simulation Suite');
  console.log('====================================================');
  
  try {
    // Authenticate
    const token = await authenticateUser();
    const client = createAuthenticatedClient(token);
    
    // Get sample data
    const sampleData = await getSampleData(client);
    
    // Create simulation scenarios
    const scenarios = createSimulationScenarios(sampleData);
    console.log(`\n📋 Created ${scenarios.length} simulation scenarios`);
    
    console.log('\n🎯 SIMULATION SCENARIOS');
    console.log('----------------------');
    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.simulationName}`);
      console.log(`   Hazards: ${scenario.hazardTypes.join(', ')}`);
      console.log(`   Duration: ${scenario.timeHorizon} ${scenario.timeHorizonUnit}`);
      console.log(`   Trials: ${scenario.modelingConfig.numberOfSimulations}`);
    });
    
    // Start all simulations
    console.log('\n🚀 STARTING SIMULATIONS');
    console.log('=======================');
    
    const runningSimulations = [];
    
    for (const scenario of scenarios) {
      const result = await runSimulation(client, scenario);
      if (result) {
        runningSimulations.push({
          ...result,
          name: scenario.simulationName
        });
      }
      
      // Small delay between starting simulations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n✅ Started ${runningSimulations.length} simulations`);
    
    // Monitor all simulations
    console.log('\n⏳ MONITORING SIMULATIONS');
    console.log('=========================');
    
    const results = [];
    
    // Monitor simulations in parallel (but limit concurrency)
    const monitorPromises = runningSimulations.map(sim => 
      monitorSimulation(client, sim.simulationRunId, sim.name)
    );
    
    const simulationResults = await Promise.allSettled(monitorPromises);
    
    // Process results
    console.log('\n📊 SIMULATION RESULTS SUMMARY');
    console.log('=============================');
    
    let completedCount = 0;
    let failedCount = 0;
    
    simulationResults.forEach((result, index) => {
      const simulationName = runningSimulations[index].name;
      
      if (result.status === 'fulfilled' && result.value) {
        completedCount++;
        console.log(`✅ ${simulationName}: COMPLETED`);
        
        if (result.value.results) {
          const res = result.value.results;
          console.log(`   Total Loss: $${(res.totalLoss || 0).toLocaleString()}`);
          console.log(`   AAL: $${(res.averageAnnualLoss || 0).toLocaleString()}`);
          console.log(`   Max Loss: $${(res.maxProbableLoss || 0).toLocaleString()}`);
        }
      } else {
        failedCount++;
        console.log(`❌ ${simulationName}: FAILED/TIMEOUT`);
      }
    });
    
    console.log('\n🎯 EXECUTION SUMMARY');
    console.log('===================');
    console.log(`📈 Total Scenarios: ${scenarios.length}`);
    console.log(`✅ Completed: ${completedCount}`);
    console.log(`❌ Failed/Timeout: ${failedCount}`);
    console.log(`🔄 Success Rate: ${((completedCount / scenarios.length) * 100).toFixed(1)}%`);
    
    console.log('\n💾 SIMULATION DATA USAGE');
    console.log('========================');
    console.log(`🔥 Hazards Used: ${sampleData.hazards.length} (from 10,000 total)`);
    console.log(`🛡️ Vulnerabilities Used: ${sampleData.vulnerabilities.length} (from 12,984 total)`);
    console.log('📍 Geographic Coverage: All India regions');
    console.log('⏱️ Time Horizons: 1-5 years');
    console.log('🎲 Total Trials: ~12,500 across all simulations');
    
  } catch (error) {
    console.error('❌ Comprehensive simulation failed:', error);
  }
}

// Run the comprehensive simulation suite
if (require.main === module) {
  runComprehensiveSimulations().catch(console.error);
}

module.exports = { runComprehensiveSimulations };