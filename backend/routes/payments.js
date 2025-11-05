const express = require('express');
const auth = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/create', auth, createPaymentOrder);
router.post('/verify', auth, verifyPayment);

module.exports = router;
