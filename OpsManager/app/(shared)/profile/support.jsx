import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import supportService from '../../services/supportService';

export default function HelpAndSupport() {
  const { user } = useAuth();
  
  // Determine user role
  const isClient = user?.role === 'client';
  const isTechnician = user?.role === 'technician';
  
  // State for form and loading
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  
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
  
  // Toggle FAQ sections
  const toggleSection = (sectionId) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
  };
  
  // Handle support form submission
  const handleSubmitRequest = async () => {
    // Validate form
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject for your request');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue or question');
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Submit the support request
      await supportService.createSupportRequest({
        subject: subject.trim(),
        message: message.trim()
      });
      
      // Show success message
      Alert.alert(
        'Request Submitted',
        'Your support request has been submitted. Our team will contact you shortly.',
        [
          { 
            text: 'OK',
            onPress: () => {
              // Clear form
              setSubject('');
              setMessage('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting support request:', error);
      Alert.alert(
        'Error', 
        'Failed to submit your request. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle contact methods
  const handleContact = (method, value) => {
    switch (method) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'whatsapp':
        Linking.openURL(`https://wa.me/${value}`);
        break;
      default:
        break;
    }
  };
  
  // FAQ data - Different sets for clients and technicians
  const clientFaqs = [
    {
      id: 1,
      question: 'How do I request a service?',
      answer: 'You can request a service by tapping on the "+" button in the app and filling out the service request form. Our team will review your request and assign a technician shortly.'
    },
    {
      id: 2,
      question: 'How do I contact my assigned technician?',
      answer: 'Once a technician has been assigned to your service request, you can communicate directly with them via the chat feature in the app.'
    },
    {
      id: 3,
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by going to the Profile tab and tapping on "Personal Information". From there, tap "Edit" to make changes to your information.'
    },
    {
      id: 4,
      question: 'What should I do if I encounter a technical issue?',
      answer: 'If you encounter any technical issues with the app, you can contact our support team using the form below or by emailing support@gde.ma. Please provide as much detail as possible about the issue you\'re experiencing.'
    },
    {
  id: 5,
  question: 'How are payments processed?',
  answer: 'Payments are made directly in cash to the technician after the service has been completed. The technician will mark the job as completed in the app once payment has been received.'
}
  ];
  
  const technicianFaqs = [
    {
      id: 1,
      question: 'How do I see my assigned tasks?',
      answer: 'All your assigned tasks and service requests will appear in your dashboard and in the Requests tab. You can tap on any request to view its details.'
    },
    {
      id: 2,
      question: 'How do I communicate with clients?',
      answer: 'You can communicate with your assigned clients through the chat feature in the app. Tap on the Chat icon and select the client you wish to contact.'
    },
    {
      id: 3,
      question: 'How do I update my skills and profile?',
      answer: 'You can update your profile information and skills by going to the Profile tab and tapping on "Personal Information". From there, tap "Edit" to make changes.'
    },
    {
      id: 4,
      question: 'How do I mark a job as completed?',
      answer: 'Once you\'ve finished a service request, you can mark it as completed by selecting the request, then tapping the "Complete" button. You\'ll need to upload evidence of the completed work.'
    },
{
  id: 5,
  question: 'How are payments handled?',
  answer: 'Payments are collected directly in cash from the client once you\'ve completed the job. After receiving payment, mark the job as completed in the app to update your service record.'
}
  ];
  
  // Choose the appropriate FAQs based on user role
  const faqs = isClient ? clientFaqs : technicianFaqs;
  
  // Show loading indicator while API call is in progress
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Submitting your request...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholderButton} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionDescription}>
            Need immediate assistance? Reach out to us through any of the following channels:
          </Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('phone', '0661909664')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="call-outline" size={24} color="#6200EE" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone Support</Text>
              <Text style={styles.contactValue}>06 61 90 96 64</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('email', 'support@gde.ma')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="mail-outline" size={24} color="#6200EE" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@gde.ma</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContact('whatsapp', '212661909664')}
          >
            <View style={styles.contactIconContainer}>
              <Ionicons name="logo-whatsapp" size={24} color="#6200EE" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp Support</Text>
              <Text style={styles.contactValue}>06 61 90 96 64</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
          </TouchableOpacity>
        </View>
        
        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqQuestion}
                onPress={() => toggleSection(faq.id)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons 
                  name={activeSection === faq.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6200EE" 
                />
              </TouchableOpacity>
              
              {activeSection === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
        
        {/* Support Request Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit a Support Request</Text>
          <Text style={styles.sectionDescription}>
            Can't find what you're looking for? Submit a request and our team will get back to you shortly.
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Subject</Text>
            <TextInput 
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Enter the subject of your request"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Your Message</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitRequest}
          >
            <Text style={styles.submitButtonText}>Submit Request</Text>
          </TouchableOpacity>
        </View>
        
        {/* Business Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          
          <View style={styles.hoursItem}>
            <Text style={styles.dayLabel}>Monday - Friday</Text>
            <Text style={styles.hourValue}>8:30 AM - 6:00 PM</Text>
          </View>
          
          <View style={styles.hoursItem}>
            <Text style={styles.dayLabel}>Saturday</Text>
            <Text style={styles.hourValue}>9:00 AM - 2:00 PM</Text>
          </View>
          
          <View style={styles.hoursItem}>
            <Text style={styles.dayLabel}>Sunday</Text>
            <Text style={styles.hourValue}>Closed</Text>
          </View>
          
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.noteText}>
              Emergency support is available 24/7 for urgent issues.
            </Text>
          </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    padding: 8,
  },
  placeholderButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#666',
  },
  faqItem: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  faqAnswer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
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
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  submitButton: {
    height: 48,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  hourValue: {
    fontSize: 15,
    color: '#666',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noteText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});