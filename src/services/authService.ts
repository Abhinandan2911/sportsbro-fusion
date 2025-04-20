import api from './api';
import axios from 'axios';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const API_URL = import.meta.env.VITE_API_URL;

// Interface for user profile
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  profilePhoto?: string;
  authProvider: string;
}

const authService = {
  // Store JWT token
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get JWT token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove token (logout)
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isLoggedIn');
  },

  // Check if user is logged in - improved to check both token and cached user
  isAuthenticated: (): boolean => {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const hasUserData = !!localStorage.getItem(USER_KEY) || !!localStorage.getItem('userProfile');
    
    // Return true if we have either a token or are marked as logged in, AND we have some user data
    return (hasToken || isLoggedIn) && hasUserData;
  },

  // Fetch and store user profile
  fetchUserProfile: async (): Promise<UserProfile | null> => {
    try {
      if (!authService.getToken()) {
        return null;
      }

      // First try to get locally stored profile data for faster response
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }

      // Fall back to API call if no local data
      const response = await api.auth.getProfile();
      
      if (response.success && response.data) {
        const userData = response.data;
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        localStorage.setItem('userProfile', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Still try to use locally cached data if API fails
      const userJson = localStorage.getItem(USER_KEY);
      if (userJson) {
        return JSON.parse(userJson);
      }
      
      return null;
    }
  },

  // Get stored user profile
  getUserProfile: (): UserProfile | null => {
    // Try userProfile first (more complete data), then fall back to user
    const profileJson = localStorage.getItem('userProfile');
    if (profileJson) {
      return JSON.parse(profileJson);
    }
    
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    
    return null;
  },

  // Update user profile in storage
  updateUserProfile: (userData: Partial<UserProfile>): void => {
    const currentUser = authService.getUserProfile();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    }
  },
  
  // Debug utility to log all auth-related information to the console
  debugAuthStatus: (): void => {
    const token = localStorage.getItem(TOKEN_KEY);
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem(USER_KEY);
    const profile = localStorage.getItem('userProfile');
    
    console.group('Authentication Status Debug');
    console.log('Auth Token:', token ? `${token.substring(0, 15)}...` : 'null');
    console.log('isLoggedIn Flag:', isLoggedIn);
    console.log('User Data:', user ? JSON.parse(user) : 'null');
    console.log('Profile Data:', profile ? JSON.parse(profile) : 'null');
    console.log('isAuthenticated():', authService.isAuthenticated());
    console.groupEnd();
  },
  
  // Emergency fix for authentication state
  fixAuthState: (): void => {
    console.log('Applying emergency fix to auth state...');
    
    // Check if we have a token but other state is inconsistent
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    const profileJson = localStorage.getItem('userProfile');
    
    if (token && (!userJson || !profileJson)) {
      console.log('Found auth token but incomplete user data, restoring from available sources');
      
      // Use whatever data we have
      const userData = userJson ? JSON.parse(userJson) : (profileJson ? JSON.parse(profileJson) : null);
      
      if (userData) {
        // Update both storage locations with the best data we have
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        localStorage.setItem('userProfile', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        console.log('Authentication state fixed: User data synchronized');
      } else {
        console.log('No user data available, cannot fix state. Try logging out and back in.');
      }
    } else if (!token && (userJson || profileJson)) {
      console.log('No auth token but found user data, setting isLoggedIn flag');
      localStorage.setItem('isLoggedIn', 'true');
      console.log('Authentication state fixed: isLoggedIn flag set');
    }
    
    // After fix, log the updated state
    authService.debugAuthStatus();
  },

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  },

  // Update user profile
  async updateProfile(profileData: { fullName?: string; profilePhoto?: string }): Promise<UserProfile> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  }
};

// Add emergency access via window object for console debugging
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.authService = authService;
}

export default authService; 