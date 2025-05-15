// app/(app)/(technician)/(tabs)/dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import technicianService from '../../../services/technicianService';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    cancelled: 0
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState(null);
  
  // Load interventions on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to fetch technician dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Get assigned interventions
      const interventionsData = await technicianService.getTechnicianInterventions();
      
      // Format the interventions data for display
      const formattedInterventions = interventionsData.map(intervention => ({
        id: intervention._id || intervention.id,
        title: intervention.title,
        description: intervention.description || 'No description provided',
        clientName: intervention.clientId?.name || 'Unknown Client',
        clientId :  intervention.clientId,
        clientAddress: intervention.clientId?.location || 'No address provided',
        clientPhone: intervention.clientId?.phone || 'No phone provided',
        date: new Date(intervention.scheduledDate || intervention.createdAt || Date.now()).toLocaleDateString(),
        time: new Date(intervention.scheduledDate || intervention.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        serviceType: intervention.category || 'General',
        status: intervention.status.toLowerCase() || 'pending',
        hasChat: true, // Simplified for now, implement chat detection logic if needed
        imageUrl: intervention.clientId?.profileImage || null,
        category: intervention.category || 'General Services',
        location: intervention.location || 'No location provided',
      }));
      
      // Calculate statistics
      const completedCount = formattedInterventions.filter(i => i.status === 'completed').length;
      const inProgressCount = formattedInterventions.filter(i => i.status === 'in progress').length;
      const pendingCount = formattedInterventions.filter(i => i.status === 'pending').length;
      const cancelledCount = formattedInterventions.filter(i => i.status === 'cancelled').length;
      
      setInterventions(formattedInterventions);
      setStats({
        completed: completedCount,
        inProgress: inProgressCount,
        pending: pendingCount,
        cancelled: cancelledCount
      });
      
      // Get technician availability status
      const techStatus = await technicianService.getTechnicianStatus();
      setIsAvailable(techStatus.isAvailable);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load your assignments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Toggle availability status
  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      await technicianService.updateTechnicianStatus(newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      setIsAvailable(!isAvailable); // Revert if failed
      setError('Failed to update your availability status.');
    }
  };

  // Navigate to view intervention details
  const handleViewIntervention = (interventionId) => {
    router.push(`/(app)/(technician)/intervention/${interventionId}`);
  };

  // Navigate to client chat
  const handleOpenChat = (interventionId) => {
    router.push(
      {pathname: `/(app)/(technician)/conversation/${interventionId}`,
      params: { clientName, clientImage }}
    );
  };

  // Helper function to get icon for category
  const getCategoryIcon = (category) => {
    if (!category) return 'construct';
    
    switch (category.toLowerCase()) {
      case 'it services':
        return 'desktop-outline';
      case 'surveillance':
        return 'videocam';
      case 'telephony':
        return 'call';
      case 'printers':
        return 'print';
      case 'software':
        return 'code-slash';
      case 'office supplies':
        return 'briefcase';
      case 'maintenance':
        return 'hammer';
      case 'alarms':
        return 'notifications';
      case 'sound systems':
        return 'volume-high';
      default:
        return 'construct';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name ? user.name : 'Technician'}</Text>
          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityText}>
              Status: {isAvailable ? 'Available' : 'Unavailable'}
            </Text>
            <Switch
              trackColor={{ false: '#9E9E9E', true: '#B39DDB' }}
              thumbColor={isAvailable ? '#6200EE' : '#F4F3F4'}
              ios_backgroundColor="#9E9E9E"
              onValueChange={toggleAvailability}
              value={isAvailable}
              style={styles.switch}
            />
          </View>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/(app)/(technician)/notifications')}
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
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#FF9800' }]} />
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="construct-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#2196F3' }]} />
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#4CAF50' }]} />
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F44336' }]}>
              <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{stats.cancelled}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
            <View style={[styles.statIndicator, { backgroundColor: '#F44336' }]} />
          </View>
        </View>
        
        {/* Recent Assignments */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Assignments</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(technician)/Assignment')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6200EE" />
              <Text style={styles.loadingText}>Loading your assignments...</Text>
            </View>
          ) : error ? (
            <TouchableOpacity 
              style={styles.errorContainer} 
              onPress={fetchDashboardData}
            >
              <Ionicons name="refresh" size={24} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </TouchableOpacity>
          ) : interventions.length > 0 ? (
            interventions.slice(0, 2).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.assignmentCard}
                onPress={() => handleViewIntervention(item.id)}
              >
                <View style={styles.assignmentHeader}>
                  <View style={styles.assignmentStatus}>
                    <View 
                      style={[
                        styles.statusDot, 
                        { backgroundColor: getStatusColor(item.status) }
                      ]} 
                    />
                    <Text style={[
                      styles.statusText, 
                      { color: getStatusColor(item.status) }
                    ]}>
                      {capitalizeFirstLetter(item.status)}
                    </Text>
                  </View>
                  
                  <View style={styles.assignmentDateContainer}>
                    <Ionicons name="calendar" size={14} color="#757575" />
                    <Text style={styles.assignmentDate}>{item.date} · {item.time}</Text>
                  </View>
                </View>
                
                <Text style={styles.assignmentTitle}>{item.title}</Text>
                
                <View style={styles.clientInfoContainer}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.clientImage} />
                  ) : (
                    <View style={styles.clientImagePlaceholder}>
                      <Ionicons name="person" size={16} color="#FFFFFF" />
                    </View>
                  )}
                  <View style={styles.clientDetails}>
                    <Text style={styles.clientName}>{item.clientName}</Text>
                    <Text style={styles.clientAddress} numberOfLines={1}>{item.location || item.clientAddress}</Text>
                  </View>
                </View>
                
                <View style={styles.assignmentFooter}>
                  <View style={styles.serviceTypeContainer}>
                    <Ionicons 
                      name={getCategoryIcon(item.category)} 
                      size={14} 
                      color="#6200EE" 
                    />
                    <Text style={styles.serviceTypeText}>{item.category}</Text>
                  </View>
                  
                  <View style={styles.assignmentActions}>
                    {item.hasChat && (
                      <TouchableOpacity 
                        style={styles.chatButton}
                        onPress={() => handleOpenChat(item.clientId)}
                      >
                        <Ionicons name="chatbubble" size={16} color="#6200EE" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No assignments yet</Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionTile}
              onPress={() => router.push('/(app)/(technician)/Assignment')}
            >
              <Ionicons name="list" size={24} color="#6200EE" />
              <Text style={styles.tileText}>All Tasks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionTile}
              onPress={() => router.push('/(app)/(technician)/completed')}
            >
              <Ionicons name="checkmark-circle" size={24} color="#6200EE" />
              <Text style={styles.tileText}>Completed</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionTile}
              onPress={() => router.push('/(app)/(technician)/reports')}
            >
              <Ionicons name="document-text" size={24} color="#6200EE" />
              <Text style={styles.tileText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  availabilityText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  switch: {
    marginLeft: 8,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '23%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    marginBottom: 4,
  },
  statIndicator: {
    position: 'absolute',
    height: 4,
    width: '100%',
    bottom: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
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
  },
  viewAllText: {
    color: '#6200EE',
    fontWeight: '500',
  },
  assignmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  assignmentDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignmentDate: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  clientInfoContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clientImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  clientImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  clientAddress: {
    fontSize: 12,
    color: '#757575',
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTypeText: {
    fontSize: 12,
    color: '#6200EE',
    marginLeft: 6,
  },
  assignmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 8,
    color: '#F44336',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  quickActionsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 16,
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
    flexWrap: 'wrap',
    marginTop: 8,
  },
  quickActionTile: {
    width: '30%',
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  tileText: {
    marginTop: 8,
    color: '#6200EE',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 90, // Adjust based on tab bar height
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
})