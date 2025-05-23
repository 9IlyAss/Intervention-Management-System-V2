const mongoose = require('mongoose');
const User = require('./User');

const ClientSchema = new mongoose.Schema({
  interventionsList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Intervention'
  }]
});

const Client = User.discriminator('client', ClientSchema);

module.exports = Client;