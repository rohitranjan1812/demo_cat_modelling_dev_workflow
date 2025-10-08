/**
 * India CAT Modeling Data Generator
 * Generates 10,000 random coordinates across India with realistic hazard and vulnerability data
 * 
 * Author: GitHub Copilot
 * Date: October 8, 2025
 */

const mongoose = require('mongoose');
const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');

// India geographic boundaries
const INDIA_BOUNDS = {
  north: 37.0841,
  south: 6.7479,
  east: 97.3956,
  west: 68.1097
};

// Indian states and regions for realistic data
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Ladakh'
];

const HAZARD_TYPES = [
  'Earthquake', 'Flood', 'Cyclone', 'Drought', 'Landslide', 
  'Heat Wave', 'Cold Wave', 'Hailstorm', 'Wildfire'
];

const HAZARD_CATEGORIES = ['Natural', 'Man-made', 'Emerging', 'Compound', 'Cascading'];
const SEVERITY_LEVELS = ['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic', 'Extreme'];
const VULNERABILITY_CATEGORIES = ['Individual', 'Community', 'Regional', 'National'];
const VULNERABILITY_TYPES = ['Physical', 'Social', 'Economic', 'Environmental', 'Infrastructure'];
const RISK_LEVELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const CONFIDENCE_LEVELS = ['Low', 'Medium', 'High', 'Very High'];

/**
 * Generate random coordinate within India bounds
 */
function generateRandomCoordinate() {
  const lat = Math.random() * (INDIA_BOUNDS.north - INDIA_BOUNDS.south) + INDIA_BOUNDS.south;
  const lon = Math.random() * (INDIA_BOUNDS.east - INDIA_BOUNDS.west) + INDIA_BOUNDS.west;
  return { lat: parseFloat(lat.toFixed(6)), lon: parseFloat(lon.toFixed(6)) };
}

/**
 * Get random element from array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random number within range
 */
function randomFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

/**
 * Generate random integer within range
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate realistic hazard distribution based on geography
 */
function getRegionalHazardDistribution(lat, lon) {
  const hazards = [];
  
  // Earthquake zones (higher in Himalayas and Western India)
  if (lat > 28 || (lon < 75 && lat > 20)) {
    hazards.push({ type: 'Earthquake', weight: 0.7 });
  } else {
    hazards.push({ type: 'Earthquake', weight: 0.3 });
  }
  
  // Cyclones (coastal areas, especially east coast)
  if ((lon > 82 && lat < 22) || (lon < 73 && lat < 20)) {
    hazards.push({ type: 'Cyclone', weight: 0.8 });
  } else {
    hazards.push({ type: 'Cyclone', weight: 0.1 });
  }
  
  // Floods (river basins and coastal areas)
  if (lat > 22 && lat < 32 && lon > 75 && lon < 90) {
    hazards.push({ type: 'Flood', weight: 0.9 });
  } else {
    hazards.push({ type: 'Flood', weight: 0.4 });
  }
  
  // Droughts (western and central India)
  if (lon < 80 && lat > 15 && lat < 28) {
    hazards.push({ type: 'Drought', weight: 0.8 });
  } else {
    hazards.push({ type: 'Drought', weight: 0.3 });
  }
  
  // Landslides (hilly regions)
  if (lat > 26 || (lat > 10 && lat < 15 && lon > 75)) {
    hazards.push({ type: 'Landslide', weight: 0.6 });
  }
  
  // Heat waves (inland areas)
  if (lon > 74 && lon < 88 && lat > 18 && lat < 30) {
    hazards.push({ type: 'Heat Wave', weight: 0.7 });
  }
  
  return hazards;
}

/**
 * Generate hazard data for a coordinate
 */
