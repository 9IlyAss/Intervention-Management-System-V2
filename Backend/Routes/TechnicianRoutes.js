const express = require('express');
const Intervention = require('../models/Intervention');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// @route GET /api/technician/interventions
// @desc Get all interventions assigned to technician
// @access Private (Technician)
Router.get('/interventions', protect, async (req, res) => {
    try {
        const interventions = await Intervention.find({ technicianId: req.user.id })
            .populate('clientId', 'name email phone')
            .sort({ createdAt: -1 });
            
        res.json(interventions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route PATCH /api/technician/interventions/:id/status
// @desc Update intervention status (requires evidence for Completed/Problematic)
// @access Private (Technician)
Router.patch('/interventions/:id/status', protect, async (req, res) => {
    try {
        const { status, attachments } = req.body;
        const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
        
        // Validate status
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Check evidence requirement
        const requiresEvidence = ['Completed', 'Cancelled'].includes(status);
        if (requiresEvidence && (!attachments || !attachments.length)) {
            return res.status(400).json({ 
                error: 'Evidence attachments are required for Completed/Cancelled status' 
            });
        }

        // Prepare update object
        const update = { status };
        if (requiresEvidence) {
            update.$push = { attachmentsList: { $each: attachments } };
        }

        // Execute update
        const intervention = await Intervention.findOneAndUpdate(
            { 
                _id: req.params.id, 
                technicianId: req.user.id 
            },
            update,
            { new: true }
        );

        if (!intervention) {
            return res.status(404).json({ error: 'Intervention not found' });
        }

        res.json(intervention);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/technician/chat/:clientId
// @desc Send message to client
// @access Private (Technician)
Router.post('/chat/:clientId', protect, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        let chatRoom = await ChatRoom.findOne({
            clientId: req.params.clientId,
            technicianId: req.user.id
        });

        if (!chatRoom) {
            chatRoom = new ChatRoom({ 
                clientId: req.params.clientId, 
                technicianId: req.user.id 
            });
            await chatRoom.save();
        }

        const newMessage = new Message({
            chatRoomId: chatRoom._id,
            senderId: req.user.id,
            content: message.trim(),
        });

        await newMessage.save();
        
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/technician/chats
// @desc Get all chat rooms for technician
// @access Private (Technician)
Router.get('/chats', protect, async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find({ technicianId: req.user.id })
            .populate('clientId', 'name email phone')
            .sort({ updatedAt: -1 });
            
        res.json(chatRooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/technician/chats/:clientId/messages
// @desc Get chat history with specific client (renamed endpoint)
// @access Private (Technician)
Router.get('/chats/:clientId/messages', protect, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findOne({
            clientId: req.params.clientId,
            technicianId: req.user.id
        }).populate('clientId', 'name email phone');

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }

        const messages = await Message.find({ chatRoomId: chatRoom._id })
            .sort({ createdAt: 1 })
            .limit(50);
            
        res.json({
            chatRoom,
            messages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = Router;