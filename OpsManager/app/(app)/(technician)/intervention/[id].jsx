// app/(app)/(technician)/intervention/[id].jsx - Technician view
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import technicianService from '../../../services/technicianService';
import ImageViewer from '../../(client)/ImageViewer';

export default function TechnicianInterventionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [intervention, setIntervention] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadInterventionDetails();
  }, [id]);

  const loadInterventionDetails = async () => {
    if (!id) {
      setError('Invalid intervention ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await technicianService.getInterventionDetails(id);
      setIntervention(data);
      
      // Initialize form with current values
      if (data) {
        setStatusUpdate(data.status);
        setNotes(data.evidence?.notes || '');
        setPhotos(data.evidence?.photos || []);
      }
    } catch (error) {
      console.error('Failed to load intervention details:', error);
      setError('Failed to load service request details. Please try again.');
      
      // Show alert for connection error
      Alert.alert(
        'Connection Error',
        'Unable to load the service request details. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photos to add images.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add the selected image to photos array (this would be a URI in a real app)
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your camera to take photos.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Add the captured image to photos array
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
  };

  const handleUpdateIntervention = async () => {
    if (!statusUpdate) {
      Alert.alert('Error', 'Please select a status before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare the update data
      const updateData = {
        status: statusUpdate,
        evidence: {
          notes: notes,
          photos: photos
        }
      };
      
      await technicianService.updateIntervention(id, updateData);
      
      Alert.alert(
        'Success',
        'Service request has been updated successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setShowUpdateForm(false);
              loadInterventionDetails(); // Reload to show updates
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to update service request:', error);
      
      // Show specific error message based on API error
      let errorMessage = 'Failed to update service request. Please try again.';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    // Normalize status to lowercase for case-insensitive comparison
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return '#FF9800'; // Orange
      case 'in progress':
        return '#2196F3'; // Blue
      case 'completed':
        return '#4CAF50'; // Green
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const getIconForCategory = (category) => {
    const categoryIcons = {
      'IT Services': 'desktop-outline',
      'Surveillance': 'videocam-outline',
      'Telephony': 'call-outline',
      'Printers': 'print-outline',
      'Software': 'code-outline',
      'Office Supplies': 'briefcase-outline',
      'Maintenance': 'construct-outline',
      'Alarms': 'notifications-outline',
      'Sound Systems': 'volume-high-outline',
    };
    
    return categoryIcons[category] || 'construct-outline';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading service request details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!intervention) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
        <Text style={styles.errorText}>Service request not found</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Technician Service View</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{intervention.title}</Text>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(intervention.status) + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.statusText, 
                  { color: getStatusColor(intervention.status) }
                ]}
              >
                {intervention.status}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons 
                  name={getIconForCategory(intervention.category)} 
                  size={20} 
                  color="#666"
                />
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{intervention.category}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>{formatDate(intervention.createdAt)}</Text>
              </View>
            </View>
            
            {intervention.location ? (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{intervention.location}</Text>
                </View>
              </View>
            ) : null}
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>{formatDate(intervention.updatedAt)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{intervention.description}</Text>
          </View>
          
          {intervention.clientId ? (
            <>
              <View style={styles.divider} />
              <View style={styles.clientSection}>
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.clientInfo}>
                  <View style={styles.clientAvatar}>
                    <Ionicons name="person" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.clientDetails}>
                    <Text style={styles.clientName}>
                      {intervention.clientId.name || 'Name not available'}
                    </Text>
                    {intervention.clientId.email ? (
                      <Text style={styles.clientEmail}>
                        {intervention.clientId.email}
                      </Text>
                    ) : null}
                    {intervention.clientId.phone ? (
                      <Text style={styles.clientEmail}>
                        {intervention.clientId.phone}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </>
          ) : null}
          
          {intervention.attachmentsList && intervention.attachmentsList.length > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.attachmentsSection}>
                <Text style={styles.sectionTitle}>Client Attachments</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoScrollView}
                >
                  {intervention.attachmentsList.map((attachment, index) => {
                    // Check if it's an image URL by extension
                    const isImage = attachment.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/);
                    
                    if (isImage) {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.photoThumbnail}
                          onPress={() => {
                            router.push(`/(app)/(technician)/ImageViewer?url=${encodeURIComponent(attachment)}`);
                          }}
                        >
                          <Image 
                            source={{ uri: attachment }} 
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      );
                    } else {
                      return (
                        <TouchableOpacity 
                          key={index}
                          style={styles.attachmentItem}
                          onPress={() => {
                            // Handle non-image attachments
                            Alert.alert('View Attachment', `Opening ${attachment}...`);
                          }}
                        >
                          <Ionicons name="document-outline" size={24} color="#6200EE" />
                          <Text style={styles.attachmentName}>
                            {attachment.split('/').pop()}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  })}
                </ScrollView>
              </View>
            </>
          ) : null}
          
          {/* Technician Evidence Section */}
          {intervention.evidence && (intervention.evidence.notes || (intervention.evidence.photos && intervention.evidence.photos.length > 0)) ? (
            <>
              <View style={styles.divider} />
              <View style={styles.evidenceSection}>
                <Text style={styles.sectionTitle}>Technician Notes</Text>
                
                {intervention.evidence.notes ? (
                  <Text style={styles.evidenceNotes}>
                    {intervention.evidence.notes}
                  </Text>
                ) : null}
                
                {intervention.evidence.photos && intervention.evidence.photos.length > 0 ? (
                  <View style={styles.evidencePhotos}>
                    <Text style={styles.photoTitle}>Work Evidence Photos:</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.photoScrollView}
                    >
                      {intervention.evidence.photos.map((photo, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.photoThumbnail}
                          onPress={() => {
                            // Fixed: Pass the correct photo URI to ImageViewer
                            router.push(`/(app)/(technician)/ImageViewer?url=${encodeURIComponent(photo)}`);
                          }}
                        >
                          <Image 
                            source={{ uri: photo }} 
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
        
 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  spacer: {
    width: 40, // Matches the width of the back button for center alignment
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  clientSection: {
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  attachmentsSection: {
    marginBottom: 16,
  },
  attachmentsList: {
    marginTop: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  attachmentName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  evidenceSection: {
    marginBottom: 16,
  },
  evidenceNotes: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  evidencePhotos: {
    marginTop: 8,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  photoScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  // Update Form Styles
  updateForm: {
    padding: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#666',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    width: '48%',
    justifyContent: 'center',
  },
  photoActionText: {
    fontSize: 14,
    color: '#6200EE',
    marginLeft: 6,
    fontWeight: '500',
  },
  photoScrollView: {
    marginTop: 8,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 8,
  },
  photoPreview: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  noPhotosText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6200EE',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});