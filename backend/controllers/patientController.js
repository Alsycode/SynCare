const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// Patient Registration by Admin
exports.registerPatient = async (req, res) => {
  const { name, email, phone, medicalHistory } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'patient',
      profile: { medicalHistory },
      createdBy: req.user.id,
    });
    await user.save();

    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Your Patient Portal Account',
    //   html: `Welcome, ${name}! Your SynCare account has been created.<br>
    //          Username: ${email}<br>
    //          Temporary Password: ${tempPassword}<br>
    //          <a href="http://localhost:3000/login">Activate Account</a>`,
    // });

    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get list of Patients
exports.listPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('name email phone');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single patient details
exports.getPatientById = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const patient = await User.findOne({ _id: patientId, role: 'patient' })
      .select('name email phone createdAt profile.medicalHistory');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching patient details' });
  }
};
