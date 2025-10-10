/**
 * Check Account Count in Database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Account = require('../src/models/Account');

async function checkAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cat-modeling-dev');
    console.log('✅ Connected to MongoDB\n');

    // Check total accounts
    const totalAccounts = await Account.countDocuments();
    console.log(`📊 Total Accounts: ${totalAccounts.toLocaleString()}`);

    // Check exposure-generator accounts
    const exposureAccounts = await Account.countDocuments({ createdBy: 'exposure-generator' });
    console.log(`📦 Exposure-Generator Accounts: ${exposureAccounts.toLocaleString()}`);

    // Check other accounts
    const otherAccounts = await Account.countDocuments({ createdBy: { $ne: 'exposure-generator' } });
    console.log(`📋 Other Accounts: ${otherAccounts.toLocaleString()}`);

    // Sample a few accounts
    console.log('\n📄 Sample Accounts:');
    const samples = await Account.find({ createdBy: 'exposure-generator' }).limit(5).lean();
    samples.forEach(acc => {
      console.log(`  - ${acc.accountId}: ${acc.accountName}`);
      console.log(`    Exposure: $${(acc.totalExposure / 1000000).toFixed(2)}M`);
      console.log(`    Status: ${acc.status}`);
    });

    // Check status distribution
    console.log('\n📊 By Status:');
    const statusCounts = await Account.aggregate([
      { $match: { createdBy: 'exposure-generator' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    statusCounts.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count.toLocaleString()}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAccounts();
