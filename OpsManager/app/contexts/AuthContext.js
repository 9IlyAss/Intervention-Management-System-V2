// app/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('AuthService check:', authService);
    if (!authService) {
      console.error('WARNING: authService is undefined!');
    }
  }, []);

  useEffect(() => {
    console.log('USER STATE CHANGED:', user);
  }, [user]);

  const handleError = (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    setError(message);
    return message;
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          const userData = await authService.getCurrentUser();
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            await authService.logout();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        await authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadStoredUser();
  }, []);

  // Updated login function with proper error handling
  const login = async (email, password) => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await authService.login(email, password);
      const { user: userData, token } = response;
      
      if (!userData || !token) {
        throw new Error('Invalid response format from server');
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      
      if (userData.role === 'technician') {
        router.replace('/(app)/(technician)/dashboard');
      } else if (userData.role === 'administrator') {
        router.replace('/(app)/(admin)/dashboard');
      } else {
        router.replace('/(app)/(client)/dashboard');
      }
      
      return userData;
    } catch (error) {
      // Handle incorrect password specifically
      if (error.response?.data?.message === "Incorrect password") {
        Alert.alert(
          'Login Failed', 
          "Incorrect password. Please try again."
        );
      } 
      // Handle user not found
      else if (error.response?.data?.message === "User doesn't exist") {
        Alert.alert(
          'Login Failed', 
          "User not found. Please check your email."
        );
      }
      // Handle other errors
      else {
        Alert.alert(
          'Login Failed', 
          error.response?.data?.message || error.message || 'Failed to log in. Please try again.'
        );
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await authService.register(userData);
      const { user: newUser, token } = response;
      
      if (!newUser || !token) {
        throw new Error('Invalid response format from server');
      }
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      if (newUser.role === 'technician') {
        router.replace('/(app)/(technician)/dashboard');
      } else if (newUser.role === 'administrator') {
        router.replace('/(app)/(admin)/dashboard');
      } else {
        router.replace('/(app)/(client)/dashboard');
      }
      
      return newUser;
    } catch (error) {
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

  const logout = async () => {
    setIsLoading(true);
    clearError();
    
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Logout error:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    setIsLoading(true);
    clearError();
    
    try {
      const updatedUserData = await authService.updateProfile(userData);
      
      if (updatedUserData) {
        setUser(updatedUserData);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
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

  const updatePassword = async (passwordData) => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await authService.updatePassword(passwordData);
      return response;
    } catch (error) {
      if (error.isValidationError && error.code === "INCORRECT_PASSWORD") {
        throw error;
      }
      
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    setUser,
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

  if (isLoadingInitial) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;