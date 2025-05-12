//interventionRoutes
const express = require('express');
const Intervention = require('../models/Intervention'); // Intervention model
const Router = express.Router();
const { protect, admin ,AdTech} = require('../middleware/authMiddleware'); // Adjust path as needed

// @route Get /api/interventions
// @desc Get all interventions 
// @access Private (Admin / Technician) 
Router.get('/', protect, AdTech, async (req, res) => {
  try {
    const interventions = await Intervention.find()
      .populate('clientId', 'name')       // only populate the 'name' field of client
      .populate('technicianId', 'name');   // only populate the 'name' field of technician

    // Then map to customize the format
    const formattedInterventions = interventions.map(intervention => ({
      _id: intervention._id,
      title: intervention.title,
      description: intervention.description,
      clientName: intervention.clientId?.name || null,
      technicianName: intervention.technicianId?.name || null,
      status: intervention.status
    }));

    res.json(formattedInterventions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route Get /api/interventions/:id
// @desc Get  intervention details
// @access Private (Admin / Technician) 
Router.get('/:id', protect ,AdTech,  async (req, res) => {
  try {
    const intervention = await Intervention.find({_id :req.params.id})
                            .populate('clientId technicianId');
    res.json(intervention);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// //-----------Futures i will add

// // @route GET /api/admin/reports/technician/:technicianId
// // @desc Get technician's report (number of interventions + average feedback)
// // @access Private (Admin only)
// Router.get("/reports/technician/:technicianId", protect, admin, async (req, res) => {
//   try {
//     const interventions = await Intervention.find({ technicianId: req.params.technicianId, status: 'Completed' });

//     const total = interventions.length;
//     const avgRating = interventions.reduce((acc, curr) => acc + (curr.feedback?.rating || 0), 0) / (total || 1);

//     res.json({ totalInterventions: total, averageRating: avgRating.toFixed(2) });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // @route GET /api/admin/reports/client/:clientId
// // @desc Get client's report (number of requests + average satisfaction)
// // @access Private (Admin only)
// Router.get("/reports/client/:clientId", protect, admin, async (req, res) => {
//   try {
//     const interventions = await Intervention.find({ clientId: req.params.clientId });

//     const total = interventions.length;
//     const avgRating = interventions.reduce((acc, curr) => acc + (curr.feedback?.rating || 0), 0) / (total || 1);

//     res.json({ totalRequests: total, averageSatisfaction: avgRating.toFixed(2) });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// const { Parser } = require('json2csv');

// Router.get("/reports/export/csv", protect, admin, async (req, res) => {
//   try {
//     const interventions = await Intervention.find().populate('clientId technicianId');

//     const fields = ['title', 'description', 'status', 'clientId.name', 'technicianId.name', 'createdAt'];
//     const opts = { fields };
//     const parser = new Parser(opts);
//     const csv = parser.parse(interventions);

//     res.header('Content-Type', 'text/csv');
//     res.attachment('interventions.csv');
//     res.send(csv);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });



module.exports = Router;












