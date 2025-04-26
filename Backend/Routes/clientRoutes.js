const express = require('express');
const Intervention = require('../models/Intervention');
const Feedback = require('../models/Feedback');
const ChatRoom = require('../models/ChatRoom');
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// @route POST /api/client/submit
// @desc Submit a new intervention
// @access Private (Client)
router.post('/submit', protect, async (req, res) => {
    try {
        const { title, description, location, attachments } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        const newIntervention = new Intervention({
            title,
            description,
            clientId: req.user.id,
            status: 'Pending',
            location,
            attachments: attachments || [],
        });

        await newIntervention.save();
        res.status(201).json(newIntervention);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/client/interventions
// @desc Get all interventions for a client
// @access Private (Client)
router.get('/interventions', protect, async (req, res) => {
    try {
        const interventions = await Intervention.find({ clientId: req.user.id })
            .populate('technicianId', 'name email phone')
            .sort({ createdAt: -1 });
            
        res.json(interventions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/client/interventions/:id
// @desc Get specific intervention details
// @access Private (Client)
router.get('/interventions/:id', protect, async (req, res) => {
    try {
        const intervention = await Intervention.findOne({
            _id: req.params.id,
            clientId: req.user.id
        }).populate('technicianId', 'name email phone');
        
        if (!intervention) {
            return res.status(404).json({ error: 'Intervention not found' });
        }
        
        res.json(intervention);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/client/feedback/:interventionId
// @desc Submit feedback for an intervention
// @access Private (Client)
router.post('/feedback/:interventionId', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valid rating (1-5) is required' });
        }

        const intervention = await Intervention.findOne({
            _id: req.params.interventionId,
            clientId: req.user.id,
            status: 'Completed'
        });

        if (!intervention) {
            return res.status(404).json({ 
                error: 'Intervention not found, not authorized, or not completed' 
            });
        }

        const newFeedback = new Feedback({
            rating,
            comment: comment || '',
            interventionId: intervention._id,
            clientId: req.user.id,
        });

        await newFeedback.save();
        
        intervention.feedback = newFeedback._id;
        await intervention.save();

        res.status(201).json(newFeedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/client/chat/:technicianId
// @desc Send message to technician
// @access Private (Client)
router.post('/chat/:technicianId', protect, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        let chatRoom = await ChatRoom.findOne({
            clientId: req.user.id,
            technicianId: req.params.technicianId
        });

        if (!chatRoom) {
            chatRoom = new ChatRoom({ 
                clientId: req.user.id, 
                technicianId: req.params.technicianId 
            });
            await chatRoom.save();
        }

        const newMessage = new Message({
            chatRoomId: chatRoom._id,
            senderId: req.user.id,
            content: message.trim(),
        });

        await newMessage.save();
        
        // Emit real-time event if using Socket.io
        // io.to(chatRoom._id).emit('newMessage', newMessage);
        
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/client/chat/:technicianId
// @desc Get chat history with technician
// @access Private (Client)
router.get('/chat/:technicianId', protect, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findOne({
            clientId: req.user.id,
            technicianId: req.params.technicianId
        });

        if (!chatRoom) {
            return res.json([]); // Return empty array if no chat exists
        }

        const messages = await Message.find({ chatRoomId: chatRoom._id })
            .sort({ createdAt: 1 })
            .limit(50);
            
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;