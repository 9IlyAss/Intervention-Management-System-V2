import api from './api'; // Assumes you have a central Axios instance


const feedbackService = {
  // Get all feedbacks (Admin only)
  async getAllFeedbacks() {
    try {
      console.log("📦 Fetching all feedbacks...");
      const response = await api.get('/api/feedbacks');
      console.log("✅ Feedbacks fetched:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching feedbacks:", error);
      throw error;
    }
  },
};
export default feedbackService;
