// routes/supportRoutes.js
const express = require('express');
const Router = express.Router();
const SupportRequest = require('../models/SupportRequest');
const { protect ,admin} = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

// @route POST /api/support
// @desc Create a new support request
// @access Private
// In supportRoutes.js, update the POST route
Router.post('/', protect, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    // Validate the request body
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    
    // Create a new support request with user role
    const supportRequest = new SupportRequest({
      userId: req.user.id,
      subject,
      message,
    });
    
    // Save the support request
    await supportRequest.save();
    
    res.status(201).json({ 
      message: 'Support request created successfully',
      requestId: supportRequest._id
    });
  } catch (error) {
    console.error('Error creating support request:', error);
    res.status(500).json({ error: 'Failed to create support request' });
  }
});


// @route GET /api/support/admin
// @desc Get all support requests (admin only)
// @access Private (Admin)
Router.get('/admin', protect, admin, async (req, res) => {
  try {
    // Get all support requests and populate with user information
    const supportRequests = await SupportRequest.find()
      .populate('userId', 'name email profileImage role')
      .sort({ createdAt: -1 });
    
    res.json(supportRequests);
  } catch (error) {
    console.error('Error fetching support requests:', error);
    res.status(500).json({ error: 'Failed to retrieve support requests' });
  }
});


// @route POST /api/support/admin/respond/:requestId
// @desc Send email response to user and mark request as resolved
// @access Private (Admin)
Router.post('/admin/respond/:requestId', protect, admin, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Response message is required' });
    }

    const supportRequest = await SupportRequest.findById(req.params.requestId)
      .populate('userId', 'name email');

    if (!supportRequest) {
      return res.status(404).json({ error: 'Support request not found' });
    }

    // Send response email
    await sendEmail(
      supportRequest.userId.email,
      `Response to Your Support Request: ${supportRequest.subject}`,
      `
        <p>Hello ${supportRequest.userId.name},</p>
        <p>Our support team has responded to your request:</p>
        <p><strong>Subject:</strong> ${supportRequest.subject}</p>
        <p><strong>Response:</strong> ${message}</p>
        <p>Best regards,<br>Support Team</p>
      `
    );

    supportRequest.response = {
      from: req.user.name,
      message,
      respondedAt: new Date()
    };
    supportRequest.status = 'resolved'; // Always set to resolved when responding

    await supportRequest.save();

    res.status(200).json({ 
      message: 'Response sent and request marked as resolved',
      supportRequest
    });
  } catch (error) {
    console.error('Error responding to support request:', error);
    res.status(500).json({ error: 'Failed to send response' });
  }
});

module.exports = Router;