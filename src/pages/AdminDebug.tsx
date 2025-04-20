import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const AdminDebug = () => {
  const [adminToken, setAdminToken] = useState('admin123');
  const [apiUrl, setApiUrl] = useState('');
  const [serverResponse, setServerResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  // Helper to add log messages
  const log = (message: string) => {
    console.log(message);
    setLogMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Initialize API URL on load
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
    setApiUrl(url);
    log(`Debug tool initialized with API URL: ${url}`);
    
    // Check localStorage for existing admin token
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      log(`Found existing admin token in localStorage: ${savedToken.substring(0, 3)}...`);
    } else {
      log('No admin token found in localStorage');
    }
  }, []);
  
  // Test the admin token with /test-token endpoint
  const testToken = async () => {
    try {
      setIsLoading(true);
      log(`Testing admin token: ${adminToken.substring(0, 3)}...`);
      
      const fullUrl = `${apiUrl}/admin/test-token?adminToken=${encodeURIComponent(adminToken)}`;
      log(`Sending request to: ${fullUrl}`);
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      log(`Response received: ${JSON.stringify(data).substring(0, 100)}...`);
      setServerResponse(data);
      
      if (data.success && data.details?.match) {
        toast.success('Token is valid!');
      } else {
        toast.error('Token is invalid!');
      }
    } catch (error: any) {
      log(`Error testing token: ${error.message}`);
      setServerResponse({ error: error.message });
      toast.error(`Request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test admin login via stats
  const testStats = async () => {
    try {
      setIsLoading(true);
      log(`Testing admin stats with token: ${adminToken.substring(0, 3)}...`);
      
      const fullUrl = `${apiUrl}/admin/stats?adminToken=${encodeURIComponent(adminToken)}`;
      log(`Sending request to: ${fullUrl}`);
      
      const response = await fetch(fullUrl);
      const data = await response.json();
      
      log(`Response received: ${JSON.stringify(data).substring(0, 100)}...`);
      setServerResponse(data);
      
      if (data.success) {
        toast.success('Stats retrieved successfully!');
        // Store token in localStorage
        localStorage.setItem('adminToken', adminToken);
        log('Token saved to localStorage');
      } else {
        toast.error('Failed to retrieve stats!');
      }
    } catch (error: any) {
      log(`Error fetching stats: ${error.message}`);
      setServerResponse({ error: error.message });
      toast.error(`Request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear localStorage token
  const clearToken = () => {
    localStorage.removeItem('adminToken');
    log('Cleared admin token from localStorage');
    toast.success('Admin token removed from localStorage');
  };
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-4xl mx-auto bg-[#2a2a2a] rounded-2xl p-8 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <h1 className="text-2xl font-bold text-center mb-6">Admin API Debug Tool</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Controls */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminToken">Admin Token</Label>
                <Input
                  id="adminToken"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={testToken}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Test Token Validation
                </Button>
                
                <Button 
                  onClick={testStats}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Test Stats Endpoint
                </Button>
                
                <Button 
                  onClick={clearToken}
                  disabled={isLoading}
                  variant="destructive"
                >
                  Clear Stored Token
                </Button>
              </div>
              
              {/* Log Messages */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Log Messages</h3>
                <div className="bg-black/30 p-3 rounded-md h-64 overflow-y-auto text-sm font-mono">
                  {logMessages.map((msg, index) => (
                    <div key={index} className="pb-1 border-b border-gray-800 mb-1 break-all">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right column - Response */}
            <div>
              <h3 className="text-lg font-medium mb-2">Server Response</h3>
              <div className="bg-black/30 p-3 rounded-md h-[500px] overflow-y-auto text-sm font-mono">
                <pre className="whitespace-pre-wrap break-all">
                  {serverResponse ? JSON.stringify(serverResponse, null, 2) : 'No response yet'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug; 