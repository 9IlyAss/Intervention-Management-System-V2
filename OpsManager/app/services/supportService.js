// services/supportService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    console.log('Error getting token for config:', error);
    return {};
  }
};

const supportService = {
  // Create a new support request
  createSupportRequest: async (data) => {
    try {
      const config = await getConfig();
      const response = await api.post('/api/support', data, config);
      return response.data;
    } catch (error) {
      console.error('Failed to create support request:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default supportService;