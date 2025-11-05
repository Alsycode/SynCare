// backend/controllers/chatController.js
const { ObjectId } = require('mongoose').Types;
const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = (io) => ({
  getChatHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const otherUserId = req.params.otherUserId;

      const messages = await Chat.find({
        $or: [
          { patientId: userId, doctorId: otherUserId },
          { patientId: otherUserId, doctorId: userId },
        ],
      }).sort({ timestamp: 1 });

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  sendMessage: async (req, res) => {
    const { patientId, doctorId, message, sender } = req.body;

    try {
      if (!ObjectId.isValid(patientId) || !ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid patientId or doctorId' });
      }

      const newMessage = new Chat({
        patientId: new ObjectId(patientId),
        doctorId: new ObjectId(doctorId),
        message,
        sender,
        read: false,
      });

      await newMessage.save();

      const room = `${patientId}-${doctorId}`;
      io.to(room).emit('message', newMessage);

      if (sender === 'doctor') {
        io.to(patientId).emit('newMessage', {
          patientId,
          doctorId,
          message,
          sender,
          timestamp: newMessage.timestamp,
          read: false,
        });
      }

      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  },

  getUnreadCountsForDoctor: async (req, res) => {
    let doctorId = req.params.doctorId;

    try {
      if (!ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid doctorId' });
      }

      doctorId = new ObjectId(doctorId);

      const counts = await Chat.aggregate([
        { $match: { doctorId, sender: 'patient', read: false } },
        { $group: { _id: '$patientId', unreadCount: { $sum: 1 } } },
      ]);

      const unreadCounts = {};
      counts.forEach((item) => {
        unreadCounts[item._id.toString()] = item.unreadCount;
      });

      res.status(200).json(unreadCounts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      res.status(500).json({ message: 'Failed to get unread counts' });
    }
  },

  getUnreadCountsForPatient: async (req, res) => {
    let patientId = req.params.patientId;

    try {
      if (!ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid patientId' });
      }

      patientId = new ObjectId(patientId);

      const counts = await Chat.aggregate([
        { $match: { patientId, sender: 'doctor', read: false } },
        { $group: { _id: '$doctorId', unreadCount: { $sum: 1 } } },
      ]);

      const unreadCounts = {};
      counts.forEach((item) => {
        unreadCounts[item._id.toString()] = item.unreadCount;
      });

      res.status(200).json(unreadCounts);
    } catch (error) {
      console.error('Error fetching unread counts for patient:', error);
      res.status(500).json({ message: 'Failed to get unread counts' });
    }
  },

  markMessagesAsRead: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const patientId = req.params.patientId;
      if (!ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid patientId' });
      }

      const filter = user.role === 'doctor'
        ? { patientId, sender: 'patient', read: false }
        : { patientId: new ObjectId(patientId), sender: 'doctor', read: false };

      await Chat.updateMany(filter, { $set: { read: true } });
      res.status(200).send({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).send({ message: 'Error marking messages as read' });
    }
  },
});