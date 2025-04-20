/**
 * API service for handling all backend requests
 */

import axios, { AxiosError } from 'axios';
import authService from './authService';

// Use different API URLs for development and production
const getApiUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  // If explicitly set in .env, use that
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Otherwise use defaults based on environment
  if (import.meta.env.MODE === 'production') {
    return 'https://api.sportsbro.com/api'; // Replace with your production API URL
  }
  
  // Default for development
  return 'http://localhost:5003/api';
};

const API_URL = getApiUrl();

console.log(`Using API URL: ${API_URL} (${import.meta.env.MODE} mode)`);

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Base request function with error handling
 */
const request = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Get token from localStorage if it exists
    const token = localStorage.getItem('authToken');
    
    // Set default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if it exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Parse the JSON response
    const data = await response.json();

    // Check if request was successful
    if (!response.ok) {
      throw new ApiError(
        data.message || 'Something went wrong',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        'Cannot connect to the server. Please check your internet connection or try again later.',
        0
      );
    }
    
    // Handle other errors
    throw new ApiError(
      (error as Error).message || 'Unknown error occurred',
      0
    );
  }
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add a 10 second timeout to prevent hanging requests
});

// Export the client so it can be accessed directly
export { apiClient };

// Add a request interceptor to include auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging if needed
    const { method, url } = response.config;
    console.debug(`API ${method?.toUpperCase()} ${url} - Success:`, 
      response.status, 
      url?.includes('login') || url?.includes('register') 
        ? { ...response.data, token: 'REDACTED' } 
        : response.data
    );
    return response;
  },
  (error) => {
    const { message, response, config } = error;
    const method = config?.method?.toUpperCase() || 'UNKNOWN';
    const url = config?.url || 'UNKNOWN URL';
    
    // Create detailed error log
    console.error(`API ERROR (${method} ${url}):`, {
      status: response?.status,
      message: response?.data?.message || message,
      data: response?.data,
      timestamp: new Date().toISOString()
    });
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    
    // Create appropriate ApiError based on the error type
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data as any;
      const errorMessage = data.message || 'An error occurred';
      
      throw new ApiError(errorMessage, status);
    } else if (error.request) {
      // The request was made but no response was received
      
      // Check if this is a timeout error
      if (error.code === 'ECONNABORTED') {
        throw new ApiError('Request timed out. The server might be overloaded or unavailable.', 408);
      }
      
      throw new ApiError('No response from server. Please check your internet connection and verify the backend server is running.', 0);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new ApiError(message || 'Unknown error occurred');
    }
  }
);

// Add timeout to requests to prevent hanging requests
apiClient.defaults.timeout = 15000; // 15 seconds timeout

