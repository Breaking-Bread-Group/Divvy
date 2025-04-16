const request = require('supertest');
const app = require('./test-db');

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  first_name: 'Test',
  last_name: 'User',
  phone: '1234567890'
};

async function testAuth() {
  try {
    console.log('Starting authentication tests...\n');

    // Test 1: Register a new user
    console.log('Test 1: Registering new user...');
    const registerResponse = await request(app)
      .post('/api/register')
      .send(testUser);
    console.log('Registration successful:', registerResponse.body);
    console.log('User ID:', registerResponse.body.id);
    console.log('----------------------------------------\n');

    // Test 2: Login with the registered user
    console.log('Test 2: Logging in...');
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    console.log('Login successful:', loginResponse.body);
    console.log('----------------------------------------\n');

    // Get the session cookie from login response
    const sessionCookie = loginResponse.headers['set-cookie'];

    // Test 3: Get current user info
    console.log('Test 3: Getting current user info...');
    const meResponse = await request(app)
      .get('/api/me')
      .set('Cookie', sessionCookie);
    console.log('Current user info:', meResponse.body);
    console.log('----------------------------------------\n');

    // Test 4: Logout
    console.log('Test 4: Logging out...');
    const logoutResponse = await request(app)
      .post('/api/logout')
      .set('Cookie', sessionCookie);
    console.log('Logout successful:', logoutResponse.body);
    console.log('----------------------------------------\n');

    // Test 5: Try to access protected route after logout
    console.log('Test 5: Attempting to access protected route after logout...');
    const protectedResponse = await request(app)
      .get('/api/me')
      .set('Cookie', sessionCookie);
    console.log('Expected error (not authenticated):', protectedResponse.body);
    console.log('----------------------------------------\n');

    console.log('All tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
testAuth(); 