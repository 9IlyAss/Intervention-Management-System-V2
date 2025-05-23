// routes/supportRoutes.js
const express = require('express');
const Router = express.Router();
const SupportRequest = require('../models/SupportRequest');
const ChatRoom = require('../../ChatRoom'); // Assuming you have a ChatRoom model
const { protect ,admin} = require('../middleware/authMiddleware');

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
      userRole: req.user.role  // Add the user's role
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
// @desc Create a chat room for a support request
// @access Private (Admin)
Router.post('/admin/respond/:requestId', protect, admin, async (req, res) => {
  try {
    // Find the support request
    const supportRequest = await SupportRequest.findById(req.params.requestId)
      .populate('userId', '_id name email');
    
    if (!supportRequest) {
      return res.status(404).json({ error: 'Support request not found' });
    }
    
    // Check if a chat room already exists for this support request
    let chatRoom = await ChatRoom.findOne({
      'supportRequestId': supportRequest._id
    });
    
    // If no chat room exists, create one
    if (!chatRoom) {
      chatRoom = new ChatRoom({
        participants: {
          clientId: supportRequest.userId._id,
          adminId: req.user.id
        },
        supportRequestId: supportRequest._id,
        messages: [{
          senderId: req.user.id,
          content: `RE: ${supportRequest.subject}\n\nHow can I help you with this issue?`,
          read: false
        }]
      });
      
      await chatRoom.save();
      
      // Update support request status
      supportRequest.status = 'in-progress';
      await supportRequest.save();
    }
    
    res.status(201).json({ 
      message: 'Chat room created for support request',
      chatRoomId: chatRoom._id
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// @route PATCH /api/support/admin/:requestId
// @desc Update support request status
// @access Private (Admin)
Router.patch('/admin/:requestId', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['new', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    // Update the support request
    const supportRequest = await SupportRequest.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    );
    
    if (!supportRequest) {
      return res.status(404).json({ error: 'Support request not found' });
    }
    
    res.json({ 
      message: 'Support request updated',
      supportRequest
    });
  } catch (error) {
    console.error('Error updating support request:', error);
    res.status(500).json({ error: 'Failed to update support request' });
  }
});

module.exports = Router;