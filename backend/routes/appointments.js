const express = require('express');
const auth = require('../middleware/auth');
const isDoctor = require('../middleware/isDoctor');
const isAdmin = require('../middleware/isAdmin');
const controller = require('../controllers/appointmentController');
const router = express.Router();

// Appointment Creation by Admin
router.post('/', auth, isAdmin, controller.createAppointmentAdmin);

// Get Appointments for Doctor
router.get('/doctor', auth, isDoctor, controller.getDoctorAppointments);

// Confirm Appointment by Doctor
router.put('/confirm/:id', auth, isDoctor, controller.confirmAppointment);

// Complete Appointment by Doctor
router.put('/complete/:id', auth, isDoctor, controller.completeAppointment);

// Get Patient's Appointments
router.get('/patient', auth, controller.getPatientAppointments);
router.get('/patientAppointments', auth, controller.getPatientAppointments);

// Admin Get All Appointments
// router.get('/admin/all', auth, isAdmin, controller.getAllAppointmentsAdmin);

// Validate Appointment Token
router.get('/validate/:appointmentId', controller.validateAppointmentToken);
router.get("/available", controller.getAvailableSlots);
module.exports = router;
