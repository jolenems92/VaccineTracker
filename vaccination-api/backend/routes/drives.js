const express = require('express');
const router = express.Router();
const Drive = require('../models/drive'); // Assuming you have a Drive model

const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware'); // Import middleware

// Secure routes with both authentication and admin authorization
router.use(authenticate); // Apply authentication to all routes in this file
router.use(authorizeAdmin); // Apply admin authorization to all routes

// Create a new vaccination drive
router.post('/', async (req, res) => {
    const { title, vaccineName, date, location, availableDoses, applicableClasses } = req.body;
  
    const driveDate = new Date(date);
    const today = new Date();
    const minDate = new Date();
    minDate.setDate(today.getDate() + 15);
  
    // Validate that the drive is at least 15 days in advance
    if (driveDate < minDate) {
      return res.status(400).json({ error: 'Drive must be scheduled at least 15 days in advance' });
    }
  
    // Check for conflicts with other drives at the same location on the same date
    const conflict = await Drive.findOne({ date: driveDate, location });
    if (conflict) {
      return res.status(409).json({ error: 'A drive is already scheduled at this location on the same day' });
    }
  
    try {
      // Save the drive to the database
      const drive = new Drive({ title, vaccineName, date: driveDate, location, availableDoses, applicableClasses });
      await drive.save();
      res.status(201).json(drive);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create drive' });
    }
  });

// Update an existing vaccination drive
router.put('/:id', async (req, res) => {
    const { vaccineName, date, availableDoses, applicableClasses, location, title } = req.body;
  
    try {
        // Find the existing drive
        const drive = await Drive.findById(req.params.id);
        if (!drive) return res.status(404).json({ error: 'Drive not found' });
  
        const today = new Date();
        const driveDate = new Date(drive.date);
  
        // Ensure that past drives cannot be edited
        if (driveDate < today) {
          return res.status(400).json({ error: 'Past drives cannot be edited' });
        }
  
        // If the location or date has changed, check for conflicts
        if (date && location && (date !== drive.date.toISOString() || location !== drive.location)) {
            const conflict = await Drive.findOne({
                _id: { $ne: drive._id }, // Ensure it's not checking the current drive
                date: new Date(date),
                location
            });
            if (conflict) {
                return res.status(409).json({ error: 'Drive conflict at new date/location' });
            }
        }
  
        // Update the drive details
        drive.title = title ?? drive.title;
        drive.vaccineName = vaccineName ?? drive.vaccineName;
        drive.date = date ? new Date(date) : drive.date;
        drive.availableDoses = availableDoses ?? drive.availableDoses;
        drive.applicableClasses = applicableClasses ?? drive.applicableClasses;
        drive.location = location ?? drive.location;
  
        // Save the updated drive to the database
        await drive.save();
        res.json(drive);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update drive' });
    }
});

// Get all vaccination drives
router.get('/', async (req, res) => {
    try {
        const drives = await Drive.find().sort({ date: 1 }); // Sort by date ascending
        res.json(drives);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch drives' });
    }
});

// Get a single vaccination drive by ID
router.get('/:id', async (req, res) => {
    try {
        const drive = await Drive.findById(req.params.id);
        if (!drive) return res.status(404).json({ error: 'Drive not found' });
        res.json(drive);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch drive' });
    }
});

module.exports = router;
