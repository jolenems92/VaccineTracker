const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const Drive = require('../models/drive');

// GET /api/dashboard
router.get('/', async (req, res) => {
    try {
      const totalStudents = await Student.countDocuments();
      const vaccinatedCount = await Student.countDocuments({ vaccinated: true });
      const percentVaccinated = totalStudents ? Math.round((vaccinatedCount / totalStudents) * 100) : 0;
  
      const today = new Date();
      const upcomingDrives = await Drive.find({ date: { $gte: today } }).sort({ date: 1 });
  
      res.json({
        totalStudents,
        vaccinatedCount,
        percentVaccinated,
        upcomingDrives: upcomingDrives.length > 0 ? upcomingDrives : 'no upcoming drives'
      });
    } catch (err) {
      res.status(500).json({ error: 'Dashboard data failed' });
    }
  });  

module.exports = router;
