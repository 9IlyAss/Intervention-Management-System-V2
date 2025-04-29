const express = require('express');
const Router = express.Router();
const User = require('../models/User'); // Adjust path as needed
const { protect, admin } = require('../middleware/auth'); // Adjust path as needed
const Intervention = require('../models/Intervention'); // Intervention model



// @route POST /api/users
// @desc Create user (client, technician, admin) based on role
// @access Private (admin only) 
Router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, email, phone, password, role, skillsList, permissionsList } = req.body;

    // Check permissions based on requested role
    if (role === "administrator" && !req.user.permissionsList.includes('full_access')) {
      return res.status(401).json({
        message: "Not authorized, creating administrators requires full_access permission"
      });
    } else if ((role === "client" || role === "technician") &&
      !(req.user.permissionsList.includes('full_access') ||
        req.user.permissionsList.includes('manage_users'))) {
      return res.status(401).json({
        message: "Not authorized, you need manage_users or full_access permission"
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: `User with this email already exists` });
    }

    // Create new user with appropriate fields
    user = new User({
      name,
      email,
      phone,
      password,
      role: role || "client"
    });

    // Add role-specific fields
    if (role === "technician" && skillsList) {
      user.skillsList = skillsList;
    }

    if (role === "administrator" && permissionsList) {
      user.permissionsList = permissionsList;
    }

    await user.save();

    // Return appropriate message based on role
    res.status(201).json({
      message: `${role || "User"} registered successfully!`,
      user
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route PUT /api/users/:id
// @desc Update user info by id
// @access Private (admin only with appropriate permissions)
Router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, email, phone, role, skillsList, permissionsList } = req.body;

    // Find user
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check permissions based on user role
    if (user.role === "administrator" && !req.user.permissionsList.includes('full_access')) {
      return res.status(401).json({
        message: "Not authorized, modifying administrators requires full_access permission"
      });
    } else if ((user.role === "client" || user.role === "technician") &&
      !(req.user.permissionsList.includes('full_access') ||
        req.user.permissionsList.includes('manage_users'))) {
      return res.status(401).json({
        message: "Not authorized, you need manage_users or full_access permission"
      });
    }

    // Update general fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    // Update role-specific fields
    if (user.role === "technician" && skillsList) {
      user.skillsList = skillsList;
    }

    if (user.role === "administrator" && permissionsList) {
      user.permissionsList = permissionsList;
    }

    const updatedUser = await user.save();

    res.json({
      message: `${user.role} updated successfully`,
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/users
// @desc Get all users
// @access Private (admin only with appropriate permissions)
Router.get("/", protect, admin, async (req, res) => {
  try {
    if (!(req.user.permissionsList.includes('full_access') ||
      req.user.permissionsList.includes('manage_users') ||
      req.user.permissionsList.includes('view_reports'))) {
      return res.status(401).json({
        message: "Not authorized, you need appropriate permissions to view users"
      });
    }

    const users = await User.find({}).select('-password');
    res.json(users);

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/users/:id
// @desc Get user by ID
// @access Private (admin only with appropriate permissions)
Router.get("/:id", protect, admin, async (req, res) => {
  try {
    if (!(req.user.permissionsList.includes('full_access') ||
      req.user.permissionsList.includes('manage_users') ||
      req.user.permissionsList.includes('view_reports'))) {
      return res.status(401).json({
        message: "Not authorized, you need appropriate permissions to view users"
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/users/:id
// @desc Delete user
// @access Private (admin only with full_access permission)
Router.delete("/:id", protect, admin, async (req, res) => {
  try {
    if (!req.user.permissionsList.includes('full_access')) {
      return res.status(401).json({
        message: "Not authorized, deleting users requires full_access permission"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route PUT /api/admin/assign-technician/:interventionId
// @desc Assign a technician to an intervention
// @access Private (Admin only)
Router.put("/assign-technician/:interventionId", protect, admin, async (req, res) => {
  const { technicianId } = req.body;
  const { interventionId } = req.params;
  try {
    if (!(req.user.permissionsList.includes('full_access') ||
          req.user.permissionsList.includes('assign_technician'))) {
      return res.status(401).json({
        message: "Not authorized, you need appropriate permissions to assign a technician"
      });
    }
    const intervention = await Intervention.findById(interventionId);
    if (!intervention) {
      return res.status(404).json({ message: "Intervention not found" });
    }
    intervention.technicianId = technicianId;
    intervention.status = 'In Progress';
    await intervention.save();

    // Create Chat Session
    const chat = new Chat({
      participants: [intervention.clientId, technicianId],
      intervention: interventionId
    });
    await chat.save();
    res.json({ message: "Technician assigned and chat created successfully", intervention, chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});





// ************************************************
// @route   GET api/users/technicians/available
// @desc    Get available technicians for intervention assignment
// @access  Private (admin only)
Router.get('/technicians/available', auth, async (req, res) => {
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


module.exports = Router;