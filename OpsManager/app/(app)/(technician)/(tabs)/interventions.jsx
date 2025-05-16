// app/(app)/(technician)/(tabs)/interventions.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Alert
} from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext'; // Updated path
import technicianService from '../../../services/technicianService'; // Updated path

export default function InterventionsScreen() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);

  // Load interventions on component mount
  useEffect(() => {
    console.log('Interventions screen mounted, loading data');
    loadInterventions();
  }, []);

  // Function to load interventions
  const loadInterventions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Calling technicianService.getTechnicianInterventions()');
      
      // Use the API call from technicianService
      const data = await technicianService.getTechnicianInterventions();
      
      console.log('API response data:', data); // Debug log
      
      // Format the data for display
      const formattedInterventions = data.map((intervention) => {
        // Check if technicianId exists and has a name property
        let technicianName = null;
        if (intervention.technicianId) {
          // If it's a populated object, get the name
          if (typeof intervention.technicianId === 'object' && intervention.technicianId.name) {
            technicianName = intervention.technicianId.name;
          } 
          // If it's just an ID without population, store that we have a technician but no name
          else if (typeof intervention.technicianId === 'string' || intervention.technicianId._id) {
            technicianName = "Assigned Technician";
          }
        }
        
        return {
          id: intervention._id || intervention.id,
          title: intervention.title || 'Untitled Request',
          description: intervention.description || 'No description provided',
          status: intervention.status?.toLowerCase() || 'pending', // Ensure lowercase for consistency
          category: intervention.category || 'Maintenance',
          date: new Date(intervention.createdAt || Date.now()),
          technician: technicianName,
          // Add all original data for reference when navigating to details
          originalData: intervention
        };
      });
      
      console.log(`Formatted ${formattedInterventions.length} interventions`);
      setInterventions(formattedInterventions);
    } catch (error) {
      console.error('Failed to load interventions:', error);
      setError('Failed to load service requests. Pull down to refresh or check your connection.');
      setInterventions([]); // Set to empty array
      
      // Show error alert
      Alert.alert(
        'Connection Error',
        'Unable to load your service requests. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInterventions();
    setRefreshing(false);
  };

  // Helper function to get status color
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

  // Helper function to get icon for category
  const getIconForCategory = (category) => {
    if (!category) return 'construct-outline';
    
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

  // Filter interventions based on active filter
  const filterInterventions = () => {
    if (activeFilter === 'all') {
      return interventions;
    }
    
    // Filter based on status
    return interventions.filter(item => {
      // Convert to lowercase for case-insensitive comparison
      const itemStatus = item.status.toLowerCase();
      
      // Convert scheduled to pending for filtering
      if (activeFilter === 'scheduled') {
        return itemStatus === 'pending';
      }
      
      // Convert filter options to match database status values
      if (activeFilter === 'in_progress') {
        return itemStatus === 'in progress';
      }
      
      // Match the database values directly for completed and cancelled
      return itemStatus === activeFilter;
    });
  };

  // Format status for display
  const getDisplayStatus = (status) => {
    // Convert database status to user-friendly display format
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return 'Scheduled';
      case 'in progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Render intervention item
  const renderInterventionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.interventionCard}
      onPress={() => router.push({
        pathname: `/(app)/(technician)/intervention/${item.id}`,
        // Pass additional params if needed
        params: { 
          id: item.id,
          title: item.title
        }
      })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons 
            name={getIconForCategory(item.category)} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.categoryText, { color: getStatusColor(item.status) }]}>
            {item.category}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getDisplayStatus(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.interventionTitle}>{item.title}</Text>
      <Text style={styles.interventionDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.interventionFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.footerText}>
            {item.date.toLocaleDateString()}
          </Text>
        </View>
        
        {item.technician ? (
          <View style={styles.footerItem}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.footerText}>{item.technician}</Text>
          </View>
        ) : (
          <View style={styles.footerItem}>
            <Text style={styles.footerText}>No technician assigned</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {error ? (
        <>
          <Ionicons name="cloud-offline-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>{error}</Text>
        </>
      ) : (
        <>
          <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No service requests found</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(app)/(technician)/create')}
          >
            <Text style={styles.createButtonText}>Create New Request</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Service Requests</Text>
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                activeFilter === option.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(option.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === option.id && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading service requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filterInterventions()}
          renderItem={renderInterventionItem}
          keyExtractor={(item) => (item.id ? item.id.toString() : `temp-id-${Math.random()}`)}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6200EE"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6200EE',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra space for tab bar
    flexGrow: 1, // Ensures the empty state centers properly
  },
  interventionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  interventionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  interventionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  interventionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  }
});