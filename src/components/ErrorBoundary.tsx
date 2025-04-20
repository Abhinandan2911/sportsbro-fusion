import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/services/api';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error info for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = (): void => {
    // Reset the error state and retry
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Check if a custom fallback was provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-center space-y-3 max-w-md">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
              {this.state.error instanceof ApiError ? 'API Error' : 'Something went wrong'}
            </h2>
            
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              {this.state.error instanceof ApiError ? (
                <>
                  <p className="font-medium">Status: {this.state.error.status || 'Unknown'}</p>
                  <p>{this.state.error.message}</p>
                  
                  {this.state.error.status === 0 && (
                    <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded text-amber-800 dark:text-amber-300 text-xs">
                      <h4 className="font-semibold mb-1">Troubleshooting Tips:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Check if the backend server is running</li>
                        <li>Verify your internet connection</li>
                        <li>Check for any console errors</li>
                        <li>Ensure the API URL is correctly configured</li>
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
              )}
            </div>
            
            <div className="flex justify-center gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={this.handleRetry}
                className="border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                Try Again
              </Button>
              <Button 
                variant="default"
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 