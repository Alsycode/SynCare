const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'patient', 'doctor'], required: true },
  profile: {
    medicalHistory: { type: String, default: '' }, // For patients
    specialty: { type: String, default: '' }, // For doctors
    schedule: [{ day: String, startTime: String, endTime: String }], // For doctors
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For patients created by admins
});

module.exports = mongoose.model('User', userSchema);