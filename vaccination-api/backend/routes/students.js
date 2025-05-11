const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
const Student = require('../models/student');

const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware'); // Import middleware

// Secure routes with both authentication and admin authorization
router.use(authenticate); // Apply authentication to all routes in this file
router.use(authorizeAdmin); // Apply admin authorization to all routes

// File upload setup using multer
const upload = multer({
  dest: 'uploads/', // Folder to store uploaded files temporarily
  limits: { fileSize: 10 * 1024 * 1024 }, // Max file size (10MB)
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Please upload a CSV file.'));
    }
    cb(null, true);
  },
});

// POST /api/students/csv-import (CSV import route)
router.post('/csv-import', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const students = [];

    // Read the uploaded CSV file and parse it using fast-csv
    fs.createReadStream(filePath)
      .pipe(fastcsv.parse({ headers: true, skipEmptyLines: true }))
      .on('data', (row) => {
        // Convert row data into an array of student objects
        students.push({
          name: row.name,
          class: row.class,
          studentId: row.studentId,
          vaccinated: row.vaccinated === 'true', // Assuming 'vaccinated' is a boolean in CSV
        });
      })
      .on('end', async () => {
        // Save students to the database
        try {
          const insertedStudents = await Student.insertMany(students);
          fs.unlinkSync(filePath); // Clean up the uploaded file after processing
          res.status(201).json({ message: 'Students imported successfully', insertedStudents });
        } catch (err) {
          fs.unlinkSync(filePath); // Clean up on error
          res.status(500).json({ error: 'Error saving students to the database', details: err.message });
        }
      })
      .on('error', (err) => {
        fs.unlinkSync(filePath); // Clean up on error
        res.status(500).json({ error: 'Error processing CSV file', details: err.message });
      });
  } catch (err) {
    res.status(500).json({ error: 'Error processing the upload', details: err.message });
  }
});

// GET all students
router.get('/', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// POST /api/students
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/students/search?name=John&class=10A&vaccinated=true
router.get('/search', async (req, res) => {
  const { name, class: className, studentId, vaccinated } = req.query;
  const filter = {};

  if (name) filter.name = new RegExp(name, 'i');
  if (className) filter.class = className;
  if (studentId) filter.studentId = studentId;
  if (vaccinated !== undefined) filter.vaccinated = vaccinated === 'true';

  const students = await Student.find(filter);
  res.json(students);
});

// POST /api/students/:id/vaccinate
router.post('/:id/vaccinate', async (req, res) => {
  const { driveId, vaccineName } = req.body;

  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const alreadyVaccinated = student.vaccinations.some(
    (v) => v.driveId.toString() === driveId && v.vaccineName === vaccineName
  );

  if (alreadyVaccinated) {
    return res.status(400).json({ error: 'Student already vaccinated for this vaccine in this drive' });
  }

  student.vaccinations.push({
    driveId,
    vaccineName,
    date: new Date(),
  });

  student.vaccinated = true;
  await student.save();

  res.json({ message: 'Vaccination recorded', student });
});

// GET /api/students/:id/vaccinations
router.get('/:id/vaccinations', async (req, res) => {
  const student = await Student.findById(req.params.id).populate('vaccinations.driveId');
  if (!student) return res.status(404).json({ error: 'Student not found' });

  res.json(student.vaccinations);
});

module.exports = router;
