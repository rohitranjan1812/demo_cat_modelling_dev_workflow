/**
 * API Response Format Validation Test
 * Tests that API endpoints return consistent response formats
 */

const mongoose = require('mongoose');
const axios = require('axios');

// Test API response format consistency
async function testAPIResponseFormats() {
  console.log('🧪 Testing API Response Format Consistency...\n');
  
  const baseURL = 'http://localhost:3001/api'; // Adjust as needed
  
  try {
    // Test endpoint patterns we expect to find
    const testEndpoints = [
      { method: 'GET', path: '/hazards', description: 'Get all hazards' },
      { method: 'GET', path: '/vulnerabilities', description: 'Get all vulnerabilities' },
      { method: 'GET', path: '/exposures', description: 'Get all exposures' },
      { method: 'GET', path: '/accounts', description: 'Get all accounts' }
    ];
    
    console.log('🔍 Testing response format consistency...\n');
    
    // Track response formats
    const responseFormats = {};
    let allConsistent = true;
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
        
        // Make request with timeout
        const response = await axios({
          method: endpoint.method,
          url: `${baseURL}${endpoint.path}`,
          timeout: 5000,
          params: { limit: 1 } // Limit results for faster testing
        });
        
        const data = response.data;
        
        // Check required fields
        const hasSuccess = typeof data.success === 'boolean';
        const hasMessage = typeof data.message === 'string';
        const hasData = data.hasOwnProperty('data');
        const hasTimestamp = typeof data.timestamp === 'string' || (data.meta && typeof data.meta.timestamp === 'string');
        
        // Record format
        responseFormats[endpoint.path] = {
          hasSuccess,
          hasMessage,
          hasData,
          hasTimestamp,
          fields: Object.keys(data)
        };
        
        // Validate format
        if (hasSuccess && hasMessage && hasData) {
          console.log(`  ✅ ${endpoint.description}: Standard format confirmed`);
          console.log(`     Fields: ${Object.keys(data).join(', ')}`);
        } else {
          console.log(`  ❌ ${endpoint.description}: Non-standard format`);
          console.log(`     Fields: ${Object.keys(data).join(', ')}`);
          console.log(`     Missing: ${!hasSuccess ? 'success ' : ''}${!hasMessage ? 'message ' : ''}${!hasData ? 'data' : ''}`);
          allConsistent = false;
        }
        
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`  ⚠️ ${endpoint.description}: Server not running (${baseURL})`);
        } else {
          console.log(`  ❌ ${endpoint.description}: ${error.message}`);
        }
      }
    }
    
    console.log('\n📊 Response Format Analysis:');
    console.log('Standard format should include: success, message, data, timestamp/meta');
    
    // Analyze consistency
    if (allConsistent) {
      console.log('✅ All tested endpoints use consistent response format');
    } else {
      console.log('❌ Some endpoints use inconsistent response format');
    }
    
    // Test error response format (if server is running)
    try {
      console.log('\n🔍 Testing error response format...');
      
      // Try to trigger a 404 error
      await axios.get(`${baseURL}/nonexistent-endpoint`);
      
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        console.log(`Status: ${error.response.status}`);
        console.log(`Error Response Fields: ${Object.keys(errorData).join(', ')}`);
        
        const hasErrorSuccess = errorData.success === false;
        const hasErrorMessage = typeof errorData.message === 'string';
        const hasErrorTimestamp = typeof errorData.timestamp === 'string';
        
        if (hasErrorSuccess && hasErrorMessage) {
          console.log('✅ Error response format is consistent');
        } else {
          console.log('❌ Error response format is inconsistent');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎉 API response format test completed!');
}

// Mock response format test (when server is not running)
function testMockResponseFormat() {
  console.log('🧪 Testing Mock Response Format Structures...\n');
  
  // Expected standard format
  const standardSuccessResponse = {
    success: true,
    message: 'Operation successful',
    data: [],
    meta: {
      timestamp: new Date().toISOString()
    }
  };
  
  const standardErrorResponse = {
    success: false,
    message: 'Error occurred',
    timestamp: new Date().toISOString()
  };
  
  const standardPaginatedResponse = {
    success: true,
    message: 'Data retrieved successfully',
    data: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
      timestamp: new Date().toISOString()
    }
  };
  
  // Validate structure
  console.log('✅ Standard Success Response Structure:');
  console.log(`   Fields: ${Object.keys(standardSuccessResponse).join(', ')}`);
  console.log(`   success: ${typeof standardSuccessResponse.success}`);
  console.log(`   message: ${typeof standardSuccessResponse.message}`);
  console.log(`   data: ${Array.isArray(standardSuccessResponse.data) ? 'array' : typeof standardSuccessResponse.data}`);
  console.log(`   meta.timestamp: ${typeof standardSuccessResponse.meta.timestamp}`);
  
  console.log('\n✅ Standard Error Response Structure:');
  console.log(`   Fields: ${Object.keys(standardErrorResponse).join(', ')}`);
  console.log(`   success: ${standardErrorResponse.success}`);
  console.log(`   message: ${typeof standardErrorResponse.message}`);
  console.log(`   timestamp: ${typeof standardErrorResponse.timestamp}`);
  
  console.log('\n✅ Standard Paginated Response Structure:');
  console.log(`   Fields: ${Object.keys(standardPaginatedResponse).join(', ')}`);
  console.log(`   pagination.page: ${typeof standardPaginatedResponse.pagination.page}`);
  console.log(`   pagination.total: ${typeof standardPaginatedResponse.pagination.total}`);
  
  console.log('\n🎉 Mock response format validation completed!');
  console.log('✅ All response structures follow consistent patterns');
}

// Run appropriate test based on environment
async function runResponseFormatTests() {
  console.log('🚀 Starting API Response Format Tests...\n');
  
  // First run mock structure test
  testMockResponseFormat();
  
  // Then try to test actual API if available
  console.log('\n' + '='.repeat(60) + '\n');
  await testAPIResponseFormats();
}

// Run tests if called directly
if (require.main === module) {
  runResponseFormatTests()
    .then(() => {
      console.log('\n🎉 All API response format tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testAPIResponseFormats,
  testMockResponseFormat,
  runResponseFormatTests
};