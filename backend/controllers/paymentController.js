// backend/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
// const transporter = require('../config/email'); // optional
// const twilioClient = require('../config/twilio'); // optional

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentOrder = async (req, res) => {
  const { appointmentId, amount } = req.body;
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or appointment not found' });
    }

    if (appointment.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed or not required' });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(500).json({ error: 'Payment creation failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  const { appointmentId, paymentId, orderId, signature } = req.body;
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or appointment not found' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === signature) {
      appointment.paymentStatus = 'paid';
      appointment.status = 'confirmed';
      await appointment.save();

      const patient = await User.findById(appointment.patientId);

      // Optional: send email or SMS
      // await transporter.sendMail({ ... });
      // await twilioClient.messages.create({ ... });

      res.json({ message: 'Payment verified and appointment confirmed' });
    } else {
      res.status(400).json({ error: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
};