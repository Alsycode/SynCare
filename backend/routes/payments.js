// backend/routes/payments.js
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const auth = require('../middleware/auth');
const router = express.Router();

// Initialize Razorpay, Nodemailer, and Twilio
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Create Razorpay Payment Order
router.post('/create', auth, async (req, res) => {
  console.log("process.env.RAZORPAY_KEY_ID",process.env.RAZORPAY_KEY_ID)
  const { appointmentId, amount } = req.body;
  try {
    // Verify the user is the patient for this appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or appointment not found' });
    }

    if (appointment.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed or not required' });
    }

    const options = {
      amount: amount * 100, // Amount in paise (smallest currency unit)
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// Verify Razorpay Payment
router.post('/verify', auth, async (req, res) => {
  const { appointmentId, paymentId, orderId, signature } = req.body;
  console.log(req.body)
  try {
    // Verify the user is the patient for this appointment
    const appointment = await Appointment.findById(appointmentId);
      console.log('appointment',appointment)
    if (!appointment || appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or appointment not found' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
      appointment.paymentStatus = 'paid';
      appointment.status = 'confirmed';
      await appointment.save();

      const patient = await User.findById(appointment.patientId);

      // Send confirmation email
      // await transporter.sendMail({
      //   from: process.env.EMAIL_USER,
      //   to: patient.email,
      //   subject: 'Appointment Confirmed',
      //   html: `Dear ${patient.name},<br>
      //          Your appointment is confirmed. Submit feedback: <a href="http://localhost:5174/feedback/${appointment._id}">Submit Feedback</a>`,
      // });

      // Send confirmation SMS
    //   await twilioClient.messages.create({
    //     body: `Dear ${patient.name}, your appointment is confirmed. Submit feedback: http://localhost:5014/feedback/${appointment._id}`,
    //     from: process.env.TWILIO_PHONE,
    //     to: patient.phone,
    //   });

      res.json({ message: 'Payment verified and appointment confirmed' });
    } else {
      res.status(400).json({ error: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;