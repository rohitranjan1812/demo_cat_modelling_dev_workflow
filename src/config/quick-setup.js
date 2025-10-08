/**
 * Quick Setup Script - Checks and Seeds Database
 * This script will verify database status and seed if necessary
 */

require('dotenv').config();
const { execSync } = require('child_process');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 CAT Modeling Platform - Quick Database Setup');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function quickSetup() {
  try {
    console.log('Step 1: Verifying database status...\n');
    
    try {
      execSync('node src/config/verify-database.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      // If verify-database exits with 0, database is ready
      console.log('\n✅ Database is already set up and ready!');
      console.log('\n🎉 You can now run simulations from the UI.');
      console.log('   Start backend:  npm run start:backend');
      console.log('   Start frontend: npm run start:frontend\n');
      
    } catch (verifyError) {
      // If verify-database exits with non-zero, need to seed
      console.log('\n📋 Database needs seeding...\n');
      console.log('Step 2: Seeding database with sample data...\n');
      
      try {
        execSync('node src/config/comprehensive-seed-fixed.js', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        console.log('\n✅ Database seeded successfully!');
        console.log('\nStep 3: Verifying seeding...\n');
        
        execSync('node src/config/verify-database.js', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
      } catch (seedError) {
        console.error('\n❌ Seeding failed!');
        console.error('Please check the error messages above.');
        console.error('\nFor help, see: DATABASE_SETUP_GUIDE.md');
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nFor detailed troubleshooting, see: DATABASE_SETUP_GUIDE.md');
    process.exit(1);
  }
}

quickSetup();
