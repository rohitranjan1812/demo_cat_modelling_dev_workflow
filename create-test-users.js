/**
 * Create Test Users Script
 * Creates default test users for the CAT modeling platform
 * 
 * Author: GitHub Copilot
 * Date: October 8, 2025
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createTestUsers() {
  console.log('🔧 Creating Test Users for CAT Modeling Platform');
  console.log('=================================================');
  
  try {
    await mongoose.connect('mongodb://localhost:27017/cat_modeling_dev');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');
    
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@catmodeling.com',
        password: 'Admin123!',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'Admin',
        organization: 'CAT Modeling Inc.',
        department: 'IT',
        jobTitle: 'System Administrator',
        permissions: ['admin', 'read_all', 'write_all', 'manage_users', 'manage_system', 'manage_data']
      },
      {
        username: 'analyst',
        email: 'analyst@catmodeling.com',  
        password: 'Analyst123!',
        firstName: 'Risk',
        lastName: 'Analyst',
        role: 'Analyst',
        organization: 'CAT Modeling Inc.',
        department: 'Risk Assessment',
        jobTitle: 'Senior Risk Analyst',
        permissions: ['read_hazards', 'read_vulnerabilities', 'read_accounts', 'read_simulations', 'read_reports', 'write_hazards', 'write_vulnerabilities', 'write_simulations']
      },
      {
        username: 'viewer',
        email: 'viewer@catmodeling.com',
        password: 'Viewer123!',
        firstName: 'Data',
        lastName: 'Viewer',
        role: 'Viewer',
        organization: 'CAT Modeling Inc.',
        department: 'Operations',
        jobTitle: 'Data Analyst',
        permissions: ['read_hazards', 'read_vulnerabilities', 'read_accounts', 'read_simulations', 'read_reports']
      },
      {
        username: 'manager',
        email: 'manager@catmodeling.com',
        password: 'Manager123!',
        firstName: 'Project',
        lastName: 'Manager',
        role: 'Risk Manager',
        organization: 'CAT Modeling Inc.',
        department: 'Risk Management',
        jobTitle: 'Risk Manager',
        permissions: ['read_hazards', 'read_vulnerabilities', 'read_accounts', 'read_simulations', 'read_reports', 'write_hazards', 'write_vulnerabilities', 'write_accounts', 'write_simulations', 'manage_data']
      },
      {
        username: 'demo',
        email: 'demo@catmodeling.com',
        password: 'Demo123!',
        firstName: 'Demo',
        lastName: 'User',
        role: 'Analyst',
        organization: 'CAT Modeling Inc.',
        department: 'Demo',
        jobTitle: 'Demo Account',
        permissions: ['read_hazards', 'read_vulnerabilities', 'read_accounts', 'read_simulations', 'read_reports', 'write_hazards', 'write_vulnerabilities', 'write_simulations']
      }
    ];    console.log('\n🔨 Creating test users...');
    
    for (let i = 0; i < testUsers.length; i++) {
      const userData = testUsers[i];
      
      // Generate user ID
      const userId = `USR-${(i + 1).toString().padStart(8, '0')}`;
      
      const user = new User({
        userId,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        organization: userData.organization,
        department: userData.department,
        jobTitle: userData.jobTitle,
        permissions: userData.permissions,
        status: 'Active',
        isEmailVerified: true,
        profile: {
          bio: `${userData.role} for CAT modeling platform`,
          timezone: 'UTC',
          language: 'en',
          dateFormat: 'YYYY-MM-DD',
          notifications: {
            email: true,
            browser: true,
            mobile: false
          }
        },
        preferences: {
          theme: 'light',
          dashboardLayout: 'grid',
          defaultView: 'dashboard',
          autoRefresh: true,
          refreshInterval: 30
        },
        createdBy: 'system',
        lastModifiedBy: 'system'
      });
      
      await user.save();
      
      console.log(`✅ Created user: ${userData.username} (${userData.email}) - Role: ${userData.role}`);
    }
    
    console.log('\n📊 USER ACCOUNTS SUMMARY');
    console.log('------------------------');
    console.log('Login Credentials:');
    console.log('1. Admin: username="admin", password="Admin123!"');
    console.log('2. Analyst: username="analyst", password="Analyst123!"');
    console.log('3. Viewer: username="viewer", password="Viewer123!"');
    console.log('4. Manager: username="manager", password="Manager123!"');
    console.log('5. Demo: username="demo", password="Demo123!"');
    
    console.log('\n🔐 PERMISSIONS OVERVIEW');
    console.log('----------------------');
    console.log('• Admin: Full system access (read, write, delete, admin)');
    console.log('• Manager: Management access (read, write, manage)');
    console.log('• Analyst: Analysis access (read, write)');
    console.log('• Demo: Demo access (read, write)');
    console.log('• Viewer: Read-only access (read)');
    
    // Verify creation
    const userCount = await User.countDocuments();
    console.log(`\n✅ Successfully created ${userCount} test users`);
    
    // Test password hashing
    const testUser = await User.findOne({ username: 'admin' });
    const passwordCheck = await testUser.checkPassword('Admin123!');
    console.log(`🔒 Password hashing test: ${passwordCheck ? 'PASSED' : 'FAILED'}`);
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createTestUsers().catch(console.error);
}

module.exports = { createTestUsers };