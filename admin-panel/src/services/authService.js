// services/authService.js
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
        localStorage.setItem('authToken', response.data.token);
        
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
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
  
  
  // Logout user
  logout: async () => {
    try {
      log('Logging out');
      
      // Clear stored auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      return { success: true };
    } catch (error) {
      log('Logout error:', error.message);
      throw error;
    }
  },
  
  // Get current user data from storage
  getCurrentUser: async () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      log('Error getting current user:', error.message);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = localStorage.getItem('authToken');
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
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      log('Error fetching user profile:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    try {
      log('Updating user profile with:', userData);
      
      // Make API call to update profile
      const response = await api.put('/api/auth/profile', userData);
      
      log('Profile update response received:', response.data);
      
      // Update stored user data
      if (response.data && response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      log('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update user password
  updatePassword: async (passwordData) => {
    try {
      log('Updating user password');
      
      // Make API call to update password
      const response = await api.put('/api/auth/change-password', passwordData);
      
      log('Password update response received:', response.data);
      
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
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      log('Requesting password reset for:', email);
      
      const response = await api.post('/api/auth/request-reset', { email });
      
      log('Password reset request response:', response.data);
      
      return response.data;
    } catch (error) {
      log('Error requesting password reset:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      log('Resetting password with token');
      
      const response = await api.post('/api/auth/reset-password', { 
        token, 
        newPassword 
      });
      
      log('Password reset response:', response.data);
      
      return response.data;
    } catch (error) {
      log('Error resetting password:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default authService;