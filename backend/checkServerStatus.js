const http = require('http');

// Function to make an HTTP request
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Status for ${url}: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.error(`Error accessing ${url}: ${err.message}`);
      reject(err);
    });
  });
};

// Check multiple endpoints
const checkEndpoints = async () => {
  try {
    // Check health endpoint
    await makeRequest('http://localhost:5003/api/health');
    
    // Try to check if auth routes are registered
    console.log("\nChecking auth routes...");
    try {
      await makeRequest('http://localhost:5003/api/auth/check-email');
    } catch (error) {
      console.log("Expected error for auth endpoints that require POST method");
    }
    
    console.log("\nServer check complete");
  } catch (error) {
    console.error("Failed to complete server checks:", error);
  }
};

// Run the checks
checkEndpoints(); 