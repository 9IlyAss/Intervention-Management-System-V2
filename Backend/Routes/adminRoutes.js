const express = require('express');
const Router = express.Router();
const User = require('../models/User'); // Adjust path as needed
const { protect, admin } = require('../middleware/authMiddleware'); // Adjust path as needed
const Intervention = require('../models/Intervention'); // Intervention model
const Feedback = require("../models/Feedback")
const ChatRoom = require("../models/ChatRoom");
const Client = require('../models/Client');
const Technician = require("../models/Technician");
const Administrator = require("../models/Administrator")

// @route POST /api/admin
// @desc Create user (client, technician, admin) based on role
// @access Private (admin only) 
Router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, email, phone, password, role, skillsList, permissionsList } = req.body;

    // Check permissions based on requested role
    if (role === "administrator" && !req.user.permissionsList.includes('full_access')) {
      return res.status(401).json({ message: "Not authorized, creating administrators requires full_access permission" });
    } else if ((role === "client" || role === "technician") &&
      !(req.user.permissionsList.includes('full_access') || req.user.permissionsList.includes('manage_users'))) {
      return res.status(401).json({ message: "Not authorized, you need manage_users or full_access permission" });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: `User with this email already exists` });
    }

    let user;
    if (role === "administrator") {
      user = new Administrator({
        name,
        email,
        phone,
        password,
        role,
        permissionsList
      });
    } else if (role === "technician") {
      user = new Technician({
        name,
        email,
        phone,
        password,
        role,
        skillsList
      });
    } else {
      user = new Client({
        name,
        email,
        phone,
        password,
        role: "client"
      });
    }

    await user.save();

    res.status(201).json({
      message: `${role || "User"} registered successfully!`,
      user
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route GET /api/admin
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

// @route GET /api/admin/:id
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

// @route DELETE /api/admin/:id
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
    } else if (user.permissionsList && user.permissionsList.includes('full_access')) {
      return res.status(401).json({ message: "you cant delete a user with full_access permission" });
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

    // Check if chat room already exists
    let existingChat = await ChatRoom.findOne({
      'participants.clientId': intervention.clientId,
      'participants.technicianId': technicianId,
      interventionId: intervention._id
    });

    if (!existingChat) {
      // Create new ChatRoom if doesn't exist
      existingChat = new ChatRoom({
        participants: {
          clientId: intervention.clientId,
          technicianId: technicianId
        },
        interventionId: [intervention._id], // ⬅️ array because in your schema it's an array
        messages: []
      });
      await existingChat.save();
    }

    res.json({
      message: "Technician assigned and chat ready!",
      intervention,
      chatRoomId: existingChat._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


//& ********************heere 
// @route PUT /api/admin/:id
// @desc Update user info by id
// @access Private (admin only with appropriate permissions)
Router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, email, phone, skillsList, permissionsList } = req.body;
    
    // Find user using base model
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Authorization checks
    if (user.role === "administrator" && 
        !req.user.permissionsList.includes('full_access')) {
      return res.status(403).json({
        message: "Requires full_access to modify administrators"
      });
    }

    if ((user.role === "client" || user.role === "technician") &&
        !req.user.permissionsList.includes('manage_users') &&
        !req.user.permissionsList.includes('full_access')) {
      return res.status(403).json({
        message: "Requires manage_users or full_access permission"
      });
    }

    // Update common fields
    if (name) user.name = name;
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }
    if (phone) user.phone = phone;

    // Handle role-specific updates
    if (user.role === "technician") {
      if (skillsList) {
        user.skillsList = skillsList;
      }
    } else if (user.role === "administrator") {
      if (permissionsList) {
        user.permissionsList = permissionsList.filter(p => 
          ['full_access','assign_technician','manage_users','view_reports'].includes(p)
        );
      }
    }
    const updatedUser = await user.save();
    
    res.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        ...(updatedUser.role === 'technician' && { skillsList: updatedUser.skillsList }),
        ...(updatedUser.role === 'administrator' && { permissionsList: updatedUser.permissionsList })
      }
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message
    });
  }
});


//*old code
// Router.put("/:id", protect, admin, async (req, res) => {
//   try {
//     const { name, email, phone, skillsList, permissionsList } = req.body;

//     let user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.role === "administrator" && !req.user.permissionsList.includes('full_access')) {
//       return res.status(401).json({
//         message: "Not authorized, modifying administrators requires full_access permission"
//       });
//     } else if ((user.role === "client" || user.role === "technician") &&
//       !(req.user.permissionsList.includes('full_access') || req.user.permissionsList.includes('manage_users'))) {
//       return res.status(401).json({
//         message: "Not authorized, you need manage_users or full_access permission"
//       });
//     }
//     if(user.role === "technician"&& skillsList ){
//       const updateuser=new Technician({
//         name : name || user.name,
//         email : email || user.email,
//         phone : phone || user.phone,
//         skillsList : skillsList
//       })
//     }else if (user.role === "administrator" && permissionsList) {
//       const updateuser=new Administrator({
//         name : name || user.name,
//         email : email || user.email,
//         phone : phone || user.phone,
//         permissionsList :permissionsList
//       })
//     }else {
//       const updateuser=new Client({
//         name : name || user.name,
//         email : email || user.email,
//         phone : phone || user.phone,
//       })
//     }
//      await updatedUser.save();

//     res.json({
//       message: ` updated successfully`,
//       user: updatedUser
//     });

//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });
//* end





// @route Get /api/admin/feedback
// @desc Get all feedbacks
// @access Private (admin)

Router.post('/feedback', protect, admin, async (req, res) => {
  try {
    const feedbacks = Feedback.find({}, { rating: 1, _id: 0 }).populate('clientId', 'name')
    if (feedbacks)
      res.json(users);
    else
      return res.status(404).json({ msg: 'No feedback Found ' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// *********************Futures i will add***************************
// @route   GET api/users/technicians/available
// @desc    Get available technicians for intervention assignment
// @access  Private (admin only)
// Router.get('/technicians/available', auth, async (req, res) => {
// Only administrators can access this endpoint
//   if (req.user.role !== 'administrator') {
//     return res.status(403).json({ msg: 'Not authorized' });
//   }
//   try {
//      Get all technicians with their skills
//     const technicians = await Technician.find().select('name email phone skillsList');
//     res.json(technicians);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });



module.exports = Router;