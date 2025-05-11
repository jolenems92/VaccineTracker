const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema({
  title: String,
  vaccineName: { type: String, required: true },
  date: { type: Date, required: true },
  location: String,
  availableDoses: { type: Number, required: true },
  applicableClasses: [String], // e.g., ["5", "6", "7"]
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Drive', DriveSchema);
