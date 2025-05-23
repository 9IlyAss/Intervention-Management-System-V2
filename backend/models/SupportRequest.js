// models/SupportRequest.js
const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  userRole: {  // Added user role field
    type: String,
    enum: ['client', 'technician', 'administrator'],
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const SupportRequest = mongoose.model('SupportRequest', SupportRequestSchema);

module.exports = SupportRequest;