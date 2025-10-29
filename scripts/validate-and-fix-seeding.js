#!/usr/bin/env node
/**
 * Validate and Fix Seeding Script
 * Checks existing seeded data for issues and fixes them
 * Ensures data integrity and schema compliance
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('../src/models/Account');
const Hazard = require('../src/models/Hazard');
const Vulnerability = require('../src/models/Vulnerability');
const Location = require('../src/models/Location');
const Exposure = require('../src/models/Exposure');
const Policy = require('../src/models/Policy');
const SimulationRun = require('../src/models/SimulationRun');
const User = require('../src/models/User');

// Tracking object for issues found and fixed
const validationReport = {
  issues: [],
  fixes: [],
  warnings: [],
  summary: {}
};

function logIssue(category, message, details = null) {
  const issue = { category, message, details, timestamp: new Date() };
  validationReport.issues.push(issue);
  console.log(`❌ [${category}] ${message}`);
  if (details) console.log('   Details:', details);
}

function logFix(category, message, details = null) {
  const fix = { category, message, details, timestamp: new Date() };
  validationReport.fixes.push(fix);
  console.log(`✅ [${category}] ${message}`);
  if (details) console.log('   Details:', details);
}

function logWarning(category, message, details = null) {
  const warning = { category, message, details, timestamp: new Date() };
  validationReport.warnings.push(warning);
  console.log(`⚠️  [${category}] ${message}`);
  if (details) console.log('   Details:', details);
}

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev';
  console.log(`🔄 Connecting to MongoDB: ${mongoUri}`);
  
  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function validateAndFixAccounts() {
  console.log('\n👥 Validating Accounts...');
  console.log('═══════════════════════════════════════');
  
  const accounts = await Account.find({});
  const count = accounts.length;
  console.log(`Found ${count} accounts to validate`);
  
  if (count === 0) {
    logWarning('Accounts', 'No accounts found in database');
    return;
  }
  
  let fixedCount = 0;
  
  // Check for missing required fields
  for (const account of accounts) {
    let needsUpdate = false;
    
    // Fix missing createdBy/lastModifiedBy
    if (!account.createdBy) {
      account.createdBy = 'seed-script';
      needsUpdate = true;
    }
    if (!account.lastModifiedBy) {
      account.lastModifiedBy = 'seed-script';
      needsUpdate = true;
    }
    
    // Fix missing accountLevel
    if (!account.accountLevel) {
      account.accountLevel = account.parentAccountId ? 2 : 1;
      needsUpdate = true;
    }
    
    // Fix missing or invalid riskProfile
    if (!account.riskProfile) {
      account.riskProfile = 'Medium';
      needsUpdate = true;
    }
    
    // Ensure hazardRiskProfile exists
    if (!account.hazardRiskProfile) {
      account.hazardRiskProfile = {
        overallRiskLevel: account.riskProfile || 'Medium',
        primaryHazards: []
      };
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      try {
        await account.save();
        fixedCount++;
      } catch (error) {
        logIssue('Accounts', `Failed to fix account ${account.accountId}`, error.message);
      }
    }
  }
  
  if (fixedCount > 0) {
    logFix('Accounts', `Fixed ${fixedCount} accounts`);
  }
  
  // Check for orphaned accounts
  const accountsWithParent = accounts.filter(a => a.parentAccountId);
  const parentIds = [...new Set(accountsWithParent.map(a => a.parentAccountId))];
  const existingParentIds = accounts.map(a => a.accountId);
  const orphanedParentIds = parentIds.filter(pid => !existingParentIds.includes(pid));
  
  if (orphanedParentIds.length > 0) {
    logIssue('Accounts', `Found ${orphanedParentIds.length} orphaned parent references`, orphanedParentIds);
  }
  
  // Calculate statistics
  const totalExposure = accounts.reduce((sum, a) => sum + (a.totalExposure || 0), 0);
  console.log(`\n📊 Account Statistics:`);
  console.log(`   Total Accounts: ${count}`);
  console.log(`   Total Exposure: $${totalExposure.toLocaleString()}`);
  console.log(`   Avg Exposure: $${Math.round(totalExposure / count).toLocaleString()}`);
}

async function validateAndFixHazards() {
  console.log('\n🌪️  Validating Hazards...');
  console.log('═══════════════════════════════════════');
  
  const hazards = await Hazard.find({});
  const count = hazards.length;
  console.log(`Found ${count} hazards to validate`);
  
  if (count === 0) {
    logWarning('Hazards', 'No hazards found in database');
    return;
  }
  
  let fixedCount = 0;
  
  for (const hazard of hazards) {
    let needsUpdate = false;
    
    // Fix missing hazardCategory
    if (!hazard.hazardCategory) {
      hazard.hazardCategory = 'Natural';
      needsUpdate = true;
    }
    
    // Fix missing status
    if (!hazard.status) {
      hazard.status = 'Active';
      needsUpdate = true;
    }
    
    // Fix missing isActive
    if (hazard.isActive === undefined) {
      hazard.isActive = hazard.status === 'Active';
      needsUpdate = true;
    }
    
    // Validate footprint coordinates if present
    if (hazard.footprint) {
      if (hazard.footprint.centerLatitude < -90 || hazard.footprint.centerLatitude > 90) {
        logIssue('Hazards', `Invalid latitude for hazard ${hazard.hazardId}`, 
          `Lat: ${hazard.footprint.centerLatitude}`);
      }
      if (hazard.footprint.centerLongitude < -180 || hazard.footprint.centerLongitude > 180) {
        logIssue('Hazards', `Invalid longitude for hazard ${hazard.hazardId}`, 
          `Lon: ${hazard.footprint.centerLongitude}`);
      }
    }
    
    if (needsUpdate) {
      try {
        await hazard.save();
        fixedCount++;
      } catch (error) {
        logIssue('Hazards', `Failed to fix hazard ${hazard.hazardId}`, error.message);
      }
    }
  }
  
  if (fixedCount > 0) {
    logFix('Hazards', `Fixed ${fixedCount} hazards`);
  }
  
  // Statistics
  const byType = {};
  hazards.forEach(h => {
    byType[h.hazardType] = (byType[h.hazardType] || 0) + 1;
  });
  
  console.log(`\n📊 Hazard Statistics:`);
  console.log(`   Total Hazards: ${count}`);
  console.log(`   Types Distribution:`, Object.keys(byType).length, 'types');
}

async function validateAndFixVulnerabilities() {
  console.log('\n🏗️  Validating Vulnerabilities...');
  console.log('═══════════════════════════════════════');
  
  const vulnerabilities = await Vulnerability.find({});
  const count = vulnerabilities.length;
  console.log(`Found ${count} vulnerabilities to validate`);
  
  if (count === 0) {
    logWarning('Vulnerabilities', 'No vulnerabilities found in database');
    return;
  }
  
  let fixedCount = 0;
  
  for (const vuln of vulnerabilities) {
    let needsUpdate = false;
    
    // Fix missing status
    if (!vuln.status) {
      vuln.status = 'Active';
      needsUpdate = true;
    }
    
    // Fix missing vulnerabilityCategory
    if (!vuln.vulnerabilityCategory) {
      vuln.vulnerabilityCategory = 'Regional';
      needsUpdate = true;
    }
    
    // Validate linked hazards
    if (vuln.linkedHazards && vuln.linkedHazards.length > 0) {
      const hazardIds = vuln.linkedHazards.map(lh => lh.hazardId);
      const existingHazards = await Hazard.find({ hazardId: { $in: hazardIds } });
      const existingHazardIds = existingHazards.map(h => h.hazardId);
      
      const invalidLinks = hazardIds.filter(id => !existingHazardIds.includes(id));
      if (invalidLinks.length > 0) {
        logIssue('Vulnerabilities', `Invalid hazard links in ${vuln.vulnerabilityId}`, invalidLinks);
      }
    }
    
    if (needsUpdate) {
      try {
        await vuln.save();
        fixedCount++;
      } catch (error) {
        logIssue('Vulnerabilities', `Failed to fix vulnerability ${vuln.vulnerabilityId}`, error.message);
      }
    }
  }
  
  if (fixedCount > 0) {
    logFix('Vulnerabilities', `Fixed ${fixedCount} vulnerabilities`);
  }
  
  console.log(`\n📊 Vulnerability Statistics:`);
  console.log(`   Total Vulnerabilities: ${count}`);
}

async function validateAndFixSimulations() {
  console.log('\n🎲 Validating Simulations...');
  console.log('═══════════════════════════════════════');
  
  const simulations = await SimulationRun.find({});
  const count = simulations.length;
  console.log(`Found ${count} simulations to validate`);
  
  if (count === 0) {
    logWarning('Simulations', 'No simulations found in database');
    return;
  }
  
  let fixedCount = 0;
  
  for (const sim of simulations) {
    let needsUpdate = false;
    
    // Validate configuration dates
    if (sim.configuration) {
      if (sim.configuration.startYear > sim.configuration.endYear) {
        logIssue('Simulations', `Invalid year range in ${sim.simulationRunId}`, 
          `Start: ${sim.configuration.startYear}, End: ${sim.configuration.endYear}`);
      }
      
      // Validate account references
      if (sim.configuration.exposureScope && sim.configuration.exposureScope.accountIds) {
        const accountIds = sim.configuration.exposureScope.accountIds;
        const existingAccounts = await Account.find({ accountId: { $in: accountIds } });
        const existingAccountIds = existingAccounts.map(a => a.accountId);
        
        const invalidAccountIds = accountIds.filter(id => !existingAccountIds.includes(id));
        if (invalidAccountIds.length > 0) {
          logIssue('Simulations', `Invalid account references in ${sim.simulationRunId}`, invalidAccountIds);
        }
      }
    }
    
    // Validate completed simulations have results
    if (sim.status === 'Completed' && !sim.results) {
      logIssue('Simulations', `Completed simulation missing results: ${sim.simulationRunId}`);
    }
    
    if (needsUpdate) {
      try {
        await sim.save();
        fixedCount++;
      } catch (error) {
        logIssue('Simulations', `Failed to fix simulation ${sim.simulationRunId}`, error.message);
      }
    }
  }
  
  if (fixedCount > 0) {
    logFix('Simulations', `Fixed ${fixedCount} simulations`);
  }
  
  // Statistics
  const byStatus = {};
  simulations.forEach(s => {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });
  
  console.log(`\n📊 Simulation Statistics:`);
  console.log(`   Total Simulations: ${count}`);
  console.log(`   By Status:`, byStatus);
}

async function validateAndFixLocations() {
  console.log('\n📍 Validating Locations...');
  console.log('═══════════════════════════════════════');
  
  const count = await Location.countDocuments();
  console.log(`Found ${count} locations to validate`);
  
  if (count === 0) {
    logWarning('Locations', 'No locations found in database');
    return;
  }
  
  const locations = await Location.find({}).limit(1000);
  let fixedCount = 0;
  
  for (const location of locations) {
    let needsUpdate = false;
    
    // Validate coordinates
    if (location.coordinates) {
      if (location.coordinates.latitude < -90 || location.coordinates.latitude > 90) {
        logIssue('Locations', `Invalid latitude for location ${location.locationId}`, 
          `Lat: ${location.coordinates.latitude}`);
      }
      if (location.coordinates.longitude < -180 || location.coordinates.longitude > 180) {
        logIssue('Locations', `Invalid longitude for location ${location.locationId}`, 
          `Lon: ${location.coordinates.longitude}`);
      }
    }
    
    // Validate account reference
    if (location.accountId) {
      const account = await Account.findOne({ accountId: location.accountId });
      if (!account) {
        logIssue('Locations', `Invalid account reference in location ${location.locationId}`, 
          `AccountId: ${location.accountId}`);
      }
    }
    
    if (needsUpdate) {
      try {
        await location.save();
        fixedCount++;
      } catch (error) {
        logIssue('Locations', `Failed to fix location ${location.locationId}`, error.message);
      }
    }
  }
  
  if (fixedCount > 0) {
    logFix('Locations', `Fixed ${fixedCount} locations`);
  }
  
  console.log(`\n📊 Location Statistics:`);
  console.log(`   Total Locations: ${count}`);
}

async function validateAndFixUsers() {
  console.log('\n👤 Validating Users...');
  console.log('═══════════════════════════════════════');
  
  const users = await User.find({});
  const count = users.length;
  console.log(`Found ${count} users to validate`);
  
  if (count === 0) {
    logWarning('Users', 'No users found in database');
    return;
  }
  
  let fixedCount = 0;
  
  for (const user of users) {
    let needsUpdate = false;
    
    // Validate email format
    if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      logIssue('Users', `Invalid email format for user ${user.userId}`, user.email);
    }
    
    // Ensure required fields
    if (!user.role) {
      user.role = 'User';
      needsUpdate = true;
    }
    
    if (!user.status) {
      user.status = 'Active';
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      try {
        await user.save();
        fixedCount++;
      } catch (error) {
        logIssue('Users', `Failed to fix user ${user.userId}`, error.message);
      }
    }
  }
  
  if (fixedCount > 0) {
    logFix('Users', `Fixed ${fixedCount} users`);
  }
  
  console.log(`\n📊 User Statistics:`);
  console.log(`   Total Users: ${count}`);
}

async function generateSummaryReport() {
  console.log('\n\n📊 COMPREHENSIVE VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  
  // Get all counts
  const counts = {
    accounts: await Account.countDocuments(),
    hazards: await Hazard.countDocuments(),
    vulnerabilities: await Vulnerability.countDocuments(),
    locations: await Location.countDocuments(),
    exposures: await Exposure.countDocuments(),
    policies: await Policy.countDocuments(),
    simulations: await SimulationRun.countDocuments(),
    users: await User.countDocuments()
  };
  
  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
  
  console.log('\n📦 Database Records:');
  console.log(`   👥 Accounts:        ${counts.accounts.toLocaleString()}`);
  console.log(`   🌪️  Hazards:         ${counts.hazards.toLocaleString()}`);
  console.log(`   🏗️  Vulnerabilities: ${counts.vulnerabilities.toLocaleString()}`);
  console.log(`   📍 Locations:       ${counts.locations.toLocaleString()}`);
  console.log(`   💰 Exposures:       ${counts.exposures.toLocaleString()}`);
  console.log(`   📄 Policies:        ${counts.policies.toLocaleString()}`);
  console.log(`   🎲 Simulations:     ${counts.simulations.toLocaleString()}`);
  console.log(`   👤 Users:           ${counts.users.toLocaleString()}`);
  console.log(`   ───────────────────────────────────────────`);
  console.log(`   📦 TOTAL:           ${totalRecords.toLocaleString()}`);
  
  console.log('\n🔍 Validation Results:');
  console.log(`   ❌ Issues Found:    ${validationReport.issues.length}`);
  console.log(`   ✅ Fixes Applied:   ${validationReport.fixes.length}`);
  console.log(`   ⚠️  Warnings:        ${validationReport.warnings.length}`);
  
  if (validationReport.issues.length > 0) {
    console.log('\n❌ Issues Breakdown:');
    const issuesByCategory = {};
    validationReport.issues.forEach(issue => {
      issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
    });
    Object.entries(issuesByCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
  }
  
  if (validationReport.fixes.length > 0) {
    console.log('\n✅ Fixes Breakdown:');
    const fixesByCategory = {};
    validationReport.fixes.forEach(fix => {
      fixesByCategory[fix.category] = (fixesByCategory[fix.category] || 0) + 1;
    });
    Object.entries(fixesByCategory).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  
  validationReport.summary = {
    counts,
    totalRecords,
    issuesFound: validationReport.issues.length,
    fixesApplied: validationReport.fixes.length,
    warnings: validationReport.warnings.length,
    timestamp: new Date()
  };
  
  return validationReport;
}

async function main() {
  console.log('🚀 CAT Modeling Platform - Seeding Validation and Fix Tool');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  try {
    await validateAndFixAccounts();
    await validateAndFixHazards();
    await validateAndFixVulnerabilities();
    await validateAndFixSimulations();
    await validateAndFixLocations();
    await validateAndFixUsers();
    
    const report = await generateSummaryReport();
    
    // Save report to file
    const fs = require('fs');
    const reportPath = `./validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    console.log('\n✅ Validation and fix process completed!');
    
  } catch (error) {
    console.error('\n❌ Error during validation:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the validation
if (require.main === module) {
  main();
}

module.exports = { main, validationReport };
