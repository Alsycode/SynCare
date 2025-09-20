const User = require('../models/User');
const bcrypt = require("bcryptjs");

// Add Doctor
exports.addDoctor = async (req, res) => {
  const { name, email, phone, specialty } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Doctor already exists' });
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    console.log("temppass",tempPassword)
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

    // Place for sending email or SMS with tempPassword to doctor

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
