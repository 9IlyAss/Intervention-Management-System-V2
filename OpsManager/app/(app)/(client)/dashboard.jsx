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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data loading
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Service categories for quick access
  const serviceCategories = [
    { id: '1', name: 'AC', icon: 'snow', color: '#2196F3' },
    { id: '2', name: 'IT', icon: 'wifi', color: '#4CAF50' },
    { id: '3', name: 'Plumbing', icon: 'water', color: '#FF9800' },
    { id: '4', name: 'Electrical', icon: 'flash', color: '#F44336' },
    { id: '5', name: 'Security', icon: 'shield', color: '#9C27B0' },
    { id: '6', name: 'Cleaning', icon: 'sparkles', color: '#00BCD4' },
  ];

  // Upcoming appointments
  const upcomingAppointments = [
    {
      id: '1',
      title: 'AC Maintenance',
      date: 'May 15, 2025',
      time: '10:00 AM',
      technician: 'John Smith',
      status: 'confirmed'
    },
    {
      id: '2',
      title: 'Network Setup',
      date: 'May 18, 2025',
      time: '2:30 PM',
      technician: 'Sarah Johnson',
      status: 'pending'
    }
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
                onPress={() => router.push(`/(app)/(client)/service/${category.id}`)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Ionicons name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Recent Activity Section */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(client)/history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => router.push(`/(app)/(client)/intervention/${appointment.id}`)}
              >
                <View style={styles.appointmentIconContainer}>
                  <Ionicons name="calendar" size={24} color="#6200EE" />
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                  <Text style={styles.appointmentTime}>
                    {appointment.date} · {appointment.time}
                  </Text>
                  <Text style={styles.technicianName}>
                    <Ionicons name="person" size={14} color="#666" /> {appointment.technician}
                  </Text>
                </View>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: appointment.status === 'confirmed' ? '#4CAF50' : '#FF9800' }
                ]} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/(app)/(client)/create')}
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
              onPress={() => router.push('/(app)/(client)/history')}
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
    color: '#666',
    fontSize: 16,
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