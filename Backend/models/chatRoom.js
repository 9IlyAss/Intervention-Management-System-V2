// models/ChatRoom.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatRoomSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messagesList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ChatRoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Message = mongoose.model('Message', MessageSchema);
const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);

module.exports = { ChatRoom, Message };