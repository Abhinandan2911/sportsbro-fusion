import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import authService from '../services/authService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // Access the auth context to properly update state

  useEffect(() => {
    const handleToken = async () => {
      try {
        if (!token) {
          setError('No authentication token provided');
          setLoading(false);
          return;
        }

        console.log('Handling authentication token');
        
        // Store the token
        authService.setToken(token);

        // Fetch the user profile
        const profileResponse = await authService.getProfile();
        const profile = profileResponse.data || profileResponse;
        
        console.log('Received profile:', profile);
        
        // Show welcome toast
        toast({
          title: "Authentication Successful",
          description: `Welcome, ${profile.fullName || profile.email}!`
        });

        // Prepare the user object
        const user = {
          userId: profile._id || profile.id,
          fullName: profile.fullName || profile.username || '',
          email: profile.email || '',
          profilePhoto: profile.profilePhoto || null,
          gender: profile.gender || '',
          sports: profile.sports || [],
          achievements: profile.achievements || [],
          authProvider: profile.authProvider || 'google',
          isProfileComplete: profile.isProfileComplete || false,
          isFirstLogin: profile.isFirstLogin || false
        };
        
        // Important: Update auth context with the login function
        // This ensures the entire app knows about the authentication state
        login(user);
        
        // Force app-wide state update
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userProfile', JSON.stringify(user));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('authToken', token);
        
        // Add a short delay to ensure state is properly updated
        setTimeout(() => {
          // Redirect to the dashboard or home page
          navigate('/', { replace: true });
        }, 500);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Failed to authenticate. Please try again.');
        setLoading(false);
      }
    };

    handleToken();
  }, [token, navigate, toast, login]);

  if (loading && !error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white">Authenticating...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we log you in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-red-500">Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Return to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-white">Authentication successful!</p>
        <p className="text-gray-400 text-sm mt-2">Redirecting to home page...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 