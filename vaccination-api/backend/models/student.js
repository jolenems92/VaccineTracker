const mongoose = require('mongoose');

const VaccinationSchema = new mongoose.Schema({
  driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive' },
  vaccineName: String,
  date: Date,
});

const StudentSchema = new mongoose.Schema({
  studentId: String,        // Unique school-assigned ID
  name: String,
  class: String,
  vaccinated: { type: Boolean, default: false },
  vaccinations: [VaccinationSchema],
});

module.exports = mongoose.model('Student', StudentSchema);
