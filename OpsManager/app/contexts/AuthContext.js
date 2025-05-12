// app/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService'; // Import the default export properly
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Create the authentication context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Debug - check if authService is properly imported
  useEffect(() => {
    console.log('AuthService check:', authService);
    if (!authService) {
      console.error('WARNING: authService is undefined!');
    } else if (!authService.login) {
      console.error('WARNING: authService.login is undefined!', Object.keys(authService));
    } else {
      console.log('authService looks good with methods:', Object.keys(authService));
    }
  }, []);

  // Function to handle API request errors
  const handleError = (error) => {
    // Extract error message from the backend response
    const message = error.response?.data?.message || error.message || 'An error occurred';
    setError(message);
    console.error('Auth error:', message);
    return message;
  };

  // Clear any error message
  const clearError = () => {
    setError(null);
  };

  // Load token and user data when the app starts
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        // Use authService to check authentication
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          console.log('User is authenticated');
          
          // Use authService to get current user
          const userData = await authService.getCurrentUser();
          
          if (userData) {
            console.log('Retrieved user data:', userData.email);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.log('No user data available, logging out');
            await authService.logout();
            setIsAuthenticated(false);
          }
        } else {
          console.log('User is not authenticated');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // If loading fails, force logout
        await authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadStoredUser();
  }, []);

  // Login function using authService
  const login = async (email, password) => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log(`Login attempt: ${email}`);
      
      // Use authService for login
      const response = await authService.login(email, password);
      console.log('Login successful');
      
      const { user: userData, token } = response;
      
      if (!userData || !token) {
        throw new Error('Invalid response format from server');
      }
      
      // Set user and auth state
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log(`Redirecting user to ${userData.role || 'client'} dashboard`);
      
      // Navigate to the appropriate screen based on user role
      if (userData.role === 'technician') {
        router.replace('/(app)/(technician)/dashboard');
      } else if (userData.role === 'administrator') {
        router.replace('/(app)/(admin)/dashboard');
      } else {
        router.replace('/(app)/(client)/dashboard');
      }
      
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert(
        'Login Failed', 
        error.response?.data?.message || error.message || 'Failed to log in. Please check your credentials.'
      );
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function using authService
  const register = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log(`Registration attempt for: ${userData.email}`);
      
      // Use authService for registration
      const response = await authService.register(userData);
      console.log('Registration successful');
      
      const { user: newUser, token } = response;
      
      if (!newUser || !token) {
        throw new Error('Invalid response format from server');
      }
      
      // Set user and auth state
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Navigate to the appropriate screen based on user role
      if (newUser.role === 'technician') {
        router.replace('/(app)/(technician)/dashboard');
      } else if (newUser.role === 'administrator') {
        router.replace('/(app)/(admin)/dashboard');
      } else {
        router.replace('/(app)/(client)/dashboard');
      }
      
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert(
        'Registration Failed', 
        error.response?.data?.message || error.message || 'Failed to register. Please try again.'
      );
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function using authService
  const logout = async () => {
    setIsLoading(true);
    clearError();
    
    try {
      // Use authService for logout
      await authService.logout();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Logout error:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      // Get current user data
      const currentUserData = user || {};
      const updatedUserData = { ...currentUserData, ...userData };
      
      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      // Update state
      setUser(updatedUserData);
      
      return updatedUserData;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Value object with all authentication-related properties and functions
  const value = {
    user,
    isLoading,
    isLoadingInitial,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    updateProfile
  };

  // Don't render children until the initial loading is done
  if (isLoadingInitial) {
    return null; // Or a loading screen
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;