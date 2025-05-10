// app/(app)/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/login" />;
  }
  
  // Layout for authenticated routes
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}