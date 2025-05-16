// app/(app)/(Technician)/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import RoleGuard from '../../components/RoleGuard';

export default function TechnicianLayout() {
  return (
    <RoleGuard requiredRole="technician">
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="conversation" />
    </Stack>
    </RoleGuard>
  );
}