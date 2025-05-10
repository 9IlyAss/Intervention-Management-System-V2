// app/index.js
import { Redirect } from 'expo-router';
import { useAuth } from './contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect to the appropriate dashboard based on user role
    if (user?.role === 'technician') {
      return <Redirect href="/(app)/(technician)/dashboard" />;
    } else if (user?.role === 'administrator') {
      return <Redirect href="/(app)/(admin)/dashboard" />;
    } else {
      return <Redirect href="/(app)/(client)/dashboard" />;
    }
  }

  // Default redirect to login
  return <Redirect href="/(auth)/login" />;
}