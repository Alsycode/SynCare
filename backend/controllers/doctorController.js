const User = require('../models/User');
const bcrypt = require("bcryptjs");
// const nodemailer = require('nodemailer');

// Configure Nodemailer transporter (example with Gmail)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER, // Your email
//     pass: process.env.EMAIL_PASS, // Your app password or real password
//   },
// });

// Add Doctor
exports.addDoctor = async (req, res) => {
  const { name, email, phone, specialty } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Doctor already exists' });
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    console.log("temppass", tempPassword);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'doctor',
      profile: { specialty, schedule: [] },
      createdBy: req.user.id,
    });
    await user.save();

    // Send email with username and temp password (commented out for now)
    /*
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Doctor Account Created',
      html: `
        <h2>Welcome Dr. ${name}</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Username (Email):</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <p>Regards,<br>Your Clinic Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Optional: Decide if you want to continue or return an error here
    }
    */

    res.status(201).json({ message: 'Doctor added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
// Update Doctor Schedule
exports.updateSchedule = async (req, res) => {
  const { schedule } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    user.profile.schedule = schedule;
    await user.save();
    res.json({ message: 'Doctor schedule updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// List all Doctors
exports.listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email phone profile.specialty');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
