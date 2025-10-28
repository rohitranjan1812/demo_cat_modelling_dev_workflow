/**
 * Data Verification Script
 * Checks database counts and samples data to verify seeding success
 */

const mongoose = require('mongoose');
const Account = require('./src/models/Account');
const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');
const Location = require('./src/models/Location');
const Exposure = require('./src/models/Exposure');
const Policy = require('./src/models/Policy');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/cat_modeling_dev';

async function verifyData() {
  try {
    console.log('🔍 DATA VERIFICATION REPORT');
    console.log('=' .repeat(80));
    
    // Connect to MongoDB
    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Count all records
    console.log('\n📊 RECORD COUNTS:');
    console.log('-'.repeat(80));
    
    const counts = await Promise.all([
      Account.countDocuments(),
      Hazard.countDocuments(),
      Vulnerability.countDocuments(),
      Location.countDocuments(),
      Exposure.countDocuments(),
      Policy.countDocuments()
    ]);

    const [accountCount, hazardCount, vulnCount, locationCount, exposureCount, policyCount] = counts;
    
    console.log(`  Accounts:        ${accountCount.toLocaleString().padStart(10)} / 50,000     ${accountCount >= 50000 ? '✅' : '❌'}`);
    console.log(`  Hazards:         ${hazardCount.toLocaleString().padStart(10)} / 30,000     ${hazardCount >= 30000 ? '✅' : '❌'}`);
    console.log(`  Vulnerabilities: ${vulnCount.toLocaleString().padStart(10)} / 20,000     ${vulnCount >= 20000 ? '✅' : '❌'}`);
    console.log(`  Locations:       ${locationCount.toLocaleString().padStart(10)} / 100,000    ${locationCount >= 100000 ? '✅' : '❌'}`);
    console.log(`  Exposures:       ${exposureCount.toLocaleString().padStart(10)} / 150,000    ${exposureCount >= 150000 ? '✅' : '❌'}`);
    console.log(`  Policies:        ${policyCount.toLocaleString().padStart(10)} / 75,000     ${policyCount >= 75000 ? '✅' : '❌'}`);
    console.log('-'.repeat(80));
    
    const totalCount = counts.reduce((a, b) => a + b, 0);
    console.log(`  TOTAL:           ${totalCount.toLocaleString().padStart(10)} / 425,000    ${totalCount >= 425000 ? '✅' : '❌'}`);
    console.log(`  COMPLETION:      ${((totalCount / 425000) * 100).toFixed(2)}%`);

    // Sample data from each collection
    console.log('\n📋 DATA SAMPLES:');
    console.log('-'.repeat(80));
    
    if (accountCount > 0) {
      const sampleAccount = await Account.findOne().limit(1);
      console.log('\n✅ Sample Account:');
      console.log(`   ID: ${sampleAccount.accountId}`);
      console.log(`   Name: ${sampleAccount.accountName}`);
      console.log(`   Industry: ${sampleAccount.industryType}`);
      console.log(`   Country: ${sampleAccount.country}`);
    } else {
      console.log('\n❌ No Accounts found');
    }

    if (hazardCount > 0) {
      const sampleHazard = await Hazard.findOne().limit(1);
      console.log('\n✅ Sample Hazard:');
      console.log(`   ID: ${sampleHazard.hazardId}`);
      console.log(`   Type: ${sampleHazard.hazardType}`);
      console.log(`   Event Name: ${sampleHazard.eventName}`);
      console.log(`   Intensity: ${sampleHazard.intensity}`);
    } else {
      console.log('\n❌ No Hazards found');
    }

    if (vulnCount > 0) {
      const sampleVuln = await Vulnerability.findOne().limit(1);
      console.log('\n✅ Sample Vulnerability:');
      console.log(`   ID: ${sampleVuln.vulnerabilityId}`);
      console.log(`   Type: ${sampleVuln.vulnerabilityType}`);
      console.log(`   Building: ${sampleVuln.buildingType}`);
      console.log(`   Occupancy: ${sampleVuln.occupancyType}`);
    } else {
      console.log('\n❌ No Vulnerabilities found');
    }

    if (locationCount > 0) {
      const sampleLocation = await Location.findOne().populate('accountId', 'accountName').limit(1);
      console.log('\n✅ Sample Location:');
      console.log(`   ID: ${sampleLocation.locationId}`);
      console.log(`   Address: ${sampleLocation.address}`);
      console.log(`   City: ${sampleLocation.city}`);
      console.log(`   Country: ${sampleLocation.country}`);
      console.log(`   Coordinates: [${sampleLocation.coordinates.coordinates[1]}, ${sampleLocation.coordinates.coordinates[0]}]`);
      if (sampleLocation.accountId) {
        console.log(`   Account: ${sampleLocation.accountId.accountName}`);
      }
    } else {
      console.log('\n❌ No Locations found');
    }

    if (exposureCount > 0) {
      const sampleExposure = await Exposure.findOne()
        .populate('accountId', 'accountName')
        .populate('locationId', 'address city')
        .limit(1);
      console.log('\n✅ Sample Exposure:');
      console.log(`   ID: ${sampleExposure.exposureId}`);
      console.log(`   Building Value: $${sampleExposure.buildingValue.toLocaleString()}`);
      console.log(`   Contents Value: $${sampleExposure.contentsValue.toLocaleString()}`);
      console.log(`   Total Insured Value: $${sampleExposure.totalInsuredValue.toLocaleString()}`);
      if (sampleExposure.accountId) {
        console.log(`   Account: ${sampleExposure.accountId.accountName}`);
      }
      if (sampleExposure.locationId) {
        console.log(`   Location: ${sampleExposure.locationId.address}, ${sampleExposure.locationId.city}`);
      }
    } else {
      console.log('\n❌ No Exposures found');
    }

    if (policyCount > 0) {
      const samplePolicy = await Policy.findOne()
        .populate('accountId', 'accountName')
        .limit(1);
      console.log('\n✅ Sample Policy:');
      console.log(`   ID: ${samplePolicy.policyId}`);
      console.log(`   Number: ${samplePolicy.policyNumber}`);
      console.log(`   Coverage: $${samplePolicy.coverageAmount.toLocaleString()}`);
      console.log(`   Premium: $${samplePolicy.premium.toLocaleString()}`);
      console.log(`   Status: ${samplePolicy.status}`);
      console.log(`   Period: ${samplePolicy.effectiveDate.toISOString().split('T')[0]} to ${samplePolicy.expirationDate.toISOString().split('T')[0]}`);
      if (samplePolicy.accountId) {
        console.log(`   Account: ${samplePolicy.accountId.accountName}`);
      }
    } else {
      console.log('\n❌ No Policies found');
    }

    // Check foreign key relationships
    console.log('\n🔗 RELATIONSHIP VALIDATION:');
    console.log('-'.repeat(80));
    
    const locationsWithAccounts = await Location.countDocuments({ accountId: { $ne: null } });
    const exposuresWithAccounts = await Exposure.countDocuments({ accountId: { $ne: null } });
    const exposuresWithLocations = await Exposure.countDocuments({ locationId: { $ne: null } });
    const policiesWithAccounts = await Policy.countDocuments({ accountId: { $ne: null } });
    
    console.log(`  Locations with Accounts:  ${locationsWithAccounts.toLocaleString()} / ${locationCount.toLocaleString()} (${((locationsWithAccounts / locationCount) * 100).toFixed(1)}%)`);
    console.log(`  Exposures with Accounts:  ${exposuresWithAccounts.toLocaleString()} / ${exposureCount.toLocaleString()} (${((exposuresWithAccounts / exposureCount) * 100).toFixed(1)}%)`);
    console.log(`  Exposures with Locations: ${exposuresWithLocations.toLocaleString()} / ${exposureCount.toLocaleString()} (${((exposuresWithLocations / exposureCount) * 100).toFixed(1)}%)`);
    console.log(`  Policies with Accounts:   ${policiesWithAccounts.toLocaleString()} / ${policyCount.toLocaleString()} (${((policiesWithAccounts / policyCount) * 100).toFixed(1)}%)`);

    // Overall status
    console.log('\n' + '=' .repeat(80));
    if (totalCount >= 425000) {
      console.log('✅ DATA SEEDING SUCCESSFUL - All 425,000 records present!');
    } else if (totalCount > 0) {
      console.log(`⚠️  DATA SEEDING INCOMPLETE - ${totalCount.toLocaleString()} / 425,000 records (${((totalCount / 425000) * 100).toFixed(2)}%)`);
    } else {
      console.log('❌ DATA SEEDING FAILED - No records found');
    }
    console.log('=' .repeat(80));

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Verification complete');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    console.error(error.stack);
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run verification
verifyData();
