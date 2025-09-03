const express = require('express');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const controller = require('../controllers/bloodbankController');
const router = express.Router();

// Get Blood Bank Availability (Accessible to Patients)
router.get('/availability', auth, controller.getAvailability);

// Update Blood Bank Inventory (Admin Only)
router.put('/update', auth, isAdmin, controller.updateInventory);

module.exports = router;