function generateHazardData(lat, lon, index) {
  const regionalHazards = getRegionalHazardDistribution(lat, lon);
  const selectedHazard = getRandomElement(regionalHazards);
  
  const hazardType = selectedHazard.type;
  const baseIntensity = selectedHazard.weight * 10;
  const startTime = new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000)); // Random time in past year
  
  return {
    hazardId: `HAZ-${String(index + 1).padStart(8, '0')}`,
    hazardName: `${hazardType} Event - Location ${index + 1}`,
    hazardType: hazardType,
    hazardCategory: getRandomElement(HAZARD_CATEGORIES),
    intensities: [{
      scale: hazardType === 'Earthquake' ? 'Richter' : 'Custom',
      value: randomFloat(1, 10),
      unit: hazardType === 'Earthquake' ? 'Magnitude' : 
            hazardType === 'Cyclone' ? 'km/h' :
            hazardType === 'Flood' ? 'Scale' : 'Scale',
      description: `${hazardType} intensity measurement`
    }],
    footprint: {
      centerLatitude: lat,
      centerLongitude: lon,
      radius: randomFloat(5, 50),
      unit: 'km',
      affectedArea: randomFloat(10, 1000),
      areaUnit: 'km2'
    },
    temporal: {
      startTime: startTime,
      endTime: new Date(startTime.getTime() + randomInt(1, 72) * 60 * 60 * 1000), // 1-72 hours duration
      duration: randomInt(1, 72),
      durationUnit: 'hours'
    },
    severity: getRandomElement(SEVERITY_LEVELS),
    probability: randomFloat(0.01, 0.8),
    returnPeriod: randomInt(5, 100),
    returnPeriodUnit: 'years',
    overallRiskScore: randomFloat(1, 10),
    confidenceScore: randomFloat(0.5, 1.0),
    status: 'Active',
    createdBy: 'data-generator',
    lastModifiedBy: 'data-generator'
  };
}

/**
 * Generate vulnerability data for a coordinate
 */
function generateVulnerabilityData(lat, lon, index) {
  const vulnerabilityType = getRandomElement(VULNERABILITY_TYPES);
  const vulnerabilityCategory = getRandomElement(VULNERABILITY_CATEGORIES);
  
  return {
    vulnerabilityId: `VUL-${String(index + 1).padStart(8, '0')}`,
    vulnerabilityName: `${vulnerabilityType} Vulnerability - Location ${index + 1}`,
    vulnerabilityDescription: `${vulnerabilityType} vulnerability assessment for coordinates ${lat}, ${lon}`,
    vulnerabilityType: vulnerabilityType,
    vulnerabilityCategory: vulnerabilityCategory,
    geographicScope: {
      centerLatitude: lat,
      centerLongitude: lon,
      radius: randomFloat(2, 25),
      radiusUnit: 'km',
      administrativeLevel: getRandomElement(['Municipal', 'Local', 'County/District']),
      country: 'India',
      state: getRandomElement(INDIAN_STATES),
      region: 'Asia Pacific'
    },
    overallVulnerabilityScore: randomFloat(1, 10),
    overallRiskLevel: getRandomElement(RISK_LEVELS),
    confidenceLevel: getRandomElement(CONFIDENCE_LEVELS),
    vulnerabilityFactors: [
      {
        factorType: vulnerabilityType,
        factorName: `${vulnerabilityType} Risk Factor`,
        factorValue: randomFloat(1, 10),
        weight: 1.0, // Must sum to 1.0 for single factor
        description: `Primary ${vulnerabilityType.toLowerCase()} vulnerability factor`
      }
    ],
    status: 'Active',
    createdBy: 'data-generator',
    lastModifiedBy: 'data-generator'
  };
}

/**
 * Generate batch of coordinates and associated data
 */
function generateDataBatch(startIndex, batchSize) {
  const hazards = [];
  const vulnerabilities = [];
  
  for (let i = 0; i < batchSize; i++) {
    const coordinate = generateRandomCoordinate();
    const index = startIndex + i;
    
    // Generate hazard data
    const hazardData = generateHazardData(coordinate.lat, coordinate.lon, index);
    hazards.push(hazardData);
    
    // Generate vulnerability data (sometimes multiple per location)
    const vulnCount = Math.random() < 0.3 ? 2 : 1; // 30% chance of 2 vulnerabilities per location
    
    for (let v = 0; v < vulnCount; v++) {
      const vulnIndex = index * 2 + v; // Ensure unique vulnerability IDs
      const vulnerabilityData = generateVulnerabilityData(coordinate.lat, coordinate.lon, vulnIndex);
      vulnerabilities.push(vulnerabilityData);
    }
    
    if ((i + 1) % 100 === 0) {
      console.log(`Generated data for ${i + 1}/${batchSize} coordinates in current batch`);
    }
  }
  
  return { hazards, vulnerabilities };
}

/**
 * Insert data in batches to avoid memory issues
 */
