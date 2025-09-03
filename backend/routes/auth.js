const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// User Login Route
router.post('/login', login);

module.exports = router;
