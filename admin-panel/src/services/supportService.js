import api from './api';

export const supportService = {
  // Admin: Get all support requests
  getAllSupportRequests: async () => {
    try {
      const response = await api.get('/api/support/admin');
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('Error fetching support requests:', errorMsg);
      throw new Error(errorMsg); // Throw a proper Error object
    }
  },
  
  // Admin: Respond to support request
  respondToRequest: async (requestId, message) => {
    try {
      const response = await api.post(
        `/api/support/admin/respond/${requestId}`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true // If using cookies/sessions
        }
      );
      return response.data;
    } catch (error) {
      // Extract meaningful error message
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      'Failed to send response';
      
      console.error('Error responding to request:', errorMsg);
      throw new Error(errorMsg); // Throw a proper Error object
    }
  },

  // Format date for display
  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  }
};

export default supportService;