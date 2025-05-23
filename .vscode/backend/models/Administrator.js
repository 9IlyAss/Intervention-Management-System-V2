const mongoose = require('mongoose');
const User = require('./User');

const AdministratorSchema = new mongoose.Schema({
  permissionsList: [{
    type: String,
    enum: ['full_access','assign_technician', 'manage_users', 'view_reports']
  }]
});

const Administrator = User.discriminator('administrator', AdministratorSchema);

module.exports = Administrator;