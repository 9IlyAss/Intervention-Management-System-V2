// app/(app)/(client)/intervention/[id].jsx - Complete with full styles
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import clientService from '../../../services/clientService';

export default function InterventionDetailScreen() {
  const { id } = useLocalSearchParams();
  const [intervention, setIntervention] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
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
      const data = await clientService.getInterventionDetails(id);
      setIntervention(data);
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

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating before submitting feedback.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await clientService.submitFeedback(id, {
        rating,
        comment
      });
      
      Alert.alert(
        'Success',
        'Thank you for your feedback!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setShowFeedbackForm(false);
              loadInterventionDetails(); // Reload to show the feedback
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      
      // Show more specific error message based on API error
      let errorMessage = 'Failed to submit feedback. Please try again.';
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message && error.message.includes('not completed')) {
        errorMessage = 'Feedback can only be submitted for completed service requests.';
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

  const renderFeedbackSection = () => {
    // Only show feedback section if intervention is completed and no feedback exists yet
    if (intervention?.status === 'Completed' && !intervention?.feedback) {
      return (
        <View style={styles.feedbackSection}>
          {showFeedbackForm ? (
            <View style={styles.feedbackForm}>
              <Text style={styles.feedbackTitle}>Rate your experience</Text>
              
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                  >
                    <Ionicons
                      name={rating >= star ? "star" : "star-outline"}
                      size={32}
                      color={rating >= star ? "#FFC107" : "#CCCCCC"}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={styles.commentInput}
                placeholder="Add additional comments (optional)"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
              />
              
              <View style={styles.feedbackButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowFeedbackForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.submitButton,
                    rating === 0 && styles.disabledButton
                  ]}
                  onPress={handleSubmitFeedback}
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Feedback</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.leaveFeedbackButton}
              onPress={() => setShowFeedbackForm(true)}
            >
              <Ionicons name="star-outline" size={20} color="#6200EE" />
              <Text style={styles.leaveFeedbackText}>Leave Feedback</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    } else if (intervention?.feedback) {
      // If feedback already exists
      return (
        <View style={styles.existingFeedback}>
          <Text style={styles.feedbackTitle}>Your Feedback</Text>
          
          <View style={styles.ratingDisplay}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={intervention.feedback.rating >= star ? "star" : "star-outline"}
                size={20}
                color={intervention.feedback.rating >= star ? "#FFC107" : "#CCCCCC"}
              />
            ))}
            <Text style={styles.ratingDate}>
              Submitted on {formatDate(intervention.feedback.date)}
            </Text>
          </View>
          
          {intervention.feedback.comment ? (
            <Text style={styles.feedbackComment}>"{intervention.feedback.comment}"</Text>
          ) : null}
        </View>
      );
    }
    
    return null;
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
        <Text style={styles.headerTitle}>Service Request Details</Text>
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
          
          {intervention.technicianId ? (
            <>
              <View style={styles.divider} />
              <View style={styles.technicianSection}>
                <Text style={styles.sectionTitle}>Assigned Technician</Text>
                <View style={styles.technicianInfo}>
                  <View style={styles.technicianAvatar}>
                    <Ionicons name="person" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.technicianDetails}>
                    <Text style={styles.technicianName}>
                      {intervention.technicianId.name || 'Name not available'}
                    </Text>
                    {intervention.technicianId.email ? (
                      <Text style={styles.technicianEmail}>
                        {intervention.technicianId.email}
                      </Text>
                    ) : null}
                    {intervention.technicianId.phone ? (
                      <Text style={styles.technicianEmail}>
                        {intervention.technicianId.phone}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.divider} />
              <View style={styles.technicianSection}>
                <Text style={styles.sectionTitle}>Assigned Technician</Text>
                <Text style={styles.noTechnician}>
                  No technician assigned yet
                </Text>
              </View>
            </>
          )}
          
          {intervention.attachmentsList && intervention.attachmentsList.length > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.attachmentsSection}>
                <Text style={styles.sectionTitle}>Attachments</Text>
                <View style={styles.attachmentsList}>
                  {intervention.attachmentsList.map((attachment, index) => {
                    // Check if it's an image URL by extension
                    const isImage = attachment.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/);
                    
                    return (
                      <TouchableOpacity 
                        key={index}
                        style={styles.attachmentItem}
                        onPress={() => {
                          if (isImage) {
                            // Navigate to image viewer with the image URL
                            router.push(`/(app)/(client)/ImageViewer?url=${encodeURIComponent(attachment)}`);
                          } else {
                            // Handle non-image attachments
                            Alert.alert('View Attachment', `Opening ${attachment}...`);
                          }
                        }}
                      >
                        {isImage ? (
                          <>
                            <Ionicons name="image-outline" size={24} color="#6200EE" />
                            <Text style={styles.attachmentName}>
                              {attachment.split('/').pop()}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="document-outline" size={24} color="#6200EE" />
                            <Text style={styles.attachmentName}>
                              {attachment.split('/').pop()}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          ) : null}
        </View>
        
        {renderFeedbackSection()}
        
        {/* Conditionally show cancel button for Pending requests */}
        {intervention.status === 'Pending' ? (
          <TouchableOpacity 
            style={styles.cancelRequestButton}
            onPress={() => Alert.alert(
              'Cancel Request',
              'Are you sure you want to cancel this service request?',
              [
                { text: 'No', style: 'cancel' },
                { 
                  text: 'Yes, Cancel Request', 
                  style: 'destructive',
                  // This would actually need to call an API to update the status
                  onPress: () => Alert.alert('Not Implemented', 'This feature would be implemented in a full app') 
                }
              ]
            )}
          >
            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
            <Text style={styles.cancelRequestText}>Cancel Request</Text>
          </TouchableOpacity>
        ) : null}
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
  technicianSection: {
    marginBottom: 16,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  technicianAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  technicianDetails: {
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  technicianEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noTechnician: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  feedbackSection: {
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
  leaveFeedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  leaveFeedbackText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  feedbackForm: {
    padding: 4,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6200EE',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  existingFeedback: {
    padding: 4,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
  },
  feedbackComment: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  cancelRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    marginTop: 8,
  },
  cancelRequestText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});