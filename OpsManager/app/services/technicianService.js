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
  getTechnicianInterventions: async (limit) => {
    try {
      const endpoint = limit ? `/api/technician/interventions?limit=${limit}` : '/api/technician/interventions';
      log('Getting technician interventions...', endpoint);
      const config = await getConfig();
      const response = await api.get(endpoint, config);
      log(`Retrieved ${response.data.length} interventions`);
      return response.data;
    } catch (error) {
      log('Failed to get interventions:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get specific intervention details
  getInterventionDetails: async (interventionId) => {
    try {
      log(`Getting details for intervention ID: ${interventionId}`);
      const config = await getConfig();
      const response = await api.get(`/api/technician/interventions/${interventionId}`, config);
      return response.data;
    } catch (error) {
      log(`Failed to get intervention details: ${error.response?.data || error.message}`);
      throw error;
    }
  },

  // Update intervention status
  updateInterventionStatus: async (interventionId, status, attachments = []) => {
    try {
      log(`Updating status for intervention ID: ${interventionId} to ${status}`);
      const config = await getConfig();
      const data = { status, attachments };
      const response = await api.patch(`/api/technician/interventions/${interventionId}/status`, data, config);
      return response.data;
    } catch (error) {
      log(`Failed to update intervention status: ${error.response?.data || error.message}`);
      throw error;
    }
  },
 
  // Get chat list for technician
  getChatRooms: async () => {
    try {
      log('Getting technician chat rooms...');
      const config = await getConfig();
      const response = await api.get('/api/technician/chat', config);
      log(`Retrieved ${response.data.length} chat rooms`);
      return response.data;
    } catch (error) {
      log(`Failed to get chat list: ${error.response?.data || error.message}`);
      throw error;
    }
  },

  // Get chat history with a client
  getChatByClientId: async (clientId) => {
    try {
      log(`Getting chat with client ID: ${clientId}`);
      const config = await getConfig();
      const response = await api.get(`/api/technician/chat/${clientId}`, config);
      return response.data;
    } catch (error) {
      log(`Failed to get chat: ${error.response?.data || error.message}`);
      throw error;
    }
  },

  // Get chat history by chat room ID
  getChatByRoomId: async (chatRoomId) => {
    try {
        log(`Getting chat room ID: ${chatRoomId}`);
        const config = await getConfig();
        const response = await api.get(`/api/technician/chat-room/${chatRoomId}`, config);
        return response.data;
    } catch (error) {
        log(`Failed to get chat room: ${error.response?.data || error.message}`);
        throw error;
    }
},

  // Send message to client by client ID
  sendMessageToClient: async (clientId, message) => {
    try {
      log(`Sending message to client ID: ${clientId}`);
      const config = await getConfig();
      const response = await api.post(`/api/technician/chat/${clientId}`, { message }, config);
      return response.data;
    } catch (error) {
      log(`Failed to send message: ${error.response?.data || error.message}`);
      throw error;
    }
  },

  // Send message to chat room by chat room ID
  sendMessageToChatRoom: async (chatRoomId, message) => {
    try {
      log(`Sending message to chat room ID: ${chatRoomId}`);
      const config = await getConfig();
      const response = await api.post(`/api/technician/chat-room/${chatRoomId}/message`, { message }, config);
      return response.data;
    } catch (error) {
      log(`Failed to send message to chat room: ${error.response?.data || error.message}`);
      throw error;
    }
  },

  // Update technician status (available/unavailable)
  updateTechnicianStatus: async (isAvailable) => {
    try {
      log(`Updating technician status: ${isAvailable ? 'Available' : 'Unavailable'}`);
      const config = await getConfig();
      // Assuming there's an endpoint for this - you may need to create one
      const response = await api.patch('/api/technician/status', { isAvailable }, config);
      return response.data;
    } catch (error) {
      log(`Failed to update technician status: ${error.response?.data || error.message}`);
      throw error;
    }
  },

  // Get technician status
  getTechnicianStatus: async () => {
    try {
      log('Getting technician status...');
      const config = await getConfig();
      // Assuming there's an endpoint for this - you may need to create one
      const response = await api.get('/api/technician/status', config);
      return response.data;
    } catch (error) {
      log(`Failed to get technician status: ${error.response?.data || error.message}`);
      // Return a default status in case the API doesn't exist yet
      return { isAvailable: true };
    }
  }
};

export default technicianService;