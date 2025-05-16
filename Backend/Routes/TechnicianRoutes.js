//technicianRoutes
const express = require('express');
const Intervention = require('../models/Intervention');
const ChatRoom = require('../models/ChatRoom');
const Router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// @route GET /api/technician/interventions?limit=2
// @desc Get all interventions assigned to technician, optionally limited
// @access Private (Technician)
Router.get('/interventions', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // optional query param
        
        let query = Intervention.find({ technicianId: req.user.id })
            .populate('clientId', 'name email phone profileImage') // Add client details
            .sort({ createdAt: -1 });
            
        if (!isNaN(limit)) {
            query = query.limit(limit);
        }
        
        const interventions = await query;
        res.json(interventions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// @route GET /api/technician/interventions/:id
// @desc Get specific intervention details
// @access Private (Technician)
Router.get('/interventions/:id', protect, async (req, res) => {
    try {
        const intervention = await Intervention.findOne({
            _id: req.params.id,
            technicianId: req.user.id
        }).populate('clientId', 'name email phone profileImage');
        
        if (!intervention) {
            return res.status(404).json({ error: 'Intervention not found' });
        }
        
        // Also fetch feedback information if it exists
        if (intervention.feedback) {
            await intervention.populate('feedback');
        }
        
        res.json(intervention);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route PATCH /api/technician/interventions/:id/status
// @desc Update intervention status (requires evidence for Completed/Cancelled)
// @access Private (Technician)
Router.patch('/interventions/:id/status', protect, async (req, res) => {
    try {
        const { status, evidence } = req.body;
        const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const requiresEvidence = ['Completed', 'Cancelled'].includes(status);

        if (requiresEvidence && (!evidence  || !evidence.photos || !evidence.photos.length)) {
            return res.status(400).json({ 
                error: 'Evidence (photos) are required for Completed or Cancelled status' 
            });
        }

        const update = { status };

        if (requiresEvidence) {
            update.evidence = {
                notes: evidence.notes,
                photos: evidence.photos
            };
        }

        const intervention = await Intervention.findOneAndUpdate(
            { _id: req.params.id, technicianId: req.user.id },
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

// @route GET /api/technician/chat
// @desc Get simplified list of chat rooms for technician
// @access Private (Technician)
Router.get('/chat', protect, async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find({ 'participants.technicianId': req.user.id })
            .populate('participants.clientId', 'name profileImage')
            .populate('interventionId', 'title')
            .sort({ updatedAt: -1 });

        // Extract only the necessary information, including profile images
        const simplified = chatRooms.map(chat => ({
            chatRoomId: chat._id,
            clientId: chat.participants.clientId._id,
            clientName: chat.participants.clientId.name,
            clientProfileImage: chat.participants.clientId.profileImage,
            interventionId: chat.interventionId ? chat.interventionId._id : null,
            interventionTitle: chat.interventionId ? chat.interventionId.title : 'General Chat',
            updatedAt: chat.updatedAt,
            unreadCount: chat.messages.filter(msg => 
                !msg.read && msg.senderId.toString() !== req.user.id
            ).length
        }));

        res.json(simplified);
    } catch (error) {
        console.error('Error in GET /chat route:', error);
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
        .populate('participants.clientId', 'name profileImage')        // client info with profile image
        .populate('messages.senderId', 'name profileImage');           // sender info with profile image
        
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        
        // Mark messages as read
        chatRoom.messages.forEach(msg => {
            if (msg.senderId._id.toString() !== req.user.id) {
                msg.read = true;
            }
        });
        await chatRoom.save();
        
        const messages = chatRoom.messages.map(msg => ({
            senderId: msg.senderId._id,
            senderName: msg.senderId.name,
            senderProfileImage: msg.senderId.profileImage,
            content: msg.content,
            sentAt: msg.createdAt,
            read: msg.read
        }));
        
        res.status(200).json({
            clientId: chatRoom.participants.clientId._id,
            clientName: chatRoom.participants.clientId.name,
            clientProfileImage: chatRoom.participants.clientId.profileImage,
            interventionId: chatRoom.interventionId,
            messages
        });

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

        if (!chatRoom) {
            return res.status(400).json({ error: 'No chat room found' });
        }

        chatRoom.messages.push({
            senderId: req.user.id,
            content: message.trim(),
            read: false
        });

        // Update the chatRoom's updatedAt timestamp
        chatRoom.updatedAt = Date.now();
        await chatRoom.save();
        
        res.status(201).json({ message: "Message sent!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/technician/chat-room/:chatRoomId
// @desc Get chat by room ID
// @access Private (Technician)
Router.get('/chat-room/:chatRoomId', protect, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findOne({
            _id: req.params.chatRoomId,
            'participants.technicianId': req.user.id
        })
        .populate('participants.clientId', 'name profileImage')
        .populate('messages.senderId', 'name profileImage');
        console.log("slllm", req.user.id,req.params.chatRoomId)
        if (!chatRoom) {
            return res.status(404).json({ 
                error: 'Chat room not found or you are not authorized to access it' 
            });
        }

        // Mark messages as read
        chatRoom.messages.forEach(msg => {
            if (msg.senderId._id.toString() !== req.user.id) {
                msg.read = true;
            }
        });
        await chatRoom.save();

        res.status(200).json({
            chatRoomId: chatRoom._id,
            clientId: chatRoom.participants.clientId._id,
            clientName: chatRoom.participants.clientId.name,
            clientImage: chatRoom.participants.clientId.profileImage,
            messages: chatRoom.messages.map(msg => ({
                senderId: msg.senderId._id,
                senderName: msg.senderId.name,
                senderImage: msg.senderId.profileImage,
                content: msg.content,
                sentAt: msg.createdAt,
                read: msg.read
            }))
        });
    } catch (error) {
        console.error('Error in GET /chat-room/:chatRoomId route:', error);
        res.status(500).json({ error: error.message });
    }
});
// @route POST /api/technician/chat-room/:chatRoomId/message
// @desc Send message to a chat room
// @access Private (Technician)
Router.post('/chat-room/:chatRoomId/message', protect, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Convert the string ID to MongoDB ObjectId
        let roomId;
        try {
            roomId = new ObjectId(req.params.chatRoomId);
        } catch (error) {
            console.error('Invalid ObjectId format:', error.message);
            return res.status(400).json({ error: 'Invalid chat room ID format' });
        }
        
        // Find the chat room and verify access
        let chatRoom = await ChatRoom.findOne({
            _id: roomId,
            'participants.technicianId': req.user.id
        });

        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found or you are not authorized to access it' });
        }

        // Add the message
        chatRoom.messages.push({
            senderId: req.user.id,
            content: message.trim(),
            read: false
        });

        // Update the chatRoom's updatedAt timestamp
        chatRoom.updatedAt = Date.now();
        await chatRoom.save();
        
        res.status(201).json({ message: "Message sent!" });
    } catch (error) {
        console.error('Error in POST chat-room/:chatRoomId/message route:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = Router;