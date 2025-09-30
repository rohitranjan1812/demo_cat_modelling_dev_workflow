/**
 * Database Seeding Script
 * Seeds the MongoDB database with sample data for development and testing
 */

const mongoose = require('mongoose');
const { sampleHazards, sampleVulnerabilities, sampleSimulations, sampleAccounts } = require('./sample-data');
require('dotenv').config();

// Import models
const Hazard = require('../models/Hazard');
const Vulnerability = require('../models/Vulnerability');
const SimulationRun = require('../models/SimulationRun');
const Account = require('../models/Account');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Hazard.deleteMany({}),
      Vulnerability.deleteMany({}),
      SimulationRun.deleteMany({}),
      Account.deleteMany({})
    ]);

    console.log('📊 Seeding sample data...');

    // Seed Hazards
    const hazards = await Hazard.insertMany(sampleHazards);
    console.log(`   ✅ Created ${hazards.length} hazards`);

    // Seed Vulnerabilities
    const vulnerabilities = await Vulnerability.insertMany(sampleVulnerabilities);
    console.log(`   ✅ Created ${vulnerabilities.length} vulnerabilities`);

    // Seed Simulations
    const simulations = await SimulationRun.insertMany(sampleSimulations);
    console.log(`   ✅ Created ${simulations.length} simulations`);

    // Seed Accounts
    const accounts = await Account.insertMany(sampleAccounts);
    console.log(`   ✅ Created ${accounts.length} accounts`);

    console.log('🎉 Database seeding completed successfully!');
    
    // Print summary
    console.log('\n📋 Database Summary:');
    console.log(`   • Hazards: ${hazards.length}`);
    console.log(`   • Vulnerabilities: ${vulnerabilities.length}`);
    console.log(`   • Simulations: ${simulations.length}`);
    console.log(`   • Accounts: ${accounts.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };


