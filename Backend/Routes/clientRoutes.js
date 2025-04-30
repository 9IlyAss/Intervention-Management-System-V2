const express = require('express');
const Intervention = require('../models/Intervention');
const Feedback = require('../models/Feedback');
const ChatRoom = require('../models/ChatRoom');
const Router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// @route POST /api/client/submit
// @desc Submit a new intervention
// @access Private (Client)
Router.post('/submit', protect, async (req, res) => {
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
            attachmentsList : attachments || [],
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
Router.get('/interventions', protect, async (req, res) => {
    try {
        const interventions = await Intervention.find({ clientId: req.user.id },{title : 1 ,status : 1,_id:0 })
            .sort({ createdAt: -1 });
            
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


//& Test chat
// @route POST /api/client/chat/:technicianId
// @desc Send message to technician
// @access Private (Client)
Router.post('/chat/:technicianId', protect, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        let chatRoom = await ChatRoom.findOne({
            'participants.clientId': req.user.id,
            'participants.technicianId': req.params.technicianId
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


// @route GET /api/client/chat/:technicianId
// @desc Get full conversation for client with a technician
// @access Private (Client)
Router.get('/chat/:technicianId', protect, async (req, res) => {
    try {
        const chatRoom = await ChatRoom.findOne({
            'participants.clientId': req.user.id,
            'participants.technicianId': req.params.technicianId
        })
        .populate('participants.technicianId', 'name')        // nom du technicien
        .populate('messages.senderId', 'name');               // nom de l'expéditeur

        if (!chatRoom) {
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
        res.status(500).json({ error: error.message });
    }
});


// @route GET /api/client/chat
// @desc Get simplified list of chat rooms for client
// @access Private (client)
Router.get('/chat', protect, async (req, res) => {
    try {
        const chatRooms = await ChatRoom.find({ 'participants.clientId': req.user.id })
            .populate('participants.technicianId', 'name')
            .populate('interventionId', 'title')
            .sort({ updatedAt: -1 });

        // On extrait uniquement les infos nécessaires
        const simplified = chatRooms.map(chat => ({
            chatRoomId: chat._id,
            clientName: chat.participants.technicianId.name,
            interventionTitle: chat.interventionId.title
        }));

        res.json(simplified);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = Router;
