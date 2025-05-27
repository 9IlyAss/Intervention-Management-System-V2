const express = require('express');
const Router = express.Router();
const Feedback = require('../models/Feedback');
const { protect, admin } = require('../middleware/authMiddleware');

// @route GET /api/feedbacks
// @desc Get all feedbacks with user and intervention info
// @access Private (Admin only)
Router.get('/', protect, admin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('clientId', 'name email profileImage') // Get client name and email
      .populate('interventionId', 'title category') // Get intervention title and category
      .sort({ date: -1 }); // Recent first

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('❌ Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Failed to retrieve feedbacks' });
  }
});

module.exports = Router;
