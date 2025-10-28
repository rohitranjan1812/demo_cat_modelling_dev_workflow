// Minimal seed script with correct schemas for testing simulation workflow
require('dotenv').config();
const mongoose = require('./src/config/mongoose-wrapper');
const Account = require('./src/models/Account');
const Hazard = require('./src/models/Hazard');
const Vulnerability = require('./src/models/Vulnerability');
const Location = require('./src/models/Location');
const Exposure = require('./src/models/Exposure');
const Policy = require('./src/models/Policy');

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Account.deleteMany({});
    await Hazard.deleteMany({});
    await Vulnerability.deleteMany({});
    await Location.deleteMany({});
    await Exposure.deleteMany({});
    await Policy.deleteMany({});
    console.log('   ✓ All collections cleared\n');

    // Create Account
    console.log('👥 Seeding Accounts...');
    const account = new Account({
      accountId: 'ACC-100001',
      accountName: 'Test Insurance Company',
      accountType: 'Primary',
      accountLevel: 1,
      totalExposure: 1000000000,
      currency: 'USD',
      regions: ['North America'],
      riskProfile: 'High',
      hazardRiskProfile: {
        overallRiskLevel: 'High',
        primaryHazards: [
          {
            hazardType: 'Hurricane',
            riskLevel: 'Very High',
            exposureAmount: 500000000,
            lastAssessed: new Date('2024-01-01')
          }
        ]
      },
      status: 'Active',
      createdBy: 'system',
      lastModifiedBy: 'system'
    });
    await account.save();
    console.log(`   ✓ Created: ${account.accountName}\n`);

    // Create Hazard
    console.log('🌪️  Seeding Hazards...');
    const hazard = new Hazard({
      hazardId: 'HAZ-10000001',
      hazardName: 'Test Hurricane 2024',
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
    });
    await hazard.save();
    console.log(`   ✓ Created: ${hazard.hazardName}\n`);

    // Create Vulnerability
    console.log('🏗️  Seeding Vulnerabilities...');
    const vulnerability = new Vulnerability({
      vulnerabilityId: 'VUL-10000001',
      vulnerabilityName: 'Test Coastal Vulnerability',
      vulnerabilityDescription: 'Test vulnerability for simulation',
      vulnerabilityType: 'Physical',
      vulnerabilityCategory: 'Regional',
      geographicScope: {
        centerLatitude: 26.6406,
        centerLongitude: -81.8723,
        radius: 50,
        radiusUnit: 'km',
        area: 7854,
        areaUnit: 'km2',
        administrativeLevel: 'State/Province',
        country: 'United States',
        state: 'Florida',
        region: 'North America'
      },
      overallVulnerabilityScore: 7.5,
      overallRiskLevel: 'High',
      confidenceLevel: 'High',
      vulnerabilityFactors: [
        {
          factorType: 'Physical',
          factorName: 'Test Factor',
          factorValue: 7.5,
          weight: 1.0,
          description: 'Test vulnerability factor'
        }
      ],
      hazardVulnerabilities: [
        {
          hazardType: 'Hurricane',
          vulnerabilityScore: 8.0,
          confidenceLevel: 'High',
          methodology: 'Test Method'
        }
      ],
      assessmentDate: new Date('2024-01-15'),
      validFrom: new Date('2024-01-15'),
      dataSources: [
        {
          sourceType: 'Government',
          sourceName: 'Test Source',
          reliability: 'High'
        }
      ],
      methodology: {
        assessmentMethod: 'Test Method',
        modelProvider: 'Custom',
        modelVersion: '1.0',
        resolution: 'High'
      },
      linkedHazards: [
        {
          hazardId: 'HAZ-10000001',
          relationshipType: 'Primary',
          vulnerabilityScore: 8.0
        }
      ],
      status: 'Active',
      isPublic: false,
      isTemplate: false,
      createdBy: 'system',
      lastModifiedBy: 'system'
    });
    await vulnerability.save();
    console.log(`   ✓ Created: ${vulnerability.vulnerabilityName}\n`);

    // Create Location
    console.log('📍 Seeding Locations...');
    const location = new Location({
      locationId: 'LOC-10000001',
      accountId: 'ACC-100001',
      locationName: 'Test Property - Miami Beach',
      coordinates: {
        latitude: 25.7907,
        longitude: -80.1300,
        elevation: 5,
        elevationUnit: 'meters'
      },
      address: {
        street: '456 Beach Drive',
        city: 'Miami Beach',
        state: 'Florida',
        postalCode: '33139',
        country: 'United States',
        region: 'North America'
      },
      propertyCharacteristics: {
        occupancyType: 'Residential',
        constructionType: 'Frame',
        yearBuilt: 1990,
        numberOfStories: 2,
        squareFootage: 2500,
        replacementCost: 800000,
        marketValue: 1000000
      },
      totalExposure: 0,
      currency: 'USD',
      associatedPolicies: [],
      riskZones: [
        {
          zoneType: 'Hurricane',
          zoneCode: 'HURR-FL-001',
          zoneDescription: 'High risk hurricane zone',
          riskLevel: 'Very High'
        }
      ],
      hazardExposure: [
        {
          hazardId: 'HAZ-10000001',
          exposureLevel: 'Very High',
          riskScore: 8.5,
          lastAssessed: new Date('2024-01-01'),
          assessmentMethod: 'Model'
        }
      ],
      status: 'Active',
      createdBy: 'system',
      lastModifiedBy: 'system'
    });
    await location.save();
    console.log(`   ✓ Created: ${location.locationName}\n`);

    // Create Exposure
    console.log('💰 Seeding Exposures...');
    const exposure = new Exposure({
      exposureId: 'EXP-1000000001',
      accountId: 'ACC-100001',
      policyId: 'POL-10000001',
      locationId: 'LOC-10000001',
      totalInsuredValue: 1000000,
      buildingValue: 800000,
      contentsValue: 150000,
      businessInterruptionValue: 50000,
      currency: 'USD',
      location: {
        latitude: 25.7907,
        longitude: -80.1300,
        elevation: 5,
        address: {
          street: '456 Beach Drive',
          city: 'Miami Beach',
          state: 'Florida',
          postalCode: '33139',
          country: 'United States',
          region: 'North America'
        }
      },
      occupancyType: 'Residential',
      constructionType: 'Wood Frame',
      yearBuilt: 1990,
      numberOfStories: 2,
      squareFootage: 2500,
      perilExposure: [
        {
          peril: 'Hurricane',
          exposureValue: 1000000,
          deductible: 25000,
          limit: 1000000,
          isExcluded: false
        }
      ],
      policyTerms: {
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2024-12-31'),
        deductible: 25000,
        limit: 1000000,
        coinsurance: 100
      },
      riskFactors: [
        {
          peril: 'Hurricane',
          riskScore: 8.5,
          probability: 0.05,
          expectedLoss: 50000,
          lastUpdated: new Date('2024-01-01')
        }
      ],
      status: 'Active',
      createdBy: 'system',
      lastModifiedBy: 'system'
    });
    await exposure.save();
    console.log(`   ✓ Created: Exposure ${exposure.exposureId}\n`);

    // Create Policy
    console.log('📋 Seeding Policies...');
    const policy = new Policy({
      policyId: 'POL-10000001',
      policyNumber: 'TEST-2024-001',
      accountId: 'ACC-100001',
      policyName: 'Test Property Policy',
      policyType: 'Direct',
      coverages: [
        {
          coverageType: 'Property',
          coverageLimit: 1000000,
          deductible: 25000,
          coveragePercentage: 100
        }
      ],
      totalLimit: 1000000,
      totalDeductible: 25000,
      premium: 15000,
      currency: 'USD',
      effectiveDate: new Date('2024-01-01'),
      expiryDate: new Date('2024-12-31'),
      coveredRegions: ['North America'],
      coveredPerils: ['Hurricane', 'Wind', 'Flood'],
      hazardCoverage: [
        {
          hazardId: 'HAZ-10000001',
          coverageLimit: 1000000,
          deductible: 25000,
          coveragePercentage: 100,
          effectiveDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-12-31')
        }
      ],
      locationCoverage: [
        {
          locationId: 'LOC-10000001',
          insuredValue: 1000000,
          buildingValue: 800000,
          contentsValue: 150000,
          businessInterruptionValue: 50000
        }
      ],
      status: 'Active',
      createdBy: 'system',
      lastModifiedBy: 'system'
    });
    await policy.save();
    console.log(`   ✓ Created: Policy ${policy.policyNumber}\n`);

    // Summary
    console.log('✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   • 1 Account');
    console.log('   • 1 Hazard');
    console.log('   • 1 Vulnerability');
    console.log('   • 1 Location');
    console.log('   • 1 Exposure');
    console.log('   • 1 Policy');
    console.log('\n🚀 Ready to test simulation workflow!');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
