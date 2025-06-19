// Comprehensive functionality test script for Rollout Ready
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(method, url, data = null, expectedStatus = 200) {
  try {
    console.log(`\n🧪 Testing ${method.toUpperCase()} ${url}`);
    
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      validateStatus: () => true, // Don't throw on any status
    };
    
    if (data) {
      config.data = data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    
    const status = response.status === expectedStatus ? '✅' : '❌';
    console.log(`   ${status} Status: ${response.status} (expected ${expectedStatus})`);
    
    if (response.status !== expectedStatus) {
      console.log(`   📄 Response: ${response.data?.slice(0, 200)}...`);
    }
    
    return {
      success: response.status === expectedStatus,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Rollout Ready Functionality Tests\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test basic pages
  const pageTests = [
    { name: 'Home Page', method: 'get', url: '/' },
    { name: 'Admin Dashboard', method: 'get', url: '/admin' },
    { name: 'Roles Page', method: 'get', url: '/admin/roles' },
    { name: 'Templates Page', method: 'get', url: '/admin/templates' },
    { name: 'Create Role Page', method: 'get', url: '/admin/roles/new' },
    { name: 'Create Template Page', method: 'get', url: '/admin/templates/new' },
    { name: 'Create Project Page', method: 'get', url: '/admin/projects/new' },
    { name: 'User Dashboard (ollie)', method: 'get', url: '/dashboard/ollie' },
    { name: 'User Dashboard (sarah)', method: 'get', url: '/dashboard/sarah' },
  ];
  
  console.log('📄 TESTING PAGES');
  console.log('================');
  
  for (const test of pageTests) {
    const result = await testEndpoint(test.method, test.url);
    results.tests.push({ name: test.name, ...result });
    if (result.success) results.passed++; else results.failed++;
  }
  
  // Test API endpoints
  console.log('\n🔌 TESTING API ENDPOINTS');
  console.log('========================');
  
  const apiTests = [
    { name: 'Get Roles API', method: 'get', url: '/api/roles' },
    { name: 'Get Templates API', method: 'get', url: '/api/templates' },
  ];
  
  for (const test of apiTests) {
    const result = await testEndpoint(test.method, test.url);
    results.tests.push({ name: test.name, ...result });
    if (result.success) results.passed++; else results.failed++;
  }
  
  // Test dynamic routes with existing data
  console.log('\n🔗 TESTING DYNAMIC ROUTES');
  console.log('=========================');
  
  const dynamicTests = [
    { name: 'Project Detail (ID: 1)', method: 'get', url: '/admin/projects/1' },
    { name: 'Project Detail (ID: 2)', method: 'get', url: '/admin/projects/2' },
    { name: 'Template Detail (ID: 1)', method: 'get', url: '/admin/templates/1' },
    { name: 'Template Detail (ID: 2)', method: 'get', url: '/admin/templates/2' },
    { name: 'Template Detail (ID: 3)', method: 'get', url: '/admin/templates/3' },
  ];
  
  for (const test of dynamicTests) {
    const result = await testEndpoint(test.method, test.url);
    results.tests.push({ name: test.name, ...result });
    if (result.success) results.passed++; else results.failed++;
  }
  
  // Test PWA files
  console.log('\n📱 TESTING PWA FILES');
  console.log('====================');
  
  const pwaTests = [
    { name: 'PWA Manifest', method: 'get', url: '/manifest.json' },
    { name: 'Service Worker', method: 'get', url: '/sw.js' },
  ];
  
  for (const test of pwaTests) {
    const result = await testEndpoint(test.method, test.url);
    results.tests.push({ name: test.name, ...result });
    if (result.success) results.passed++; else results.failed++;
  }
  
  // Test form submissions (create operations)
  console.log('\n📝 TESTING FORM SUBMISSIONS');
  console.log('===========================');
  
  // Test creating a role
  const createRoleTest = await testEndpoint('post', '/api/roles', {
    name: 'Test Role',
    description: 'A test role for verification'
  }, 201);
  results.tests.push({ name: 'Create Role API', ...createRoleTest });
  if (createRoleTest.success) results.passed++; else results.failed++;
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('===============');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  console.log('\n🔍 FAILED TESTS:');
  const failedTests = results.tests.filter(t => !t.success);
  if (failedTests.length === 0) {
    console.log('   🎉 All tests passed!');
  } else {
    failedTests.forEach(test => {
      console.log(`   ❌ ${test.name} - Status: ${test.status || 'ERROR'}`);
    });
  }
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };
