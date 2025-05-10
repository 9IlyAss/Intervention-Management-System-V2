// app/(auth)/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';

// Error is likely happening here - make sure this component is properly structured
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f9f9f9' },
      }}
    />
  );
}