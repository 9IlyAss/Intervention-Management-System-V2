// app/services/clientService.js
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

// Set up config with token - no need to manually set this as api.js already handles tokens
// But keeping it for extra reliability
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

const clientService = {
  // Submit a new intervention
  // POST /api/client/submit
  // Requires: title, category, description, location, attachments (optional)
  submitIntervention: async (interventionData) => {
    try {
      log('Submitting new intervention...', interventionData);
      
      // Validate required fields
      if (!interventionData.title || !interventionData.description) {
        throw new Error('Title and description are required');
      }
      
      const config = await getConfig();
      const response = await api.post('/api/client/submit', interventionData, config);
      log('Intervention submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      log('Failed to submit intervention:', error.message);
      throw error;
    }
  },

  // Get interventions for the client
  // GET /api/client/interventions
  // Optional query param: limit (number of interventions to return)
  getClientInterventions: async (limit = null) => {
    try {
      log('Getting client interventions...');
      const config = await getConfig();
      
      // Add limit parameter if provided
      let url = '/api/client/interventions';
      if (limit && !isNaN(parseInt(limit))) {
        url += `?limit=${parseInt(limit)}`;
      }
      
      const response = await api.get(url, config);
      log(`Retrieved ${response.data.length} interventions`);
      return response.data;
    } catch (error) {
      log('Failed to get interventions:', error.message);
      throw error;
    }
  },

  // Get specific intervention details
  // GET /api/client/interventions/:id
  getInterventionDetails: async (interventionId) => {
    try {
      log(`Getting intervention details for ID: ${interventionId}`);
      
      if (!interventionId) {
        throw new Error('Intervention ID is required');
      }
      
      const config = await getConfig();
      const response = await api.get(`/api/client/interventions/${interventionId}`, config);
      log('Retrieved intervention details');
      return response.data;
    } catch (error) {
      log(`Failed to get intervention details: ${error.message}`);
      throw error;
    }
  },

  // Submit feedback for an intervention
  // POST /api/client/feedback/:interventionId
  // Requires: rating (1-5), comment (optional)
  submitFeedback: async (interventionId, feedbackData) => {
    try {
      log(`Submitting feedback for intervention ID: ${interventionId}`);
      
      // Validate required fields
      if (!interventionId) {
        throw new Error('Intervention ID is required');
      }
      
      if (!feedbackData.rating || feedbackData.rating < 1 || feedbackData.rating > 5) {
        throw new Error('Valid rating (1-5) is required');
      }
      
      const config = await getConfig();
      const response = await api.post(
        `/api/client/feedback/${interventionId}`, 
        feedbackData,
        config
      );
      
      log('Feedback submitted successfully');
      return response.data;
    } catch (error) {
      log(`Failed to submit feedback: ${error.message}`);
      throw error;
    }
  },

// Get chat list for client
  // GET /api/client/chat
  getChatRooms: async () => {
    try {
      log('Getting client chat rooms...');
      const config = await getConfig();
      
      // Try to get chat rooms from API
      const response = await api.get('/api/client/chat', config);
      log(`Retrieved ${response.data.length} chat rooms`);
      return response.data;
    } catch (error) {
      log(`Failed to get chat rooms: ${error.message}`);
      
      // If the error is due to the endpoint not being available (404)
      // Return an empty array instead of throwing the error
      if (error.response && error.response.status === 404) {
        log('Chat endpoint not available. Returning empty array.');
        return [];
      }
      
      // For other errors, rethrow
      throw error;
    }
  },

  // Get chat history with a technician (keep for backwards compatibility)
  // GET /api/client/chat/:technicianId
  getChatWithTechnician: async (technicianId) => {
    try {
      log(`Getting chat with technician ID: ${technicianId}`);
      
      if (!technicianId) {
        throw new Error('Technician ID is required');
      }
      
      const config = await getConfig();
      const response = await api.get(`/api/client/chat/${technicianId}`, config);
      log(`Retrieved chat with ${response.data.messages?.length || 0} messages`);
      return response.data;
    } catch (error) {
      // Log detailed error information
      log(`Failed to get chat: ${error.message}`);
      
      if (error.response) {
        log(`Status: ${error.response.status}`);
        log(`Error data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error; // Re-throw the error to be handled by the component
    }
  },

  // Get chat by room ID - NEW METHOD
  // GET /api/client/chat-room/:chatRoomId
  getChatByRoomId: async (chatRoomId) => {
    try {
      log(`Getting chat for room ID: ${chatRoomId}`);
      
      if (!chatRoomId) {
        throw new Error('Chat room ID is required');
      }
      
      const config = await getConfig();
      const response = await api.get(`/api/client/chat-room/${chatRoomId}`, config);
      log(`Retrieved chat with ${response.data.messages?.length || 0} messages`);
      return response.data;
    } catch (error) {
      // Log detailed error information
      log(`Failed to get chat: ${error.message}`);
      
      if (error.response) {
        log(`Status: ${error.response.status}`);
        log(`Error data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error; // Re-throw the error to be handled by the component
    }
  },

  // Send message to technician (keep for backwards compatibility)
  // POST /api/client/chat/:technicianId
  // Requires: message
  sendMessageToTechnician: async (technicianId, message) => {
    try {
      log(`Sending message to technician ID: ${technicianId}`);
      
      // Validate required fields
      if (!technicianId) {
        throw new Error('Technician ID is required');
      }
      
      if (!message || message.trim() === '') {
        throw new Error('Message cannot be empty');
      }
      
      const config = await getConfig();
      const response = await api.post(
        `/api/client/chat/${technicianId}`,
        { message },
        config
      );
      
      log('Message sent successfully');
      return response.data;
    } catch (error) {
      // Log detailed error information
      log(`Failed to send message: ${error.message}`);
      
      if (error.response) {
        log(`Status: ${error.response.status}`);
        log(`Error data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error; // Re-throw the error to be handled by the component
    }
  },

  // Send message to a chat room - NEW METHOD
  // POST /api/client/chat-room/:chatRoomId/message
  // Requires: message
  sendMessageToChatRoom: async (chatRoomId, message) => {
    try {
      log(`Sending message to chat room ID: ${chatRoomId}`);
      
      // Validate required fields
      if (!chatRoomId) {
        throw new Error('Chat room ID is required');
      }
      
      if (!message || message.trim() === '') {
        throw new Error('Message cannot be empty');
      }
      
      const config = await getConfig();
      const response = await api.post(
        `/api/client/chat-room/${chatRoomId}/message`,
        { message },
        config
      );
      
      log('Message sent successfully');
      return response.data;
    } catch (error) {
      // Log detailed error information
      log(`Failed to send message: ${error.message}`);
      
      if (error.response) {
        log(`Status: ${error.response.status}`);
        log(`Error data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error; // Re-throw the error to be handled by the component
    }
  }
};
export default clientService;