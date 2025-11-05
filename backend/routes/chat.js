// backend/routes/chatRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const isDoctor = require('../middleware/isDoctor');
const createChatController = require('../controllers/chatController');

module.exports = (io) => {
  const router = express.Router();
  const chatController = createChatController(io);

  router.get('/history/:otherUserId', auth, chatController.getChatHistory);
  router.post('/send', auth, chatController.sendMessage);
  router.get('/unread-counts/:doctorId', chatController.getUnreadCountsForDoctor);
  router.get('/unread-counts-patient/:patientId', chatController.getUnreadCountsForPatient);
  router.post('/mark-read/:patientId', auth, chatController.markMessagesAsRead);

  return router;
};