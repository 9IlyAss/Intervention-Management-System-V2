// app/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userAPI } from '../services/api';
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
        console.log('Checking for stored auth token...');
        const token = await AsyncStorage.getItem('authToken');
        
        if (token) {
          console.log('Found stored token');
          
          // Use stored user data instead of making API call
          const storedUserData = await AsyncStorage.getItem('userData');
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            console.log('Using stored user data:', userData.email);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.log('No stored user data, clearing token');
            await AsyncStorage.removeItem('authToken');
            setIsAuthenticated(false);
          }
        } else {
          console.log('No token found, user is not authenticated');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        // If loading fails, clear token to prevent infinite loading
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        setIsAuthenticated(false);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadStoredUser();
  }, []);

  // Login function matching your backend API
  const login = async (email, password) => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log(`Login attempt: ${email}`);
      const response = await authAPI.login(email, password);
      console.log('Login successful, got response:', response);
      
      const { user: userData, token } = response;
      
      if (!userData || !token) {
        throw new Error('Invalid response format from server');
      }
      
      // Save token and user data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
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

  // Register function matching your backend API
  const register = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      console.log(`Registration attempt for: ${userData.email}`);
      const response = await authAPI.register(userData);
      console.log('Registration successful');
      
      const { user: newUser, token } = response;
      
      if (!newUser || !token) {
        throw new Error('Invalid response format from server');
      }
      
      // Save token and user data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      
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

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    clearError();
    
    try {
      // Client-side logout
      await authAPI.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Clear token and user data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // Navigate to login
      router.replace('/(auth)/login');
    }
  };

  // Update user profile (simplified - just updates local data)
  const updateProfile = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      // Instead of making an API call, just update local storage
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