async function insertDataBatch(hazards, vulnerabilities, batchNumber) {
  try {
    console.log(`Inserting batch ${batchNumber}: ${hazards.length} hazards, ${vulnerabilities.length} vulnerabilities`);
    
    // Insert hazards
    const insertedHazards = await Hazard.insertMany(hazards, { ordered: false });
    console.log(`✅ Inserted ${insertedHazards.length} hazards`);
    
    // Insert vulnerabilities
    const insertedVulnerabilities = await Vulnerability.insertMany(vulnerabilities, { ordered: false });
    console.log(`✅ Inserted ${insertedVulnerabilities.length} vulnerabilities`);
    
    return {
      hazards: insertedHazards.length,
      vulnerabilities: insertedVulnerabilities.length
    };
  } catch (error) {
    console.error(`❌ Error inserting batch ${batchNumber}:`, error.message);
    
    // Try to insert individually if batch fails
    let hazardCount = 0;
    let vulnCount = 0;
    
    for (const hazard of hazards) {
      try {
        await new Hazard(hazard).save();
        hazardCount++;
      } catch (err) {
        console.error(`Failed to insert hazard: ${err.message}`);
      }
    }
    
    for (const vulnerability of vulnerabilities) {
      try {
        await new Vulnerability(vulnerability).save();
        vulnCount++;
      } catch (err) {
        console.error(`Failed to insert vulnerability: ${err.message}`);
      }
    }
    
    return { hazards: hazardCount, vulnerabilities: vulnCount };
  }
}

/**
 * Main data generation function
 */
async function generateIndiaCAGData() {
  console.log('🇮🇳 Starting India CAT Modeling Data Generation');
  console.log('================================================');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_dev');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data (optional - comment out to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await Hazard.deleteMany({ createdBy: 'data-generator' });
    await Vulnerability.deleteMany({ createdBy: 'data-generator' });
    console.log('✅ Cleared existing generated data');
    
    const totalCoordinates = 10000;
    const batchSize = 500; // Process in batches to avoid memory issues
    const totalBatches = Math.ceil(totalCoordinates / batchSize);
    
    let totalHazards = 0;
    let totalVulnerabilities = 0;
    
    console.log(`🎯 Generating data for ${totalCoordinates} coordinates across India`);
    console.log(`📦 Processing in ${totalBatches} batches of ${batchSize} coordinates each`);
    console.log('');
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const startIndex = batch * batchSize;
      const currentBatchSize = Math.min(batchSize, totalCoordinates - startIndex);
      
      console.log(`🔄 Processing batch ${batch + 1}/${totalBatches} (coordinates ${startIndex + 1}-${startIndex + currentBatchSize})`);
      
      // Generate data for current batch
      const batchData = generateDataBatch(startIndex, currentBatchSize);
      
      // Insert data to database
      const insertResult = await insertDataBatch(batchData.hazards, batchData.vulnerabilities, batch + 1);
      
      totalHazards += insertResult.hazards;
      totalVulnerabilities += insertResult.vulnerabilities;
      
      console.log(`✅ Batch ${batch + 1} complete. Running totals: ${totalHazards} hazards, ${totalVulnerabilities} vulnerabilities`);
      console.log('');
      
      // Brief pause between batches to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 Data Generation Complete!');
    console.log('============================');
    console.log(`📊 Final Results:`);
    console.log(`   • Total Coordinates: ${totalCoordinates}`);
    console.log(`   • Total Hazards: ${totalHazards}`);
    console.log(`   • Total Vulnerabilities: ${totalVulnerabilities}`);
    console.log(`   • Geographic Coverage: All of India (${INDIA_BOUNDS.south}°N to ${INDIA_BOUNDS.north}°N, ${INDIA_BOUNDS.west}°E to ${INDIA_BOUNDS.east}°E)`);
    console.log(`   • States Covered: ${INDIAN_STATES.length} states/territories`);
    console.log(`   • Hazard Types: ${HAZARD_TYPES.length} different types`);
    console.log('');
    
    // Verification queries
    console.log('🔍 Verification Queries:');
    const hazardCount = await Hazard.countDocuments({ createdBy: 'data-generator' });
    const vulnCount = await Vulnerability.countDocuments({ createdBy: 'data-generator' });
    const hazardTypes = await Hazard.distinct('hazardType', { createdBy: 'data-generator' });
    const vulnTypes = await Vulnerability.distinct('vulnerabilityType', { createdBy: 'data-generator' });
    const states = await Hazard.distinct('geographicScope.state', { createdBy: 'data-generator' });
    
    console.log(`   • Database Hazard Count: ${hazardCount}`);
    console.log(`   • Database Vulnerability Count: ${vulnCount}`);
    console.log(`   • Unique Hazard Types: ${hazardTypes.length} (${hazardTypes.join(', ')})`);
    console.log(`   • Unique Vulnerability Types: ${vulnTypes.length} (${vulnTypes.join(', ')})`);
    console.log(`   • States with Data: ${states.length} states`);
    
  } catch (error) {
    console.error('❌ Data generation failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the data generation
if (require.main === module) {
  generateIndiaCAGData().catch(console.error);
}

module.exports = { generateIndiaCAGData, generateRandomCoordinate, generateHazardData, generateVulnerabilityData };