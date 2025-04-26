// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Client = require('../models/Client');
const Technician = require('../models/Technician');
const Administrator = require('../models/Administrator');

// @route   GET api/users
// @desc    Get all users (filtered by role if specified)
// @access  Private (admin only)
router.get('/', auth, async (req, res) => {
  // Only administrators can list all users
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    const { role } = req.query;
    let users;

    if (role && ['client', 'technician', 'administrator'].includes(role)) {
      // Filter by role if specified
      users = await User.find({ role }).select('-password');
    } else {
      // Get all users
      users = await User.find().select('-password');
    }

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private (admin or self)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is requesting their own info or is an admin
    if (req.user.id !== req.params.id && req.user.role !== 'administrator') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id
// @desc    Update user profile
// @access  Private (admin or self)
router.put('/:id', auth, async (req, res) => {
  // Check if user is updating their own info or is an admin
  if (req.user.id !== req.params.id && req.user.role !== 'administrator') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  const { name, email, phone } = req.body;

  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (phone) userFields.phone = phone;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/technician/:id/skills
// @desc    Update technician skills
// @access  Private (admin only)
router.put('/technician/:id/skills', auth, async (req, res) => {
  // Only administrators can update technician skills
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  const { skillsList } = req.body;

  try {
    let technician = await Technician.findById(req.params.id);

    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' });
    }

    // Update technician skills
    technician = await Technician.findByIdAndUpdate(
      req.params.id,
      { $set: { skillsList } },
      { new: true }
    ).select('-password');

    res.json(technician);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Technician not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/admin/:id/permissions
// @desc    Update administrator permissions
// @access  Private (admin only)
router.put('/admin/:id/permissions', auth, async (req, res) => {
  // Only administrators can update permissions
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  const { permissionsList } = req.body;

  // Validate permissions
  const validPermissions = ['assign_technician', 'manage_users', 'view_reports'];
  if (permissionsList.some(perm => !validPermissions.includes(perm))) {
    return res.status(400).json({ msg: 'Invalid permissions' });
  }

  try {
    let admin = await Administrator.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ msg: 'Administrator not found' });
    }

    // Update administrator permissions
    admin = await Administrator.findByIdAndUpdate(
      req.params.id,
      { $set: { permissionsList } },
      { new: true }
    ).select('-password');

    res.json(admin);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Administrator not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/technicians/available
// @desc    Get available technicians for intervention assignment
// @access  Private (admin only)
router.get('/technicians/available', auth, async (req, res) => {
  // Only administrators can access this endpoint
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    // Get all technicians with their skills
    const technicians = await Technician.find().select('name email phone skillsList');
    res.json(technicians);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Private (admin only)
router.delete('/:id', auth, async (req, res) => {
  // Only administrators can delete users
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Don't let admin delete themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }

    await User.findByIdAndRemove(req.params.id);

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;