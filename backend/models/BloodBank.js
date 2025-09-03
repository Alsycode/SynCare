const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BloodBank', bloodBankSchema);