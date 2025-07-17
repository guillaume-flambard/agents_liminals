const axios = require('axios');
const qs = require('querystring');

async function testRegistration() {
  try {
    console.log('🧪 Testing user registration...\n');
    
    // Test registration with proper data
    const registerData = {
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'motdepasse123',
      confirmPassword: 'motdepasse123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    console.log('Attempting registration with data:', {
      username: registerData.username,
      email: registerData.email,
      firstName: registerData.firstName,
      lastName: registerData.lastName
    });
    
    const response = await axios.post('http://localhost:3001/auth/register', 
      qs.stringify(registerData), 
      {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Test)'
        },
        maxRedirects: 0,
        validateStatus: () => true // Accept all status codes
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.status === 302) {
      console.log('✅ Registration successful - redirected to:', response.headers.location);
    } else if (response.status === 200) {
      console.log('📄 Registration page returned (check for errors)');
      // Look for error messages in the response
      if (response.data.includes('error') || response.data.includes('Error')) {
        console.log('❌ Registration failed - page contains errors');
      } else {
        console.log('✅ Registration might be successful');
      }
    } else {
      console.log('❌ Registration failed with status:', response.status);
      console.log('Response data:', response.data.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error data:', error.response.data?.substring(0, 500));
    }
  }
}

testRegistration();