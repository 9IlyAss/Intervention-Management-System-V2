const mongoose = require('mongoose');
const User = require('./User');

const TechnicianSchema = new mongoose.Schema({
  assignedInterventionsList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intervention'
  }],
  skillsList: [{
    type: String
  }],
  status:{
    type :String,
    enum: ['Available', 'Unavailable'],
  },
  avgRating: {
  type: Number,
  default: 0
},
});

const Technician = User.discriminator('technician', TechnicianSchema);

module.exports = Technician;