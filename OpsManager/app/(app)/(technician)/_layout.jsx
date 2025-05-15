// app/(app)/(Technician)/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';

export default function TechnicianLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="conversation" />
    </Stack>
  );
}