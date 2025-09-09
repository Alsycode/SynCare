const express = require('express');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const controller = require('../controllers/feedbackController');
const router = express.Router();

router.post('/', auth, controller.submitFeedback);
// router.get('/:appointmentId', auth, controller.getFeedbackByAppointment);
router.get('/allreviews', auth, isAdmin, controller.getAllFeedback);

module.exports = router;
