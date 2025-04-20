import { useEffect, useState } from 'react';
import authService from '../services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  profilePhoto?: string;
  authProvider: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // First try to get from local storage
        let userProfile = authService.getUserProfile();
        
        // If not available, fetch from API
        if (!userProfile) {
          userProfile = await authService.getProfile();
        }
        
        setUser(userProfile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
        <Card className="w-[350px] bg-[#2a2a2a] border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Error</CardTitle>
            <CardDescription className="text-gray-400">Failed to load user profile</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleLogout} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#1a1a1a] min-h-screen text-white">
      <Card className="max-w-md mx-auto bg-[#2a2a2a] border border-white/10">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePhoto} alt={user.fullName} />
              <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="text-white">{user.fullName}</CardTitle>
              <CardDescription className="text-gray-400">
                Logged in with {user.authProvider === 'google' ? 'Google' : user.authProvider}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">Email</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-white">User ID</p>
            <p className="text-sm text-gray-400">{user.id}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleEditProfile} 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            Edit Profile
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard; 