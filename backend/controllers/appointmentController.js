const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalHistory = require('../models/MedicalHistory');
const Feedback = require("../models/Feedback");
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const jwt = require("jsonwebtoken");
const Instruction = require("../models/Instructions")
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
function generateHalfHourSlots(startTime, endTime) {
  const slots = [];
  let [hours, minutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  while (hours < endHours || (hours === endHours && minutes < endMinutes)) {
    slots.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    minutes += 30;
    if (minutes >= 60) {
      hours += 1;
      minutes = 0;
    }
  }
  return slots;
}

// Appointment Creation by Admin
exports.createAppointmentAdmin = async (req, res) => {
  const { patientId, doctorId, date, time } = req.body;
  try {
    const appointment = new Appointment({
      patientId,
      doctorId,
      date: new Date(date),
      time,
      status: 'pending',
    });
    await appointment.save();

    // Medical history creation (if needed)
    let medicalHistory = await MedicalHistory.findOne({ patientId });
    if (!medicalHistory) {
      medicalHistory = await MedicalHistory.create({ patientId, entries: [] });
    }

    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get Appointments for Doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.id })
      .populate('patientId', 'name email phone')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Confirm Appointment by Doctor
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: req.user.id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }
    appointment.status = 'confirmed';
    await appointment.save();

    // Send confirmation email to patient
    const patient = await User.findById(appointment.patientId);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: 'Appointment Confirmed',
      html: `Dear ${patient.name},<br>Your appointment on ${appointment.date.toLocaleDateString()} at ${appointment.time} with Dr. ${req.user.name} is confirmed.`,
    });

    res.json({ message: 'Appointment confirmed', appointment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Complete Appointment by Doctor
exports.completeAppointment = async (req, res) => {
  console.log("request reached")
  try {
    const { doctorNotes, diagnosis, treatmentPlan, vitalSigns, progressStatus, instructions, isOngoing } = req.body;
    const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: req.user.id });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or not authorized" });
    }
console.log("appointmnt",req.body)
    appointment.status = "completed";
    appointment.doctorNotes = doctorNotes || appointment.doctorNotes;
    appointment.diagnosis = diagnosis || appointment.diagnosis;
    appointment.treatmentPlan = treatmentPlan || appointment.treatmentPlan;
    appointment.vitalSigns = vitalSigns || appointment.vitalSigns;
    appointment.progressStatus = progressStatus || appointment.progressStatus;
    await appointment.save();
console.log("saved appointment")
    // Create instruction record for doctor
    if (instructions) {
      await Instruction.create({
        appointmentId: appointment._id,
        text: instructions,
        role: "doctor",
        createdBy: req.user.id,
        isOngoing: isOngoing || false,
      });
    }
console.log("no instructions")
    // Update MedicalHistory
    let medicalHistory = await MedicalHistory.findOne({ patientId: appointment.patientId });
    console.log("history found")
    if (!medicalHistory) {
      medicalHistory = await MedicalHistory.create({ patientId: appointment.patientId, entries: [] });
    }
    const entries = [];
    if (doctorNotes) entries.push({ type: "note", details: doctorNotes, appointmentId: appointment._id, addedBy: req.user.id });
    if (diagnosis) entries.push({ type: "diagnosis", details: diagnosis, appointmentId: appointment._id, addedBy: req.user.id });
    if (treatmentPlan) entries.push({ type: "treatment", details: treatmentPlan, appointmentId: appointment._id, addedBy: req.user.id });
    if (vitalSigns) entries.push({ type: "vitals", details: JSON.stringify(vitalSigns), appointmentId: appointment._id, addedBy: req.user.id });
    if (progressStatus) entries.push({ type: "progress", details: progressStatus, appointmentId: appointment._id, addedBy: req.user.id });
    if (instructions) entries.push({ type: "instruction", details: instructions, appointmentId: appointment._id, addedBy: req.user.id });
    await MedicalHistory.findOneAndUpdate(
      { patientId: appointment.patientId },
      { $push: { entries: { $each: entries } } },
      { upsert: true, new: true }
    );
console.log("medicak history updated")
    // Feedback email logic
    const patient = await User.findById(appointment.patientId);
    const token = jwt.sign(
      {
        appointmentId: appointment._id,
        patientId: patient._id,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
      process.env.JWT_SECRET
    );
    console.log("Feedback email")
     await transporter.sendMail({
       from: process.env.EMAIL_USER,
       to: patient.email,
       subject: "Appointment Completed - Share Feedback",
       html: `Dear ${patient.name},<br>Your appointment on ${appointment.date.toLocaleDateString()} at ${appointment.time} is complete. Please provide feedback: <a href="http://localhost:5174/feedback/${appointment._id}?token=${token}">Feedback Form</a>`,
     });
console.log("Feedback email sent")
    res.json({ message: "Appointment completed", appointment });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get Patient's Appointments
exports.getPatientAppointments = async (req, res) => {
  
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name email')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// exports.getAllAppointmentsAdmin = async (req, res) => {
//   try {
//     const appointments = await Appointment.find()
//       .populate('patientId', 'name email')
//       .populate('doctorId', 'name email')
//       .sort({ date: -1 });
//     const appointmentsWithFeedback = await Promise.all(appointments.map(async (apt) => {
//       const feedback = await Feedback.findOne({ appointmentId: apt._id })
//         .select('rating comments submittedAt')
//         .lean(); 
//       return { ...apt.toObject(), feedback };
//     }));

//     res.status(200).json({
//       success: true,
//       data: appointmentsWithFeedback
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching all appointments',
//       error: error.message
//     });
//   }
// };

// Validate appointment token
exports.validateAppointmentToken = async (req, res) => {
   console.log("paramsssssssss")
  const { appointmentId } = req.params;
  console.log("params",appointmentId)
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.status !== 'completed') {
      return res.status(400).json({ valid: false, error: 'Invalid appointment' });
    }
    console.log("appointment",appointment)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
const isValid = appointment.patientId && appointment.patientId.toString() === decoded.id;

      console.log("decoded",decoded)
    console.log("decoded patientid",appointment.patientId)
        console.log("isValid",isValid)
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ valid: false, error: 'Server error' });
  }
};


exports.getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ error: "doctorId and date are required" });
  }
  try {
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    // Get the weekday of the date
    const weekday = new Date(date).getDay();
    const weekdaysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const scheduleForDay = doctor.profile.schedule.find(
      (s) => s.day === weekdaysMap[weekday]
    );
    if (!scheduleForDay) {
      return res.json({ availableSlots: [] });
    }
    // Generate all half-hour slots
    let allSlots = generateHalfHourSlots(scheduleForDay.startTime, scheduleForDay.endTime);
    // Get already booked appointments
    const bookedAppointments = await Appointment.find({
      doctorId,
      date
    }).select("time");
    const bookedTimes = bookedAppointments.map((a) => a.time);
    // Filter out booked slots
    const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));
    res.json({ availableSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }}
