import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import authService from '../services/authService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  profilePhoto?: string;
  authProvider: string;
}

const EditProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        // First try to get from local storage
        let userProfile = authService.getUserProfile();
        
        // If not available, fetch from API
        if (!userProfile) {
          userProfile = await authService.getProfile();
        }
        
        if (userProfile) {
          setUser(userProfile);
          setFullName(userProfile.fullName || '');
          setProfilePhoto(userProfile.profilePhoto || '');
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load user profile. Please log in again."
          });
          authService.logout();
          navigate('/login');
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profile"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [toast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updatedProfile = await authService.updateProfile({
        fullName,
        profilePhoto
      });
      
      // Update local storage with the updated profile
      authService.updateUserProfile(updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
      
      // Redirect to home page instead of dashboard
      navigate('/');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update your profile"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#1a1a1a] min-h-screen text-white">
      <Card className="max-w-md mx-auto bg-[#2a2a2a] border border-white/10">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profilePhoto} alt={fullName} />
              <AvatarFallback>{fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="text-white">Edit Profile</CardTitle>
              <CardDescription className="text-gray-400">Update your profile information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="bg-[#3a3a3a] border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-[#3a3a3a] border-white/20 text-gray-400"
              />
              <p className="text-xs text-gray-400">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profilePhoto" className="text-white">Profile Photo URL</Label>
              <Input
                id="profilePhoto"
                value={profilePhoto}
                onChange={e => setProfilePhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="bg-[#3a3a3a] border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="authProvider" className="text-white">Authentication Provider</Label>
              <Input
                id="authProvider"
                value={user?.authProvider || ''}
                disabled
                className="bg-[#3a3a3a] border-white/20 text-gray-400"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={updating}>
              {updating ? 'Updating...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile; 