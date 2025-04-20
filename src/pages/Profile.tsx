import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Edit2, LogOut, Trophy, Activity, Shield, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PremiumDialog from '@/components/PremiumDialog';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

// Predefined achievements that users can select from
const PREDEFINED_ACHIEVEMENTS = [
  { title: 'District Champion', description: 'Won district level tournament', year: '2023' },
  { title: 'Best Player', description: 'Awarded best player in tournament', year: '2022' },
  { title: 'Team Captain', description: 'Led team to victory', year: '2023' },
  { title: 'Most Valuable Player', description: 'MVP of the season', year: '2023' },
  { title: 'Rising Star', description: 'Outstanding performance in debut season', year: '2022' },
  { title: 'Sportsmanship Award', description: 'Exemplary conduct on and off field', year: '2023' },
  { title: 'Tournament Winner', description: 'Won major tournament', year: '2023' },
  { title: 'Record Breaker', description: 'Set new record in competition', year: '2023' },
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const { user, login, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(() => Date.now());
  const isMountedRef = useRef(true);
  const initialLoadCompletedRef = useRef(false);
  
  // Set isMountedRef to false when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Add self-recovery mechanism to handle authentication edge cases
  useEffect(() => {
    // Check if we have any form of authentication
    const hasToken = !!localStorage.getItem('authToken');
    const isLoggedInFlag = localStorage.getItem('isLoggedIn') === 'true';
    const hasUserData = !!localStorage.getItem('userProfile') || !!localStorage.getItem('user');
    
    console.log('Profile page auth check:', {
      hasToken,
      isLoggedInFlag,
      hasUserData
    });
    
    if (!hasToken && !isLoggedInFlag) {
      console.warn('Profile page loaded without proper authentication');
      
      if (hasUserData) {
        // We have user data but no token - set the isLoggedIn flag to recover
        console.log('Applying recovery - setting isLoggedIn flag');
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        // No recovery possible, redirect to login
        console.log('No recovery possible, redirecting to login');
        navigate('/login');
      }
    }
  }, [navigate]);
  
  // Get stored profile data from localStorage or fall back to user context
  const [userInfo, setUserInfo] = useState(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      initialLoadCompletedRef.current = true;
      return JSON.parse(storedProfile);
    }
    
    // If we have user data from the auth context, mark initial load as completed
    if (user) {
      initialLoadCompletedRef.current = true;
    }
    
    // Fall back to current user from auth context
    return {
      fullName: user?.fullName || 'John Doe',
      userId: user?.userId || '@johndoe',
      email: user?.email || 'user@example.com',
      gender: user?.gender || 'Male',
      sports: user?.sports || [],
      achievements: user?.achievements || [],
      profilePhoto: user?.profilePhoto || null,
      authProvider: user?.authProvider || 'local'
    };
  });
  
  // Fetch user profile from the server when component mounts, but only if needed
  useEffect(() => {
    // Skip this effect entirely if we already completed initial load
    // or if auth is already loading
    if (initialLoadCompletedRef.current && !user?.userId) {
      console.log('Skipping profile fetch - initial load already completed or no user ID');
      return;
    }
    
    let isCancelled = false;
    let loadingTimer: NodeJS.Timeout | null = null;
    
    const fetchUserProfile = async () => {
      // Skip fetch if auth is already loading, or if we recently fetched (within last 10 seconds)
      if (authLoading || (Date.now() - lastFetch < 10000)) {
        console.log('Skipping profile fetch - auth loading or recent fetch');
        return;
      }
      
      try {
        // Only fetch if user is logged in and we have an auth token
        if (user && localStorage.getItem('authToken')) {
          setLoading(true);
          
          // Debug log to help diagnose loop issues
          console.log('Fetching profile data...', { 
            userId: user.userId,
            lastFetch,
            now: Date.now(),
            timeSinceLastFetch: Date.now() - lastFetch
          });
          
          const response = await api.auth.getProfile();
          
          // Don't update state if component unmounted or operation cancelled
          if (isCancelled || !isMountedRef.current) return;
          
          setLastFetch(Date.now()); // Update fetch timestamp
          initialLoadCompletedRef.current = true;
          
          if (response.success && response.data) {
            // Compare data to see if we need to update
            const currentUserInfo = userInfo;
            
            // Use stable stringification to compare objects
            const stripFunctions = (key: string, value: any) => {
              return typeof value === 'function' ? undefined : value;
            };
            
            // Only compare relevant fields to avoid false positives
            const currentUserRelevant = {
              fullName: currentUserInfo?.fullName,
              sports: currentUserInfo?.sports,
              achievements: currentUserInfo?.achievements,
              profilePhoto: currentUserInfo?.profilePhoto,
              gender: currentUserInfo?.gender
            };
            
            const newUserRelevant = {
              fullName: response.data?.fullName,
              sports: response.data?.sports,
              achievements: response.data?.achievements,
              profilePhoto: response.data?.profilePhoto,
              gender: response.data?.gender
            };
            
            const currentStr = JSON.stringify(currentUserRelevant, stripFunctions);
            const newStr = JSON.stringify(newUserRelevant, stripFunctions);
            
            const hasChanges = currentStr !== newStr;
              
            if (hasChanges) {
              console.log('Profile data has changed, updating...');
              // Update local state with server data
              setUserInfo(response.data);
              
              // DO NOT call login here - it creates an infinite loop!
              // Just update the localStorage but don't trigger context updates
              localStorage.setItem('userProfile', JSON.stringify(response.data));
            } else {
              console.log('No meaningful profile changes, skipping update');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fall back to localStorage if API call fails
        if (!isCancelled && isMountedRef.current) {
          const storedProfile = localStorage.getItem('userProfile');
          if (storedProfile) {
            setUserInfo(JSON.parse(storedProfile));
          }
        }
      } finally {
        // Add a small delay before removing loading state to prevent flickering
        if (!isCancelled && isMountedRef.current) {
          loadingTimer = setTimeout(() => {
            if (!isCancelled && isMountedRef.current) {
              setLoading(false);
            }
          }, 300); // 300ms delay before removing loading state
        }
      }
    };
    
    fetchUserProfile();
    
    return () => {
      isCancelled = true;
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // Only depend on the user ID - this is the real source of truth
  
  // Show loading indicator when auth is loading or component is loading
  const isPageLoading = loading || authLoading;
  
  // Skip updates during editing to prevent interference
  useEffect(() => {
    if (user && !isEditing) {
      // Get current localStorage data
      const storedProfile = localStorage.getItem('userProfile');
      const storedData = storedProfile ? JSON.parse(storedProfile) : null;
      
      // Only update if there's meaningful difference to avoid loops
      if (storedData && JSON.stringify(storedData) !== JSON.stringify(userInfo)) {
        setUserInfo(prevInfo => ({
          ...prevInfo,
          ...storedData
        }));
      }
    }
  }, [user, isEditing, userInfo]); // Add userInfo to the dependency array

  const [editedInfo, setEditedInfo] = useState(userInfo);
  const [showAchievementDropdown, setShowAchievementDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2023');
  const [newSport, setNewSport] = useState('');
  const [newAchievementTitle, setNewAchievementTitle] = useState('');
  const [newAchievementDescription, setNewAchievementDescription] = useState('');

  // Only update localStorage if there's a meaningful change
  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    const storedData = storedProfile ? JSON.parse(storedProfile) : null;
    
    if (userInfo && (!storedData || JSON.stringify(userInfo) !== JSON.stringify(storedData))) {
      localStorage.setItem('userProfile', JSON.stringify(userInfo));
    }
  }, [userInfo]); // Only depend on userInfo

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    logout();
    navigate('/');
  };

  const handleEdit = () => {
    setEditedInfo({...userInfo}); // Create a deep copy to avoid reference issues
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedInfo({...userInfo}); // Create a deep copy to avoid reference issues
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // Skip if already saving
      if (loading) return;
      
      setLoading(true);
      const updatedInfo = {
        ...editedInfo,
        // Preserve the original auth provider
        authProvider: userInfo.authProvider || 'local'
      };
      
      // Check if there are actual changes before saving
      const hasChanges = 
        JSON.stringify(userInfo.fullName) !== JSON.stringify(updatedInfo.fullName) ||
        JSON.stringify(userInfo.sports) !== JSON.stringify(updatedInfo.sports) ||
        JSON.stringify(userInfo.achievements) !== JSON.stringify(updatedInfo.achievements) ||
        JSON.stringify(userInfo.gender) !== JSON.stringify(updatedInfo.gender) ||
        JSON.stringify(userInfo.profilePhoto) !== JSON.stringify(updatedInfo.profilePhoto);
        
      if (!hasChanges) {
        console.log('No changes detected, skipping save');
        setIsEditing(false);
        setLoading(false);
        return;
      }
      
      // Set lastFetch to now to prevent profile from being fetched again immediately
      setLastFetch(Date.now() + 30000); // 30 seconds in the future
      
      // Ensure authentication state is maintained
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.log('No auth token found, setting isLoggedIn flag to maintain auth state');
        localStorage.setItem('isLoggedIn', 'true');
      }
      
      // Verify the image size in case it's still too large
      if (updatedInfo.profilePhoto && typeof updatedInfo.profilePhoto === 'string' && updatedInfo.profilePhoto.length > 1000000) {
        // If still too large, use a placeholder or smaller version
        const canvas = document.createElement('canvas');
        const img = new Image();
        
        img.onload = async () => {
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, 200, 200);
            const smallerPhoto = canvas.toDataURL('image/jpeg', 0.5);
            
            const finalInfo = {
              ...updatedInfo,
              profilePhoto: smallerPhoto
            };
            
            // Save to database first
            try {
              const response = await api.auth.updateProfile(finalInfo);
              
              if (response.success) {
                // Update state and localStorage
                setUserInfo(finalInfo);
                localStorage.setItem('userProfile', JSON.stringify(finalInfo));
                localStorage.setItem('isLoggedIn', 'true');
                
                // If we get a token back from the server, store it
                if (response.token) {
                  localStorage.setItem('authToken', response.token);
                }
                
                toast.success('Profile updated successfully!');
              } else {
                throw new Error(response.message || 'Failed to update profile');
              }
            } catch (apiError) {
              console.error('Error saving profile to database:', apiError);
              toast.error('Failed to save profile to server. Changes are saved locally only.');
              
              // Still update local state even if server update fails
              setUserInfo(finalInfo);
              localStorage.setItem('userProfile', JSON.stringify(finalInfo));
              localStorage.setItem('isLoggedIn', 'true');
            }
            
            setIsEditing(false);
            setLoading(false);
          }
        };
        
        img.onerror = async () => {
          // Fallback to saving without image if there's an error
          const noPhotoInfo = {
            ...updatedInfo,
            profilePhoto: null
          };
          
          try {
            await api.auth.updateProfile(noPhotoInfo);
            toast.success('Profile updated without photo');
          } catch (apiError) {
            console.error('Error saving profile to database:', apiError);
            toast.error('Failed to save profile to server. Changes are saved locally only.');
          }
          
          setUserInfo(noPhotoInfo);
          localStorage.setItem('userProfile', JSON.stringify(noPhotoInfo));
          localStorage.setItem('isLoggedIn', 'true');
          
          setIsEditing(false);
          setLoading(false);
        };
        
        img.src = updatedInfo.profilePhoto;
      } else {
        // Normal save path for smaller images
        try {
          const response = await api.auth.updateProfile(updatedInfo);
          
          if (response.success) {
            // Update state and localStorage
            setUserInfo(updatedInfo);
            localStorage.setItem('userProfile', JSON.stringify(updatedInfo));
            localStorage.setItem('isLoggedIn', 'true');
            
            // If we get a token back from the server, store it
            if (response.token) {
              localStorage.setItem('authToken', response.token);
            }
            
            toast.success('Profile updated successfully!');
          } else {
            throw new Error(response.message || 'Failed to update profile');
          }
        } catch (apiError) {
          console.error('Error saving profile to database:', apiError);
          toast.error('Failed to save profile to server. Changes are saved locally only.');
          
          // Still update local state even if server update fails
          setUserInfo(updatedInfo);
          localStorage.setItem('userProfile', JSON.stringify(updatedInfo));
          localStorage.setItem('isLoggedIn', 'true');
        }
        
        setIsEditing(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('There was a problem saving your profile. Please try again with a smaller profile photo.');
      
      // Fallback to saving without the problematic photo
      const safeInfo = {
        ...editedInfo,
        profilePhoto: null
      };
      
      try {
        await api.auth.updateProfile(safeInfo);
      } catch (apiError) {
        console.error('Error saving profile to database:', apiError);
      }
      
      setUserInfo(safeInfo);
      localStorage.setItem('userProfile', JSON.stringify(safeInfo));
      localStorage.setItem('isLoggedIn', 'true');
      
      setIsEditing(false);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sport = e.target.value;
    if (e.target.checked) {
      setEditedInfo(prev => ({
        ...prev,
        sports: [...prev.sports, sport]
      }));
    } else {
      setEditedInfo(prev => ({
        ...prev,
        sports: prev.sports.filter(s => s !== sport)
      }));
    }
  };

  const handleAchievementSelect = (achievement: typeof PREDEFINED_ACHIEVEMENTS[0]) => {
    const newAchievement = { ...achievement, year: selectedYear };
    setEditedInfo(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
    setShowAchievementDropdown(false);
  };

  const handleAchievementRemove = (index: number) => {
    setEditedInfo(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomSport = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSport.trim() === '') return;
    
    setEditedInfo(prev => ({
      ...prev,
      sports: [...prev.sports, newSport.trim()]
    }));
    
    setNewSport('');
  };

  const handleAddCustomAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAchievementTitle.trim() === '') return;
    
    const newAchievement = {
      title: newAchievementTitle.trim(),
      description: newAchievementDescription.trim() || 'No description provided'
    };
    
    setEditedInfo(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
    
    // Clear inputs
    setNewAchievementTitle('');
    setNewAchievementDescription('');
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size before processing
    if (file.size > 2 * 1024 * 1024) {  // 2MB limit
      alert("Image size should be less than 2MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const photoUrl = event.target?.result as string;
        
        // Compress image before setting in state
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to more efficient format and reduced quality
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            setEditedInfo(prev => ({
              ...prev,
              profilePhoto: compressedUrl
            }));
          }
        };
        
        img.src = photoUrl;
      } catch (error) {
        console.error('Error processing image:', error);
        alert('There was a problem processing the image. Please try a different one.');
      }
    };
    
    reader.onerror = () => {
      alert('There was an error reading the file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };

  // Add a reset function to clear out problematic states
  const resetProfileState = useCallback(() => {
    console.log('Resetting profile state due to issues...');
    setLoading(false);
    setLastFetch(Date.now());
    initialLoadCompletedRef.current = false;
    
    // Clear localStorage to force a clean state
    localStorage.removeItem('userProfile');
    // Delay reload to prevent infinite error loops
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);
  
  // Add an error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by profile error boundary:', event.error);
      resetProfileState();
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [resetProfileState]);
  
  // Add a safety timeout to detect potential infinite loops
  useEffect(() => {
    // If loading state persists for more than 10 seconds, something is wrong
    let safetyTimer: NodeJS.Timeout | null = null;
    
    if (loading) {
      console.log('Setting safety timer due to loading state');
      safetyTimer = setTimeout(() => {
        console.warn('Loading state persisted for 10 seconds, resetting profile');
        resetProfileState();
      }, 10000);
    }
    
    return () => {
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [loading, resetProfileState]);
  
  // If the profile page is causing issues, provide a way for the user to reset
  if (loading && Date.now() - lastFetch > 5000) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8 text-white">
        <Navbar />
        <div className="container mx-auto max-w-4xl mt-8">
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/70">Loading your profile data...</p>
            <button
              onClick={resetProfileState}
              className="mt-8 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              Reset Profile (If Stuck)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8 text-white">
        <Navbar />
        <div className="container mx-auto max-w-4xl mt-8">
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white/70">Loading your profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Profile Header */}
        <div className="bg-[#2a2a2a] rounded-2xl p-6 mb-8 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Profile Photo with Upload Functionality */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  {(isEditing ? editedInfo : userInfo).profilePhoto ? (
                    <img 
                      src={(isEditing ? editedInfo : userInfo).profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                  )}
                </div>
                
                {/* Edit overlay that appears on hover in edit mode */}
                {isEditing && (
                  <label 
                    htmlFor="profile-photo-upload" 
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-all"
                  >
                    <Edit2 className="w-6 h-6 text-white" />
                    <input 
                      id="profile-photo-upload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleProfilePhotoChange} 
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      name="fullName"
                      value={editedInfo.fullName}
                      onChange={handleChange}
                      className="bg-white/10 border-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] focus:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    />
                    <Input
                      name="userId"
                      value={editedInfo.userId}
                      onChange={handleChange}
                      className="bg-white/10 border-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] focus:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    />
                    <div className="relative">
                      <select
                        name="gender"
                        value={editedInfo.gender}
                        onChange={handleChange}
                        className="w-full appearance-none bg-[#2a2a2a] border border-white/20 text-amber-500 rounded-md px-3 py-1.5 shadow-[0_0_10px_rgba(255,255,255,0.1)] focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] focus:outline-none"
                      >
                        <option value="Male" className="bg-[#2a2a2a] text-amber-500">Male</option>
                        <option value="Female" className="bg-[#2a2a2a] text-amber-500">Female</option>
                        <option value="Other" className="bg-[#2a2a2a] text-amber-500">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{userInfo.fullName}</h1>
                    <p className="text-gray-400 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{userInfo.userId}</p>
                    
                    {/* Auth Provider Badge */}
                    {userInfo.authProvider && (
                      <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${userInfo.authProvider === 'google' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-amber-500/20 text-amber-400'}`}>
                        {userInfo.authProvider === 'google' ? (
                          <>
                            <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google Account
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 mr-1.5" />
                            Standard Account
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEdit}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            {/* Sports Section */}
            <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" />
                <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Sports</span>
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  {/* Add Your Sport Input */}
                  <form onSubmit={handleAddCustomSport} className="flex items-center">
                    <Input
                      type="text"
                      value={newSport}
                      onChange={(e) => setNewSport(e.target.value)}
                      placeholder="Add your sport..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 focus:ring-2 focus:ring-amber-500/30"
                    />
                    <Button 
                      type="submit" 
                      className="ml-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500"
                      disabled={!newSport.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>
                  
                  {/* Show Added Sports */}
                  {editedInfo.sports.length > 0 ? (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {editedInfo.sports.map((sport, index) => (
                          <div key={index} className="bg-white/10 rounded-full px-3 py-1 flex items-center gap-1">
                            <span className="text-sm">{sport}</span>
                            <button 
                              onClick={() => {
                                setEditedInfo(prev => ({
                                  ...prev,
                                  sports: prev.sports.filter(s => s !== sport)
                                }))
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      Please add your favorite sports using the form above
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userInfo.sports.length > 0 ? (
                    userInfo.sports.map((sport, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-white/10 rounded-full text-sm shadow-[0_0_5px_rgba(255,255,255,0.1)] drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]"
                      >
                        {sport}
                      </span>
                    ))
                  ) : (
                    <div className="text-center w-full py-4 text-gray-400">
                      No sports added yet
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Achievements Section */}
            <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" />
                  <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Achievements</span>
                </h2>
                
                {/* Show Add Achievement button only in edit mode */}
                {isEditing && !showAchievementDropdown && (
                  <Button
                    onClick={() => setShowAchievementDropdown(true)}
                    className="bg-white/10 hover:bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Achievement
                  </Button>
                )}
              </div>
              
              {/* Achievement Input Form - only shown when button is clicked */}
              {isEditing && showAchievementDropdown && (
                <form 
                  onSubmit={(e) => {
                    handleAddCustomAchievement(e);
                    setShowAchievementDropdown(false);  // Hide form after submission
                  }} 
                  className="mb-6 space-y-3 bg-white/5 p-4 rounded-xl border border-white/10"
                >
                  <div>
                    <Label htmlFor="achievementTitle" className="text-white/90 mb-1 block">Achievement Title</Label>
                    <Input
                      id="achievementTitle"
                      type="text"
                      value={newAchievementTitle}
                      onChange={(e) => setNewAchievementTitle(e.target.value)}
                      placeholder="Enter achievement title..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="achievementDescription" className="text-white/90 mb-1 block">Description</Label>
                    <Input
                      id="achievementDescription"
                      type="text"
                      value={newAchievementDescription}
                      onChange={(e) => setNewAchievementDescription(e.target.value)}
                      placeholder="Enter description..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-500"
                      disabled={!newAchievementTitle.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => {
                        setShowAchievementDropdown(false);
                        setNewAchievementTitle('');
                        setNewAchievementDescription('');
                      }} 
                      className="w-1/3 bg-white/10 hover:bg-white/20 text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              )}
              
              {/* Achievement List */}
              <div className="space-y-4">
                {(isEditing ? editedInfo : userInfo).achievements.length > 0 ? (
                  (isEditing ? editedInfo : userInfo).achievements.map((achievement, index) => (
                    <div key={index} className="border-b border-white/10 pb-4 last:border-0 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{achievement.title}</h3>
                        <p className="text-gray-400 text-sm drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">{achievement.description}</p>
                      </div>
                      {isEditing && (
                        <Button
                          onClick={() => handleAchievementRemove(index)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-500 p-2 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    {isEditing ? 
                      "Click 'Add Achievement' button to add your achievements" : 
                      "No achievements added yet"
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Privacy Settings */}
            <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" />
                <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Privacy Settings</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">Profile Visibility</span>
                  <select className="bg-white/10 rounded-lg px-3 py-1.5 text-sm text-amber-500 shadow-[0_0_10px_rgba(255,255,255,0.1)] focus:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <option className="bg-[#2a2a2a] text-amber-500">Public</option>
                    <option className="bg-[#2a2a2a] text-amber-500">Private</option>
                    <option className="bg-[#2a2a2a] text-amber-500">Friends Only</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">Show Achievements</span>
                  <input type="checkbox" className="rounded bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.1)]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">Show Sports</span>
                  <input type="checkbox" className="rounded bg-white/10 shadow-[0_0_5px_rgba(255,255,255,0.1)]" />
                </div>
              </div>
            </div>

            {/* Account Information - Show for Google accounts */}
            {userInfo.authProvider === 'google' ? (
              <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Google Account</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300 text-sm">
                      Your account is linked to Google. You can use Google to sign in to your SportsBro account. 
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Connected Email</p>
                    <p className="text-sm text-white">{userInfo.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#2a2a2a] rounded-2xl p-6 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]" />
                  <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Account</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300 text-sm">
                      You're using a standard account with email and password for authentication.
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Email Address</p>
                    <p className="text-sm text-white">{userInfo.email}</p>
                  </div>
                  {!isEditing && (
                    <Button
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-500"
                      onClick={handleEdit}
                    >
                      Update Profile Information
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Premium Features */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <h2 className="text-xl font-bold mb-4 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Upgrade to Premium</h2>
              <p className="text-gray-300 mb-4 drop-shadow-[0_0_3px_rgba(255,255,255,0.1)]">
                Get access to advanced features and personalized training programs.
              </p>
              <Button 
                onClick={() => setShowPremiumDialog(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Dialog */}
      <PremiumDialog 
        isOpen={showPremiumDialog} 
        onClose={() => setShowPremiumDialog(false)} 
      />
    </div>
  );
};

export default Profile; 