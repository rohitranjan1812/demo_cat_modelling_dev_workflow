/**
 * India CAT Data Analysis Script
 * Demonstrates the generated hazard and vulnerability data across India
 * 
 * Author: GitHub Copilot
 * Date: October 8, 2025
 */

const mongoose = require('mongoose');
const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');

async function analyzeIndiaCAGData() {
  console.log('🇮🇳 India CAT Modeling Data Analysis');
  console.log('====================================');
  
  try {
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_dev');
    console.log('✅ Connected to MongoDB');
    
    // Basic Statistics
    console.log('\n📊 DATA OVERVIEW');
    console.log('----------------');
    
    const hazardCount = await Hazard.countDocuments({ createdBy: 'data-generator' });
    const vulnerabilityCount = await Vulnerability.countDocuments({ createdBy: 'data-generator' });
    
    console.log(`Total Hazards Generated: ${hazardCount.toLocaleString()}`);
    console.log(`Total Vulnerabilities Generated: ${vulnerabilityCount.toLocaleString()}`);
    
    // Hazard Analysis
    console.log('\n⚡ HAZARD ANALYSIS');
    console.log('------------------');
    
    const hazardTypes = await Hazard.aggregate([
      { $match: { createdBy: 'data-generator' } },
      { $group: { _id: '$hazardType', count: { $sum: 1 }, avgRiskScore: { $avg: '$overallRiskScore' } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Hazard Distribution:');
    hazardTypes.forEach(hazard => {
      const avgRisk = hazard.avgRiskScore ? hazard.avgRiskScore.toFixed(2) : 'N/A';
      console.log(`  • ${hazard._id}: ${hazard.count.toLocaleString()} events (Avg Risk: ${avgRisk})`);
    });
    
    const hazardSeverity = await Hazard.aggregate([
      { $match: { createdBy: 'data-generator' } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nSeverity Distribution:');
    hazardSeverity.forEach(severity => {
      console.log(`  • ${severity._id}: ${severity.count.toLocaleString()} events`);
    });
    
    // Vulnerability Analysis
    console.log('\n🛡️ VULNERABILITY ANALYSIS');
    console.log('-------------------------');
    
    const vulnerabilityTypes = await Vulnerability.aggregate([
      { $match: { createdBy: 'data-generator' } },
      { $group: { _id: '$vulnerabilityType', count: { $sum: 1 }, avgScore: { $avg: '$overallVulnerabilityScore' } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Vulnerability Type Distribution:');
    vulnerabilityTypes.forEach(vuln => {
      const avgScore = vuln.avgScore ? vuln.avgScore.toFixed(2) : 'N/A';
      console.log(`  • ${vuln._id}: ${vuln.count.toLocaleString()} assessments (Avg Score: ${avgScore})`);
    });
    
    const vulnerabilityCategories = await Vulnerability.aggregate([
      { $match: { createdBy: 'data-generator' } },
      { $group: { _id: '$vulnerabilityCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nVulnerability Category Distribution:');
    vulnerabilityCategories.forEach(category => {
      console.log(`  • ${category._id}: ${category.count.toLocaleString()} assessments`);
    });
    
    // Geographic Analysis
    console.log('\n🗺️ GEOGRAPHIC ANALYSIS');
    console.log('----------------------');
    
    const coordinateRanges = await Hazard.aggregate([
      { $match: { createdBy: 'data-generator' } },
      {
        $group: {
          _id: null,
          minLat: { $min: '$footprint.centerLatitude' },
          maxLat: { $max: '$footprint.centerLatitude' },
          minLon: { $min: '$footprint.centerLongitude' },
          maxLon: { $max: '$footprint.centerLongitude' },
          avgRadius: { $avg: '$footprint.radius' }
        }
      }
    ]);
    
    if (coordinateRanges.length > 0) {
      const range = coordinateRanges[0];
      console.log(`Latitude Range: ${range.minLat ? range.minLat.toFixed(4) : 'N/A'}°N to ${range.maxLat ? range.maxLat.toFixed(4) : 'N/A'}°N`);
      console.log(`Longitude Range: ${range.minLon ? range.minLon.toFixed(4) : 'N/A'}°E to ${range.maxLon ? range.maxLon.toFixed(4) : 'N/A'}°E`);
      console.log(`Average Hazard Radius: ${range.avgRadius ? range.avgRadius.toFixed(2) : 'N/A'} km`);
    }
    
    // Regional Hazard Distribution (by approximate regions based on coordinates)
    const regionalHazards = await Hazard.aggregate([
      { $match: { createdBy: 'data-generator' } },
      {
        $group: {
          _id: {
            region: {
              $switch: {
                branches: [
                  { case: { $and: [{ $gte: ['$footprint.centerLatitude', 28] }] }, then: 'Northern India' },
                  { case: { $and: [{ $gte: ['$footprint.centerLatitude', 15] }, { $lt: ['$footprint.centerLatitude', 28] }] }, then: 'Central India' },
                  { case: { $lt: ['$footprint.centerLatitude', 15] }, then: 'Southern India' }
                ],
                default: 'Other'
              }
            }
          },
          count: { $sum: 1 },
          earthquakes: { $sum: { $cond: [{ $eq: ['$hazardType', 'Earthquake'] }, 1, 0] } },
          floods: { $sum: { $cond: [{ $eq: ['$hazardType', 'Flood'] }, 1, 0] } },
          cyclones: { $sum: { $cond: [{ $eq: ['$hazardType', 'Cyclone'] }, 1, 0] } },
          droughts: { $sum: { $cond: [{ $eq: ['$hazardType', 'Drought'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nRegional Hazard Distribution:');
    regionalHazards.forEach(region => {
      console.log(`\n${region._id.region}: ${region.count.toLocaleString()} total hazards`);
      console.log(`  - Earthquakes: ${region.earthquakes.toLocaleString()}`);
      console.log(`  - Floods: ${region.floods.toLocaleString()}`);
      console.log(`  - Cyclones: ${region.cyclones.toLocaleString()}`);
      console.log(`  - Droughts: ${region.droughts.toLocaleString()}`);
    });
    
    // Risk Analysis
    console.log('\n📈 RISK ANALYSIS');
    console.log('----------------');
    
    const highRiskHazards = await Hazard.countDocuments({ 
      createdBy: 'data-generator', 
      overallRiskScore: { $gte: 7 } 
    });
    
    const highRiskVulnerabilities = await Vulnerability.countDocuments({
      createdBy: 'data-generator',
      overallVulnerabilityScore: { $gte: 7 }
    });
    
    console.log(`High Risk Hazards (Score ≥ 7): ${highRiskHazards.toLocaleString()} (${(highRiskHazards/hazardCount*100).toFixed(1)}%)`);
    console.log(`High Risk Vulnerabilities (Score ≥ 7): ${highRiskVulnerabilities.toLocaleString()} (${(highRiskVulnerabilities/vulnerabilityCount*100).toFixed(1)}%)`);
    
    // Sample Data Preview
    console.log('\n🔍 SAMPLE DATA PREVIEW');
    console.log('----------------------');
    
    const sampleHazard = await Hazard.findOne({ createdBy: 'data-generator' }).lean();
    const sampleVulnerability = await Vulnerability.findOne({ createdBy: 'data-generator' }).lean();
    
    if (sampleHazard) {
      console.log('Sample Hazard:');
      console.log(`  ID: ${sampleHazard.hazardId || 'N/A'}`);
      console.log(`  Type: ${sampleHazard.hazardType || 'N/A'}`);
      console.log(`  Severity: ${sampleHazard.severity || 'N/A'}`);
      const lat = sampleHazard.footprint?.centerLatitude ? sampleHazard.footprint.centerLatitude.toFixed(4) : 'N/A';
      const lon = sampleHazard.footprint?.centerLongitude ? sampleHazard.footprint.centerLongitude.toFixed(4) : 'N/A';
      console.log(`  Location: ${lat}, ${lon}`);
      console.log(`  Risk Score: ${sampleHazard.overallRiskScore ? sampleHazard.overallRiskScore.toFixed(2) : 'N/A'}`);
      console.log(`  Probability: ${sampleHazard.probability ? (sampleHazard.probability * 100).toFixed(1) : 'N/A'}%`);
    }
    
    if (sampleVulnerability) {
      console.log('\nSample Vulnerability:');
      console.log(`  ID: ${sampleVulnerability.vulnerabilityId || 'N/A'}`);
      console.log(`  Type: ${sampleVulnerability.vulnerabilityType || 'N/A'}`);
      console.log(`  Category: ${sampleVulnerability.vulnerabilityCategory || 'N/A'}`);
      const vLat = sampleVulnerability.geographicScope?.centerLatitude ? sampleVulnerability.geographicScope.centerLatitude.toFixed(4) : 'N/A';
      const vLon = sampleVulnerability.geographicScope?.centerLongitude ? sampleVulnerability.geographicScope.centerLongitude.toFixed(4) : 'N/A';
      console.log(`  Location: ${vLat}, ${vLon}`);
      console.log(`  Score: ${sampleVulnerability.overallVulnerabilityScore ? sampleVulnerability.overallVulnerabilityScore.toFixed(2) : 'N/A'}`);
      console.log(`  Risk Level: ${sampleVulnerability.overallRiskLevel || 'N/A'}`);
    }
    
    console.log('\n🎯 DATA UTILIZATION SUGGESTIONS');
    console.log('-------------------------------');
    console.log('• Use coordinate ranges for geographic filtering and mapping');
    console.log('• Analyze hazard-vulnerability correlations by location proximity');
    console.log('• Create risk heat maps using coordinate clusters');
    console.log('• Perform regional risk assessments using the generated distributions');
    console.log('• Test API endpoint filtering with the various hazard types and severities');
    console.log('• Use the temporal data for time-series risk analysis');
    console.log('• Implement radius-based proximity analysis for multi-hazard scenarios');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the analysis
if (require.main === module) {
  analyzeIndiaCAGData().catch(console.error);
}

module.exports = { analyzeIndiaCAGData };