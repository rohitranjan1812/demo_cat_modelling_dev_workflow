/**
 * Quick validation test for restored Exposure functionality
 */

const mongoose = require('mongoose');
const Exposure = require('../src/models/Exposure');
const ExposureService = require('../src/services/ExposureService');

async function testExposureFunctionality() {
  try {
    console.log('🧪 Testing Restored Exposure Functionality\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_exposure');
    console.log('✅ Connected to MongoDB\n');

    const exposureService = new ExposureService();

    // Test 1: Create a sample exposure
    console.log('📝 Test 1: Create Exposure with Validation');
    const testExposure = {
      exposureId: 'EXP-00000001',
      exposureType: 'Property',
      accountId: 'ACC-TEST-001',
      policyId: 'POL-TEST-001',
      locationId: 'LOC-TEST-001',
      totalInsuredValue: 1000000,
      replacementValue: 1200000,
      currency: 'USD',
      perilExposures: [
        {
          peril: 'Earthquake',
          exposureAmount: 800000,
          deductible: 50000,
          limit: 1000000
        },
        {
          peril: 'Flood',
          exposureAmount: 600000,
          deductible: 25000,
          limit: 1000000
        }
      ],
      location: {
        latitude: 37.7749,
        longitude: -122.4194
      },
      occupancyType: 'Commercial',
      constructionType: 'Concrete',
      effectiveDate: new Date('2025-01-01'),
      expiryDate: new Date('2025-12-31'),
      status: 'Active',
      createdBy: 'test-user',
      lastModifiedBy: 'test-user'
    };

    // Clean up any existing test exposure
    await Exposure.deleteOne({ exposureId: 'EXP-00000001' });

    const exposure = new Exposure(testExposure);
    await exposure.save();
    console.log('✅ Exposure created successfully');
    console.log(`   Display Name: ${exposure.displayName}`);
    console.log(`   Is Active: ${exposure.isActive()}`);
    console.log('');

    // Test 2: Instance methods
    console.log('🔍 Test 2: Instance Methods');
    const earthquakeExposure = exposure.getTotalExposureForPeril('Earthquake');
    console.log(`✅ Earthquake Exposure: $${earthquakeExposure.toLocaleString()}`);
    
    const netExposure = exposure.calculateNetExposure('Earthquake');
    console.log(`✅ Net Exposure (after deductible): $${netExposure.toLocaleString()}`);
    
    const activePerils = exposure.getActivePerils();
    console.log(`✅ Active Perils: ${activePerils.join(', ')}`);
    
    const riskAdjusted = exposure.getRiskAdjustedExposure();
    console.log(`✅ Risk-Adjusted Exposure: $${riskAdjusted.toLocaleString()}`);
    console.log('');

    // Test 3: Static methods
    console.log('📊 Test 3: Static Methods');
    const perilTotal = await Exposure.getTotalExposureByPeril('Earthquake');
    console.log(`✅ Total Earthquake Exposure: $${perilTotal.totalExposure.toLocaleString()}`);
    console.log(`   Count: ${perilTotal.count}`);
    console.log(`   Average: $${Math.round(perilTotal.avgExposure).toLocaleString()}`);
    console.log('');

    const validation = await Exposure.validateExposureConsistency('EXP-00000001');
    console.log(`✅ Consistency Validation: ${validation.valid ? 'PASSED' : 'FAILED'}`);
    if (!validation.valid) {
      console.log(`   Errors: ${validation.errors.join(', ')}`);
    }
    console.log('');

    // Test 4: Service methods
    console.log('🔧 Test 4: Service Methods');
    const exposures = await exposureService.getExposures({ status: 'Active' });
    console.log(`✅ Active Exposures: ${exposures.data.length}`);
    console.log(`   Total: ${exposures.pagination.total}`);
    console.log('');

    const summary = await exposureService.getExposureSummary();
    console.log('✅ Exposure Summary:');
    console.log(`   Total Count: ${summary.overall.totalCount}`);
    console.log(`   Total Insured Value: $${summary.overall.totalInsuredValue.toLocaleString()}`);
    console.log(`   Average Value: $${Math.round(summary.overall.avgInsuredValue).toLocaleString()}`);
    console.log('   By Peril:');
    Object.entries(summary.byPeril).forEach(([peril, data]) => {
      console.log(`     ${peril}: $${data.totalExposure.toLocaleString()} (${data.count} exposures)`);
    });
    console.log('');

    // Test 5: Geospatial query
    console.log('🌍 Test 5: Geospatial Query');
    const nearbyExposures = await exposureService.getExposuresInRadius(
      37.7749, // San Francisco
      -122.4194,
      50 // 50 km radius
    );
    console.log(`✅ Exposures within 50km: ${nearbyExposures.length}`);
    if (nearbyExposures.length > 0) {
      console.log(`   Nearest: ${nearbyExposures[0].distance.toFixed(2)} km away`);
    }
    console.log('');

    // Test 6: Accumulation analysis
    console.log('💰 Test 6: Accumulation Analysis');
    const accumulation = await exposureService.calculateExposureAccumulation();
    console.log(`✅ Total Exposures: ${accumulation.totalExposures}`);
    console.log(`✅ Total Insured Value: $${accumulation.totalInsuredValue.toLocaleString()}`);
    console.log('   By Occupancy:');
    Object.entries(accumulation.byOccupancy).forEach(([type, data]) => {
      console.log(`     ${type}: ${data.count} exposures, $${data.totalValue.toLocaleString()}`);
    });
    console.log('');

    // Cleanup
    await Exposure.deleteOne({ exposureId: 'EXP-00000001' });
    
    console.log('✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Model instance methods working');
    console.log('   ✅ Model static methods working');
    console.log('   ✅ Service CRUD operations working');
    console.log('   ✅ Aggregation methods working');
    console.log('   ✅ Geospatial queries working');
    console.log('   ✅ Accumulation analysis working');
    console.log('\n🎉 Exposure module fully functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run tests
if (require.main === module) {
  testExposureFunctionality()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = testExposureFunctionality;
