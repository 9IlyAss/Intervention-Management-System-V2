// app/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
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

  // Debug - log user state changes
  useEffect(() => {
    console.log('USER STATE CHANGED:', user);
  }, [user]);

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
            console.log('Full user data:', userData);
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

  // Update user profile - FIXED VERSION
  const updateProfile = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log('Updating profile with data:', userData);
      
      // Call the authService to update profile
      const updatedUserData = await authService.updateProfile(userData);
      
      if (updatedUserData) {
        console.log('Profile updated successfully:', updatedUserData);
        
        // Update state with the response from the backend
        setUser(updatedUserData);
        
        // Also update AsyncStorage with the latest data
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      } else {
        console.log('No user data returned from updateProfile');
      }
      
      return updatedUserData;
    } catch (error) {
      console.error('Profile update error in context:', error);
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user password with validation handling
  const updatePassword = async (passwordData) => {
    setIsLoading(true);
    clearError();
    
    try {
      // Call the authService to update password
      const response = await authService.updatePassword(passwordData);
      console.log('Password updated successfully:', response);
      return response;
    } catch (error) {
      // Handle validation errors differently than regular errors
      if (error.isValidationError && error.code === "INCORRECT_PASSWORD") {
        // Don't log this as an error
        console.warn('Password validation in context:', error.message);
        
        // Still throw it for component handling, but don't treat as auth error
        throw error;
      }
      
      // Handle regular errors but use warn instead of error
      console.warn('Password update issue:', error.message);
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Value object with all authentication-related properties and functions
  const value = {
    user,
    setUser, // Expose setUser for direct updates
    isLoading,
    isLoadingInitial,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    updatePassword
  };

  // Don't render children until the initial loading is done
  if (isLoadingInitial) {
    return null; // Or a loading screen
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;