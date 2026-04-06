#!/usr/bin/env node

/**
 * MiraaLink Smart Market System - API Testing Script
 *
 * This script provides a quick way to test the backend API endpoints.
 * Run with: node test-api.js
 */

const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(method, endpoint, data = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🔍 Testing ${method} ${endpoint}`);
    const response = await fetch(url, config);
    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${response.status}:`, result);
      return result;
    } else {
      console.log(`❌ ${response.status}:`, result);
      return null;
    }
  } catch (error) {
    console.log(`💥 Error:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 MiraaLink Smart Market System - API Tests');
  console.log('=' .repeat(50));

  // Test health check
  await testEndpoint('GET', '/health'.replace('/api', ''));

  // Test registration
  const userData = {
    name: 'Test Farmer',
    phone: '+254700000000',
    role: 'FARMER',
    location: 'Test Location'
  };

  const registerResult = await testEndpoint('POST', '/auth/register', userData);
  if (!registerResult) {
    console.log('\n❌ Registration failed, stopping tests');
    return;
  }

  // Extract token from registration response
  let token = registerResult.token;
  console.log(`\n🔑 Using token: ${token.substring(0, 20)}...`);

  // Test profile
  await testEndpoint('GET', '/auth/profile', null, token);

  // Test listings
  await testEndpoint('GET', '/listings');

  // Test training modules
  await testEndpoint('GET', '/training');

  // Test predictive data
  await testEndpoint('GET', '/predictive');

  // Test wallet
  await testEndpoint('GET', '/wallet', null, token);

  // Test payment methods
  await testEndpoint('GET', '/payments/methods', null, token);

  console.log('\n' + '=' .repeat(50));
  console.log('✨ API tests completed!');
  console.log('\n📝 Notes:');
  console.log('- OTP for login: Check backend console output');
  console.log('- Some endpoints require specific user roles');
  console.log('- Use Prisma Studio (npm run db:studio) to view data');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEndpoint, runTests };