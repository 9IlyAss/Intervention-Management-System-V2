//clientRoutes
const express = require('express');
const Intervention = require('../models/Intervention');
const Feedback = require('../models/Feedback');
const ChatRoom = require('../models/ChatRoom');
const Router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

// @route POST /api/client/submit
// @desc Submit a new intervention
// @access Private (Client) //Category
Router.post('/submit', protect, async (req, res) => {
    try {
        const { title,category, description, location, attachments } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        
        const newIntervention = new Intervention({
            title,
            category,
            description,
            clientId: req.user.id,
            status: 'Pending',
            location,
            attachmentsList : attachments || [],
        });

        await newIntervention.save();
        res.status(201).json(newIntervention);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/client/interventions?limit=2
// @desc Get interventions for a client, optionally limited
// @access Private (Client)
Router.get('/interventions', protect, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit); // optional query param
        let query = Intervention.find(
            { clientId: req.user.id },
            { title: 1, status: 1, _id: 0 }
        ).sort({ createdAt: -1 });

        if (!isNaN(limit)) {
            query = query.limit(limit);
        }

        const interventions = await query;
        res.json(interventions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/client/interventions/:id
// @desc Get specific intervention details
// @access Private (Client)
Router.get('/interventions/:id', protect, async (req, res) => {
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
Router.post('/feedback/:interventionId', protect, async (req, res) => {
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

// @route GET /api/client/chat
// @desc Get simplified list of chat rooms for client
// @access Private (client)
Router.get('/chat', protect, async (req, res) => {
    try {
        console.log(`Getting chat rooms for client ID: ${req.user.id}`);
        
        const chatRooms = await ChatRoom.find({ 'participants.clientId': req.user.id })
            .populate('participants.technicianId', 'name')
            .populate('interventionId', 'title')
            .sort({ updatedAt: -1 });

        console.log(`Found ${chatRooms.length} chat rooms`);
        
        // Extract only the necessary information
        const simplified = chatRooms.map(chat => ({
            chatRoomId: chat._id,
            clientName: chat.participants.technicianId ? chat.participants.technicianId.name : 'Unknown',
            interventionTitle: chat.interventionId ? chat.interventionId.title : 'General Chat'
        }));

        res.json(simplified);
    } catch (error) {
        console.error('Error in GET /chat route:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route GET /api/client/chat/:technicianId
// @desc Get full conversation for client with a technician
// @access Private (Client)
Router.get('/chat/:technicianId', protect, async (req, res) => {
    try {
        // Convert the string ID to MongoDB ObjectId
        let techId;
        try {
            techId = new ObjectId(req.params.technicianId);
        } catch (error) {
            console.error('Invalid ObjectId format:', error.message);
            return res.status(400).json({ error: 'Invalid technician ID format' });
        }

        console.log(`Looking for chat room with clientId: ${req.user.id}, technicianId: ${techId}`);
        
        const chatRoom = await ChatRoom.findOne({
            'participants.clientId': req.user.id,
            'participants.technicianId': techId
        })
        .populate('participants.technicianId', 'name')
        .populate('messages.senderId', 'name');

        if (!chatRoom) {
            console.log('Chat room not found - it should have been created when a technician was assigned');
            return res.status(404).json({ error: 'Chat room not found' });
        }

        const messages = chatRoom.messages.map(msg => ({
            senderName: msg.senderId.name,
            content: msg.content,
            sentAt: msg.createdAt
        }));

        res.status(200).json({
            technicianName: chatRoom.participants.technicianId.name,
            messages
        });
    } catch (error) {
        console.error('Error in chat/:technicianId route:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/client/chat/:technicianId
// @desc Send message to technician
// @access Private (Client)
Router.post('/chat/:technicianId', protect, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Convert the string ID to MongoDB ObjectId
        let techId;
        try {
            techId = new ObjectId(req.params.technicianId);
        } catch (error) {
            console.error('Invalid ObjectId format:', error.message);
            return res.status(400).json({ error: 'Invalid technician ID format' });
        }
        
        let chatRoom = await ChatRoom.findOne({
            'participants.clientId': req.user.id,
            'participants.technicianId': techId
        });

        if (!chatRoom) {
            console.log('Chat room not found for sending message - it should have been created when a technician was assigned');
            return res.status(404).json({ error: 'Chat room not found' });
        }

        // Add new message to the chat room
        chatRoom.messages.push({
            senderId: req.user.id,
            content: message.trim(),
            read: false
        });

        await chatRoom.save();
        
        res.status(201).json({ message: "Message sent!" });
    } catch (error) {
        console.error('Error in POST chat/:technicianId route:', error);
        res.status(500).json({ error: error.message });
    }
});

// NEW ROUTES FOR CHAT ROOM-CENTRIC OPERATIONS

// @route GET /api/client/chat-room/:chatRoomId
// @desc Get chat by room ID
// @access Private (Client)
Router.get('/chat-room/:chatRoomId', protect, async (req, res) => {
    try {
        // Convert the string ID to MongoDB ObjectId
        let roomId;
        try {
            roomId = new ObjectId(req.params.chatRoomId);
        } catch (error) {
            console.error('Invalid ObjectId format:', error.message);
            return res.status(400).json({ error: 'Invalid chat room ID format' });
        }

        console.log(`Looking for chat room with ID: ${roomId}`);
        
        // Find the chat room by ID and make sure it belongs to the current user
        const chatRoom = await ChatRoom.findOne({
            _id: roomId,
            'participants.clientId': req.user.id
        })
        .populate('participants.technicianId', 'name')
        .populate('messages.senderId', 'name');

        if (!chatRoom) {
            console.log('Chat room not found or not authorized');
            return res.status(404).json({ error: 'Chat room not found or you are not authorized to access it' });
        }

        const messages = chatRoom.messages.map(msg => ({
            senderName: msg.senderId.name,
            content: msg.content,
            sentAt: msg.createdAt
        }));

        res.status(200).json({
            chatRoomId: chatRoom._id,
            technicianName: chatRoom.participants.technicianId.name,
            messages
        });
    } catch (error) {
        console.error('Error in chat-room/:chatRoomId route:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route POST /api/client/chat-room/:chatRoomId/message
// @desc Send message to a chat room
// @access Private (Client)
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
        
        // Find the chat room and verify ownership
        let chatRoom = await ChatRoom.findOne({
            _id: roomId,
            'participants.clientId': req.user.id
        });

        if (!chatRoom) {
            console.log('Chat room not found or not authorized for message sending');
            return res.status(404).json({ error: 'Chat room not found or you are not authorized to access it' });
        }

        // Add the message
        chatRoom.messages.push({
            senderId: req.user.id,
            content: message.trim(),
            read: false
        });

        await chatRoom.save();
        
        res.status(201).json({ message: "Message sent!" });
    } catch (error) {
        console.error('Error in POST chat-room/:chatRoomId/message route:', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = Router;