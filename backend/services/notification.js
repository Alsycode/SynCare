const nodemailer = require('nodemailer');
const cron = require('node-cron');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User'); // Adjust the path to your User model

// Configure Nodemailer transporter (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email address
    pass: process.env.EMAIL_PASS, // Your Gmail app-specific password
  },
});

// Function to send email notification
const sendAppointmentReminder = async (appointment, patient) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patient.email,
    subject: 'Appointment Reminder',
    html: `
      <h2>Appointment Reminder</h2>
      <p>Dear ${patient.name},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <ul>
        <li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${appointment.time}</li>
        <li><strong>Doctor:</strong> ${appointment.doctorId.name}</li>
        <li><strong>Status:</strong> ${appointment.status}</li>
      </ul>
      <p>Please arrive on time or contact us if you need to reschedule.</p>
      <p>Best regards,<br>Your Clinic Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${patient.email} for appointment ID ${appointment._id}`);
    // Update appointment to mark notification as sent
    await Appointment.findByIdAndUpdate(appointment._id, { notificationSent: true });
  } catch (error) {
    console.error(`Error sending email to ${patient.email}:`, error);
  }
};

// Function to check and send reminders for upcoming appointments
const checkUpcomingAppointments = async () => {
  try {
    const now = new Date();
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now
    const fiveMinuteWindow = new Date(now.getTime() + 4 * 60 * 60 * 1000 + 5 * 60 * 1000); // 5-minute window

    // Find appointments within the 4-hour window that haven't had notifications sent
    const appointments = await Appointment.find({
      date: {
        $gte: fourHoursFromNow,
        $lte: fiveMinuteWindow,
      },
      status: 'confirmed', // Only send reminders for confirmed appointments
      notificationSent: false,
    }).populate('patientId doctorId'); // Populate patient and doctor details

    for (const appointment of appointments) {
      const patient = appointment.patientId;
      if (patient && patient.email) {
        await sendAppointmentReminder(appointment, patient);
      }
    }
  } catch (error) {
    console.error('Error checking upcoming appointments:', error);
  }
};

// Schedule the task to run every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('Checking for upcoming appointments...');
  checkUpcomingAppointments();
});

module.exports = { checkUpcomingAppointments };