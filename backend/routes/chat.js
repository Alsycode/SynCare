const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongoose').Types;
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');
const isDoctor = require('../middleware/isDoctor');

module.exports = (io) => {
  // Get Chat History for Patient or Doctor
  router.get('/history/:otherUserId', auth, async (req, res) => {
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
  });

  // Send a new message
  router.post('/send', auth, async (req, res) => {
    const { patientId, doctorId, message, sender } = req.body;

    try {
      // Validate ObjectIds
      if (!ObjectId.isValid(patientId) || !ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'Invalid patientId or doctorId' });
      }

      // Create new chat message
      const newMessage = new Chat({
        patientId: new ObjectId(patientId),
        doctorId: new ObjectId(doctorId),
        message,
        sender,
        read: false,
      });

      await newMessage.save();

      // Emit to the chat room (e.g., patientId-doctorId)
      const room = `${patientId}-${doctorId}`;
      io.to(room).emit('message', newMessage);

      // Emit newMessage to patientId room if sender is doctor
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
  });

  // Get unread counts for doctor
  router.get('/unread-counts/:doctorId', async (req, res) => {
    let doctorId = req.params.doctorId;

    try {
      if (!ObjectId.isValid(doctorId)) {
        console.log('Invalid doctorId:', doctorId);
        return res.status(400).json({ message: 'Invalid doctorId' });
      }
      doctorId = new ObjectId(doctorId);
      // console.log('Querying unread counts for doctorId:', doctorId);

      const counts = await Chat.aggregate([
        {
          $match: {
            doctorId,
            sender: 'patient',
            read: false,
          },
        },
        {
          $group: {
            _id: '$patientId',
            unreadCount: { $sum: 1 },
          },
        },
      ]);

      const unreadCounts = {};
      counts.forEach((item) => {
        unreadCounts[item._id.toString()] = item.unreadCount;
      });

      // console.log('Unread counts result:', unreadCounts);
      res.status(200).json(unreadCounts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      res.status(500).json({ message: 'Failed to get unread counts' });
    }
  });

  // Get unread counts for patient
  router.get('/unread-counts-patient/:patientId', async (req, res) => {
    let patientId = req.params.patientId;

    try {
      if (!ObjectId.isValid(patientId)) {
        console.log('Invalid patientId:', patientId);
        return res.status(400).json({ message: 'Invalid patientId' });
      }
      patientId = new ObjectId(patientId);
      // console.log('Querying unread counts for patientId:', patientId);

      const counts = await Chat.aggregate([
        {
          $match: {
            patientId,
            sender: 'doctor',
            read: false,
          },
        },
        {
          $group: {
            _id: '$doctorId',
            unreadCount: { $sum: 1 },
          },
        },
      ]);

      const unreadCounts = {};
      counts.forEach((item) => {
        unreadCounts[item._id.toString()] = item.unreadCount;
      });

      // console.log('Unread counts for patientId', patientId, ':', unreadCounts);
      res.status(200).json(unreadCounts);
    } catch (error) {
      console.error('Error fetching unread counts for patient:', error);
      res.status(500).json({ message: 'Failed to get unread counts' });
    }
  });

  // Mark messages as read
  router.post('/mark-read/:patientId', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const patientId = req.params.patientId;
      if (!ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid patientId' });
      }

      // If user is a doctor, mark patient messages as read
      // If user is a patient, mark doctor messages as read
      const filter = user.role === 'doctor'
        ? { patientId, sender: 'patient', read: false }
        : { patientId: new ObjectId(patientId), sender: 'doctor', read: false };

      await Chat.updateMany(filter, { $set: { read: true } });
      res.status(200).send({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).send({ message: 'Error marking messages as read' });
    }
  });

  return router;
};