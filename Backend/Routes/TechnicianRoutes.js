const express = require('express');
const Intervention = require('../models/Intervention');
const ChatRoom = require('../models/ChatRoom');
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
            'participants.clientId': req.params.clientId,
            'participants.technicianId': req.user.id
        });

        if (!chatRoom) 
            return res.status(400).json({ error: 'No chatRoom founded' });

        chatRoom.messages.push({
            senderId: req.user.id,
            content: message.trim()
        });

        await chatRoom.save();
        
        res.status(201).json({message : "Message send !"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/technician/chat/:clientId
// @desc Get chat history with specific client
// @access Private (Technician)
Router.get('/chat/:clientId', protect, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findOne({
            'participants.clientId': req.params.clientId,
            'participants.technicianId': req.user.id
        })
        .populate('participants.clientId', 'name')        // nom client
        .populate('messages.senderId', 'name');           // nom expéditeur
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        const messages = chatRoom.messages.map(msg => ({
            senderName: msg.senderId.name,
            content: msg.content,
            sentAt: msg.createdAt
        }));
        res.status(200).json({
            clientName: chatRoom.participants.clientId.name,
            messages
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/technician/chat
// @desc Get simplified list of chat rooms for technician
// @access Private (Technician)
Router.get('/chat', protect, async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find({ 'participants.technicianId': req.user.id })
            .populate('participants.clientId', 'name')
            .populate('interventionId', 'title')
            .sort({ updatedAt: -1 });

        // On extrait uniquement les infos nécessaires
        const simplified = chatRooms.map(chat => ({
            chatRoomId: chat._id,
            clientName: chat.participants.clientId.name,
            interventionTitle: chat.interventionId.title
        }));

        res.json(simplified);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = Router;
