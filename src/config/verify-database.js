/**
 * Database Verification Script
 * Checks if database has the required seed data for simulations to run
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Account = require('../models/Account');
const Hazard = require('../models/Hazard');
const Vulnerability = require('../models/Vulnerability');
const SimulationRun = require('../models/SimulationRun');

async function verifyDatabase() {
  let isConnected = false;
  
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 CAT Modeling Platform - Database Verification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📡 Attempting to connect to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully\n');
    
    // Check counts
    console.log('📊 Checking Database Collections...\n');
    
    const accountsCount = await Account.countDocuments();
    const hazardsCount = await Hazard.countDocuments();
    const vulnerabilitiesCount = await Vulnerability.countDocuments();
    const simulationsCount = await SimulationRun.countDocuments();
    
    // Display results
    console.log('Collection Statistics:');
    console.log(`  • Accounts:         ${accountsCount.toString().padStart(4)} ${getStatusIcon(accountsCount)}`);
    console.log(`  • Hazards:          ${hazardsCount.toString().padStart(4)} ${getStatusIcon(hazardsCount)}`);
    console.log(`  • Vulnerabilities:  ${vulnerabilitiesCount.toString().padStart(4)} ${getStatusIcon(vulnerabilitiesCount)}`);
    console.log(`  • Simulations:      ${simulationsCount.toString().padStart(4)} ${getStatusIcon(simulationsCount, false)}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Determine if simulation can run
    const canRunSimulation = accountsCount > 0 && hazardsCount > 0 && vulnerabilitiesCount > 0;
    
    if (canRunSimulation) {
      console.log('✅ Database Status: READY FOR SIMULATIONS');
      console.log('\n📋 Database has the minimum required data:');
      console.log('   ✓ Account data for exposure calculations');
      console.log('   ✓ Hazard data for event generation');
      console.log('   ✓ Vulnerability data for impact assessment');
      console.log('\n🚀 You can now run simulations from the UI!');
      
      // Show sample data
      if (hazardsCount > 0) {
        console.log('\n📌 Sample Hazard Data:');
        const sampleHazard = await Hazard.findOne();
        console.log(`   ID:   ${sampleHazard.hazardId}`);
        console.log(`   Name: ${sampleHazard.hazardName}`);
        console.log(`   Type: ${sampleHazard.hazardType}`);
        console.log(`   Severity: ${sampleHazard.severity}`);
      }
      
      if (accountsCount > 0) {
        console.log('\n📌 Sample Account Data:');
        const sampleAccount = await Account.findOne();
        console.log(`   ID:   ${sampleAccount.accountId}`);
        console.log(`   Name: ${sampleAccount.accountName}`);
        console.log(`   Total Exposure: $${sampleAccount.totalExposure.toLocaleString()}`);
        console.log(`   Regions: ${sampleAccount.regions.join(', ')}`);
      }
      
      if (vulnerabilitiesCount > 0) {
        console.log('\n📌 Sample Vulnerability Data:');
        const sampleVuln = await Vulnerability.findOne();
        console.log(`   ID:   ${sampleVuln.vulnerabilityId}`);
        console.log(`   Name: ${sampleVuln.vulnerabilityName}`);
        console.log(`   Type: ${sampleVuln.vulnerabilityType}`);
        console.log(`   Score: ${sampleVuln.overallVulnerabilityScore}/10`);
      }
      
    } else {
      console.log('❌ Database Status: NOT READY FOR SIMULATIONS');
      console.log('\n⚠️  Missing Required Data:');
      
      if (accountsCount === 0) {
        console.log('   ✗ No account data found (required for exposure calculations)');
      }
      if (hazardsCount === 0) {
        console.log('   ✗ No hazard data found (required for event generation)');
      }
      if (vulnerabilitiesCount === 0) {
        console.log('   ✗ No vulnerability data found (required for impact assessment)');
      }
      
      console.log('\n💡 Solution: Run the database seeding script');
      console.log('   Command: npm run seed:fixed');
      console.log('   or:      node src/config/comprehensive-seed-fixed.js');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await mongoose.connection.close();
    
    // Exit with appropriate code
    process.exit(canRunSimulation ? 0 : 1);
    
  } catch (error) {
    if (error.name === 'MongoServerSelectionError' || error.message.includes('ECONNREFUSED')) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 CAT Modeling Platform - Database Verification');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('❌ MongoDB Connection Failed');
      console.log('\n⚠️  MongoDB is not running or not accessible\n');
      console.log('📋 Troubleshooting Steps:');
      console.log('   1. Check if MongoDB is installed:');
      console.log('      • Windows: Check Services for "MongoDB"');
      console.log('      • Linux:   sudo systemctl status mongod');
      console.log('      • Mac:     brew services list | grep mongodb');
      console.log('');
      console.log('   2. Start MongoDB:');
      console.log('      • Windows: net start MongoDB');
      console.log('      • Linux:   sudo systemctl start mongod');
      console.log('      • Mac:     brew services start mongodb-community');
      console.log('');
      console.log('   3. Verify MongoDB is listening on port 27017');
      console.log('      • netstat -an | grep 27017');
      console.log('');
      console.log('   4. Check your .env file has correct MONGODB_URI');
      console.log(`      • Current: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure'}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ Database verification error:', error.message);
      console.error('\nFull error:', error);
    }
    
    if (isConnected) {
      try {
        await mongoose.connection.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    
    process.exit(1);
  }
}

function getStatusIcon(count, required = true) {
  if (count === 0) {
    return required ? '❌ (REQUIRED)' : '⚠️  (Optional)';
  } else if (count < 3 && required) {
    return '⚠️  (Low)';
  } else {
    return '✅';
  }
}

// Run verification
verifyDatabase();
