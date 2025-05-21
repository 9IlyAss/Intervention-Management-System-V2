// services/requestService.js
// Handles API requests for interventions management
import api from './api';

// Debug mode
const DEBUG = true;

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

export const requestService = {
  // Get all requests/interventions
  getrequests: async (limit = null) => {
    try {
      log('Fetching interventions', limit ? `with limit: ${limit}` : '');
      
      let url = `/api/interventions`;
      if (limit) {
        url += `?limit=${limit}`;
      }
      
      const response = await api.get(url);
      
      log('Interventions received:', response.data);
      
      // Ensure we always return an array, even if the API response is invalid
      if (!response.data || !Array.isArray(response.data)) {
        log('Warning: API response is not an array:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      log('Error fetching interventions:', error.response?.data || error.message);
      // Return empty array on error for safer usage
      return [];
    }
  },
  
  // Get a specific request/intervention by ID
  getrequestById: async (id) => {
    try {
      log(`Fetching intervention with ID: ${id}`);
      
      const response = await api.get(`/api/interventions/${id}`);
      
      log('Intervention details received:', response.data);
      
      return response.data;
    } catch (error) {
      log(`Error fetching intervention with ID ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Assign technician to an intervention
  assignTechnician: async (interventionId, technicianId) => {
    try {
      log(`Assigning technician ${technicianId} to intervention ${interventionId}`);
      
      const response = await api.put(
        `/api/interventions/assign-technician/${interventionId}`,
        { technicianId }
      );
      
      log('Technician assignment response:', response.data);
      
      return response.data;
    } catch (error) {
      log(`Error assigning technician to intervention ${interventionId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update request/intervention status
  updateRequestStatus: async (requestId, status) => {
    try {
      log(`Updating intervention ${requestId} status to: ${status}`);
      
      const response = await api.put(
        `/api/interventions/${requestId}/status`,
        { status }
      );
      
      log('Status update response:', response.data);
      
      return response.data;
    } catch (error) {
      log(`Error updating intervention status:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      log('Fetching dashboard statistics');
      
      const response = await api.get(`/api/admin/stats`);
      
      log('Dashboard stats received:', response.data);
      
      // Validate that response.data is an object
      if (!response.data || typeof response.data !== 'object' || Array.isArray(response.data)) {
        log('Warning: Invalid dashboard stats format:', response.data);
        return getDefaultStats();
      }
      
      return response.data;
    } catch (error) {
      log('Error fetching dashboard statistics:', error.response?.data || error.message);
      
      // Return a default structure in case of error
      return getDefaultStats();
    }
  },
  
  // Submit feedback for an intervention
  submitFeedback: async (interventionId, feedbackData) => {
    try {
      log(`Submitting feedback for intervention ${interventionId}:`, feedbackData);
      
      const response = await api.post(
        `/api/interventions/${interventionId}/feedback`, 
        feedbackData
      );
      
      log('Feedback submission response:', response.data);
      
      return response.data;
    } catch (error) {
      log('Error submitting feedback:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Create a new intervention
  createRequest: async (requestData) => {
    try {
      log('Creating new intervention:', requestData);
      
      const response = await api.post(`/api/interventions`, requestData);
      
      log('Intervention creation response:', response.data);
      
      return response.data;
    } catch (error) {
      log('Error creating intervention:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Helper function to get default stats structure
const getDefaultStats = () => {
  return {
    totals: {
      interventions: 0,
      clients: 0,
      technicians: 0
    },
    statusCounts: {
      completed: 0,
      inProgress: 0,
      issues: 0
    },
    timeline: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    },
    averageRating: 0
  };
};

export default requestService;