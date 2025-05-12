// app/(app)/(client)/interventions.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { interventionAPI } from '../../../services/api';

export default function InterventionsScreen() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadInterventions();
  }, []);

  const loadInterventions = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual API call when implemented
      // const response = await interventionAPI.getAll({ client: user.id });
      // setInterventions(response.interventions || []);
      
      // For now, use placeholder data
      setTimeout(() => {
        setInterventions([
          {
            id: '1',
            title: 'AC Maintenance',
            description: 'Regular maintenance for the air conditioning unit',
            status: 'scheduled',
            category: 'Air Conditioning',
            date: new Date(2025, 5, 15),
            technician: 'John Smith'
          },
          {
            id: '2',
            title: 'Internet Troubleshooting',
            description: 'Fix internet connectivity issues in the main office',
            status: 'in_progress',
            category: 'Network & IT',
            date: new Date(2025, 5, 10),
            technician: 'Sarah Johnson'
          },
          {
            id: '3',
            title: 'Plumbing Repair',
            description: 'Fix leaking faucet in the kitchen area',
            status: 'completed',
            category: 'Plumbing',
            date: new Date(2025, 5, 5),
            technician: 'Michael Brown'
          },
          {
            id: '4',
            title: 'Electrical Wiring Check',
            description: 'Inspect wiring in the conference room',
            status: 'completed',
            category: 'Electrical',
            date: new Date(2025, 4, 25),
            technician: 'Emily Davis'
          },
          {
            id: '5',
            title: 'Office Cleaning',
            description: 'Deep cleaning of office premises',
            status: 'cancelled',
            category: 'Cleaning',
            date: new Date(2025, 4, 15),
            technician: null
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load interventions:', error);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#2196F3';
      case 'in_progress':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'Air Conditioning':
        return 'snow-outline';
      case 'Network & IT':
        return 'wifi-outline';
      case 'Plumbing':
        return 'water-outline';
      case 'Electrical':
        return 'flash-outline';
      case 'Security':
        return 'shield-outline';
      case 'Cleaning':
        return 'sparkles-outline';
      default:
        return 'construct-outline';
    }
  };

  const filterInterventions = () => {
    if (activeFilter === 'all') {
      return interventions;
    }
    return interventions.filter(item => item.status === activeFilter);
  };

  const renderInterventionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.interventionCard}
      onPress={() => router.push(`/(app)/(client)/intervention/${item.id}`)}
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
            {item.status.replace('_', ' ')}
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

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyText}>No service requests found</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/(app)/(client)/create')}
      >
        <Text style={styles.createButtonText}>Create New Request</Text>
      </TouchableOpacity>
    </View>
  );

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
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Loading service requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filterInterventions()}
          renderItem={renderInterventionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
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
  },
});