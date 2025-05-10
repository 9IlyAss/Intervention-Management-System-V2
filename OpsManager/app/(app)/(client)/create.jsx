// app/(app)/(client)/create.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { interventionAPI } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function CreateScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [preferredDate, setPreferredDate] = useState(new Date());
  const [preferredTime, setPreferredTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories for services
  const categories = [
    { id: '1', name: 'Air Conditioning', icon: 'snow-outline', color: '#2196F3' },
    { id: '2', name: 'Network & IT', icon: 'wifi-outline', color: '#4CAF50' },
    { id: '3', name: 'Plumbing', icon: 'water-outline', color: '#FF9800' },
    { id: '4', name: 'Electrical', icon: 'flash-outline', color: '#F44336' },
    { id: '5', name: 'Security', icon: 'shield-outline', color: '#9C27B0' },
    { id: '6', name: 'Cleaning', icon: 'sparkles-outline', color: '#00BCD4' },
  ];

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for your request');
      return false;
    }
    
    if (!selectedCategory) {
      Alert.alert('Required Field', 'Please select a category for your request');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide a description of the issue');
      return false;
    }
    
    if (!location.trim()) {
      Alert.alert('Required Field', 'Please specify the location');
      return false;
    }
    
    return true;
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera permissions to take photos');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // This would be replaced with actual API call when implemented
      // const response = await interventionAPI.create({
      //   title,
      //   description,
      //   location,
      //   category: selectedCategory.id,
      //   preferredDate,
      //   preferredTime,
      //   isUrgent,
      //   photos,
      //   client: user.id,
      // });
      
      // Simulate API call success
      setTimeout(() => {
        Alert.alert(
          'Request Submitted',
          'Your service request has been submitted successfully. We will confirm the appointment shortly.',
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/(app)/(client)/dashboard')
            }
          ]
        );
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to submit request:', error);
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Service Request</Text>
        <View style={{ width: 24 }} /> {/* Empty view for alignment */}
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter a title for your request"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory?.id === category.id && {
                        backgroundColor: `${category.color}20`,
                        borderColor: category.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Ionicons 
                      name={category.icon} 
                      size={18} 
                      color={selectedCategory?.id === category.id ? category.color : '#666'} 
                      style={styles.categoryIcon}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory?.id === category.id && { color: category.color, fontWeight: '600' },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe the issue in detail"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter the location (e.g., Office, Room 101)"
                value={location}
                onChangeText={setLocation}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Preferred Date & Time (Optional)</Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => Alert.alert('Date Picker', 'Date picker would open here')}
                >
                  <Ionicons name="calendar-outline" size={18} color="#666" style={styles.dateTimeIcon} />
                  <Text style={styles.dateTimeText}>
                    {preferredDate.toLocaleDateString() || 'Select date'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.timeInput}
                  onPress={() => Alert.alert('Time Picker', 'Time picker would open here')}
                >
                  <Ionicons name="time-outline" size={18} color="#666" style={styles.dateTimeIcon} />
                  <Text style={styles.dateTimeText}>
                    {preferredTime || 'Select time'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Photos (Optional)</Text>
              <View style={styles.photosContainer}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoPreview}>
                    {/* Note: Image component import is missing in your original code */}
                    {/* <Image source={{ uri: photo }} style={styles.photoImage} /> */}
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={22} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={24} color="#6200EE" />
                    <Text style={styles.photoButtonText}>Gallery</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={24} color="#6200EE" />
                    <Text style={styles.photoButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
                <Text style={styles.switchLabel}>Mark as Urgent</Text>
              </View>
              <Switch
                value={isUrgent}
                onValueChange={setIsUrgent}
                trackColor={{ false: '#D0D0D0', true: '#E8A7A7' }}
                thumbColor={isUrgent ? '#F44336' : '#F0F0F0'}
              />
            </View>
            
            {isUrgent && (
              <View style={styles.urgentNoteContainer}>
                <Text style={styles.urgentNoteText}>
                  Marking as urgent may incur additional charges depending on the service.
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeInput: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  photosContainer: {
    marginTop: 8,
  },
  photoPreview: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F7FA',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  photoButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F3E5F5',
  },
  photoButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6200EE',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  urgentNoteContainer: {
    backgroundColor: '#FEF5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  urgentNoteText: {
    fontSize: 14,
    color: '#F44336',
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200EE',
  },
  submitButtonDisabled: {
    backgroundColor: '#B794F6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 100, // Extra space for tab bar
  },
});