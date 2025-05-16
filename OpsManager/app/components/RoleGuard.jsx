// app/components/RoleGuard.jsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

export default function RoleGuard({ requiredRole, children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Log the current state
  console.log(`RoleGuard check - Required: ${requiredRole}, Current: ${user?.role}`);
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== requiredRole) {
      console.log(`User role ${user?.role} doesn't match required role ${requiredRole}, redirecting`);
      
      // Determine the correct route based on user role
      let redirectPath;
      if (user?.role === 'technician') {
        redirectPath = '/(app)/(technician)/dashboard';
      } else if (user?.role === 'administrator') {
        redirectPath = '/(app)/(admin)/dashboard';
      } else {
        redirectPath = '/(app)/(client)/dashboard';
      }
      
      // Redirect to the appropriate dashboard
      router.replace(redirectPath);
    }
  }, [isLoading, isAuthenticated, user, requiredRole]);
  
  // Show loading while checking
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text>Loading...</Text>
      </View>
    );
  }
  
  // If not authenticated, don't render anything (will be handled by app layout redirect)
  if (!isAuthenticated) {
    return null;
  }
  
  // If wrong role, show nothing while redirecting
  if (user?.role !== requiredRole) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text>Redirecting to correct dashboard...</Text>
      </View>
    );
  }
  
  // All good - render the children
  return children;
}