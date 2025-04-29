const mongoose = require('mongoose');

// Message Schema (embedded)
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

// ChatRoom Schema
const ChatRoomSchema = new mongoose.Schema({
  participants: {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  interventionId: {  // ⬅️ Not array
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intervention',
    required: true
  },
  messages: [MessageSchema]  // Array of embedded messages
}, { timestamps: true });

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);

module.exports = ChatRoom;
