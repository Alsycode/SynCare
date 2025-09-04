// models/Instruction.js
const mongoose = require("mongoose");

const InstructionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  text: { type: String, required: true },
  role: { type: String, enum: ["admin", "doctor"], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  isOngoing: { type: Boolean, default: false },
});

module.exports = mongoose.model("Instruction", InstructionSchema);