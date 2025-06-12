// models/User.js - Fixed with shorter, user-friendly tokens
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'technician', 'administrator'],
    required: true
  },
  // Password reset fields
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
}, { 
  timestamps: true,
  discriminatorKey: 'role' 
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
 
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔧 FIXED: Generate shorter, user-friendly reset token
UserSchema.methods.createPasswordResetToken = function() {
  // Generate a 6-digit numeric code (easier for users to type)
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash token and save to database (still secure)
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set expire time (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  // Return the user-friendly 6-digit code
  return resetToken;
};

// Clear password reset fields
UserSchema.methods.clearPasswordReset = function() {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;