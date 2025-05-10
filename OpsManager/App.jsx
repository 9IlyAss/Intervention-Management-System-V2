// App.jsx (FIXED VERSION)
import React from 'react';
import { AuthProvider } from './app/contexts/AuthContext';
import { AppNavigator } from './app/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  // Note: No NavigationContainer here since Expo Router provides it
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}