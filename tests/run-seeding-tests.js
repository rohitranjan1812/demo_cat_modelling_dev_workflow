#!/usr/bin/env node
/**
 * Comprehensive Seeding Test Runner
 * Tests seeding functionality with in-memory MongoDB
 */

require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Import models with correct paths
const Account = require(path.join(__dirname, '../src/models/Account'));
const Hazard = require(path.join(__dirname, '../src/models/Hazard'));
const Vulnerability = require(path.join(__dirname, '../src/models/Vulnerability'));
const SimulationRun = require(path.join(__dirname, '../src/models/SimulationRun'));
const User = require(path.join(__dirname, '../src/models/User'));

// Import seed data
const { 
  accountsData, 
  hazardsData, 
  vulnerabilitiesData, 
  simulationRunsData 
} = require(path.join(__dirname, '../src/config/comprehensive-seed-fixed'));

let mongod;
let mongoUri;

async function setup() {
  console.log('🚀 Starting In-Memory MongoDB Server...');
  mongod = await MongoMemoryServer.create();
  mongoUri = mongod.getUri();
  
  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  
  console.log('✅ Connected to in-memory MongoDB\n');
}

async function seedData() {
  console.log('🌱 Seeding Test Data...');
  console.log('═══════════════════════════════════════');
  
  // Clear existing data
  await Promise.all([
    Account.deleteMany({}),
    Hazard.deleteMany({}),
    Vulnerability.deleteMany({}),
    SimulationRun.deleteMany({})
  ]);
  
  // Seed accounts
  console.log('👥 Seeding Accounts...');
  for (const accountData of accountsData) {
    try {
      const account = new Account(accountData);
      await account.save();
      console.log(`   ✓ Created account: ${accountData.accountId}`);
    } catch (error) {
      console.error(`   ❌ Error creating account ${accountData.accountId}:`, error.message);
      throw error;
    }
  }
  
  // Seed hazards
  console.log('🌪️  Seeding Hazards...');
  for (const hazardData of hazardsData) {
    try {
      const hazard = new Hazard(hazardData);
      await hazard.save();
      console.log(`   ✓ Created hazard: ${hazardData.hazardId}`);
    } catch (error) {
      console.error(`   ❌ Error creating hazard ${hazardData.hazardId}:`, error.message);
      throw error;
    }
  }
  
  // Seed vulnerabilities
  console.log('🏗️  Seeding Vulnerabilities...');
  for (const vulnData of vulnerabilitiesData) {
    try {
      const vulnerability = new Vulnerability(vulnData);
      await vulnerability.save();
      console.log(`   ✓ Created vulnerability: ${vulnData.vulnerabilityId}`);
    } catch (error) {
      console.error(`   ❌ Error creating vulnerability ${vulnData.vulnerabilityId}:`, error.message);
      throw error;
    }
  }
  
  // Seed simulations
  console.log('🎲 Seeding Simulations...');
  for (const simData of simulationRunsData) {
    try {
      const simulation = new SimulationRun(simData);
      await simulation.save();
      console.log(`   ✓ Created simulation: ${simData.simulationRunId}`);
    } catch (error) {
      console.error(`   ❌ Error creating simulation ${simData.simulationRunId}:`, error.message);
      throw error;
    }
  }
  
  console.log('\n✅ Data seeding completed successfully!\n');
}

