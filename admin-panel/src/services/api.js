const  env = require("dotenv")
import axios from 'axios';
env.config();


// Enable debug mode
const DEBUG = true;

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Create an axios instance
const api = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to inject the auth token into requests
api.interceptors.request.use(
  async (config) => {
    log(`Making request to: ${config.baseURL}${config.url}`);
    
    try {
      const token = localStorage.getItem('authToken');
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
        // Clear tokens
        localStorage.removeItem('authToken');
        log('Token cleared due to 401 error');
        
        // You can trigger a redirect to login page here if needed
        // window.location.href = '/login';
      }
    } else if (error.request) {
      log('No response received:', error.request.responseURL || error.request);
    } else {
      log('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;