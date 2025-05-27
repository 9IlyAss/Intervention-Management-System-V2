//authRoutes
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");  // Ensure correct path for User model
const Client = require("../models/Client");
const Technician = require("../models/Technician");
const Administrator = require("../models/Administrator");
const Router = express.Router();
const {protect} = require("../middleware/authMiddleware") // Assuming you have middleware for authorization

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
      console.log("Updating skillsList to:", skillsList);
    }
    
    console.log("Update fields:", updateFields);
    
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
      // Fallback to base User model
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

Router.put('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password securely
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Router.put("/profile/image", protect, async (req, res) => {
//     try {
//         const { profileImage } = req.body;
        
//         if (!profileImage) {
//             return res.status(400).json({ message: "Profile image URL is required" });
//         }
        
//         // Update just the profile image
//         const updatedUser = await User.findByIdAndUpdate(
//             req.user.id,
//             { $set: { profileImage } },
//             { new: true }
//         ).select('-password');
        
//         // Return full response with updated info
//         res.json({
//             message: "Profile image updated successfully",
//             user: {
//                 id: updatedUser._id,
//                 name: updatedUser.name,
//                 email: updatedUser.email,
//                 role: updatedUser.role,
//                 profileImage: updatedUser.profileImage
//             }
//         });
//     } catch (error) {
//         console.error('Error updating profile image:', error);
//         res.status(500).json({ message: "Server Error" });
//     }
// });
module.exports = Router;
