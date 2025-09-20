const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  doctorNotes: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  treatmentPlan: { type: String, default: '' },
  vitalSigns: {
    type: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number
    },
    default: {}
  },
  progressStatus: { type: String, enum: ['improving', 'stable', 'worsening', 'unknown'], default: 'unknown' },
  notificationSent: { type: Boolean, default: false }, // New field to track notification status
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Automatically update 'updatedAt' on save
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);