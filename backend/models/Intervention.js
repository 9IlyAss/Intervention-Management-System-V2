const mongoose = require('mongoose');

const InterventionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    enum: ['IT Services', 'Surveillance', 'Telephony', 'Printers', 'Software', 'Office Supplies', 'Maintenance', 'Alarms', 'Sound Systems'],
  },
  location: {
    type: String,
    trim: true // Removes extra whitespace
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },

  attachmentsList: [String],
  evidence: {
    notes: {
      type: String,
      default: ''
    },
    photos: [String]
  }


}, { timestamps: true });

// Update the updatedAt field on save
InterventionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Intervention = mongoose.model('Intervention', InterventionSchema);

module.exports = Intervention;