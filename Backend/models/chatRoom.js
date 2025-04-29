// models/ChatRoom.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const ChatRoomSchema = new mongoose.Schema({
  participants : {
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
  },
  interventionId :  [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intervention'
  }],
  messages: [MessageSchema] // Embedded messages
}, { timestamps: true });

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);
module.exports = ChatRoom;