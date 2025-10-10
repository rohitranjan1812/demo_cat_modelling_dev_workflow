/**
 * Generate Realistic Exposure Accounts for CAT Modeling
 * 
 * Creates 5,000-10,000 accounts with exposures at hazard locations across India
 * This enables realistic loss calculations and populates the UI with account data
 * 
 * Features:
 * - Geographic distribution matching India hazard locations
 * - Realistic insured values (₹10L to ₹50Cr)
 * - Property types: Residential, Commercial, Industrial, Infrastructure
 * - Links to nearby vulnerabilities for loss calculations
 * - Proper risk profiles based on hazard exposure
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('../src/models/Account');
const Hazard = require('../src/models/Hazard');
const Vulnerability = require('../src/models/Vulnerability');

// India-specific property types and characteristics
const PROPERTY_TYPES = {
  Residential: {
    avgValue: { min: 1000000, max: 50000000 }, // ₹10L to ₹5Cr
    occupancyTypes: ['Single Family', 'Multi Family', 'Apartment', 'Villa', 'Rowhouse'],
    constructionTypes: ['Concrete', 'Brick', 'Wood Frame', 'Steel Frame', 'Mixed'],
    vulnerabilityMultiplier: 1.0
  },
  Commercial: {
    avgValue: { min: 5000000, max: 200000000 }, // ₹50L to ₹20Cr
    occupancyTypes: ['Office', 'Retail', 'Restaurant', 'Hotel', 'Mall', 'Warehouse'],
    constructionTypes: ['Concrete', 'Steel Frame', 'Mixed', 'High Rise'],
    vulnerabilityMultiplier: 1.2
  },
  Industrial: {
    avgValue: { min: 10000000, max: 500000000 }, // ₹1Cr to ₹50Cr
    occupancyTypes: ['Manufacturing', 'Processing', 'Refinery', 'Power Plant', 'Factory'],
    constructionTypes: ['Steel Frame', 'Concrete', 'Pre-Engineered', 'Heavy Industrial'],
    vulnerabilityMultiplier: 1.5
  },
  Infrastructure: {
    avgValue: { min: 50000000, max: 1000000000 }, // ₹5Cr to ₹100Cr
    occupancyTypes: ['Bridge', 'Road', 'Railway', 'Airport', 'Port', 'Dam', 'Power Grid'],
    constructionTypes: ['Concrete', 'Steel', 'Composite', 'Earthen'],
    vulnerabilityMultiplier: 2.0
  }
};

// India states for geographic distribution
const INDIA_STATES = [
  'Maharashtra', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Madhya Pradesh',
  'Tamil Nadu', 'Rajasthan', 'Karnataka', 'Gujarat', 'Andhra Pradesh',
  'Odisha', 'Telangana', 'Kerala', 'Jharkhand', 'Assam',
  'Punjab', 'Chhattisgarh', 'Haryana', 'Delhi', 'Jammu and Kashmir',
  'Uttarakhand', 'Himachal Pradesh', 'Tripura', 'Meghalaya', 'Manipur'
];

class ExposureAccountGenerator {
  constructor() {
    this.accountCounter = 100000; // Start from ACC-100000
    this.generatedAccounts = [];
  }

  /**
   * Generate a unique account ID
   */
  generateAccountId() {
    this.accountCounter++;
    return `ACC-${String(this.accountCounter).padStart(6, '0')}`;
  }

  /**
   * Calculate risk level based on hazard proximity and count
   */
  calculateRiskLevel(nearbyHazards) {
    const hazardCount = nearbyHazards.length;
    const highSeverityCount = nearbyHazards.filter(h => 
      h.hazardMetrics?.severity === 'Extreme' || h.hazardMetrics?.severity === 'High'
    ).length;

    if (highSeverityCount >= 3 || hazardCount >= 5) return 'Very High';
    if (highSeverityCount >= 2 || hazardCount >= 4) return 'High';
    if (highSeverityCount >= 1 || hazardCount >= 2) return 'Medium';
    return 'Low';
  }

  /**
   * Generate hazard risk profile for account
   */
  generateHazardRiskProfile(nearbyHazards) {
    const hazardTypeCounts = {};
    nearbyHazards.forEach(h => {
      hazardTypeCounts[h.hazardType] = (hazardTypeCounts[h.hazardType] || 0) + 1;
    });

    const primaryHazards = Object.entries(hazardTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hazardType, count]) => {
        const hazards = nearbyHazards.filter(h => h.hazardType === hazardType);
        const avgSeverity = hazards.reduce((sum, h) => {
          const severityMap = { 'Low': 1, 'Moderate': 2, 'High': 3, 'Very High': 4, 'Extreme': 5 };
          return sum + (severityMap[h.hazardMetrics?.severity] || 2);
        }, 0) / hazards.length;

        let riskLevel = 'Medium';
        if (avgSeverity >= 4) riskLevel = 'Extreme';
        else if (avgSeverity >= 3) riskLevel = 'Very High';
        else if (avgSeverity >= 2) riskLevel = 'High';
        else if (avgSeverity >= 1.5) riskLevel = 'Medium';
        else riskLevel = 'Low';

        return {
          hazardType,
          riskLevel,
          exposureAmount: Math.random() * 10000000 + 1000000,
          lastAssessed: new Date()
        };
      });

    return {
      overallRiskLevel: this.calculateRiskLevel(nearbyHazards),
      primaryHazards,
      lastRiskAssessment: new Date(),
      riskAssessmentMethod: 'Model'
    };
  }

  /**
   * Generate a single account at a hazard location
   */
  async generateAccountAtLocation(hazard, nearbyHazards, propertyType) {
    const typeConfig = PROPERTY_TYPES[propertyType];
    
    // Generate insured value with realistic distribution
    const baseValue = typeConfig.avgValue.min + 
      Math.random() * (typeConfig.avgValue.max - typeConfig.avgValue.min);
    const totalExposure = Math.floor(baseValue * (0.8 + Math.random() * 0.4));

    // Add small random offset to location (within 10km)
    const latOffset = (Math.random() - 0.5) * 0.1; // ~10km
    const lonOffset = (Math.random() - 0.5) * 0.1;

    const accountData = {
      accountId: this.generateAccountId(),
      accountName: `${propertyType} Property - ${hazard.hazardLocation?.state || 'India'}`,
      accountType: 'Primary',
      accountLevel: 1,
      totalExposure: totalExposure,
      currency: 'USD', // USD equivalent for international comparison
      regions: ['Asia Pacific'],
      riskProfile: this.calculateRiskLevel(nearbyHazards),
      hazardRiskProfile: this.generateHazardRiskProfile(nearbyHazards),
      status: 'Active',
      effectiveDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-12-31'),
      createdBy: 'exposure-generator',
      lastModifiedBy: 'exposure-generator',
      metadata: {
        generatedAt: new Date().toISOString(),
        hazardLocationLat: hazard.footprint?.centerLatitude || 0,
        hazardLocationLon: hazard.footprint?.centerLongitude || 0,
        nearbyHazardCount: nearbyHazards.length,
        primaryHazardType: hazard.hazardType,
        propertyType: propertyType,
        occupancyType: typeConfig.occupancyTypes[Math.floor(Math.random() * typeConfig.occupancyTypes.length)],
        constructionType: typeConfig.constructionTypes[Math.floor(Math.random() * typeConfig.constructionTypes.length)],
        state: hazard.hazardLocation?.state || INDIA_STATES[Math.floor(Math.random() * INDIA_STATES.length)],
        city: hazard.hazardLocation?.city || 'Unknown',
        exposureLat: (hazard.footprint?.centerLatitude || 0) + latOffset,
        exposureLon: (hazard.footprint?.centerLongitude || 0) + lonOffset
      }
    };

    return accountData;
  }

  /**
   * Main generation function
   */
  async generateAccounts(targetCount = 5000) {
    console.log(`\n🏭 EXPOSURE ACCOUNT GENERATOR`);
    console.log(`=============================`);
    console.log(`Target: ${targetCount.toLocaleString()} accounts\n`);

    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat-modeling-dev');
      console.log('✅ Connected to MongoDB\n');

      // Get all hazards
      console.log('📊 Fetching hazard data...');
      const hazards = await Hazard.find({ 
        createdBy: 'data-generator',
        status: 'Active'
      }).limit(2000); // Use 2000 hazards for distribution

      console.log(`✅ Found ${hazards.length.toLocaleString()} hazards\n`);

      if (hazards.length === 0) {
        throw new Error('No hazards found! Run generate-india-exposure-data.js first');
      }

      // Property type distribution (realistic mix)
      const propertyDistribution = {
        Residential: 0.60,    // 60% residential
        Commercial: 0.25,     // 25% commercial
        Industrial: 0.10,     // 10% industrial
        Infrastructure: 0.05  // 5% infrastructure
      };

      const accountsToGenerate = [];
      let generatedCount = 0;
      const batchSize = 500;

      console.log('🏗️  Generating accounts...\n');
      
      for (let i = 0; i < targetCount; i++) {
        // Select random hazard location
        const primaryHazard = hazards[Math.floor(Math.random() * hazards.length)];
        
        // Find nearby hazards (within 50km)
        const lat = primaryHazard.footprint?.centerLatitude || 0;
        const lon = primaryHazard.footprint?.centerLongitude || 0;
        const nearbyHazards = hazards.filter(h => {
          const hLat = h.footprint?.centerLatitude || 0;
          const hLon = h.footprint?.centerLongitude || 0;
          const distance = Math.sqrt(Math.pow(lat - hLat, 2) + Math.pow(lon - hLon, 2)) * 111; // Approx km
          return distance <= 50;
        }).slice(0, 5); // Max 5 nearby hazards

        // Determine property type based on distribution
        const rand = Math.random();
        let propertyType = 'Residential';
        let cumulative = 0;
        for (const [type, probability] of Object.entries(propertyDistribution)) {
          cumulative += probability;
          if (rand <= cumulative) {
            propertyType = type;
            break;
          }
        }

        const account = await this.generateAccountAtLocation(primaryHazard, nearbyHazards, propertyType);
        accountsToGenerate.push(account);
        generatedCount++;

        // Batch insert
        if (accountsToGenerate.length >= batchSize) {
          await Account.insertMany(accountsToGenerate);
          console.log(`  ✅ Inserted ${generatedCount.toLocaleString()} / ${targetCount.toLocaleString()} accounts`);
          accountsToGenerate.length = 0; // Clear array
        }

        // Progress indicator
        if (generatedCount % 1000 === 0) {
          const totalExposure = await Account.aggregate([
            { $match: { createdBy: 'exposure-generator' } },
            { $group: { _id: null, total: { $sum: '$totalExposure' } } }
          ]);
          console.log(`  📊 Progress: ${generatedCount.toLocaleString()} accounts, Total Exposure: $${(totalExposure[0]?.total / 1000000000).toFixed(2)}B`);
        }
      }

      // Insert remaining accounts
      if (accountsToGenerate.length > 0) {
        await Account.insertMany(accountsToGenerate);
        console.log(`  ✅ Inserted final ${accountsToGenerate.length} accounts`);
      }

      // Generate summary statistics
      console.log(`\n📊 GENERATION SUMMARY`);
      console.log(`===================`);

      const stats = await Account.aggregate([
        { $match: { createdBy: 'exposure-generator' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalExposure: { $sum: '$totalExposure' },
            avgExposure: { $avg: '$totalExposure' },
            minExposure: { $min: '$totalExposure' },
            maxExposure: { $max: '$totalExposure' }
          }
        }
      ]);

      const typeStats = await Account.aggregate([
        { $match: { createdBy: 'exposure-generator' } },
        {
          $group: {
            _id: '$metadata.propertyType',
            count: { $sum: 1 },
            totalExposure: { $sum: '$totalExposure' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const riskStats = await Account.aggregate([
        { $match: { createdBy: 'exposure-generator' } },
        {
          $group: {
            _id: '$riskProfile',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      console.log(`\n✅ Total Accounts: ${stats[0].count.toLocaleString()}`);
      console.log(`💰 Total Exposure: $${(stats[0].totalExposure / 1000000000).toFixed(2)}B`);
      console.log(`📊 Average Exposure: $${(stats[0].avgExposure / 1000000).toFixed(2)}M`);
      console.log(`📉 Min Exposure: $${(stats[0].minExposure / 1000000).toFixed(2)}M`);
      console.log(`📈 Max Exposure: $${(stats[0].maxExposure / 1000000).toFixed(2)}M`);

      console.log(`\n📦 By Property Type:`);
      typeStats.forEach(stat => {
        console.log(`  ${stat._id}: ${stat.count.toLocaleString()} (${((stat.count / stats[0].count) * 100).toFixed(1)}%) - $${(stat.totalExposure / 1000000000).toFixed(2)}B`);
      });

      console.log(`\n⚠️  By Risk Profile:`);
      riskStats.forEach(stat => {
        console.log(`  ${stat._id}: ${stat.count.toLocaleString()} (${((stat.count / stats[0].count) * 100).toFixed(1)}%)`);
      });

      console.log(`\n✅ ACCOUNT GENERATION COMPLETE!`);
      console.log(`🎯 Accounts are now visible in the UI`);
      console.log(`💵 Realistic losses will now be calculated in simulations\n`);

    } catch (error) {
      console.error('❌ Error generating accounts:', error);
      throw error;
    } finally {
      await mongoose.disconnect();
    }
  }
}

// Run the generator
if (require.main === module) {
  const targetCount = parseInt(process.argv[2]) || 5000;
  
  const generator = new ExposureAccountGenerator();
  generator.generateAccounts(targetCount)
    .then(() => {
      console.log('✅ Generation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Generation failed:', error);
      process.exit(1);
    });
}

module.exports = ExposureAccountGenerator;