// API endpoints
const api = {
  // Auth endpoints
  auth: {
    register: async (userData: { fullName: string; username: string; email: string; password: string }) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
    
    login: async (credentials: { email: string; password: string }) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    
    getProfile: async () => {
      try {
        console.log('Fetching user profile...');
        console.log('Auth token:', localStorage.getItem('authToken')?.substring(0, 20) + '...');
        const response = await apiClient.get('/auth/profile');
        console.log('Profile response:', response.data);
        
        // Store the fetched profile in localStorage for offline access
        if (response.data.success && response.data.data) {
          localStorage.setItem('userProfile', JSON.stringify(response.data.data));
        }
        
        return response.data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    
    updateProfile: async (profileData: any) => {
      try {
        const response = await apiClient.put('/auth/profile', profileData);
        
        // If update was successful, also update local storage
        if (response.data.success && response.data.data) {
          localStorage.setItem('userProfile', JSON.stringify(response.data.data));
        }
        
        return response.data;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    
    checkEmail: async (email: string) => {
      try {
        const response = await apiClient.post('/auth/check-email', { email });
        console.log('Email check response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Email check error:', error);
        throw error;
      }
    },
    
    checkUsername: async (username: string) => {
      try {
        const response = await apiClient.post('/auth/check-username', { username });
        console.log('Username check response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Username check error:', error);
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError('Failed to check username', 500);
      }
    },
    
    checkGoogleEmail: async (email: string) => {
      try {
        // Only proceed if it's a Gmail address
        if (!email.toLowerCase().endsWith('@gmail.com')) {
          return {
            success: false,
            message: 'Not a Gmail address',
            isValid: false
          };
        }
        
        const response = await apiClient.post('/auth/check-google-email', { email });
        console.log('Google email check response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Google email check error:', error);
        throw error;
      }
    },
    
    validateGmailExists: async (email: string) => {
      try {
        // Only proceed if it's a Gmail address
        if (!email.toLowerCase().endsWith('@gmail.com')) {
          return {
            success: false,
            message: 'Not a Gmail address',
            isValid: false
          };
        }
        
        const response = await apiClient.post('/auth/validate-gmail', { email });
        console.log('Gmail validation response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Gmail validation error:', error);
        throw error;
      }
    },
    
    getAuthToken: () => {
      return localStorage.getItem('authToken');
    },
    
    validateGmail: async (email: string) => {
      return await api.auth.validateGmailExists(email);
    }
  },
  
  // Team endpoints
  teams: {
    getAll: (queryParams = '') => 
      request(`/teams${queryParams ? `?${queryParams}` : ''}`),
    
    getById: (id: string) => 
      request(`/teams/${id}`),
    
    create: (teamData: any) => 
      request('/teams', {
        method: 'POST',
        body: JSON.stringify(teamData),
      }),
    
    update: (id: string, teamData: any) => 
      request(`/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(teamData),
      }),
    
    delete: (id: string) => 
      request(`/teams/${id}`, {
        method: 'DELETE',
      }),
    
    // New endpoints for team membership
    requestToJoin: (id: string) => 
      request(`/teams/${id}/request`, {
        method: 'POST',
      }),
    
    cancelRequest: (id: string) => 
      request(`/teams/${id}/cancel-request`, {
        method: 'POST',
      }),
    
    acceptRequest: (id: string, userId: string) => 
      request(`/teams/${id}/accept/${userId}`, {
        method: 'POST',
      }),
    
    rejectRequest: (id: string, userId: string) => 
      request(`/teams/${id}/reject/${userId}`, {
        method: 'POST',
      }),
    
    join: (id: string) => 
      request(`/teams/${id}/join`, {
        method: 'POST',
      }),
    
    leave: (id: string) => 
      request(`/teams/${id}/leave`, {
        method: 'POST',
      }),
    
    removeMember: (id: string, userId: string) => 
      request(`/teams/${id}/remove/${userId}`, {
        method: 'POST',
      }),
  },
  
  // Products endpoints
  products: {
    getAll: async () => {
      const response = await apiClient.get('/products');
      return response.data;
    },
    
    getById: async (id: string) => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
    
    create: async (productData: any) => {
      const response = await apiClient.post('/products', productData);
      return response.data;
    },
    
    update: async (id: string, productData: any) => {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data;
    },
    
    delete: async (id: string) => {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    }
  },
  
  // Admin endpoints
  admin: {
    // Get users with pagination
    getUsers: async (params?: { page?: number; limit?: number; search?: string; authProvider?: string }) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append('adminToken', adminToken);
        
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.authProvider) queryParams.append('authProvider', params.authProvider);
        
        const response = await apiClient.get(`/admin/users?${queryParams.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    
    // Get user by ID
    getUserById: async (id: string) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.get(`/admin/users/${id}?adminToken=${adminToken}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
    },
    
    // Update user
    updateUser: async (id: string, userData: any) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.put(`/admin/users/${id}?adminToken=${adminToken}`, userData);
        return response.data;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
    
    // Delete user
    deleteUser: async (id: string) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.delete(`/admin/users/${id}?adminToken=${adminToken}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },
    
    // Get user statistics
    getStats: async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.get(`/admin/stats?adminToken=${adminToken}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }
    },
    
    // Admin login - this sets the admin token in localStorage
    login: async (token: string) => {
      try {
        console.log('Admin login attempt with token:', token);
        
        // Validate input
        if (!token || !token.trim()) {
          return { 
            success: false, 
            message: 'Please provide an admin token'
          };
        }
        
        // For the demo, we hardcode the accepted token
        // In a real app, this would validate against a secure backend
        if (token === 'admin123') {
          console.log('Using demo admin token');
          localStorage.setItem('adminToken', token);
          return { 
            success: true, 
            message: 'Admin login successful (demo mode)',
            data: { demoMode: true }
          };
        }
        
        // Test the token first to provide better error messages
        try {
          console.log('Testing admin token against backend');
          const testResponse = await apiClient.get('/admin/test-token', {
            params: { adminToken: token }
          });
          
          console.log('Token test response:', testResponse.data);
          
          // If the token doesn't match, don't proceed
          if (!testResponse.data.details?.match) {
            console.log('Token did not match');
            return {
              success: false,
              message: 'Invalid admin token. Please check your credentials.',
              debug: testResponse.data
            };
          }
          
          console.log('Token validated successfully');
        } catch (testError) {
          console.error('Error testing admin token:', testError);
          // Continue anyway since the test endpoint might not be available
          console.log('Continuing after test error');
        }
        
        // Use axios instead of fetch for consistency
        console.log('Making stats request to validate token');
        try {
          const response = await apiClient.get('/admin/stats', {
            params: { adminToken: token }
          });
          
          console.log('Stats response received:', response.status);
          
          // If we got here, the token is valid
          localStorage.setItem('adminToken', token);
          return { 
            success: true, 
            message: 'Admin login successful',
            data: response.data
          };
        } catch (statsError: any) {
          console.error('Error fetching stats:', statsError);
          
          // Check if the error is related to authentication
          if (statsError.response && statsError.response.status === 401) {
            return {
              success: false,
              message: 'Invalid admin token',
              statusCode: 401,
              debug: {
                status: statsError.response.status,
                data: statsError.response.data
              }
            };
          }
          
          // Re-throw to be caught by the outer catch
          throw statsError;
        }
      } catch (error: any) {
        console.error('Admin login error:', error);
        localStorage.removeItem('adminToken');
        
        // Handle different error types
        if (error.response) {
          // Server responded with an error
          console.log('Error response data:', error.response.data);
          console.log('Error status:', error.response.status);
          
          return { 
            success: false, 
            message: error.response.data?.message || 'Invalid admin token',
            statusCode: error.response.status,
            debug: {
              data: error.response.data,
              status: error.response.status
            }
          };
        } else if (error.request) {
          // Network error
          console.log('Error request:', error.request);
          
          return { 
            success: false, 
            message: 'Unable to connect to server. Please check your internet connection.',
            error: 'NETWORK_ERROR',
            debug: { request: error.request }
          };
        } else {
          // Other error
          return { 
            success: false, 
            message: error.message || 'An unexpected error occurred',
            error: error.toString(),
            debug: { message: error.message, stack: error.stack }
          };
        }
      }
    },
    
    // Admin logout - removes the admin token
    logout: () => {
      localStorage.removeItem('adminToken');
      return { success: true, message: 'Admin logout successful' };
    },
    
    // Check if user is admin
    isAdmin: () => {
      return !!localStorage.getItem('adminToken');
    },
    
    // Product management
    getProducts: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append('adminToken', adminToken);
        
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.category) queryParams.append('category', params.category);
        
        const response = await apiClient.get(`/products?${queryParams.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
    
    getProductById: async (id: string) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.get(`/products/${id}?adminToken=${adminToken}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },
    
    createProduct: async (productData: any) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.post(`/admin/products?adminToken=${adminToken}`, productData);
        return response.data;
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },
    
    updateProduct: async (id: string, productData: any) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.put(`/admin/products/${id}?adminToken=${adminToken}`, productData);
        return response.data;
      } catch (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    },
    
    deleteProduct: async (id: string) => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.delete(`/admin/products/${id}?adminToken=${adminToken}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    },
    
    getProductStats: async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          throw new ApiError('Admin token not found. Please log in as admin.', 401);
        }
        
        const response = await apiClient.get(`/admin/products/stats?adminToken=${adminToken}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching product stats:', error);
        throw error;
      }
    }
  },
};

export default api; 