// app/services/technicianService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Debug mode
const DEBUG = true;

// Helper function for logging
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Set up config with token
const getConfig = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  } catch (error) {
    log('Error getting token for config:', error);
    return {};
  }
};

const technicianService = {
  // Get all interventions assigned to technician
  getTechnicianInterventions: async () => {
    try {
      log('Getting technician interventions...');
      const config = await getConfig();
      const response = await api.get('/api/technician/interventions', config);
      return response.data;
    } catch (error) {
      log('Failed to get interventions:', error.message);
      throw error;
    }
  },

  // Update intervention status
  updateInterventionStatus: async (interventionId, statusData) => {
    try {
      log(`Updating status for intervention ID: ${interventionId}`);
      const config = await getConfig();
      const response = await api.patch(`/api/technician/interventions/${interventionId}/status`, statusData, config);
      return response.data;
    } catch (error) {
      log(`Failed to update intervention status: ${error.message}`);
      throw error;
    }
  },

  // Get chat list for technician
  getTechnicianChatList: async () => {
    try {
      log('Getting technician chat list...');
      const config = await getConfig();
      const response = await api.get('/api/technician/chat', config);
      return response.data;
    } catch (error) {
      log(`Failed to get chat list: ${error.message}`);
      throw error;
    }
  },

  // Get chat history with a client
  getTechnicianChatHistory: async (clientId) => {
    try {
      log(`Getting chat with client ID: ${clientId}`);
      const config = await getConfig();
      const response = await api.get(`/api/technician/chat/${clientId}`, config);
      return response.data;
    } catch (error) {
      log(`Failed to get chat: ${error.message}`);
      throw error;
    }
  },

  // Send message to client
  sendTechnicianMessage: async (clientId, message) => {
    try {
      log(`Sending message to client ID: ${clientId}`);
      const config = await getConfig();
      const response = await api.post(`/api/technician/chat/${clientId}`, { message }, config);
      return response.data;
    } catch (error) {
      log(`Failed to send message: ${error.message}`);
      throw error;
    }
  }
};

export default technicianService;