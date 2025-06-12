// app/(auth)/reset-password.jsx - Using authService
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import authService from '../services/authService'; // 🎯 Using your authService

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams(); // Get token from URL params (optional)
  const [resetCode, setResetCode] = useState(token || ''); // Pre-fill if token provided
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    resetCode: '',
    password: '',
  });

  // Form validation
  const validateForm = () => {
    const newErrors = { resetCode: '', password: '' };
    let isValid = true;
    
    // Validate reset code
    if (!resetCode.trim()) {
      newErrors.resetCode = 'Reset code is required';
      isValid = false;
    }
    
    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // 🎯 Use authService instead of fetch
      const data = await authService.resetPassword(resetCode, password);

      if (data.success) {
        Alert.alert(
          'Success!',
          'Your password has been reset successfully!',
          [
            {
              text: 'Continue',
              onPress: () => {
                // User is already logged in with new token from authService
                router.replace('/(auth)/login'); // Go to main app
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.response) {
        Alert.alert('Error', error.response.data?.message || 'Failed to reset password');
      } else {
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading during API call
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Resetting your password...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={60} color="#6200EE" />
          </View>
          
          <Text style={styles.cardTitle}>Create New Password</Text>
          <Text style={styles.cardDescription}>
            Enter the reset code from your email and choose a new secure password.
          </Text>
          
          {/* Reset Code Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Reset Code</Text>
            <TextInput
              style={styles.textInput}
              value={resetCode}
              onChangeText={setResetCode}
              placeholder="Enter reset code from email"
              autoCapitalize="characters"
            />
            {errors.resetCode ? (
              <Text style={styles.errorText}>{errors.resetCode}</Text>
            ) : null}
          </View>

          {/* New Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>New Password</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password (min 6 characters)"
              secureTextEntry={true}
              autoCapitalize="none"
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={password.length >= 6 ? "#4CAF50" : "#999"} 
              />
              <Text style={[
                styles.requirementText,
                password.length >= 6 && styles.requirementMet
              ]}>
                At least 6 characters
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
          >
            <Text style={styles.resetButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        {/* Help Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Need Help?</Text>
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.helpLink}>Request a new one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Links */}
      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>Remember your password? </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.bottomLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  requirementsContainer: {
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  requirementMet: {
    color: '#4CAF50',
  },
  resetButton: {
    height: 48,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
  },
  helpLink: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  bottomText: {
    fontSize: 14,
    color: '#666',
  },
  bottomLink: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '500',
  },
});