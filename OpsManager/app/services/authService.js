// app/services/authService.js - Updated with forgot/reset password methods
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const DEBUG = true;

const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      // Only log unexpected errors (non-400 status)
      if (error.response?.status !== 400) {
        log('Login error:', error.response?.data || error.message);
      }
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      log('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      log('Logout error:', error.message);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      log('Error getting current user:', error.message);
      return null;
    }
  },
  
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      log('Error checking authentication:', error.message);
      return false;
    }
  },
  
  getUserProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      
      if (response.data && response.data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      log('Error fetching user profile:', error.response?.data || error.message);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/auth/profile', userData);
      
      if (response.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      log('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updatePassword: async (userData) => {
    try {
      const response = await api.put('/api/auth/change-password', userData);
      
      if (response.data) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      if (error.response && 
          error.response.status === 400 && 
          error.response.data?.message === "Current password is incorrect") {
        
        const validationError = new Error(error.response.data.message);
        validationError.isValidationError = true;
        validationError.code = "INCORRECT_PASSWORD";
        validationError.status = 400;
        
        throw validationError;
      }
      
      log('Error updating password:', error.response?.data || error.message);
      throw error;
    }
  },

  // 🆕 NEW: Forgot password method
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      log('Forgot password success:', response.data);
      return response.data;
    } catch (error) {
      // Only log unexpected errors (non-400/404 status)
      if (error.response?.status !== 400 && error.response?.status !== 404) {
        log('Forgot password error:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  // 🆕 NEW: Reset password method
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/api/auth/reset-password/${token}`, { password });
      
      // If reset is successful and returns auth token, store it
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
      
      log('Reset password success:', response.data);
      return response.data;
    } catch (error) {
      // Only log unexpected errors (non-400 status)
      if (error.response?.status !== 400) {
        log('Reset password error:', error.response?.data || error.message);
      }
      throw error;
    }
  }
};

export default authService;