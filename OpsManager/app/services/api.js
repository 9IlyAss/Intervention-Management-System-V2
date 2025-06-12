// app/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your base URL - change this to your actual backend URL
// For local development with Expo, use your computer's IP address instead of localhost
const API_URL = 'http://192.168.100.113:9000';
// const API_URL = 'https://opm-eight.vercel.app';

// Enable debug mode
const DEBUG = true;

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add a request interceptor to inject the auth token into requests
api.interceptors.request.use(
  async (config) => {
    log(`Making request to: ${config.baseURL}${config.url}`);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        log('Token included in request');
      } else {
        log('No token available');
      }
    } catch (error) {
      log('Error retrieving token:', error.message);
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

export default api;