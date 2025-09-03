const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entries: [{
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    type: { type: String, enum: ['diagnosis', 'treatment', 'vitals', 'note'], required: true },
    details: { type: String, required: true }, // Can be expanded to object if structured data needed
    date: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }]
});

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);