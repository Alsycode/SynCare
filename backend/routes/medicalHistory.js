const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicalHistoryController');

router.get('/:patientId', controller.getMedicalHistoryByPatientId);

module.exports = router;
