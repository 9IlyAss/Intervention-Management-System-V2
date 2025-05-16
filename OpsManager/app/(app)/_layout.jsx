// app/(app)/_layout.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Redirect, Slot } from 'expo-router';

export default function AppLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Debug log - app layout
  console.log('App Layout - User role:', user?.role);

  // Protect routes if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  // Important: If we're logged in, but the user object has no role,
  // log out because something is wrong with auth state
  if (!isLoading && isAuthenticated && !user?.role) {
    console.error('User authenticated but no role defined - logging out');
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}