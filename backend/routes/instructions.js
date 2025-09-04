// routes/instructions.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const instructionController = require("../controllers/instructionController");

router.post("/api/instructions", auth, isAdmin, instructionController.createInstruction);
router.get("/appointment/:appointmentId", auth, instructionController.getInstructionsByAppointment);

module.exports = router;