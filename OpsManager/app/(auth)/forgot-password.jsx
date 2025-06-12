// app/(auth)/forgot-password.jsx - Using authService
import React, { useState } from 'react';
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
import { router } from 'expo-router';
import authService from '../services/authService'; // 🎯 Using your authService

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(''); // For testing
  const [errors, setErrors] = useState({
    email: '',
  });

  // Form validation
  const validateForm = () => {
    const newErrors = { email: '' };
    let isValid = true;
    
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // 🎯 Use authService instead of fetch
      const data = await authService.forgotPassword(email);
      
      if (data.success) {
        // Store reset token for testing (remove in production)
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        setIsSubmitted(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        Alert.alert('Error', error.response.data?.message || 'Failed to send reset email');
      } else {
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // For testing: Go to reset password screen with token
  const handleTestReset = () => {
    if (resetToken) {
      router.push(`/(auth)/reset-password?token=${resetToken}`);
    } else {
      Alert.alert('Error', 'No reset token available');
    }
  };

  // Show loading during API call
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Sending reset code...</Text>
      </View>
    );
  }

  // Success screen
  if (isSubmitted) {
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
          <Text style={styles.headerTitle}>Reset Code Sent</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            
            <Text style={styles.successTitle}>Check Your Email!</Text>
            <Text style={styles.successDescription}>
              We've sent a reset code to {email}. Enter the code in the next step to create a new password.
            </Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/(auth)/reset-password')}
            >
              <Text style={styles.continueButtonText}>Continue to Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => {
                setIsSubmitted(false);
                setResetToken('');
              }}
            >
              <Text style={styles.tryAgainButtonText}>Try Different Email</Text>
            </TouchableOpacity>
          </View>

          {/* Help Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Didn't receive the email?</Text>
            <View style={styles.tipContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.tipIcon} />
              <Text style={styles.tipText}>Check your spam/junk folder</Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="time-outline" size={20} color="#666" style={styles.tipIcon} />
              <Text style={styles.tipText}>Wait a few minutes and try again</Text>
            </View>
            <View style={styles.tipContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#666" style={styles.tipIcon} />
              <Text style={styles.tipText}>Make sure the email address is correct</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main form
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
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={60} color="#6200EE" />
          </View>
          
          <Text style={styles.cardTitle}>Reset Your Password</Text>
          <Text style={styles.cardDescription}>
            Enter your email address and we'll send you a reset code to create a new password.
          </Text>
          
          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSubmit}
          >
            <Text style={styles.sendButtonText}>Send Reset Code</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#6200EE" />
            <Text style={styles.infoText}>
              The reset code will expire in 10 minutes for security reasons.
            </Text>
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
  sendButton: {
    height: 48,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 18,
  },
  
  // Success screen styles
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  
  // Testing section (remove in production)
  testingCard: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  testingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  testingText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 18,
  },
  resetCode: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: 4,
  },
  testButton: {
    backgroundColor: '#FFC107',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#856404',
    fontWeight: '600',
  },
  
  continueButton: {
    height: 48,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tryAgainButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryAgainButtonText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '500',
  },
  
  tipContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
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