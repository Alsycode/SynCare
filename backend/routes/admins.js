// backend/routes/admins.js
const express = require('express');
const auth = require('../middleware/auth');
const { registerAdmin } = require('../controllers/adminController');
const router = express.Router();

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied, admin only' });
  }
  next();
};

// Register Admin (restricted to existing admins)
router.post('/register', auth, isAdmin, registerAdmin);

module.exports = router;
