import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ApiError } from '@/services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type ConnectionStatus = 'idle' | 'loading' | 'connected' | 'error';

const BackendStatusChecker: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkBackendStatus = async () => {
    setStatus('loading');
    setMessage('Checking backend connection...');

    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setMessage(`Connected to backend: ${data.message || 'Server is running'}`);
        setRetryCount(0); // Reset retry count on success
        // Clear any retry interval if it exists
        if (retryIntervalRef.current) {
          clearInterval(retryIntervalRef.current);
          retryIntervalRef.current = null;
        }
      } else {
        const errorData = await response.json();
        throw new ApiError(errorData.message || 'Backend connection error', response.status);
      }
    } catch (error) {
      setStatus('error');
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setMessage('Cannot connect to the backend server. Please make sure it is running.');
      } else if (error instanceof ApiError) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Unexpected error: ${(error as Error).message}`);
      }
      
      // If we haven't exceeded max retries, set up retry
      if (retryCount < maxRetries && !retryIntervalRef.current) {
        // Exponential backoff: 5s, 10s, 20s
        const delay = Math.pow(2, retryCount) * 5000;
        setMessage(prev => `${prev} Retrying in ${delay/1000}s...`);
        
        retryIntervalRef.current = setInterval(() => {
          setRetryCount(prev => prev + 1);
          checkBackendStatus();
        }, delay);
      }
    }
  };

  // Check backend status on component mount and every 30 seconds
  useEffect(() => {
    // Check immediately when component mounts
    checkBackendStatus();
    
    // Set up interval to check every 30 seconds
    const intervalId = setInterval(checkBackendStatus, 30000);
    
    // Clean up the interval when component unmounts
    return () => {
      clearInterval(intervalId);
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
    };
  }, []);
  
  // Determine background and border styles based on status
  const getContainerStyles = () => {
    if (status === 'connected') {
      return 'bg-green-950/20 border-green-800/30';
    } else if (status === 'error') {
      return 'bg-red-950/20 border-red-800/30';
    } else {
      return 'bg-[#2a2a2a] border-white/10';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className={`p-4 rounded-lg border ${getContainerStyles()} text-white`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {status === 'connected' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {status === 'loading' && (
              <div className="h-5 w-5 border-2 border-t-transparent border-yellow-500 rounded-full animate-spin"></div>
            )}
            {status === 'idle' && <AlertCircle className="h-5 w-5 text-gray-400" />}
            <h3 className="text-lg font-semibold">Backend Connection</h3>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <div className="mt-2">
          {status === 'idle' && (
            <p className="text-gray-400">Initializing backend connection check...</p>
          )}
          
          {status === 'loading' && (
            <div className="flex items-center gap-2">
              <p className="text-yellow-400">{message}</p>
            </div>
          )}
          
          {status === 'connected' && (
            <div className="flex items-center gap-2">
              <p className="text-green-400">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-2">
              <p className="text-red-400">{message}</p>
            </div>
          )}
        </div>
        
        <CollapsibleContent>
          {status === 'error' && (
            <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-800 text-xs">
              <h4 className="font-semibold mb-2 text-white">Troubleshooting Steps:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                <li>
                  <strong>Check if backend server is running:</strong>
                  <ul className="list-disc pl-5 mt-1 text-gray-400">
                    <li>Navigate to the backend folder in terminal: <code className="bg-slate-800 px-1 py-0.5 rounded">cd backend</code></li>
                    <li>Start the server: <code className="bg-slate-800 px-1 py-0.5 rounded">npm run dev</code> or use the <code className="bg-slate-800 px-1 py-0.5 rounded">start.bat</code> file</li>
                  </ul>
                </li>
                <li>
                  <strong>Verify API URL configuration:</strong>
                  <div className="mt-1 text-gray-400">
                    Current API URL: <code className="bg-slate-800 px-1 py-0.5 rounded">{API_URL}</code>
                    <div className="mt-1">Check this matches your backend server port in <code className="bg-slate-800 px-1 py-0.5 rounded">backend/.env</code> file.</div>
                  </div>
                </li>
                <li>
                  <strong>Check for network issues:</strong>
                  <div className="mt-1 text-gray-400">
                    Make sure no firewall is blocking local connections.
                  </div>
                </li>
              </ol>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={checkBackendStatus}
                  disabled={status === 'loading'}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-800 text-xs"
                >
                  {status === 'loading' ? 'Checking...' : 'Try Again Now'}
                </Button>
              </div>
            </div>
          )}
          
          {status === 'connected' && (
            <div className="mt-4 p-3 bg-green-900/20 rounded border border-green-900/30 text-xs">
              <h4 className="font-semibold mb-2 text-white">Connection Details:</h4>
              <div className="text-gray-300 space-y-1">
                <p><strong>API URL:</strong> {API_URL}</p>
                <p><strong>Status:</strong> Connected</p>
                <p><strong>Last Checked:</strong> {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default BackendStatusChecker; 