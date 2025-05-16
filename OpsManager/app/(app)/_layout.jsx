import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Redirect } from 'expo-router';
import { Slot } from 'expo-router';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Instead of Stack, render Slot to allow nested layouts to work
  return <>{/* Fragment required if you want to add more wrappers */}
    <Slot />
  </>;
}
