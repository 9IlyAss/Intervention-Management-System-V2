// app/(app)/(client)/_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';

export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="conversation" />
    </Stack>
  );
}