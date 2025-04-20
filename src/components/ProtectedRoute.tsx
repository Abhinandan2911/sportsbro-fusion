import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('ProtectedRoute: Checking authentication');
      
      // First check if user is already authenticated in the AuthContext
      if (isLoggedIn && user) {
        console.log('ProtectedRoute: User is logged in via AuthContext');
        setAuthenticated(true);
        setLoading(false);
        return;
      }
      
      // Then check auth service as a fallback
      const isAuth = authService.isAuthenticated();
      console.log('ProtectedRoute: Auth service authentication check:', isAuth);
      
      if (isAuth) {
        // Verify by attempting to fetch profile
        console.log('ProtectedRoute: Fetching user profile to verify token');
        const userProfile = await authService.fetchUserProfile();
        
        if (userProfile) {
          console.log('ProtectedRoute: Valid user profile found:', userProfile);
          setAuthenticated(true);
        } else {
          console.log('ProtectedRoute: Failed to fetch valid profile');
          setAuthenticated(false);
        }
      } else {
        console.log('ProtectedRoute: User is not authenticated');
        setAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [isLoggedIn, user]);

  if (loading) {
    // Show loading spinner
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    // Redirect to login page, but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child components
  console.log('ProtectedRoute: User is authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute; 