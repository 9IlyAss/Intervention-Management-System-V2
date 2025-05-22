// services/userService.js
// Handles API requests for user management
import api from './api';

// Debug mode
const DEBUG = true;

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

export const userService = {
  // Get all users
  getUsers: async () => {
    try {
      log('Fetching all users');
      
      const response = await api.get('/api/admin');
      
      log('Users received:', response.data);
      
      // Ensure we always return an array
      if (!response.data || !Array.isArray(response.data)) {
        log('Warning: Users API response is not an array:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      log('Error fetching users:', error.response?.data || error.message);
      // Return empty array on error for safer usage
      return [];
    }
  },
  
  // Get technicians only
  getTechnicians: async () => {
    try {
      log('Fetching technicians');
      
      const users = await userService.getUsers();
      const technicians = users.filter(user => user.role === 'technician');
      
      log('Technicians found:', technicians.length);
      
      return technicians;
    } catch (error) {
      log('Error fetching technicians:', error.response?.data || error.message);
      return [];
    }
  },
  
  // Get clients only
  getClients: async () => {
    try {
      log('Fetching clients');
      
      const users = await userService.getUsers();
      const clients = users.filter(user => user.role === 'client');
      
      log('Clients found:', clients.length);
      
      return clients;
    } catch (error) {
      log('Error fetching clients:', error.response?.data || error.message);
      return [];
    }
  },
  
  // Get user by ID
  getUserById: async (id) => {
    try {
      log(`Fetching user with ID: ${id}`);
      
      const response = await api.get(`/api/admin/${id}`);
      
      log('User details received:', response.data);
      
      return response.data;
    } catch (error) {
      log(`Error fetching user with ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Create new user
  createUser: async (userData) => {
    try {
      log('Creating new user:', userData);
      
      const response = await api.post('/api/admin', userData);
      
      log('User creation response:', response.data);
      
      return response.data;
    } catch (error) {
      log('Error creating user:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update user
  updateUser: async (id, userData) => {
    try {
      log(`Updating user ${id}:`, userData);
      
      const response = await api.put(`/api/admin/${id}`, userData);
      
      log('User update response:', response.data);
      
      return response.data;
    } catch (error) {
      log(`Error updating user ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete user
  deleteUser: async (id) => {
    try {
      log(`Deleting user with ID: ${id}`);
      
      const response = await api.delete(`/api/admin/${id}`);
      
      log('User deletion response:', response.data);
      
      return response.data;
    } catch (error) {
      log(`Error deleting user ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get user counts (for dashboard)
  getUserCounts: async () => {
    try {
      log('Fetching user counts');
      
      const users = await userService.getUsers();
      
      const counts = {
        total: users.length,
        clients: users.filter(user => user.role === 'client').length,
        technicians: users.filter(user => user.role === 'technician').length,
        admins: users.filter(user => user.role === 'admin').length
      };
      
      log('User counts:', counts);
      
      return counts;
    } catch (error) {
      log('Error fetching user counts:', error.response?.data || error.message);
      return {
        total: 0,
        clients: 0,
        technicians: 0,
        admins: 0
      };
    }
  },
  
  // Search users
  searchUsers: async (query, role = null) => {
    try {
      log(`Searching users with query: "${query}", role: ${role}`);
      
      const users = await userService.getUsers();
      
      let filteredUsers = users;
      
      // Filter by role if specified
      if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }
      
      // Filter by search query
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name?.toLowerCase().includes(lowercaseQuery) ||
          user.email?.toLowerCase().includes(lowercaseQuery) ||
          user.phone?.toLowerCase().includes(lowercaseQuery)
        );
      }
      
      log('Search results:', filteredUsers.length, 'users found');
      
      return filteredUsers;
    } catch (error) {
      log('Error searching users:', error.response?.data || error.message);
      return [];
    }
  }
};

export default userService;