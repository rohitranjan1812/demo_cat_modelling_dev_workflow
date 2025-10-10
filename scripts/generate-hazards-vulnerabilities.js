/**
 * Generate Hazards and Vulnerabilities for India
 * 
 * This script creates realistic hazard and vulnerability data
 * to support the CAT simulation engine
 */

const mongoose = require('mongoose');

// Import models
const Hazard = require('../src/models/Hazard');
const Vulnerability = require('../src/models/Vulnerability');
const Account = require('../src/models/Account');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_dev';

class HazardVulnerabilityGenerator {
  constructor() {
    this.generatedCount = { hazards: 0, vulnerabilities: 0 };
  }

  async connectDB() {
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  }

  /**
   * Generate realistic hazards for India
   */
  async generateHazards() {
    console.log('📍 Generating hazards for India...');

    // Major seismic zones in India
    const seismicZones = [
      { name: 'Delhi-NCR', lat: 28.6139, lng: 77.2090, zone: 4, hazardTypes: ['Earthquake'] },
      { name: 'Uttarakhand', lat: 30.0668, lng: 79.0193, zone: 5, hazardTypes: ['Earthquake', 'Landslide'] },
      { name: 'Gujarat-Kutch', lat: 23.2599, lng: 69.6700, zone: 5, hazardTypes: ['Earthquake'] },
      { name: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, zone: 5, hazardTypes: ['Earthquake', 'Landslide'] },
      { name: 'Kashmir Valley', lat: 34.0837, lng: 74.7973, zone: 5, hazardTypes: ['Earthquake'] },
      { name: 'Northeast India', lat: 26.2006, lng: 92.9376, zone: 5, hazardTypes: ['Earthquake', 'Flood'] },
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777, zone: 3, hazardTypes: ['Earthquake', 'Flood', 'Cyclone'] },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, zone: 3, hazardTypes: ['Cyclone', 'Flood'] },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, zone: 3, hazardTypes: ['Cyclone', 'Flood'] },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, zone: 2, hazardTypes: ['Earthquake'] },
      { name: 'Bangalore', lat: 12.9716, lng: 77.5946, zone: 2, hazardTypes: ['Earthquake'] },
      { name: 'Pune', lat: 18.5204, lng: 73.8567, zone: 3, hazardTypes: ['Earthquake'] },
    ];

    // Flood-prone river basins
    const floodZones = [
      { name: 'Ganges Basin', lat: 25.5, lng: 85.0, severity: 'High', hazardTypes: ['Flood'] },
      { name: 'Brahmaputra Basin', lat: 26.0, lng: 91.5, severity: 'Very High', hazardTypes: ['Flood'] },
      { name: 'Godavari Basin', lat: 18.0, lng: 80.0, severity: 'Medium', hazardTypes: ['Flood'] },
      { name: 'Krishna Basin', lat: 16.5, lng: 76.0, severity: 'Medium', hazardTypes: ['Flood'] },
    ];

    // Cyclone-prone coastal areas
    const cycloneZones = [
      { name: 'Odisha Coast', lat: 19.8135, lng: 85.8312, severity: 'Very High', hazardTypes: ['Cyclone', 'Storm Surge'] },
      { name: 'Andhra Coast', lat: 16.5, lng: 81.0, severity: 'High', hazardTypes: ['Cyclone'] },
      { name: 'Tamil Nadu Coast', lat: 11.0, lng: 79.8, severity: 'High', hazardTypes: ['Cyclone'] },
      { name: 'West Bengal Coast', lat: 22.0, lng: 88.5, severity: 'High', hazardTypes: ['Cyclone'] },
      { name: 'Gujarat Coast', lat: 21.5, lng: 70.0, severity: 'Medium', hazardTypes: ['Cyclone'] },
    ];

    const allZones = [...seismicZones, ...floodZones, ...cycloneZones];
    const hazards = [];

    for (const zone of allZones) {
      for (const hazardType of zone.hazardTypes) {
        const hazardId = `HAZ-${Math.floor(10000000 + Math.random() * 90000000)}`;
        const severity = zone.severity || this.getSeverityFromZone(zone.zone);
        const returnPeriod = this.getReturnPeriod(hazardType, zone.zone || 3);
        
        const hazard = {
          hazardId: hazardId,
          hazardName: `${hazardType} - ${zone.name}`,
          hazardType: hazardType,
          hazardCategory: 'Natural',
          
          // Required: footprint
          footprint: {
            centerLatitude: zone.lat,
            centerLongitude: zone.lng,
            radius: this.getRadiusForHazard(hazardType, zone.zone || 3),
            unit: 'km'
          },
          
          // Required: temporal
          temporal: {
            startTime: new Date('2024-01-01'),
            endTime: new Date('2025-12-31'),
            duration: 24,
            durationUnit: 'hours'
          },
          
          // Required: severity (enum value)
          severity: this.getSeverityEnum(severity),
          
          // Required: probability
          probability: this.getProbability(hazardType, zone.zone || 3),
          
          returnPeriod: returnPeriod,
          returnPeriodUnit: 'years',
          
          // Intensities array
          intensities: [{
            scale: this.getIntensityScale(hazardType),
            value: this.getIntensity(hazardType, zone.zone || 3),
            unit: this.getIntensityUnit(hazardType)
          }],
          
          // Economic impact
          economicImpact: [{
            impactType: 'Direct',
            estimatedLoss: 1000000 * (zone.zone || 3),
            currency: 'USD',
            confidence: 0.7
          }],
          
          affectedRegions: ['Asia Pacific'],
          affectedCountries: ['India'],
          
          dataSource: 'India Meteorological Department',
          dataQuality: 'High',
          confidence: 0.85,
          isHistorical: false,
          isPredicted: true,
          createdBy: 'system',
          lastModifiedBy: 'system'
        };

        hazards.push(hazard);
      }
    }

    // Insert hazards
    await Hazard.insertMany(hazards);
    this.generatedCount.hazards = hazards.length;
    console.log(`✅ Generated ${hazards.length} hazards`);

    return hazards;
  }

  /**
   * Generate vulnerabilities for accounts
   */
  async generateVulnerabilities() {
    console.log('\n🏗️  Generating vulnerabilities for accounts...');

    // Get accounts directly from collection to avoid model issues
    const accounts = await mongoose.connection.db.collection('accounts').find({}).limit(5000).toArray();
    console.log(`Found ${accounts.length} accounts`);

    if (accounts.length === 0) {
      console.log('⚠️  No accounts found - skipping vulnerability generation');
      return [];
    }

    const vulnerabilities = [];
    const hazardTypes = ['Earthquake', 'Flood', 'Cyclone', 'Landslide', 'Storm Surge'];

    for (const account of accounts) {
      // Create vulnerability for each major hazard type
      for (const hazardType of hazardTypes) {
        const vuln = {
          vulnerabilityId: `VULN-${account.accountId}-${hazardType.substring(0, 3).toUpperCase()}`,
          accountId: account.accountId,
          hazardType: hazardType,
          vulnerabilityScore: this.calculateVulnerabilityScore(account, hazardType),
          vulnerabilityRating: 'Medium',
          centerLatitude: account.location?.latitude || 20.5937,
          centerLongitude: account.location?.longitude || 78.9629,
          structuralVulnerability: this.getStructuralVulnerability(account.occupancyType, account.constructionType),
          nonStructuralVulnerability: this.getNonStructuralVulnerability(account.occupancyType),
          contentsVulnerability: this.getContentsVulnerability(account.occupancyType),
          foundationType: account.constructionType || 'Unknown',
          foundationQuality: 'Average',
          buildingAge: account.yearBuilt ? 2024 - account.yearBuilt : 20,
          buildingCondition: 'Good',
          retrofittingStatus: 'None',
          exposureAtRisk: account.totalInsuredValue,
          currency: account.currency || 'USD',
          dataSource: 'Account Data',
          dataQuality: 'Medium',
          confidence: 0.75,
          isHistorical: false,
          isPredicted: true,
          createdBy: 'system',
          lastModifiedBy: 'system'
        };

        vulnerabilities.push(vuln);
      }
    }

    console.log(`Preparing to insert ${vulnerabilities.length} vulnerabilities...`);

    // Insert in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < vulnerabilities.length; i += batchSize) {
      const batch = vulnerabilities.slice(i, i + batchSize);
      await Vulnerability.insertMany(batch);
      console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vulnerabilities.length / batchSize)}`);
    }

    this.generatedCount.vulnerabilities = vulnerabilities.length;
    console.log(`✅ Generated ${vulnerabilities.length} vulnerabilities`);

    return vulnerabilities;
  }

  // Helper methods
  getSeverityFromZone(zone) {
    if (zone === 5) return 'Very High';
    if (zone === 4) return 'High';
    if (zone === 3) return 'Medium';
    if (zone === 2) return 'Low';
    return 'Very Low';
  }

  getSeverityEnum(severity) {
    // Map to valid enum values: Minor, Moderate, Major, Severe, Catastrophic, Extreme
    if (severity === 'Very High') return 'Extreme';
    if (severity === 'High') return 'Severe';
    if (severity === 'Medium') return 'Major';
    if (severity === 'Low') return 'Moderate';
    if (severity === 'Very Low') return 'Minor';
    return 'Major';
  }

  getIntensityUnit(hazardType) {
    if (hazardType === 'Earthquake') return 'Magnitude';
    if (['Cyclone', 'Hurricane', 'Typhoon'].includes(hazardType)) return 'Category';
    if (hazardType === 'Tornado') return 'Scale';
    return 'Custom';
  }

  getRadiusForHazard(hazardType, zone) {
    if (hazardType === 'Earthquake') return zone * 50;
    if (hazardType === 'Cyclone') return 200;
    if (hazardType === 'Flood') return 100;
    if (hazardType === 'Landslide') return 30;
    return 50;
  }

  getReturnPeriod(hazardType, zone) {
    if (hazardType === 'Earthquake') return zone === 5 ? 50 : zone === 4 ? 100 : 200;
    if (hazardType === 'Cyclone') return 25;
    if (hazardType === 'Flood') return 10;
    return 50;
  }

  getProbability(hazardType, zone) {
    const returnPeriod = this.getReturnPeriod(hazardType, zone);
    return 1 / returnPeriod;
  }

  getIntensity(hazardType, zone) {
    if (hazardType === 'Earthquake') return zone * 1.5 + Math.random();
    if (hazardType === 'Cyclone') return 3 + Math.random() * 2;
    if (hazardType === 'Flood') return 2 + Math.random() * 2;
    return 3;
  }

  getIntensityScale(hazardType) {
    if (hazardType === 'Earthquake') return 'Richter';
    if (hazardType === 'Cyclone') return 'Saffir-Simpson';
    if (hazardType === 'Flood') return 'Custom';
    return 'Custom';
  }

  getPGA(zone) {
    return zone * 0.08; // Peak Ground Acceleration in g
  }

  getWindSpeed(severity) {
    if (severity === 'Very High') return 200;
    if (severity === 'High') return 150;
    if (severity === 'Medium') return 100;
    return 80;
  }

  getPrecipitation(severity) {
    if (severity === 'Very High') return 300;
    if (severity === 'High') return 200;
    if (severity === 'Medium') return 150;
    return 100;
  }

  calculateVulnerabilityScore(account, hazardType) {
    let baseScore = 5.0;

    // Adjust based on construction type
    const constructionType = account.constructionType || 'Unknown';
    if (constructionType.includes('Concrete') || constructionType.includes('Steel')) {
      baseScore -= 1.5;
    } else if (constructionType.includes('Wood') || constructionType.includes('Masonry')) {
      baseScore += 1.0;
    }

    // Adjust based on occupancy
    const occupancyType = account.occupancyType || 'Unknown';
    if (occupancyType.includes('Residential')) {
      baseScore += 0.5;
    } else if (occupancyType.includes('Commercial') || occupancyType.includes('Industrial')) {
      baseScore -= 0.5;
    }

    // Adjust based on year built
    if (account.yearBuilt) {
      const age = 2024 - account.yearBuilt;
      if (age > 50) baseScore += 1.5;
      else if (age > 30) baseScore += 1.0;
      else if (age < 10) baseScore -= 1.0;
    }

    // Hazard-specific adjustments
    if (hazardType === 'Earthquake') {
      // Higher risk for unreinforced structures
      if (!constructionType.includes('Reinforced')) baseScore += 1.0;
    } else if (hazardType === 'Flood') {
      // Higher risk for ground floor properties
      if (account.numberOfStories === 1) baseScore += 1.5;
    } else if (hazardType === 'Cyclone') {
      // Higher risk for coastal properties
      baseScore += 0.5;
    }

    // Keep score between 1 and 10
    return Math.max(1, Math.min(10, baseScore));
  }

  getStructuralVulnerability(occupancyType, constructionType) {
    if (constructionType?.includes('Concrete') || constructionType?.includes('Steel')) {
      return 3.0;
    }
    if (constructionType?.includes('Wood')) {
      return 6.0;
    }
    if (constructionType?.includes('Masonry')) {
      return 5.0;
    }
    return 5.0;
  }

  getNonStructuralVulnerability(occupancyType) {
    if (occupancyType?.includes('Residential')) return 4.0;
    if (occupancyType?.includes('Commercial')) return 5.0;
    if (occupancyType?.includes('Industrial')) return 6.0;
    return 4.5;
  }

  getContentsVulnerability(occupancyType) {
    if (occupancyType?.includes('Residential')) return 5.0;
    if (occupancyType?.includes('Commercial')) return 6.0;
    if (occupancyType?.includes('Industrial')) return 4.0;
    return 5.0;
  }

  async run() {
    try {
      await this.connectDB();

      console.log('🎯 Starting hazard and vulnerability generation...\n');
      console.log('='.repeat(60));

      // Generate hazards
      await this.generateHazards();

      // Generate vulnerabilities
      await this.generateVulnerabilities();

      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('📊 GENERATION SUMMARY');
      console.log('='.repeat(60));
      console.log(`✅ Hazards generated: ${this.generatedCount.hazards}`);
      console.log(`✅ Vulnerabilities generated: ${this.generatedCount.vulnerabilities}`);
      console.log('='.repeat(60));

      console.log('\n✅ Data generation complete!');
      console.log('\n📝 Next steps:');
      console.log('1. Run simulations again - they should now complete successfully');
      console.log('2. You should see events, losses, and proper statistics');
      console.log('3. Check frontend for realistic simulation results\n');

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

// Run the generator
const generator = new HazardVulnerabilityGenerator();
generator.run();
