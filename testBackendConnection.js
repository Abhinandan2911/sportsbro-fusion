// Test script to check backend connectivity
import fetch from 'node-fetch';

const checkBackendConnection = async () => {
  try {
    console.log('Testing connection to backend server...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5003/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    
    // Try Google auth endpoint (this will redirect to Google)
    console.log('\nTesting Google auth endpoint (expect redirect)...');
    try {
      const authResponse = await fetch('http://localhost:5003/api/auth/google', {
        redirect: 'manual'  // Don't follow redirects
      });
      console.log('Auth endpoint status:', authResponse.status);
      console.log('Auth endpoint redirect URL:', authResponse.headers.get('location'));
    } catch (error) {
      console.log('Expected redirect for auth endpoint');
    }
    
    console.log('\nConnection test complete');
  } catch (error) {
    console.error('Error testing backend connection:', error);
  }
};

checkBackendConnection(); 