async function runValidationTests() {
  console.log('🔍 Running Validation Tests...');
  console.log('═══════════════════════════════════════');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Check accounts exist
  try {
    const accountCount = await Account.countDocuments();
    const expectedCount = accountsData.length;
    if (accountCount === expectedCount) {
      console.log(`✓ Test 1: Account count matches (${accountCount})`);
      results.passed++;
      results.tests.push({ name: 'Account count', status: 'passed' });
    } else {
      throw new Error(`Expected ${expectedCount}, got ${accountCount}`);
    }
  } catch (error) {
    console.log(`✗ Test 1: Account count mismatch - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Account count', status: 'failed', error: error.message });
  }
  
  // Test 2: Validate account IDs
  try {
    const accounts = await Account.find({});
    const invalidIds = accounts.filter(a => !a.accountId || !/^ACC-\d{6}$/.test(a.accountId));
    if (invalidIds.length === 0) {
      console.log(`✓ Test 2: All account IDs valid (${accounts.length} checked)`);
      results.passed++;
      results.tests.push({ name: 'Account ID format', status: 'passed' });
    } else {
      throw new Error(`Found ${invalidIds.length} invalid IDs`);
    }
  } catch (error) {
    console.log(`✗ Test 2: Invalid account IDs - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Account ID format', status: 'failed', error: error.message });
  }
  
  // Test 3: Check required fields in accounts
  try {
    const accounts = await Account.find({});
    const incomplete = accounts.filter(a => 
      !a.accountName || 
      !a.accountType || 
      a.totalExposure === undefined ||
      !a.currency
    );
    if (incomplete.length === 0) {
      console.log(`✓ Test 3: All accounts have required fields`);
      results.passed++;
      results.tests.push({ name: 'Account required fields', status: 'passed' });
    } else {
      throw new Error(`Found ${incomplete.length} incomplete accounts`);
    }
  } catch (error) {
    console.log(`✗ Test 3: Missing required fields - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Account required fields', status: 'failed', error: error.message });
  }
  
  // Test 4: Check hazards exist
  try {
    const hazardCount = await Hazard.countDocuments();
    const expectedCount = hazardsData.length;
    if (hazardCount === expectedCount) {
      console.log(`✓ Test 4: Hazard count matches (${hazardCount})`);
      results.passed++;
      results.tests.push({ name: 'Hazard count', status: 'passed' });
    } else {
      throw new Error(`Expected ${expectedCount}, got ${hazardCount}`);
    }
  } catch (error) {
    console.log(`✗ Test 4: Hazard count mismatch - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Hazard count', status: 'failed', error: error.message });
  }
  
  // Test 5: Validate hazard coordinates
  try {
    const hazards = await Hazard.find({});
    const invalidCoords = hazards.filter(h => 
      h.footprint && (
        h.footprint.centerLatitude < -90 || 
        h.footprint.centerLatitude > 90 ||
        h.footprint.centerLongitude < -180 ||
        h.footprint.centerLongitude > 180
      )
    );
    if (invalidCoords.length === 0) {
      console.log(`✓ Test 5: All hazard coordinates valid`);
      results.passed++;
      results.tests.push({ name: 'Hazard coordinates', status: 'passed' });
    } else {
      throw new Error(`Found ${invalidCoords.length} invalid coordinates`);
    }
  } catch (error) {
    console.log(`✗ Test 5: Invalid coordinates - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Hazard coordinates', status: 'failed', error: error.message });
  }
  
  // Test 6: Check vulnerabilities exist
  try {
    const vulnCount = await Vulnerability.countDocuments();
    const expectedCount = vulnerabilitiesData.length;
    if (vulnCount === expectedCount) {
      console.log(`✓ Test 6: Vulnerability count matches (${vulnCount})`);
      results.passed++;
      results.tests.push({ name: 'Vulnerability count', status: 'passed' });
    } else {
      throw new Error(`Expected ${expectedCount}, got ${vulnCount}`);
    }
  } catch (error) {
    console.log(`✗ Test 6: Vulnerability count mismatch - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Vulnerability count', status: 'failed', error: error.message });
  }
  
  // Test 7: Validate vulnerability scores
  try {
    const vulnerabilities = await Vulnerability.find({});
    const invalidScores = vulnerabilities.filter(v => 
      v.overallVulnerabilityScore !== undefined && 
      (v.overallVulnerabilityScore < 0 || v.overallVulnerabilityScore > 10)
    );
    if (invalidScores.length === 0) {
      console.log(`✓ Test 7: All vulnerability scores valid`);
      results.passed++;
      results.tests.push({ name: 'Vulnerability scores', status: 'passed' });
    } else {
      throw new Error(`Found ${invalidScores.length} invalid scores`);
    }
  } catch (error) {
    console.log(`✗ Test 7: Invalid vulnerability scores - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Vulnerability scores', status: 'failed', error: error.message });
  }
  
  // Test 8: Check simulations exist
  try {
    const simCount = await SimulationRun.countDocuments();
    const expectedCount = simulationRunsData.length;
    if (simCount === expectedCount) {
      console.log(`✓ Test 8: Simulation count matches (${simCount})`);
      results.passed++;
      results.tests.push({ name: 'Simulation count', status: 'passed' });
    } else {
      throw new Error(`Expected ${expectedCount}, got ${simCount}`);
    }
  } catch (error) {
    console.log(`✗ Test 8: Simulation count mismatch - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Simulation count', status: 'failed', error: error.message });
  }
  
  // Test 9: Validate simulation configurations
  try {
    const simulations = await SimulationRun.find({});
    const invalidConfigs = simulations.filter(s => 
      !s.configuration ||
      s.configuration.startYear > s.configuration.endYear
    );
    if (invalidConfigs.length === 0) {
      console.log(`✓ Test 9: All simulation configurations valid`);
      results.passed++;
      results.tests.push({ name: 'Simulation configurations', status: 'passed' });
    } else {
      throw new Error(`Found ${invalidConfigs.length} invalid configurations`);
    }
  } catch (error) {
    console.log(`✗ Test 9: Invalid simulation configurations - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Simulation configurations', status: 'failed', error: error.message });
  }
  
  // Test 10: Validate completed simulations have results
  try {
    const completedSims = await SimulationRun.find({ status: 'Completed' });
    const missingResults = completedSims.filter(s => !s.results);
    if (missingResults.length === 0) {
      console.log(`✓ Test 10: All completed simulations have results (${completedSims.length} checked)`);
      results.passed++;
      results.tests.push({ name: 'Simulation results', status: 'passed' });
    } else {
      throw new Error(`Found ${missingResults.length} completed simulations without results`);
    }
  } catch (error) {
    console.log(`✗ Test 10: Completed simulations missing results - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Simulation results', status: 'failed', error: error.message });
  }
  
  return results;
}

async function generateReport(results) {
  console.log('\n📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✓ Tests Passed: ${results.passed}`);
  console.log(`✗ Tests Failed: ${results.failed}`);
  console.log(`📊 Total Tests:  ${results.passed + results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => t.status === 'failed').forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`);
    });
  }
  
  // Get database stats
  const counts = {
    accounts: await Account.countDocuments(),
    hazards: await Hazard.countDocuments(),
    vulnerabilities: await Vulnerability.countDocuments(),
    simulations: await SimulationRun.countDocuments()
  };
  
  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
  
  console.log('\n📦 DATABASE STATISTICS');
  console.log('═══════════════════════════════════════');
  console.log(`👥 Accounts:        ${counts.accounts}`);
  console.log(`🌪️  Hazards:         ${counts.hazards}`);
  console.log(`🏗️  Vulnerabilities: ${counts.vulnerabilities}`);
  console.log(`🎲 Simulations:     ${counts.simulations}`);
  console.log(`───────────────────────────────────────`);
  console.log(`📦 TOTAL RECORDS:   ${totalRecords}`);
  console.log('═══════════════════════════════════════\n');
  
  return { ...results, counts, totalRecords };
}

async function cleanup() {
  console.log('🧹 Cleaning up...');
  await mongoose.disconnect();
  await mongod.stop();
  console.log('✅ Cleanup completed\n');
}

async function main() {
  console.log('🧪 CAT Modeling Platform - Comprehensive Seeding Test\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const startTime = Date.now();
  
  try {
    await setup();
    await seedData();
    const results = await runValidationTests();
    const report = await generateReport(results);
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Total execution time: ${elapsed} seconds\n`);
    
    // Save report to tests directory for consistency
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Detailed report saved to: ${reportPath}\n`);
    
    if (results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Seeding validation complete.\n');
      process.exitCode = 0;
    } else {
      console.log(`⚠️  ${results.failed} TEST(S) FAILED! Please review and fix issues.\n`);
      process.exitCode = 1;
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = { main };
