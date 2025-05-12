// app/(app)/(client)/dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import clientService from '../../../services/clientService';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [error, setError] = useState(null);
  
  // Load interventions on component mount
  useEffect(() => {
    fetchInterventions();
  }, []);

  // Function to fetch client interventions
  const fetchInterventions = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Get only 3 most recent interventions for the dashboard
      const data = await clientService.getClientInterventions(2);
      
      // Format the data for display
      const formattedInterventions = data.map(intervention => ({
        id: intervention._id || intervention.id,
        title: intervention.title,
        date: new Date(intervention.createdAt || Date.now()).toLocaleDateString(),
        time: new Date(intervention.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        technician: intervention.technicianId?.name || 'Unassigned',
        status: intervention.status.toLowerCase() || 'pending'
      }));
      
      setInterventions(formattedInterventions);
    } catch (err) {
      console.error('Failed to load interventions:', err);
      setError('Failed to load interventions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInterventions();
    setRefreshing(false);
  };

  // Navigate to create a new intervention
  const handleCreateIntervention = () => {
    router.push('/(app)/(client)/create');
  };

  // Navigate to view intervention details
  const handleViewIntervention = (interventionId) => {
    router.push(`/(app)/(client)/intervention/${interventionId}`);
  };

  // Service categories for quick access
  const serviceCategories = [
    { id: '1', name: 'IT Services', icon: 'desktop', color: '#2196F3' },
    { id: '2', name: 'Surveillance', icon: 'videocam', color: '#9C27B0' },
    { id: '3', name: 'Telephony', icon: 'call', color: '#4CAF50' },
    { id: '4', name: 'Printers', icon: 'print', color: '#FF9800' },
    { id: '5', name: 'Software', icon: 'code', color: '#F44336' },
    { id: '6', name: 'Office Supplies', icon: 'briefcase', color: '#00BCD4' },
    { id: '7', name: 'Maintenance', icon: 'construct', color: '#607D8B' },
    { id: '8', name: 'Alarms', icon: 'notifications', color: '#E91E63' },
    { id: '9', name: 'Sound Systems', icon: 'volume-high', color: '#795548' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'Client'}</Text>
          <Text style={styles.subGreeting}>What service do you need today?</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/(app)/(client)/notifications')}
        >
          <Ionicons name="notifications" size={24} color="#FFFFFF" />
          {/* Notification badge */}
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200EE']} />
        }
      >
        {/* Service Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.categoriesGrid}>
            {serviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => {
                  // Create new intervention with pre-selected category
                  router.push({
                    pathname: '/(app)/(client)/create',
                    params: { category: category.id, categoryName: category.name }
                  });
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Ionicons name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Recent Interventions Section */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Requests</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(client)/(tabs)/interventions')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6200EE" />
              <Text style={styles.loadingText}>Loading your requests...</Text>
            </View>
          ) : error ? (
            <TouchableOpacity 
              style={styles.errorContainer} 
              onPress={fetchInterventions}
            >
              <Ionicons name="refresh" size={24} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </TouchableOpacity>
          ) : interventions.length > 0 ? (
            interventions.map((intervention) => (
              <TouchableOpacity
                key={intervention.id}
                style={styles.appointmentCard}
                onPress={() => handleViewIntervention(intervention.id)}
              >
                <View style={styles.appointmentIconContainer}>
                  <Ionicons 
                    name={getStatusIcon(intervention.status)} 
                    size={24} 
                    color={getStatusColor(intervention.status)} 
                  />
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentTitle}>{intervention.title}</Text>
                  <Text style={styles.appointmentTime}>
                    {intervention.date} · {intervention.time}
                  </Text>
                  <Text style={styles.technicianName}>
                    <Ionicons name="person" size={14} color="#666" /> {intervention.technician}
                  </Text>
                </View>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: getStatusColor(intervention.status) }
                ]} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No requests yet</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateIntervention}
              >
                <Text style={styles.createButtonText}>Create New Request</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleCreateIntervention}
            >
              <Ionicons name="add-circle" size={22} color="#6200EE" />
              <Text style={styles.quickActionText}>New Request</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/(client)/support')}
            >
              <Ionicons name="help-circle" size={22} color="#6200EE" />
              <Text style={styles.quickActionText}>Get Help</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/(client)/(tabs)/interventions')}
            >
              <Ionicons name="time" size={22} color="#6200EE" />
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get icon based on status
const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return 'time';
    case 'in progress':
      return 'construct';
    case 'completed':
      return 'checkmark-circle';
    case 'cancelled':
      return 'close-circle';
    default:
      return 'document-text';
  }
};

// Helper function to get color based on status
const getStatusColor = (status) => {
  switch (status) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6200EE',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  subGreeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#6200EE',
  },
  scrollView: {
    flex: 1,
  },
  categoriesSection: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#6200EE',
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  appointmentsSection: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 150, // Ensure minimum height even when empty
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorText: {
    marginTop: 8,
    color: '#F44336',
    fontSize: 14,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appointmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  technicianName: {
    fontSize: 12,
    color: '#666',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    marginTop: 12,
    marginBottom: 16,
    color: '#666',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  quickActionsSection: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3E5F5',
    marginHorizontal: 4,
  },
  quickActionText: {
    marginTop: 8,
    color: '#6200EE',
    fontWeight: '500',
    fontSize: 12,
  },
  bottomSpacing: {
    height: 90, // Adjust based on tab bar height
  },
});