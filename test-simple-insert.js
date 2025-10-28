/**
 * Simple Insert Test
 * Tests basic MongoDB insertion without transactions
 */

const mongoose = require('mongoose');
const Account = require('./src/models/Account');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/cat_modeling_dev';

async function testInsert() {
  try {
    console.log('🔄 Connecting to MongoDB:', MONGODB_URI);
    
    // Connect with explicit options
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected successfully');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
    // Check initial count
    const initialCount = await Account.countDocuments();
    console.log('\n📊 Initial Account count:', initialCount);
    
    // Insert a single test account
    console.log('\n📝 Inserting test account...');
    const testAccount = await Account.create({
      accountId: 'TEST-001',
      accountName: 'Test Account',
      accountType: 'Primary',
      industryType: 'Technology',
      contactEmail: 'test@example.com',
      contactPhone: '+1234567890',
      address: '123 Test St',
      city: 'Test City',
      state: 'CA',
      country: 'USA',
      postalCode: '12345',
      taxId: 'TAX123',
      creditRating: 'A',
      established: new Date('2020-01-01'),
      employees: 100,
      annualRevenue: 1000000,
      totalInsuredValue: 5000000,
      primaryContact: 'Test Contact',
      riskProfile: 'Medium',
      activeStatus: true
    });
    
    console.log('✅ Test account created:', testAccount.accountId);
    console.log('📊 MongoDB _id:', testAccount._id);
    
    // Verify the count increased
    const afterInsertCount = await Account.countDocuments();
    console.log('\n📊 After insert count:', afterInsertCount);
    console.log('📊 Count increased:', afterInsertCount > initialCount ? 'YES ✅' : 'NO ❌');
    
    // Query it back
    console.log('\n🔍 Querying back the inserted account...');
    const queriedAccount = await Account.findOne({ accountId: 'TEST-001' });
    
    if (queriedAccount) {
      console.log('✅ Account found:', queriedAccount.accountName);
    } else {
      console.log('❌ Account NOT found in database!');
    }
    
    // Wait a moment
    console.log('\n⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check again
    const finalCount = await Account.countDocuments();
    console.log('\n📊 Final count after wait:', finalCount);
    
    // Close connection properly
    console.log('\n🔌 Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY:');
    console.log('  Initial count:', initialCount);
    console.log('  After insert:', afterInsertCount);
    console.log('  After wait:', finalCount);
    console.log('  Data persisted:', finalCount > initialCount ? 'YES ✅' : 'NO ❌');
    console.log('='.repeat(80));
    
    process.exit(finalCount > initialCount ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

testInsert();
