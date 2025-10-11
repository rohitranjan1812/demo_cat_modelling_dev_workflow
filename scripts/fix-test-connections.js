/**
 * Fix Test Database Connections
 * Removes individual mongoose.connect() calls from test files to prevent conflicts
 */

const fs = require('fs');
const path = require('path');

// Find all test files that need fixing
const testFiles = [
  'tests/models/User.test.js',
  'tests/models/Portfolio.test.js',
  'tests/models/Policy.test.js',
  'tests/models/Location.test.js',
  'tests/models/Exposure.test.js',
  'tests/controllers/vulnerabilityController.test.js',
  'tests/controllers/hazardController.test.js'
  // Add more files as needed
];

function removeConnectionCode(filePath) {
  try {
    console.log(`🔧 Fixing ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove common connection setup patterns
    content = content.replace(/let connection;\s*\n/g, '');
    content = content.replace(/const connection = [^;]+;\s*\n/g, '');
    
    // Remove beforeAll connection setup
    content = content.replace(/beforeAll\(async \(\) => \{[\s\S]*?await mongoose\.connect[^}]+\}\);\s*\n/g, '');
    
    // Remove afterAll connection cleanup  
    content = content.replace(/afterAll\(async \(\) => \{[\s\S]*?mongoose\.connection\.close[^}]+\}\);\s*\n/g, '');
    
    // Remove inline mongoose.connect calls
    content = content.replace(/await mongoose\.connect\([^;]+;\s*\n/g, '');
    content = content.replace(/await mongoose\.connection\.close\(\);\s*\n/g, '');
    content = content.replace(/await mongoose\.connection\.dropDatabase\(\);\s*\n/g, '');
    
    // Remove connection condition checks
    content = content.replace(/if \(mongoose\.connection\.readyState === 1\) \{[\s\S]*?\}\s*\n/g, '');
    
    // Write the cleaned content back
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Process all test files
console.log('🚀 Starting test file connection cleanup...');

testFiles.forEach(removeConnectionCode);

console.log('✅ Test file cleanup completed!');

module.exports = { removeConnectionCode };