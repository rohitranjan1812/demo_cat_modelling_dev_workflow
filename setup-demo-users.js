#!/usr/bin/env node
/**
 * Quick Demo User Setup Script
 * Creates default demo users for testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const DEMO_USERS = [
  {
    username: 'riskmanager',
    email: 'riskmanager@catmodelling.local',
    password: 'RiskManager2025!',
    firstName: 'Risk',
    lastName: 'Manager',
    role: 'Analyst',
    permissions: [
      'read_hazards', 'read_vulnerabilities', 'read_accounts', 'read_simulations', 'read_reports',
      'write_hazards', 'write_vulnerabilities', 'write_accounts', 'write_simulations', 'manage_data'
    ]
  },
  {
    username: 'analyst',
    email: 'analyst@catmodelling.local',
    password: 'DataAnalyst2025!',
    firstName: 'Data',
    lastName: 'Analyst',
    role: 'Admin',
    permissions: ['admin', 'read_all', 'write_all', 'manage_users', 'manage_system', 'manage_data']
  },
  {
    username: 'viewer',
    email: 'viewer@catmodelling.local',
    password: 'Viewer2025!',
    firstName: 'Report',
    lastName: 'Viewer',
    role: 'Viewer',
    permissions: ['read_hazards', 'read_vulnerabilities', 'read_accounts', 'read_simulations', 'read_reports']
  }
];

async function setupDemoUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cat_modeling_dev';
    console.log(`🔄 Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing users. Checking for demo users...`);
    }

    for (const userData of DEMO_USERS) {
      const existingUser = await User.findOne({ 
        $or: [{ username: userData.username }, { email: userData.email }] 
      });

      if (existingUser) {
        console.log(`⏭️  User '${userData.username}' already exists, skipping...`);
        continue;
      }

      // Generate user ID
      const userCount = await User.countDocuments();
      const userId = `USR-${(userCount + 1).toString().padStart(8, '0')}`;

      const user = new User({
        userId,
        ...userData,
        status: 'Active',
        organization: 'CAT Modelling Demo',
        department: 'Demo',
        jobTitle: 'Demo User'
      });

      await user.save();
      console.log(`✅ Created user: ${userData.username}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.role}`);
      console.log('');
    }

    console.log('✨ Demo user setup complete!');
    console.log('\n📋 Available Demo Credentials:\n');
    console.log('1️⃣  Risk Manager Role:');
    console.log('   Username: riskmanager');
    console.log('   Password: RiskManager2025!');
    console.log('   Permissions: Read & Write data, Manage data\n');
    
    console.log('2️⃣  Analyst Role (Admin):');
    console.log('   Username: analyst');
    console.log('   Password: DataAnalyst2025!');
    console.log('   Permissions: Full system access\n');
    
    console.log('3️⃣  Viewer Role:');
    console.log('   Username: viewer');
    console.log('   Password: Viewer2025!');
    console.log('   Permissions: Read-only access\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up demo users:', error.message);
    process.exit(1);
  }
}

setupDemoUsers();
