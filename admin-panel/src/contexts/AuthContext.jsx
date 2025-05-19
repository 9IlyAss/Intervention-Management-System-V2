// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// Create the auth context
const AuthContext = createContext(null);

// Debug mode
const DEBUG = true;

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Export the provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navigate = useNavigate();

  // Check if user is already logged in when app loads
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Check if token exists
        const isUserAuthenticated = await authService.isAuthenticated();
        setIsAuthenticated(isUserAuthenticated);
        
        if (isUserAuthenticated) {
          // Get user data from local storage
          const userData = await authService.getCurrentUser();
          
          if (userData) {
            setCurrentUser(userData);
            log('User data loaded from storage:', userData);
          } else {
            // If no user data in storage but token exists, try to fetch from API
            try {
              const profileData = await authService.getUserProfile();
              if (profileData && profileData.user) {
                setCurrentUser(profileData.user);
                log('User profile fetched from API:', profileData.user);
              }
            } catch (profileError) {
              log('Error fetching profile, clearing auth data:', profileError);
              await authService.logout();
              setIsAuthenticated(false);
            }
          }
        }
      } catch (err) {
        log('Error loading user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response && response.user) {
        // Check if user has admin role
        if (response.user.role !== 'administrator') {
          // If not admin, log them out and throw an error
          await authService.logout();
          throw new Error('Access denied. Only administrators can access this system.');
        }
        
        // If admin, set the user and authentication state
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        log('Admin user logged in successfully:', response.user);
      }
      
      return response;
    } catch (err) {
      log('Login error in context:', err);
      
      let errorMessage = 'Failed to login. Please try again.';
      
      if (err.message === 'Access denied. Only administrators can access this system.') {
        errorMessage = err.message;
      } else if (err.response) {
        // Use error message from API if available
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      
      await authService.logout();
      
      setCurrentUser(null);
      setIsAuthenticated(false);
      log('User logged out');
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      log('Logout error in context:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(userData);
      
      if (response && response.user) {
        setCurrentUser(response.user);
        log('User profile updated successfully:', response.user);
      }
      
      return response;
    } catch (err) {
      log('Update profile error in context:', err);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.updatePassword(passwordData);
      log('Password updated successfully');
      
      return response;
    } catch (err) {
      log('Update password error in context:', err);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.isValidationError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.requestPasswordReset(email);
      log('Password reset requested successfully');
      
      return response;
    } catch (err) {
      log('Password reset request error in context:', err);
      
      let errorMessage = 'Failed to request password reset. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.resetPassword(token, newPassword);
      log('Password reset successfully');
      
      return response;
    } catch (err) {
      log('Password reset error in context:', err);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear current error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    updatePassword,
    requestPasswordReset,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;