#!/usr/bin/env node
/**
 * Working Seed Script for CAT Modelling Platform
 * Creates realistic sample data matching actual model schemas
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev';
    console.log('🔌 Connecting to MongoDB:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      if (!collection.name.startsWith('system.')) {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`   ✓ Cleared ${collection.name}`);
      }
    }
    console.log('');

    // Import models
    const Account = require('./src/models/Account');
    const Hazard = require('./src/models/Hazard');
    const Vulnerability = require('./src/models/Vulnerability');

    // Seed Accounts
    console.log('👥 Seeding Accounts...');
    const accounts = [
      {
        accountId: 'ACC-100001',
        accountName: 'Global Insurance Corp',
        accountType: 'Primary',
        accountLevel: 1,
        totalExposure: 50000000,
        currency: 'USD',
        regions: ['North America', 'Europe'],
        riskProfile: 'High',
        status: 'Active',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-12-31'),
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      {
        accountId: 'ACC-100002',
        accountName: 'Regional Reinsurance Ltd',
        accountType: 'Reinsurance',
        accountLevel: 1,
        totalExposure: 25000000,
        currency: 'USD',
        regions: ['North America'],
        riskProfile: 'Medium',
        status: 'Active',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-12-31'),
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      {
        accountId: 'ACC-100003',
        accountName: 'Florida Property Insurance',
        accountType: 'Primary',
        parentAccountId: 'ACC-100001',
        accountLevel: 2,
        totalExposure: 15000000,
        currency: 'USD',
        regions: ['North America'],
        riskProfile: 'Very High',
        status: 'Active',
        effectiveDate: new Date('2024-01-01'),
        expiryDate: new Date('2025-12-31'),
        createdBy: 'system',
        lastModifiedBy: 'system'
      }
    ];

    for (const accountData of accounts) {
      const account = new Account(accountData);
      await account.save();
      console.log(`   ✓ Created: ${accountData.accountName}`);
    }
    console.log(`   📊 Total: ${accounts.length} accounts\n`);

    // Seed Hazards
    console.log('🌪️  Seeding Hazards...');
    const hazards = [
      {
        hazardId: 'HAZ-10000001',
        hazardName: 'Hurricane Ian 2024',
        hazardType: 'Hurricane',
        hazardCategory: 'Natural',
        severity: 'Major',
        status: 'Active',
        footprint: {
          centerLatitude: 26.6406,
          centerLongitude: -81.8723,
          radius: 500,
          unit: 'km',
          affectedArea: 785398,
          areaUnit: 'km2'
        },
        temporal: {
          startTime: new Date('2024-09-27T12:00:00Z'),
          endTime: new Date('2024-09-30T18:00:00Z'),
          duration: 90,
          durationUnit: 'hours'
        },
        probability: 0.05,
        returnPeriod: 20,
        returnPeriodUnit: 'years',
        affectedRegions: ['North America'],
        affectedCountries: ['United States'],
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      {
        hazardId: 'HAZ-10000002',
        hazardName: 'California Earthquake 2024',
        hazardType: 'Earthquake',
        hazardCategory: 'Natural',
        severity: 'Major',
        status: 'Active',
        footprint: {
          centerLatitude: 34.0522,
          centerLongitude: -118.2437,
          radius: 300,
          unit: 'km',
          affectedArea: 282743,
          areaUnit: 'km2'
        },
        temporal: {
          startTime: new Date('2024-07-15T08:30:00Z'),
          endTime: new Date('2024-07-15T08:31:00Z'),
          duration: 1,
          durationUnit: 'minutes'
        },
        probability: 0.02,
        returnPeriod: 50,
        returnPeriodUnit: 'years',
        affectedRegions: ['North America'],
        affectedCountries: ['United States'],
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      {
        hazardId: 'HAZ-10000003',
        hazardName: 'Texas Wildfire Season 2024',
        hazardType: 'Wildfire',
        hazardCategory: 'Natural',
        severity: 'Moderate',
        status: 'Active',
        footprint: {
          centerLatitude: 31.9686,
          centerLongitude: -99.9018,
          radius: 200,
          unit: 'km',
          affectedArea: 125664,
          areaUnit: 'km2'
        },
        temporal: {
          startTime: new Date('2024-08-01T00:00:00Z'),
          endTime: new Date('2024-09-30T23:59:59Z'),
          duration: 1464,
          durationUnit: 'hours'
        },
        probability: 0.15,
        returnPeriod: 7,
        returnPeriodUnit: 'years',
        affectedRegions: ['North America'],
        affectedCountries: ['United States'],
        createdBy: 'system',
        lastModifiedBy: 'system'
      }
    ];

    for (const hazardData of hazards) {
      const hazard = new Hazard(hazardData);
      await hazard.save();
      console.log(`   ✓ Created: ${hazardData.hazardName}`);
    }
    console.log(`   📊 Total: ${hazards.length} hazards\n`);

    // Seed Vulnerabilities
    console.log('🏗️  Seeding Vulnerabilities...');
    const vulnerabilities = [
      {
        vulnerabilityId: 'VUL-10000001',
        vulnerabilityName: 'Coastal Wood Frame Residential',
        vulnerabilityDescription: 'Wood frame residential structures in coastal zones',
        vulnerabilityType: 'Structural',
        vulnerabilityCategory: 'Building',
        overallVulnerabilityScore: 7.5,
        hazardTypeScores: [
          { hazardType: 'Hurricane', vulnerabilityScore: 8.5, weight: 1.0, dataSource: 'Engineering Study 2023' },
          { hazardType: 'Flood', vulnerabilityScore: 7.0, weight: 0.8, dataSource: 'FEMA Guidelines' }
        ],
        geographicScope: {
          region: 'North America',
          country: 'United States',
          administrativeLevel: 'State',
          specificAreas: ['Florida', 'Louisiana', 'Texas'],
          centerLatitude: 27.9944,
          centerLongitude: -81.7603,
          affectedRadius: 500
        },
        temporalScope: {
          effectiveDate: new Date('2024-01-01'),
          expirationDate: new Date('2025-12-31')
        },
        vulnerabilityFactors: [
          { factorName: 'Building Age', factorValue: 35, weight: 0.3, dataSource: 'Property Survey' },
          { factorName: 'Construction Quality', factorValue: 6.0, weight: 0.4, dataSource: 'Inspection Reports' },
          { factorName: 'Maintenance Level', factorValue: 5.5, weight: 0.3, dataSource: 'Owner Reports' }
        ],
        assessmentMethodology: 'Engineering-based vulnerability assessment',
        dataSource: 'USGS, FEMA, Engineering Consultants',
        lastAssessmentDate: new Date('2024-01-15'),
        status: 'Active',
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      {
        vulnerabilityId: 'VUL-10000002',
        vulnerabilityName: 'Urban High-Rise Buildings',
        vulnerabilityDescription: 'Modern steel and concrete high-rise structures',
        vulnerabilityType: 'Structural',
        vulnerabilityCategory: 'Building',
        overallVulnerabilityScore: 4.5,
        hazardTypeScores: [
          { hazardType: 'Earthquake', vulnerabilityScore: 5.0, weight: 1.0, dataSource: 'Seismic Study 2023' },
          { hazardType: 'Hurricane', vulnerabilityScore: 4.0, weight: 0.7, dataSource: 'Wind Engineering' }
        ],
        geographicScope: {
          region: 'North America',
          country: 'United States',
          administrativeLevel: 'Metropolitan',
          specificAreas: ['Los Angeles', 'San Francisco', 'Seattle'],
          centerLatitude: 34.0522,
          centerLongitude: -118.2437,
          affectedRadius: 300
        },
        temporalScope: {
          effectiveDate: new Date('2024-01-01'),
          expirationDate: new Date('2025-12-31')
        },
        vulnerabilityFactors: [
          { factorName: 'Seismic Design', factorValue: 8.5, weight: 0.5, dataSource: 'Building Codes' },
          { factorName: 'Foundation Type', factorValue: 9.0, weight: 0.3, dataSource: 'Structural Plans' },
          { factorName: 'Building Height', factorValue: 6.0, weight: 0.2, dataSource: 'Property Data' }
        ],
        assessmentMethodology: 'Performance-based vulnerability assessment',
        dataSource: 'Engineering Studies, Building Department Records',
        lastAssessmentDate: new Date('2024-02-01'),
        status: 'Active',
        createdBy: 'system',
        lastModifiedBy: 'system'
      }
    ];

    for (const vulnData of vulnerabilities) {
      const vuln = new Vulnerability(vulnData);
      await vuln.save();
      console.log(`   ✓ Created: ${vulnData.vulnerabilityName}`);
    }
    console.log(`   📊 Total: ${vulnerabilities.length} vulnerabilities\n`);

    // Summary
    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Accounts: ${accounts.length}`);
    console.log(`   • Hazards: ${hazards.length}`);
    console.log(`   • Vulnerabilities: ${vulnerabilities.length}`);
    console.log('');
    console.log('🚀 Ready to run simulations!');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedDatabase();
