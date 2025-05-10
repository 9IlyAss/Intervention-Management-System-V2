// app/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your base URL - change this to your actual backend URL
// For local development with Expo, use your computer's IP address instead of localhost
const API_URL = 'http://192.168.100.113:9000';

// Enable debug mode
const DEBUG = true;

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Add a request interceptor to inject the auth token into requests
api.interceptors.request.use(
  async (config) => {
    log(`Making request to: ${config.baseURL}${config.url}`);
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      log('Token included in request');
    } else {
      log('No token available');
    }
    return config;
  },
  (error) => {
    log('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    log('Error in API call:', error.message);
    
    if (error.response) {
      log(`Error response from ${error.config?.url || 'unknown endpoint'}:`, error.response.status);
      log('Error data:', error.response.data);

      // Handle 401 errors (unauthorized)
      if (error.response.status === 401) {
        // Clear tokens and handle in auth context
        await AsyncStorage.removeItem('authToken');
        log('Token cleared due to 401 error');
      }
    } else if (error.request) {
      log('No response received:', error.request._url || error.request);
    } else {
      log('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Try different API paths if the first one fails
// This helps when you're not sure of the exact API path structure
const tryApiPaths = async (paths, method, body = null) => {
  for (let i = 0; i < paths.length; i++) {
    try {
      log(`Trying API path ${i+1}/${paths.length}: ${paths[i]}`);
      
      let response;
      if (method === 'GET') {
        response = await api.get(paths[i]);
      } else if (method === 'POST') {
        response = await api.post(paths[i], body);
      } else if (method === 'PUT') {
        response = await api.put(paths[i], body);
      } else if (method === 'DELETE') {
        response = await api.delete(paths[i]);
      }
      
      log(`Success with path: ${paths[i]}`);
      return response.data;
    } catch (error) {
      log(`Failed with path ${paths[i]}:`, error.message);
      
      // If this is the last path to try, throw the error
      if (i === paths.length - 1) {
        throw error;
      }
      // Otherwise continue to the next path
    }
  }
};

// Auth API calls based on your backend routes
export const authAPI = {
  // Login endpoint
  login: async (email, password) => {
    try {
      log('Attempting login with:', email);
      
      const possiblePaths = [
        '/api/auth/login',
        '/api/users/login',
        '/auth/login',
        '/users/login',
        '/login'
      ];
      
      const data = await tryApiPaths(possiblePaths, 'POST', { email, password });
      log('Login successful');
      return data;
    } catch (error) {
      log('Login failed:', error.message);
      throw error;
    }
  },
  
  // Register endpoint
  register: async (userData) => {
    try {
      log('Attempting registration with:', userData.email);
      
      const possiblePaths = [
        '/api/auth/register',
        '/api/users/register',
        '/auth/register',
        '/users/register',
        '/register'
      ];
      
      const data = await tryApiPaths(possiblePaths, 'POST', userData);
      log('Registration successful');
      return data;
    } catch (error) {
      log('Registration failed:', error.message);
      throw error;
    }
  },
  
  // Logout (client-side only since backend doesn't have logout endpoint)
  logout: async () => {
    return { success: true };
  }
};

// User API calls
export const userAPI = {
  // Get user profile - try multiple possible API paths
  getProfile: async () => {
    try {
      log('Getting user profile...');
      
      const possiblePaths = [
        '/api/users/profile',
        '/api/auth/profile',
        '/api/client/profile',
        '/api/technician/profile',
        '/api/admin/profile',
        '/users/profile',
        '/auth/profile',
        '/profile'
      ];
      
      const data = await tryApiPaths(possiblePaths, 'GET');
      log('Successfully got user profile');
      return data;
    } catch (error) {
      log('Failed to get profile:', error.message);
      throw error;
    }
  },
  
  // Update profile
  updateProfile: async (userData) => {
    try {
      log('Updating user profile...');
      
      const possiblePaths = [
        '/api/users/profile',
        '/api/auth/profile',
        '/api/client/profile',
        '/api/technician/profile',
        '/api/admin/profile',
        '/users/profile',
        '/auth/profile',
        '/profile'
      ];
      
      const data = await tryApiPaths(possiblePaths, 'PUT', userData);
      log('Successfully updated profile');
      return data;
    } catch (error) {
      log('Failed to update profile:', error.message);
      throw error;
    }
  },
  
  // Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      log('Changing password...');
      
      const possiblePaths = [
        '/api/auth/change-password',
        '/api/users/change-password',
        '/auth/change-password',
        '/users/change-password',
        '/change-password'
      ];
      
      const data = await tryApiPaths(possiblePaths, 'PUT', { oldPassword, newPassword });
      log('Password changed successfully');
      return data;
    } catch (error) {
      log('Failed to change password:', error.message);
      throw error;
    }
  },
};

// Client API calls
export const clientAPI = {
  // Get client-specific data
  getServices: async () => {
    try {
      const response = await api.get('/api/client/services');
      return response.data;
    } catch (error) {
      log('Failed to get services:', error.message);
      throw error;
    }
  }
};

// Technician API calls
export const technicianAPI = {
  // Get technician-specific data
  getAssignments: async () => {
    try {
      const response = await api.get('/api/technician/assignments');
      return response.data;
    } catch (error) {
      log('Failed to get assignments:', error.message);
      throw error;
    }
  }
};

// Intervention API calls
export const interventionAPI = {
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('/api/interventions', { params: filters });
      return response.data;
    } catch (error) {
      log('Failed to get interventions:', error.message);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/api/interventions/${id}`);
      return response.data;
    } catch (error) {
      log(`Failed to get intervention ${id}:`, error.message);
      throw error;
    }
  },
  
  create: async (interventionData) => {
    try {
      const response = await api.post('/api/interventions', interventionData);
      return response.data;
    } catch (error) {
      log('Failed to create intervention:', error.message);
      throw error;
    }
  },
  
  update: async (id, interventionData) => {
    try {
      const response = await api.put(`/api/interventions/${id}`, interventionData);
      return response.data;
    } catch (error) {
      log(`Failed to update intervention ${id}:`, error.message);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/interventions/${id}`);
      return response.data;
    } catch (error) {
      log(`Failed to delete intervention ${id}:`, error.message);
      throw error;
    }
  },
};

export default api;