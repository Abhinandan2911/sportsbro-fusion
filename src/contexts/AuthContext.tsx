import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import api from '@/services/api';

interface User {
  fullName: string;
  userId: string;
  email: string;
  gender: string;
  sports: string[];
  achievements: Array<{
    title: string;
    description: string;
    year?: string;
  }>;
  profilePhoto?: string | null;
  isProfileComplete?: boolean;
  isFirstLogin?: boolean;
  authProvider?: 'google' | 'local';
  googleId?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  shouldShowProfileCompletion: boolean;
  dismissProfileCompletion: () => void;
  updateProfileCompletionStatus: (status: boolean) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize state from localStorage if available
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn');
    return storedLoggedIn === 'true';
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Check if this isn't the first render after login
      // If user data exists, this is not a first login
      const parsedUser = JSON.parse(storedUser);
      
      // Always set isFirstLogin to false for stored users
      // This ensures returning users never see the popup
      if (parsedUser) {
        parsedUser.isFirstLogin = false;
        // Immediately update localStorage to persist this change
        localStorage.setItem('user', JSON.stringify(parsedUser));
        console.log('Existing user found in localStorage - isFirstLogin set to false', parsedUser);
      }
      
      return parsedUser;
    }
    return null;
  });

  const [shouldShowProfileCompletion, setShouldShowProfileCompletion] = useState(() => {
    console.log('Calculating initial shouldShowProfileCompletion state');
    
    // Check if we've already shown the profile completion dialog for this session
    const hasShownDialog = localStorage.getItem('profileCompletionDismissed');
    console.log('profileCompletionDismissed:', hasShownDialog);
    
    // Get the user's first login status
    const storedUser = localStorage.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    
    // Explicitly ensure stored user is never considered a first login
    if (userObj) {
      if (userObj.isFirstLogin) {
        console.log('Found stored user with isFirstLogin=true, this should not happen for returning users');
        userObj.isFirstLogin = false;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    }
    
    const isFirstLogin = userObj?.isFirstLogin === true;
    console.log('isFirstLogin:', isFirstLogin);
    console.log('isProfileComplete:', userObj?.isProfileComplete);
    
    // For existing users, immediately make their isFirstLogin false to prevent popup
    if (userObj && !isFirstLogin) {
      // This is an existing user - make sure we don't show the popup
      localStorage.setItem('profileCompletionDismissed', 'true');
    }
    
    // Only show if:
    // 1. User is logged in
    // 2. Profile is incomplete
    // 3. Dialog hasn't been dismissed
    // 4. This is the user's first login
    const shouldShow = isLoggedIn && userObj && !userObj.isProfileComplete && hasShownDialog !== 'true' && isFirstLogin;
    console.log('Initial shouldShowProfileCompletion:', shouldShow);
    
    return shouldShow;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    if (user) {
      console.log('Saving user to localStorage:', user);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [isLoggedIn, user]);

  // Update profile completion dialog status when user changes
  useEffect(() => {
    if (user) {
      console.log('User updated, recalculating shouldShowProfileCompletion', {
        isProfileComplete: user.isProfileComplete,
        isFirstLogin: user.isFirstLogin
      });
      
      // CRITICAL FIX: Check if this is a subsequent render with the same user ID
      // If we've seen this user before in this session, NEVER show the popup
      const seenUsersBefore = sessionStorage.getItem('seen_users') || '[]';
      let seenUsers = JSON.parse(seenUsersBefore) as string[];
      
      if (seenUsers.includes(user.userId)) {
        console.log(`User ${user.userId} has been seen before in this session, suppressing popup`);
        setShouldShowProfileCompletion(false);
        
        // Also update the user to not be a first-time user anymore
        if (user.isFirstLogin) {
          console.log('Correcting incorrect isFirstLogin flag for returning user');
          const updatedUser = { ...user, isFirstLogin: false };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('profileCompletionDismissed', 'true');
        }
        return;
      }
      
      // Add this user to the seen users list
      seenUsers.push(user.userId);
      sessionStorage.setItem('seen_users', JSON.stringify(seenUsers));
      
      // Proceed with normal check
      if (!user.isProfileComplete) {
        // Check if dialog has been dismissed
        const hasShownDialog = localStorage.getItem('profileCompletionDismissed');
        // Only show the dialog if this is the user's first login
        const shouldShow = hasShownDialog !== 'true' && user.isFirstLogin === true;
        console.log('Setting shouldShowProfileCompletion to:', shouldShow);
        setShouldShowProfileCompletion(shouldShow);
      } else {
        console.log('Profile is complete, not showing dialog');
        setShouldShowProfileCompletion(false);
      }
    } else {
      console.log('No user, not showing dialog');
      setShouldShowProfileCompletion(false);
    }
  }, [user]);

  // Expose a fail-safe mechanism to dismiss the dialog if it appears incorrectly
  // This can be called from the browser console as window.dismissProfilePopup()
  useEffect(() => {
    // @ts-ignore - Add to window for emergency access
    window.dismissProfilePopup = () => {
      console.log('Emergency dismiss of profile popup triggered from console');
      localStorage.setItem('profileCompletionDismissed', 'true');
      if (user) {
        const updatedUser = { ...user, isFirstLogin: false };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setShouldShowProfileCompletion(false);
      console.log('Profile popup should now be dismissed');
    };
    
    return () => {
      // @ts-ignore - Clean up when component unmounts
      delete window.dismissProfilePopup;
    };
  }, [user]);

  // Add a debounce mechanism for login to prevent rapid calls
  const [lastLoginTimestamp, setLastLoginTimestamp] = useState<number>(0);
  const LOGIN_DEBOUNCE_MS = 1000; // 1 second between login attempts
  
  const login = useCallback(async (userData: User) => {
    const currentTime = Date.now();
    
    // Prevent rapid consecutive login calls (prevents infinite loops)
    if (currentTime - lastLoginTimestamp < LOGIN_DEBOUNCE_MS) {
      console.log('Login debounced. Too many calls in quick succession.');
      return;
    }
    
    setLastLoginTimestamp(currentTime);
    setIsLoading(true);
    
    try {
      // Check if profile is complete based on data received
      const isComplete = !!(
        userData.sports?.length > 0 &&
        userData.achievements?.length > 0 &&
        userData.profilePhoto
      );
      
      // Check if this is a new user by looking for their data in localStorage
      const existingUserData = localStorage.getItem('user');
      const existingUser = existingUserData ? JSON.parse(existingUserData) : null;
      const isNewUser = !existingUser || existingUser.userId !== userData.userId;
      
      console.log('Login analysis:', {
        isComplete,
        isNewUser,
        existingUserId: existingUser?.userId,
        newUserId: userData.userId,
        authProvider: userData.authProvider || 'local'
      });
      
      // Set isFirstLogin based on whether this is a new user
      const userWithLoginStatus = {
        ...userData,
        isProfileComplete: isComplete,
        isFirstLogin: isNewUser,
        // Ensure authProvider is set, default to 'local' if not provided
        authProvider: userData.authProvider || 'local'
      };
      
      // Update state and localStorage
      setUser(userWithLoginStatus);
      setIsLoggedIn(true);
      
      // Store in localStorage with timestamp to track freshness
      const userWithTimestamp = {
        ...userWithLoginStatus,
        lastUpdated: new Date().getTime()
      };
      localStorage.setItem('user', JSON.stringify(userWithTimestamp));
      localStorage.setItem('isLoggedIn', 'true');
      
      if (isNewUser) {
        // For new users, clear any previous profileCompletionDismissed flag
        // So they see the popup on first login
        localStorage.removeItem('profileCompletionDismissed');
        console.log('New user detected, profileCompletionDismissed flag cleared');
      }
      
      // Only fetch profile from server if needed (new login or no recent fetch)
      const shouldFetchProfile = isNewUser || 
        !localStorage.getItem('lastProfileFetch') || 
        (Date.now() - Number(localStorage.getItem('lastProfileFetch'))) > 60000; // 1 minute threshold
      
      // Fetch the complete profile from the server if we have an auth token
      if (localStorage.getItem('authToken') && shouldFetchProfile) {
        try {
          console.log('Fetching full profile data from server...');
          const response = await api.auth.getProfile();
          
          // Update last fetch timestamp
          localStorage.setItem('lastProfileFetch', Date.now().toString());
          
          if (response.success && response.data) {
            console.log('Received profile data from server:', response.data);
            
            // Avoid unnecessary updates by checking if data has actually changed
            const currentUser = localStorage.getItem('user');
            const parsedCurrentUser = currentUser ? JSON.parse(currentUser) : null;
            
            // Compare meaningful properties to see if we need to update
            const hasChanges = !parsedCurrentUser ||
              JSON.stringify(parsedCurrentUser.fullName) !== JSON.stringify(response.data.fullName) ||
              JSON.stringify(parsedCurrentUser.sports) !== JSON.stringify(response.data.sports) ||
              JSON.stringify(parsedCurrentUser.achievements) !== JSON.stringify(response.data.achievements) ||
              JSON.stringify(parsedCurrentUser.profilePhoto) !== JSON.stringify(response.data.profilePhoto) ||
              JSON.stringify(parsedCurrentUser.gender) !== JSON.stringify(response.data.gender);
              
            if (hasChanges) {
              // Merge the server data with the login data, prioritizing server data
              const mergedUser = {
                ...userWithLoginStatus,
                ...response.data,
                // Keep these flags from our initial determination
                isProfileComplete: isComplete,
                isFirstLogin: isNewUser,
                lastUpdated: new Date().getTime()
              };
              
              // Update state and localStorage
              setUser(mergedUser);
              localStorage.setItem('user', JSON.stringify(mergedUser));
              localStorage.setItem('userProfile', JSON.stringify(response.data));
              console.log('Profile data merged with login data');
            } else {
              console.log('No meaningful changes in profile data, skipping update');
            }
          }
        } catch (error) {
          console.error('Error fetching profile after login:', error);
          // Continue with login even if profile fetch fails
        }
      } else {
        console.log('Skipping profile fetch - recent data already available');
      }
    } finally {
      // Delay removing loading state to prevent UI flicker
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [user, lastLoginTimestamp]);

  const logout = () => {
    console.log('Logout called');
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('profileCompletionDismissed');
    localStorage.removeItem('user');
  };

  const dismissProfileCompletion = () => {
    console.log('Dismissing profile completion dialog');
    localStorage.setItem('profileCompletionDismissed', 'true');
    setShouldShowProfileCompletion(false);
    
    // Also update the user to not be considered a first-time user anymore
    if (user) {
      console.log('Updating user isFirstLogin to false');
      const updatedUser = { ...user, isFirstLogin: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateProfileCompletionStatus = (status: boolean) => {
    console.log('Updating profile completion status to:', status);
    if (user) {
      const updatedUser = { 
        ...user, 
        isProfileComplete: status,
        isFirstLogin: false // Always set to false when profile status changes
      };
      console.log('Updated user:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // If profile is now complete, don't show the dialog anymore
      if (status) {
        console.log('Profile is complete, hiding dialog');
        setShouldShowProfileCompletion(false);
        localStorage.setItem('profileCompletionDismissed', 'true');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      login, 
      logout, 
      shouldShowProfileCompletion, 
      dismissProfileCompletion,
      updateProfileCompletionStatus,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 