// backend/controllers/admins.controller.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register a new admin (controller logic)
const registerAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'admin',
      createdBy: req.user.id,
      createdAt: new Date(),
    });
    await user.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { registerAdmin };
