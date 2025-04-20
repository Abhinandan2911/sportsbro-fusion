import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { handleApiError, showSuccess } from '@/services/errorHandler';

const AdminLogin = () => {
  const [adminToken, setAdminToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loginSteps, setLoginSteps] = useState<Array<{step: string, data?: any, timestamp: string}>>([]);
  const navigate = useNavigate();
  
  // Add a function to log debug steps
  const logStep = (step: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${step}`, data || '');
    setLoginSteps(prev => [...prev, { step, data, timestamp }]);
  };
  
  // Check if already logged in
  useEffect(() => {
    logStep('Component mounted');
    
    if (api.admin.isAdmin()) {
      logStep('Already logged in, redirecting to dashboard');
      navigate('/admin/dashboard');
    }
    
    // Display API URL for debug
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
    logStep('Initial setup', { apiUrl });
    
    setDebugInfo({
      apiUrl,
      hasToken: !!localStorage.getItem('adminToken')
    });
  }, [navigate]);
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    logStep('Login form submitted');
    
    if (!adminToken.trim()) {
      logStep('Error: Empty token');
      toast.error('Please enter an admin token');
      return;
    }
    
    setIsSubmitting(true);
    logStep('Starting login process', { tokenLength: adminToken.length });
    
    // Always clear debug info when starting a new login attempt
    setDebugInfo({
      status: 'Attempting login...',
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
      token: adminToken.substring(0, 3) + '...'
    });
    
    try {
      // Clear any existing token first
      localStorage.removeItem('adminToken');
      logStep('Cleared existing token from localStorage');
      
      // Try the admin token directly first with demo mode
      logStep('Calling api.admin.login', { token: adminToken.substring(0, 3) + '...' });
      
      const result = await api.admin.login(adminToken);
      logStep('Login API response received', { 
        success: result.success,
        message: result.message,
        hasData: !!result.data
      });
      console.log('Login result:', result);
      
      if (result.success) {
        logStep('Login successful');
        showSuccess('Admin login successful');
        
        // Update debug info with success details
        setDebugInfo({
          status: 'Success',
          message: 'Login successful! Redirecting to dashboard...',
          apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
          data: result.data
        });
        
        // Verify token was saved
        const savedToken = localStorage.getItem('adminToken');
        logStep('Token saved check', { tokenSaved: !!savedToken });
        
        // Short delay before redirect for better UX
        logStep('Starting redirect delay');
        setTimeout(() => {
          logStep('Redirecting to dashboard');
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        logStep('Login failed', { 
          message: result.message, 
          statusCode: result.statusCode 
        });
        
        handleApiError({ message: result.message || 'Invalid admin token' }, 'Admin login failed');
        
        // Update debug info with failure details
        setDebugInfo({
          status: 'Failed',
          error: result.message || 'Invalid admin token',
          statusCode: result.statusCode,
          apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
          details: result
        });
      }
    } catch (error: any) {
      logStep('Exception during login', { 
        message: error.message,
        stack: error.stack?.substring(0, 100) + '...'
      });
      
      handleApiError(error, 'Admin login failed');
      
      // Update debug info with error details
      setDebugInfo({
        status: 'Error',
        message: error.message || 'Unknown error occurred',
        stack: error.stack,
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5003/api'
      });
    } finally {
      logStep('Login process completed');
      setIsSubmitting(false);
    }
  };
  
  // Function to manually test the admin token
  const testAdminToken = async () => {
    try {
      logStep('Testing admin token', { token: adminToken.substring(0, 3) + '...' });
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      
      // Directly test the admin token with fetch
      const testUrl = `${apiUrl}/admin/test-token?adminToken=${encodeURIComponent(adminToken)}`;
      logStep('Fetching', { url: testUrl });
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      logStep('Test result', data);
      toast.success('Token test completed. Check debug section.');
      
      // Add test results to debug info
      setDebugInfo(prev => ({
        ...prev,
        testResult: data
      }));
    } catch (error: any) {
      logStep('Test error', { message: error.message });
      toast.error('Token test failed: ' + error.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-md mx-auto bg-[#2a2a2a] rounded-2xl p-8 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adminToken">Admin Token</Label>
              <div className="relative">
                <Input
                  id="adminToken"
                  type={showPassword ? "text" : "password"}
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  placeholder="Enter your admin token"
                  className="bg-white/10 border-white/20 text-white pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <Key className="text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Login to Admin Panel'
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full mt-2 border-gray-700"
              onClick={testAdminToken}
            >
              Test Token Only
            </Button>
          </form>
          
          <p className="text-gray-400 text-sm mt-6 text-center">
            This area is restricted to authorized administrators only.
          </p>
          
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm">
              <span className="font-semibold">Hint:</span> Use the token "admin123" for demo access.
            </p>
          </div>
          
          {/* Debug info */}
          {debugInfo && (
            <div className="mt-6 p-4 border border-gray-700 rounded bg-gray-800/50 text-xs overflow-auto">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Login steps log */}
          {loginSteps.length > 0 && (
            <div className="mt-6 p-4 border border-gray-700 rounded bg-gray-800/50 text-xs overflow-auto max-h-64">
              <h3 className="font-bold mb-2">Login Process Log:</h3>
              <div className="space-y-2">
                {loginSteps.map((step, idx) => (
                  <div key={idx} className="border-b border-gray-700 pb-1">
                    <span className="text-gray-400">{step.timestamp.split('T')[1].split('.')[0]}</span>
                    {' - '}
                    <span className="text-amber-400">{step.step}</span>
                    {step.data && (
                      <pre className="mt-1 pl-4 text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 