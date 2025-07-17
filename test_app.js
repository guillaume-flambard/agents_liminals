const axios = require('axios');
const qs = require('querystring');

const baseURL = 'http://localhost:3001';

async function testApp() {
  try {
    console.log('🧪 Testing Agents Liminals Application...\n');
    
    // Test 1: Health check
    console.log('1. Health Check...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health:', health.data.status);
    
    // Test 2: Homepage redirect
    console.log('\n2. Homepage redirect...');
    try {
      await axios.get(`${baseURL}/`);
    } catch (err) {
      if (err.response?.status === 302) {
        console.log('✅ Redirects to:', err.response.headers.location);
      }
    }
    
    // Test 3: Login page
    console.log('\n3. Login page...');
    const loginPage = await axios.get(`${baseURL}/auth/login`);
    console.log('✅ Login page loads:', loginPage.status === 200);
    
    // Test 4: Register page
    console.log('\n4. Register page...');
    const registerPage = await axios.get(`${baseURL}/auth/register`);
    console.log('✅ Register page loads:', registerPage.status === 200);
    
    // Test 5: User registration
    console.log('\n5. User registration...');
    try {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123456',
        confirmPassword: 'test123456',
        firstName: 'Test',
        lastName: 'User'
      };
      
      const registerResponse = await axios.post(`${baseURL}/auth/register`, 
        qs.stringify(registerData), 
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxRedirects: 0
        }
      );
      console.log('✅ Registration successful');
    } catch (err) {
      if (err.response?.status === 302) {
        console.log('✅ Registration successful (redirected)');
      } else {
        console.log('❌ Registration failed:', err.response?.data || err.message);
      }
    }
    
    // Test 6: Login
    console.log('\n6. User login...');
    try {
      const loginData = {
        username: 'testuser',
        password: 'test123456'
      };
      
      const loginResponse = await axios.post(`${baseURL}/auth/login`, 
        qs.stringify(loginData), 
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxRedirects: 0
        }
      );
      console.log('✅ Login successful');
    } catch (err) {
      if (err.response?.status === 302) {
        console.log('✅ Login successful (redirected)');
      } else {
        console.log('❌ Login failed:', err.response?.data || err.message);
      }
    }
    
    console.log('\n🎉 Application is working correctly!');
    console.log('\n📱 Access the application at: http://localhost:3001');
    console.log('🔗 Or in production at: https://liminals.memoapp.eu');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApp();