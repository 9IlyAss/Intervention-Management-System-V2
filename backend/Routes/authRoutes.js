//authRoutes - Clean version without deep links
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const User = require("../models/User");
const Client = require("../models/Client");
const Technician = require("../models/Technician");
const Administrator = require("../models/Administrator");
const sendEmail = require("../utils/sendEmail");
const Router = express.Router();
const {protect} = require("../middleware/authMiddleware")

// @route POST /api/users/register
// @desc Register a new user
// @access Public
Router.post("/register", async (req, res) => {
    const { name, email, password, phone, role = 'client' } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Create new user (default role: client)
        let newUser = new Client({ name, email, password, phone, role });

        // Save the user
        await newUser.save();

        // Create JWT token
        const payload = { user: { id: newUser._id, role: newUser.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
            if (err) throw err;

            res.status(201).json({
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    phone: newUser.phone
                },
                token,
            });
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// @route POST /api/users/login
// @desc Log in to your account
// @access Public
Router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "User doesn't exist" });

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });

        // Create the JWT token
        const payload = { user: { id: user._id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
            if (err) throw err;
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                    phone:user.phone
                    
                },
                token,
            });
        });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// 🆕 @route POST /api/auth/forgot-password
// @desc Send password reset email
// @access Public
Router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No user found with that email address' 
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 🎯 Simple email without deep links
    try {
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6200EE;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You have requested a password reset for your account.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #333;">Your Reset Code:</h3>
            <p style="font-size: 24px; font-weight: bold; color: #6200EE; margin: 10px 0; letter-spacing: 2px;">
              ${resetToken}
            </p>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Enter this code in the app to reset your password
            </p>
          </div>
          
          <p style="color: #666;">This code will expire in 10 minutes for security reasons.</p>
          <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
        </div>
      `;

      await sendEmail(
        user.email,
        'Password Reset Code',
        emailHTML
      );

      res.status(200).json({
        success: true,
        message: 'Password reset code sent to your email',
        // 🚨 REMOVE THIS IN PRODUCTION
        resetToken: resetToken,
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      user.clearPasswordReset();
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Error sending password reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// 🆕 @route POST /api/auth/reset-password/:token
// @desc Reset password with token
// @access Public
Router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // Validation
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Hash the token to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token that hasn't expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = password;
    user.clearPasswordReset();
    await user.save();

    // Generate new JWT token
    const payload = { user: { id: user._id, role: user.role } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error generating authentication token' 
        });
      }

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
        token: token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          phone: user.phone
        }
      });
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password' 
    });
  }
});

// 🎯 @route PUT /api/auth/change-password
// @desc Change password for authenticated user
// @access Private
Router.put('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error changing password' 
    });
  }
});

// @route GET /api/users/profile
// @desc Access your profile
// @access Private
Router.get("/profile", protect, (req, res) => {
    res.json(req.user);
});

Router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, email, profileImage, skillsList } = req.body;
    
    // Build update object with only the fields that were provided
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (profileImage) updateFields.profileImage = profileImage;
    
    if (req.user.role === 'technician' && skillsList !== undefined) {
      updateFields.skillsList = skillsList;
    }
    
    let updatedUser;
    
    if (req.user.role === 'technician') {
      updatedUser = await Technician.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true }
      ).select('-password');
    } else if (req.user.role === 'client') {
      updatedUser = await Client.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true }
      ).select('-password');
    } else {
      updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updateFields },
        { new: true }
      ).select('-password');
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = Router;