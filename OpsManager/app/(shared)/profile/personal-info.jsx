import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput,
  ScrollView, TouchableOpacity, Alert, StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import fileService from '../../services/fileService';

export default function PersonalInformation() {
  const { user, setUser } = useAuth();
  
  // Determine user role from the model
  const isClient = user?.role === 'client';
  const isTechnician = user?.role === 'technician';
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // State to track if we're in edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for user base fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [localImageUri, setLocalImageUri] = useState(null);
  
  // Properly handle skillsList initialization
  const [skills, setSkills] = useState(
    isTechnician && user?.skillsList && Array.isArray(user.skillsList) 
      ? user.skillsList.join(', ') 
      : ''
  );
  
  // Handle navigation back based on user role
  const handleGoBack = () => {
    if (isTechnician) {
      // Navigate back to technician profile
      router.replace('/(app)/(technician)/(tabs)/profile');
    } else if (isClient) {
      // Navigate back to client profile
      router.replace('/(app)/(client)/(tabs)/profile');
    } else {
      // Fallback to generic back navigation
      router.back();
    }
  };
  
  // Reset form values if user changes
  useEffect(() => {
    console.log('Current user object:', user);
    console.log('Skills data:', user?.skillsList);
    
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setProfileImage(user?.profileImage || null);
    setLocalImageUri(null);
    
    // Properly initialize skills with better checks
    if (isTechnician) {
      if (user?.skillsList && Array.isArray(user.skillsList)) {
        console.log('Setting skills from array:', user.skillsList);
        setSkills(user.skillsList.join(', '));
      } else if (user?.skillsList && typeof user.skillsList === 'string') {
        console.log('Setting skills from string:', user.skillsList);
        setSkills(user.skillsList);
      } else {
        console.log('No skills data found, setting empty string');
        setSkills('');
      }
    }
  }, [user]);
  
  // Toggle between view and edit modes
  const toggleEditMode = () => {
    if (isEditing) {
      // If exiting edit mode without saving, reset values
      setName(user?.name || '');
      setEmail(user?.email || '');
      setPhone(user?.phone || '');
      setProfileImage(user?.profileImage || null);
      setLocalImageUri(null);
      
      // Properly reset skills
      if (isTechnician) {
        if (user?.skillsList && Array.isArray(user.skillsList)) {
          setSkills(user.skillsList.join(', '));
        } else if (user?.skillsList && typeof user.skillsList === 'string') {
          setSkills(user.skillsList);
        } else {
          setSkills('');
        }
      }
    }
    setIsEditing(!isEditing);
  };
  
  // Handle profile image picking
  const handleProfileImagePick = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }
    
    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Set the selected image
        const selectedAsset = result.assets[0];
        
        // Update local image URI state
        setLocalImageUri(selectedAsset.uri);
        // Update profile image state (this will be replaced with cloud URL after upload)
        setProfileImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };
  
  // Save edited profile information
  const handleSave = async () => {
    try {
      // Form validation
      if (!name.trim()) {
        Alert.alert('Error', 'Name is required');
        return;
      }
      
      if (!email.trim()) {
        Alert.alert('Error', 'Email is required');
        return;
      }
      
      if (!phone.trim()) {
        Alert.alert('Error', 'Phone number is required');
        return;
      }
      
      // Start loading state
      setIsLoading(true);
      
      // Prepare update data
      const userData = {
        name,
        email,
        phone,
      };
      
      // Handle profile image upload if changed
      if (localImageUri) {
        try {
          // Set initial progress
          setUploadProgress(0);
          
          // Upload image using fileService
          const cloudinaryUrl = await fileService.uploadImage(
            localImageUri, 
            (progress) => {
              setUploadProgress(progress);
            }
          );
          
          console.log('Image uploaded successfully:', cloudinaryUrl);
          
          // Add the Cloudinary URL to the userData
          userData.profileImage = cloudinaryUrl;
          
          // Reset local image URI
          setLocalImageUri(null);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          Alert.alert(
            'Warning',
            'Failed to upload profile image, but will continue updating other information.'
          );
        }
      }
      
      // Always include skillsList for technicians, even if empty
      if (isTechnician) {
        console.log('Processing skills:', skills);
        
        // Convert string to array, clean up empty items
        const skillsArray = skills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
        
        console.log('Skills array to save:', skillsArray);
        userData.skillsList = skillsArray;
      }
      
      console.log('Saving user data:', userData);
      
      // Use the auth service to update the profile
      const updatedUser = await authService.updateProfile(userData);
      
      console.log('Update response:', updatedUser);
      
      // Update the context with the new user data
      if (updatedUser && setUser) {
        setUser(updatedUser);
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      // Show success message
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Show error message
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      // End loading state
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
  // Show loading indicator while API call is in progress
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6200EE" />
        {uploadProgress > 0 && uploadProgress < 100 ? (
          <Text style={styles.loadingText}>
            Uploading image: {uploadProgress}%
          </Text>
        ) : (
          <Text style={styles.loadingText}>Updating your profile...</Text>
        )}
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleEditMode}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        {/* Profile Image Section */}
        <View style={styles.profileSection}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>{name[0] || 'U'}</Text>
            </View>
          )}
          
          {isEditing && (
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={handleProfileImagePick}
            >
              <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <Text style={styles.profileName}>{name || 'User'}</Text>
          <Text style={styles.roleText}>{user?.role || ''}</Text>
        </View>
        
        {/* Basic Information Card - From User base model */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>
          
          {/* Name field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
            ) : (
              <Text style={styles.fieldValue}>{name || 'Not provided'}</Text>
            )}
          </View>
          
          {/* Email field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.fieldValue}>{email || 'Not provided'}</Text>
            )}
          </View>
          
          {/* Phone field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{phone || 'Not provided'}</Text>
            )}
          </View>
        </View>
        
        {/* Technician-specific fields - from TechnicianSchema */}
        {isTechnician && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Professional Information</Text>
            
            {/* Skills List field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Skills</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={skills}
                  onChangeText={setSkills}
                  placeholder="Enter your skills (comma separated)"
                  multiline
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {user?.skillsList && user.skillsList.length > 0 
                    ? user.skillsList.join(', ') 
                    : 'No skills listed'}
                </Text>
              )}
            </View>           
          </View>
        )}
      </ScrollView>
      
      {isEditing && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={toggleEditMode}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
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
  actionButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#6200EE',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#6200EE',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 40, // Adjusted to position correctly with text below
    right: '50%',
    marginRight: -50, // Half of image width
    backgroundColor: '#6200EE',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  changePasswordButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  changePasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200EE',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

