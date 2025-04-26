const express = require('express');
const Intervention = require('../models/Intervention'); // Intervention model
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Middleware to verify JWT token

// Submit an intervention (Client)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, clientId, location, attachments } = req.body;

    const newIntervention = new Intervention({
      title,
      description,
      clientId,
      status: 'Pending',
      location,
      attachments,
    });

    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all interventions (Admin / Technician)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const interventions = await Intervention.find().populate('clientId technicianId');
    res.json(interventions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update intervention status (Technician or Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, technicianId } = req.body;
    const intervention = await Intervention.findById(req.params.id);
    
    if (!intervention) return res.status(404).json({ error: 'Intervention not found' });

    if (technicianId) {
      intervention.technicianId = technicianId;
    }
    
    intervention.status = status;
    await intervention.save();

    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
