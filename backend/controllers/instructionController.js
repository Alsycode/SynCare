// controllers/instructionController.js
const Instruction = require("../models/Instructions");

exports.createInstruction = async (req, res) => {
  const { appointmentId, text } = req.body;
  try {
    const instruction = new Instruction({
      appointmentId,
      text,
      role: "admin",
      createdBy: req.user.id,
    });
    await instruction.save();
    res.status(201).json({ message: "Instruction created successfully", instruction });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getInstructionsByAppointment = async (req, res) => {
    console.log("req",req.params.appointmentId)
    try {
    console.log("req",req.params.appointmentId)
    const instructions = await Instruction.find({ appointmentId: req.params.appointmentId });
    res.json(instructions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};