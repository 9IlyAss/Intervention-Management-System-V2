// app/services/authService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Debug mode
const DEBUG = true;

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      log('Attempting login with:', email);
      
      const response = await api.post('/api/auth/login', { 
        email, 
        password 
      });
      
      log('Login response received:', response.data);
      
      // Store token and user data
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      } else {
        log('Warning: Response missing token or user data', response.data);
      }
      
      return response.data;
    } catch (error) {
      log('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Register user
  register: async (userData) => {
    try {
      log('Attempting registration with:', userData.email);
      
      const response = await api.post('/api/auth/register', userData);
      
      log('Registration response received:', response.data);
      
      // Store token and user data
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      } else {
        log('Warning: Response missing token or user data', response.data);
      }
      
      return response.data;
    } catch (error) {
      log('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      log('Logging out');
      
      // Clear stored auth data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      return { success: true };
    } catch (error) {
      log('Logout error:', error.message);
      throw error;
    }
  },
  
  // Get current user data from storage
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      log('Error getting current user:', error.message);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      log('Error checking authentication:', error.message);
      return false;
    }
  },
  
  // Get user profile from API
  getUserProfile: async () => {
    try {
      log('Fetching user profile');
      
      const response = await api.get('/api/auth/profile');
      
      log('Profile response received:', response.data);
      
      // Update stored user data if profile exists
      if (response.data && response.data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      log('Error fetching user profile:', error.response?.data || error.message);
      throw error;
    }
  },
 // Update user profile
// Update user profile - FIXED VERSION
  updateProfile: async (userData) => {
    try {
      log('Updating user profile with:', userData);
      
      // Make API call to update profile
      const response = await api.put('/api/auth/profile', userData);
      
      log('Profile update response received:', response.data);
      
      // Update stored user data
      if (response.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      log('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },
  // Update user password
// Update user password 
  updatePassword: async (userData) => {
  try {
    log('Updating user password with:', userData);
    
    // Make API call to update profile
    const response = await api.put('/api/auth/change-password', userData);
    
    log('Password update response received:', response.data);
    
    // Update stored user data
    if (response.data) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    // Special case for incorrect password
    if (error.response && 
        error.response.status === 400 && 
        error.response.data && 
        error.response.data.message === "Current password is incorrect") {
      
      console.log('Creating validation error for incorrect password');
      
      // Create a special error type
      const validationError = new Error(error.response.data.message);
      validationError.isValidationError = true;
      validationError.code = "INCORRECT_PASSWORD";
      validationError.status = 400;
      
      // Use console.warn instead of log
      console.warn('Password validation:', error.response.data.message);
      
      throw validationError;
    }
    
    // For other errors, log as usual
    log('Error updating password:', error.response?.data || error.message);
    throw error;
  }
}

};

export default authService;