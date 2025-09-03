const express = require('express');
const auth = require('../middleware/auth');

const controller = require('../controllers/doctorController');

const router = express.Router();

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied, admin only' });
  }
  next();
};
router.post('/add', auth, isAdmin, controller.addDoctor);
router.put('/schedule/:id', auth, isAdmin, controller.updateSchedule);
router.get('/list', auth, isAdmin, controller.listDoctors);

module.exports = router;
