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
    const { name, email, password, phone , role = 'client' } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });
        // Create new user
        let newUser = new Client({ name, email, password, phone , role });

        // Save the user
        await newUser.save();

        // Create the JWT token
        const payload = { user: { id: newUser._id, role: newUser.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "40h" }, (err, token) => {
            if (err) throw err;
            res.status(201).json({
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
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

module.exports = Router;
