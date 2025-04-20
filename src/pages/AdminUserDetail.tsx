import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Save, Trash2 } from "lucide-react";
import { handleApiError, showSuccess } from '@/services/errorHandler';
import api from '@/services/api';

interface UserData {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  authProvider: string;
  googleId?: string;
  profilePhoto?: string;
  sports?: string[];
  gender?: string;
  createdAt: string;
}

const AdminUserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  
  // Check if admin is logged in
  useEffect(() => {
    if (!api.admin.isAdmin()) {
      navigate('/admin');
    }
  }, [navigate]);
  
  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await api.admin.getUserById(id);
        
        if (response.success && response.data) {
          setUserData(response.data);
          setFormData({
            fullName: response.data.fullName,
            username: response.data.username,
            email: response.data.email,
            gender: response.data.gender || '',
            sports: response.data.sports || []
          });
        } else {
          handleApiError({ message: 'Failed to load user details' }, 'Error');
          navigate('/admin/dashboard');
        }
      } catch (error) {
        handleApiError(error, 'Failed to load user details');
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [id, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSportsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sports = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      sports
    }));
  };
  
  const handleSave = async () => {
    if (!id || !formData) return;
    
    setSaving(true);
    try {
      const response = await api.admin.updateUser(id, formData);
      
      if (response.success) {
        showSuccess('User details updated successfully');
        
        // Update local state with the new data
        setUserData(prev => prev ? { ...prev, ...formData } : null);
      } else {
        handleApiError({ message: 'Failed to update user' }, 'Error');
      }
    } catch (error) {
      handleApiError(error, 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const response = await api.admin.deleteUser(id);
      
      if (response.success) {
        showSuccess('User deleted successfully');
        navigate('/admin/dashboard');
      } else {
        handleApiError({ message: 'Failed to delete user' }, 'Error');
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center">
        <p className="text-xl text-red-400 mb-6">User not found</p>
        <Button onClick={() => navigate('/admin/dashboard')} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            className="mr-4 text-amber-400 hover:text-amber-300"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-amber-400">User Details</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="col-span-1 backdrop-blur-sm bg-black/40 border border-white/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <CardHeader>
              <CardTitle className="text-amber-400">User Profile</CardTitle>
              <CardDescription className="text-gray-400">
                Basic information about the user
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex justify-center mb-6">
                {userData.profilePhoto ? (
                  <img 
                    src={userData.profilePhoto} 
                    alt={userData.fullName} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-amber-500/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {userData.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">ID</p>
                <p className="text-white/80 text-xs font-mono bg-white/5 p-2 rounded mt-1 break-all">
                  {userData._id}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Auth Provider</p>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    userData.authProvider === 'google' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {userData.authProvider === 'google' ? 'Google' : 'Local'}
                  </span>
                </div>
              </div>
              
              {userData.googleId && (
                <div>
                  <p className="text-gray-400 text-sm">Google ID</p>
                  <p className="text-white/70 text-xs font-mono bg-white/5 p-2 rounded mt-1 break-all">
                    {userData.googleId}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-gray-400 text-sm">Registered On</p>
                <p className="text-white/80 mt-1">
                  {formatDate(userData.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Edit Form */}
          <Card className="col-span-1 lg:col-span-2 backdrop-blur-sm bg-black/40 border border-white/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <CardHeader>
              <CardTitle className="text-amber-400">Edit User</CardTitle>
              <CardDescription className="text-gray-400">
                Update user information
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    className="bg-transparent border border-white/30 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white/90">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleInputChange}
                    className="bg-transparent border border-white/30 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="bg-transparent border border-white/30 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white/90">Gender</Label>
                  <Input
                    id="gender"
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className="bg-transparent border border-white/30 text-white"
                    placeholder="Male, Female, Non-binary, etc."
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sports" className="text-white/90">Sports (comma-separated)</Label>
                  <Input
                    id="sports"
                    name="sports"
                    value={(formData.sports || []).join(', ')}
                    onChange={handleSportsChange}
                    className="bg-transparent border border-white/30 text-white"
                    placeholder="Basketball, Soccer, Tennis, etc."
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-6">
              <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail; 