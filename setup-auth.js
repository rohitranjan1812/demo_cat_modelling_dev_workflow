/**
 * Authentication Setup Script for CAT Modeling Platform
 * Creates default admin user and sets up authentication system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

console.log('🔐 CAT Modeling Platform - Authentication Setup');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function setupAuthentication() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cat_modeling_exposure';
    console.log(`\n🔄 Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Create default admin user
    console.log('\n👤 Setting up default admin user...');
    
    const adminExists = await User.findOne({ role: 'Admin' });
    if (adminExists) {
      console.log('⚠️ Admin user already exists:');
      console.log(`   Username: ${adminExists.username}`);
      console.log(`   Email: ${adminExists.email}`);
      console.log(`   Status: ${adminExists.status}`);
    } else {
      const admin = await User.createDefaultAdmin();
      if (admin) {
        console.log('✅ Default admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 Admin Login Credentials:');
        console.log('   Username: admin');
        console.log('   Email: admin@catmodeling.com');
        console.log('   Password: CATModeling2025!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️ IMPORTANT: Please change the default password after first login!');
      }
    }

    // Create sample users with different roles
    console.log('\n👥 Setting up sample users...');
    
    const sampleUsers = [
      {
        userId: 'USR-00000002',
        username: 'riskmanager',
        email: 'risk.manager@catmodeling.com',
        password: 'RiskManager2025!',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'Risk Manager',
        permissions: ['read_all', 'write_hazards', 'write_vulnerabilities', 'write_simulations'],
        organization: 'Global Re Insurance',
        department: 'Risk Management',
        jobTitle: 'Senior Risk Manager'
      },
      {
        userId: 'USR-00000003',
        username: 'analyst',
        email: 'data.analyst@catmodeling.com', 
        password: 'DataAnalyst2025!',
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'Analyst',
        permissions: ['read_all', 'write_simulations'],
        organization: 'Catastrophe Analytics Inc',
        department: 'Data Science',
        jobTitle: 'Risk Analyst'
      },
      {
        userId: 'USR-00000004',
        username: 'viewer',
        email: 'viewer@catmodeling.com',
        password: 'Viewer2025!',
        firstName: 'Emma',
        lastName: 'Davis',
        role: 'Viewer',
        permissions: ['read_hazards', 'read_vulnerabilities', 'read_simulations'],
        organization: 'Insurance Corp',
        department: 'Underwriting',
        jobTitle: 'Underwriter'
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }]
      });
      
      if (!existingUser) {
        const user = new User({
          ...userData,
          status: 'Active',
          isEmailVerified: true
        });
        await user.save();
        console.log(`   ✅ Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`   ⚠️ User already exists: ${userData.username}`);
      }
    }

    // Display authentication endpoints
    console.log('\n🌐 Authentication Endpoints Available:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   POST /api/v1/auth/register  - User registration');
    console.log('   POST /api/v1/auth/login     - User login');
    console.log('   POST /api/v1/auth/refresh   - Refresh access token');
    console.log('   POST /api/v1/auth/logout    - User logout');
    console.log('   GET  /api/v1/auth/profile   - Get user profile');
    console.log('   PUT  /api/v1/auth/profile   - Update user profile');
    console.log('   PUT  /api/v1/auth/password  - Change password');
    console.log('   GET  /api/v1/auth/verify    - Verify token');
    console.log('   GET  /api/v1/auth/permissions - Get user permissions');
    console.log('   GET  /api/v1/auth/health    - Auth service health');

    // Display sample API usage
    console.log('\n📖 Sample API Usage:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Login:');
    console.log('   curl -X POST http://localhost:3001/api/v1/auth/login \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"username":"admin","password":"CATModeling2025!"}\'');
    console.log('');
    console.log('2. Use token in subsequent requests:');
    console.log('   curl -H "Authorization: Bearer <your_token>" \\');
    console.log('     http://localhost:3001/api/v1/hazards');

    console.log('\n🎉 Authentication system setup completed successfully!');
    console.log('✨ Your CAT Modeling Platform now has secure JWT-based authentication.');

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('\n❌ Authentication setup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run setup
setupAuthentication();
