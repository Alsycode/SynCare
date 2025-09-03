const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  sender: { type: String, enum: ['patient', 'doctor'], required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
}, { collection: 'chats' }); // Explicitly set collection name to 'chats'

module.exports = mongoose.model('Chat', chatSchema);