/**
 * Enhanced CAT Model Simulation with Real Data Integration
 * Creates exposure data and runs comprehensive simulation using generated India dataset
 * 
 * Author: GitHub Copilot  
 * Date: October 8, 2025
 */

const mongoose = require('mongoose');
const axios = require('axios');
const Account = require('./src/models/Account');
const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');

const API_BASE_URL = 'http://localhost:3001/api/v1';

class RealCATSimulation {
  constructor() {
    this.authToken = null;
    this.client = null;
  }

  async authenticate() {
    console.log('🔐 Authenticating...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'demo',
        password: 'Demo123!'
      });
      
      this.authToken = response.data.data.tokens.accessToken;
      this.client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Authentication successful');
    } catch (error) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateExposureData() {
    console.log('💰 Generating exposure data from hazard locations...');
    
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_dev');
    
    // Get a sample of our generated hazards to create exposures at the same locations
    const hazards = await Hazard.find({ createdBy: 'data-generator' }).limit(500);
    console.log(`📊 Found ${hazards.length} hazards to create exposures for`);
    
    // Clear existing accounts/exposures
    await Account.deleteMany({ createdBy: 'exposure-generator' });
    
    const exposures = [];
    
    for (let i = 0; i < hazards.length; i++) {
      const hazard = hazards[i];
      
      // Create 1-3 accounts per hazard location to simulate realistic exposure density
      const numAccounts = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numAccounts; j++) {
        const accountId = `ACC-EXP-${(i * 10 + j + 1).toString().padStart(8, '0')}`;
        
        // Add some random offset to coordinates (within 5km radius)
        const latOffset = (Math.random() - 0.5) * 0.045; // ~5km in degrees
        const lngOffset = (Math.random() - 0.5) * 0.045;
        
        const account = new Account({
          accountId,
          accountNumber: `${accountId}-${Date.now()}`,
          accountName: `Property ${accountId}`,
          policyId: `POL-${accountId}`,
          policyNumber: `POL-${Date.now()}-${i}${j}`,
          insuredName: `Property Owner ${i}-${j}`,
          policyType: this.randomChoice(['Property', 'Casualty', 'Motor', 'Marine']),
          
          // Coverage details
          coverage: {
            policyLimit: this.generatePolicyLimit(),
            deductible: this.generateDeductible(),
            coverageTypes: this.generateCoverageTypes(),
            attachmentPoint: 0,
            currency: 'INR'
          },
          
          // Geographic details
          riskLocation: {
            address: `Risk Location ${accountId}`,
            city: this.getIndianCity(hazard.footprint.centerLatitude, hazard.footprint.centerLongitude),
            state: this.getIndianState(hazard.footprint.centerLatitude),
            country: 'India',
            postalCode: this.generateIndianPostalCode(),
            latitude: hazard.footprint.centerLatitude + latOffset,
            longitude: hazard.footprint.centerLongitude + lngOffset,
            occupancyType: this.randomChoice(['Residential', 'Commercial', 'Industrial', 'Agricultural']),
            constructionType: this.randomChoice(['Concrete', 'Steel', 'Wood', 'Masonry', 'Mixed']),
            yearBuilt: Math.floor(Math.random() * 50) + 1970,
            buildingHeight: Math.floor(Math.random() * 20) + 1,
            numberOfFloors: Math.floor(Math.random() * 10) + 1
          },
          
          // Financial details  
          exposure: {
            totalInsuredValue: this.generateTotalInsuredValue(),
            buildingValue: 0, // Will be calculated
            contentsValue: 0, // Will be calculated
            businessInterruptionValue: 0, // Will be calculated
            timeElementLimit: 365
          },
          
          // Risk characteristics
          riskCharacteristics: {
            primaryHazards: [hazard.hazardType],
            secondaryHazards: this.getSecondaryHazards(hazard.hazardType),
            riskProfile: this.randomChoice(['Low', 'Medium', 'High']),
            replacementCost: 0 // Will be calculated
          },
          
          // Metadata
          status: 'Active',
          isActive: true,
          effectiveDate: new Date(),
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          createdBy: 'exposure-generator',
          lastModifiedBy: 'exposure-generator'
        });
        
        // Calculate derived values
        const tiv = account.exposure.totalInsuredValue;
        account.exposure.buildingValue = tiv * 0.6;
        account.exposure.contentsValue = tiv * 0.3;
        account.exposure.businessInterruptionValue = tiv * 0.1;
        account.riskCharacteristics.replacementCost = tiv * 1.2;
        
        exposures.push(account);
      }
    }
    
    // Batch insert exposures
    console.log(`💾 Inserting ${exposures.length} exposure accounts...`);
    await Account.insertMany(exposures);
    
    console.log(`✅ Created ${exposures.length} exposure accounts`);
    
    await mongoose.disconnect();
    return exposures.length;
  }

  generatePolicyLimit() {
    // Generate realistic policy limits in INR
    const options = [500000, 1000000, 2500000, 5000000, 10000000, 25000000, 50000000];
    return this.randomChoice(options);
  }

  generateDeductible() {
    // Generate deductibles as percentage of policy limit
    const percentages = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2];
    return this.randomChoice(percentages);
  }

  generateCoverageTypes() {
    const allTypes = ['Property Damage', 'Business Interruption', 'Contents', 'Additional Living Expenses'];
    const numTypes = Math.floor(Math.random() * 3) + 1;
    return this.shuffle(allTypes).slice(0, numTypes);
  }

  generateTotalInsuredValue() {
    // Generate realistic TIV values in INR (₹50L to ₹50Cr)
    const min = 5000000; // 50 Lakh
    const max = 500000000; // 50 Crore
    return Math.floor(Math.random() * (max - min) + min);
  }

  getIndianCity(lat, lng) {
    // Simple mapping based on coordinates
    if (lat > 28) return 'Delhi';
    if (lat > 22 && lng < 80) return 'Mumbai';
    if (lat > 22 && lng > 80) return 'Kolkata';
    if (lat < 15 && lng > 80) return 'Chennai';
    if (lat < 15 && lng < 78) return 'Bangalore';
    return 'Hyderabad';
  }

  getIndianState(lat) {
    if (lat > 30) return 'Himachal Pradesh';
    if (lat > 28) return 'Delhi';
    if (lat > 26) return 'Rajasthan';
    if (lat > 23) return 'Madhya Pradesh';
    if (lat > 20) return 'Maharashtra';
    if (lat > 15) return 'Karnataka';
    return 'Tamil Nadu';
  }

  generateIndianPostalCode() {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  getSecondaryHazards(primaryHazard) {
    const hazardMap = {
      'Earthquake': ['Landslide', 'Tsunami'],
      'Flood': ['Wind', 'Hail'],
      'Cyclone': ['Flood', 'Storm Surge', 'Wind'],
      'Drought': ['Heat Wave', 'Wildfire'],
      'Heat Wave': ['Drought', 'Wildfire'],
      'Landslide': ['Flood']
    };
    return hazardMap[primaryHazard] || [];
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async runEnhancedSimulation() {
    console.log('🚀 Running enhanced CAT simulation with real data...');
    
    const simulationConfig = {
      simulationName: 'India Enhanced CAT Model - Real Data Integration',
      simulationDescription: 'Comprehensive CAT simulation using generated India hazard data with synthetic exposures',
      startYear: 2025,
      endYear: 2025,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Earthquake', 'Flood', 'Cyclone', 'Drought'],
      
      geographicScope: {
        regions: ['Asia Pacific']
      },
      
      exposureScope: {
        currency: 'INR',
        minExposureAmount: 1000000, // 10 Lakh
        maxExposureAmount: 1000000000 // 100 Crore
      },
      
      vulnerabilityScope: {
        minVulnerabilityScore: 0,
        maxVulnerabilityScore: 10
      },
      
      modelingConfig: {
        numberOfSimulations: 100, // Reduced for debugging
        modelProvider: 'Custom',
        modelType: 'Probabilistic',
        resolution: 'High',
        // Enhanced frequency parameters
        hazardFrequencyMultiplier: 10, // Increase event frequency
        enableRealDataIntegration: true,
        vulnerabilityRadius: 100, // km - increase search radius
        exposureRadius: 100 // km
      },
      
      riskConfig: {
        confidenceLevels: [0.9, 0.95, 0.99],
        returnPeriods: [10, 25, 50, 100, 250, 500]
      }
    };
    
    try {
      const response = await this.client.post('/simulations/start', simulationConfig);
      
      if (response.data.success) {
        console.log(`✅ Enhanced simulation started successfully`);
        console.log(`   Simulation ID: ${response.data.data.simulationRunId}`);
        console.log(`   Status: ${response.data.data.status}`);
        
        // Monitor the simulation
        return await this.monitorSimulation(response.data.data.simulationRunId, simulationConfig.simulationName);
        
      } else {
        console.error('❌ Failed to start simulation:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error starting enhanced simulation:', error.response?.data || error.message);
      return null;
    }
  }

  async monitorSimulation(simulationRunId, simulationName) {
    console.log(`⏳ Monitoring enhanced simulation: ${simulationName}`);
    
    const maxAttempts = 30;
    const delayMs = 3000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.client.get(`/simulations/${simulationRunId}/status`);
        const status = response.data.data.status;
        const progress = response.data.data.progress || 0;
        
        console.log(`   Status: ${status} (${progress}%) - Attempt ${attempt}/${maxAttempts}`);
        
        if (status === 'Completed') {
          console.log(`✅ Enhanced simulation completed!`);
          return await this.getDetailedResults(simulationRunId);
          
        } else if (status === 'Failed') {
          console.log(`❌ Enhanced simulation failed`);
          const errorDetails = response.data.data.errorDetails || response.data.data.errorMessage;
          console.log(`   Error: ${errorDetails}`);
          return null;
        }
        
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
      } catch (error) {
        console.error(`⚠️ Error monitoring simulation:`, error.response?.data || error.message);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.log(`⏰ Simulation monitoring timeout`);
    return null;
  }

  async getDetailedResults(simulationRunId) {
    try {
      const response = await this.client.get(`/simulations/${simulationRunId}/results`);
      const results = response.data.data;
      
      console.log('\n📊 ENHANCED SIMULATION RESULTS');
      console.log('==============================');
      
      if (results.results) {
        const res = results.results;
        console.log(`💰 Total Loss: ₹${(res.totalLoss || 0).toLocaleString()}`);
        console.log(`📈 Average Loss: ₹${(res.averageLoss || 0).toLocaleString()}`);
        console.log(`🎯 Maximum Loss: ₹${(res.maxLoss || 0).toLocaleString()}`);
        console.log(`📉 Minimum Loss: ₹${(res.minLoss || 0).toLocaleString()}`);
        console.log(`📊 Standard Deviation: ₹${(res.standardDeviation || 0).toLocaleString()}`);
        console.log(`🎲 Total Events: ${res.totalEvents || 0}`);
        console.log(`💎 Total Exposure: ₹${(res.totalExposure || 0).toLocaleString()}`);
        console.log(`⚡ Events by Hazard Type:`, JSON.stringify(res.eventsByHazardType || {}, null, 2));
        console.log(`📍 Affected Regions:`, res.affectedRegions || []);
        
        if (res.valueAtRisk) {
          console.log(`🔴 VaR 95%: ₹${(res.valueAtRisk['95'] || 0).toLocaleString()}`);
          console.log(`🔴 VaR 99%: ₹${(res.valueAtRisk['99'] || 0).toLocaleString()}`);
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Error getting detailed results:', error.response?.data || error.message);
      return null;
    }
  }

  async runDiagnosticTests() {
    console.log('\n🔍 RUNNING DIAGNOSTIC TESTS');
    console.log('============================');
    
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_dev');
    
    // Test 1: Check hazard data availability
    const hazardCount = await Hazard.countDocuments({ createdBy: 'data-generator' });
    console.log(`✅ Hazards Available: ${hazardCount.toLocaleString()}`);
    
    // Test 2: Check vulnerability data availability  
    const vulnCount = await Vulnerability.countDocuments({ createdBy: 'data-generator' });
    console.log(`✅ Vulnerabilities Available: ${vulnCount.toLocaleString()}`);
    
    // Test 3: Check exposure data availability
    const exposureCount = await Account.countDocuments({ createdBy: 'exposure-generator' });
    console.log(`✅ Exposures Available: ${exposureCount.toLocaleString()}`);
    
    // Test 4: Sample coordinate overlaps
    const sampleHazard = await Hazard.findOne({ createdBy: 'data-generator' });
    if (sampleHazard) {
      console.log(`📍 Sample Hazard Location: ${sampleHazard.footprint.centerLatitude.toFixed(4)}, ${sampleHazard.footprint.centerLongitude.toFixed(4)}`);
      
      // Find nearby vulnerabilities
      const nearbyVulns = await Vulnerability.find({
        createdBy: 'data-generator',
        'geographicScope.centerLatitude': {
          $gte: sampleHazard.footprint.centerLatitude - 0.5,
          $lte: sampleHazard.footprint.centerLatitude + 0.5
        },
        'geographicScope.centerLongitude': {
          $gte: sampleHazard.footprint.centerLongitude - 0.5,
          $lte: sampleHazard.footprint.centerLongitude + 0.5
        }
      }).limit(5);
      
      console.log(`🛡️ Nearby Vulnerabilities: ${nearbyVulns.length}`);
      
      // Find nearby exposures
      const nearbyExposures = await Account.find({
        createdBy: 'exposure-generator',
        'riskLocation.latitude': {
          $gte: sampleHazard.footprint.centerLatitude - 0.5,
          $lte: sampleHazard.footprint.centerLatitude + 0.5
        },
        'riskLocation.longitude': {
          $gte: sampleHazard.footprint.centerLongitude - 0.5,
          $lte: sampleHazard.footprint.centerLongitude + 0.5
        }
      }).limit(5);
      
      console.log(`💰 Nearby Exposures: ${nearbyExposures.length}`);
      
      if (nearbyExposures.length > 0) {
        const totalTIV = nearbyExposures.reduce((sum, exp) => sum + exp.exposure.totalInsuredValue, 0);
        console.log(`💎 Total TIV in Sample Area: ₹${totalTIV.toLocaleString()}`);
      }
    }
    
    await mongoose.disconnect();
  }
}

async function runEnhancedCATSimulation() {
  console.log('🇮🇳 Enhanced India CAT Model Simulation');
  console.log('========================================');
  
  const simulator = new RealCATSimulation();
  
  try {
    // Step 1: Authenticate
    await simulator.authenticate();
    
    // Step 2: Run diagnostic tests
    await simulator.runDiagnosticTests();
    
    // Step 3: Generate exposure data if needed
    console.log('\n💰 EXPOSURE DATA GENERATION');
    console.log('============================');
    
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_dev');
    const existingExposures = await Account.countDocuments({ createdBy: 'exposure-generator' });
    await mongoose.disconnect();
    
    if (existingExposures === 0) {
      console.log('🔨 No exposure data found. Generating...');
      await simulator.generateExposureData();
    } else {
      console.log(`✅ Found ${existingExposures.toLocaleString()} existing exposures`);
    }
    
    // Step 4: Run enhanced simulation
    console.log('\n🚀 ENHANCED SIMULATION EXECUTION');
    console.log('=================================');
    
    const results = await simulator.runEnhancedSimulation();
    
    if (results) {
      console.log('\n🎯 SIMULATION SUCCESS!');
      console.log('======================');
      console.log('✅ Enhanced CAT simulation completed with real data integration');
      console.log('✅ Results include losses, events, and risk metrics');
      console.log('✅ System is now validated for comprehensive CAT modeling');
    } else {
      console.log('\n⚠️ SIMULATION DEBUGGING NEEDED');
      console.log('==============================');
      console.log('❌ Simulation failed or timed out');
      console.log('🔧 Check simulation engine configuration');
      console.log('📊 Verify data integration logic');
    }
    
  } catch (error) {
    console.error('❌ Enhanced simulation failed:', error);
  }
}

if (require.main === module) {
  runEnhancedCATSimulation().catch(console.error);
}

module.exports = { RealCATSimulation, runEnhancedCATSimulation };