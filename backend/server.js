const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const chatRoutes = require('./routes/chat');
const feedbackRoutes = require('./routes/feedback');
const bloodBankRoutes = require('./routes/bloodBank');
const adminRoutes = require('./routes/admins');
const paymentRoutes = require("./routes/payments");
const medicalHistoryRoutes = require("./routes/medicalHistory")
const instructionRoutes = require("./routes/instructions")
const Chat = require("./models/Chat");
require('dotenv').config();

const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5174", "http://localhost:5173","https://caresync-patient-portal.vercel.app", "https://syn-care.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes(io)); // Pass io to chatRoutes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/blood-bank', bloodBankRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/medicalHistory', medicalHistoryRoutes);
app.use('/api/instructions', instructionRoutes);
app.get('/', (req, res) => {
  res.send('Server is live');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  // console.log('New client connected:', socket.id);

  socket.on('join', ({ userId, room }) => {
    socket.join(room);
    // console.log(`User ${userId} joined room ${room}`);
  });

  socket.on('sendMessage', async ({ room, message, sender, patientId, doctorId }) => {
    try {
      const chat = new Chat({
        patientId: new mongoose.Types.ObjectId(patientId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        message,
        sender,
        read: false,
        timestamp: new Date(),
      });
      await chat.save();

      // Emit to the chat room (for chat window)
      io.to(room).emit('message', chat);

      // Emit newMessage to patientId room if sender is doctor
      if (sender === 'doctor') {
        io.to(patientId).emit('newMessage', {
          patientId,
          doctorId,
          message,
          sender,
          timestamp: chat.timestamp,
          read: false,
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  });

  // WebRTC signaling events
  socket.on('call-user', ({ room, offer }) => {
    socket.to(room).emit('call-made', { offer });
  });

  socket.on('answer-call', ({ room, answer }) => {
    socket.to(room).emit('call-answered', { answer });
  });

  socket.on('ice-candidate', ({ room, candidate }) => {
    socket.to(room).emit('ice-candidate', { candidate });
  });

  socket.on('end-call', ({ room }) => {
    socket.to(room).emit('call-ended');
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));