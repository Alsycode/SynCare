const express = require('express');
const auth = require('../middleware/auth');


const controller = require('../controllers/patientController');
const router = express.Router();
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied, admin only' });
  }
  next();
};
router.post('/register', auth, isAdmin, controller.registerPatient);
router.get('/list', auth, isAdmin, controller.listPatients);
router.get('/:patientId', auth, controller.getPatientById);

module.exports = router;
