// app/services/interventionService.js
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

const interventionService = {
  // Get all interventions (admin/technician access)
  getAllInterventions: async () => {
    try {
      log('Getting all interventions...');
      const config = await getConfig();
      const response = await api.get('/api/interventions', config);
      return response.data;
    } catch (error) {
      log('Failed to get interventions:', error.message);
      throw error;
    }
  },

  // Get specific intervention details (admin/technician access)
  getInterventionById: async (interventionId) => {
    try {
      log(`Getting intervention with ID: ${interventionId}`);
      const config = await getConfig();
      const response = await api.get(`/api/interventions/${interventionId}`, config);
      return response.data;
    } catch (error) {
      log(`Failed to get intervention: ${error.message}`);
      throw error;
    }
  },

  // Get technician report
  getTechnicianReport: async (technicianId) => {
    try {
      log(`Getting report for technician ID: ${technicianId}`);
      const config = await getConfig();
      const response = await api.get(`/api/interventions/reports/technician/${technicianId}`, config);
      return response.data;
    } catch (error) {
      log(`Failed to get technician report: ${error.message}`);
      throw error;
    }
  },

  // Get client report
  getClientReport: async (clientId) => {
    try {
      log(`Getting report for client ID: ${clientId}`);
      const config = await getConfig();
      const response = await api.get(`/api/interventions/reports/client/${clientId}`, config);
      return response.data;
    } catch (error) {
      log(`Failed to get client report: ${error.message}`);
      throw error;
    }
  },

  // Future feature - Export interventions to CSV
  // Note: This is modified for React Native - it returns the data rather than downloading
  exportInterventionsToCsv: async () => {
    try {
      log('Exporting interventions to CSV...');
      const config = await getConfig();
      const response = await api.get('/api/interventions/reports/export/csv', {
        ...config,
        responseType: 'blob'
      });
      
      // In React Native, we can't download files directly to the browser
      // Instead, return the data for handling in the app
      return response.data;
    } catch (error) {
      log('Failed to export CSV:', error.message);
      throw error;
    }
  }
};

export default interventionService;