const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ────────────────────────────────────────────
let io;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  const jwt = require('jsonwebtoken');
  const User = require('./models/User');
  const Message = require('./models/Message');

  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name}`);

    // Join booking chat room
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`${socket.user.name} joined room: booking_${bookingId}`);
    });

    // Leave booking chat room
    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking_${bookingId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { bookingId, text } = data;
        if (!text?.trim() || !bookingId) return;

        const message = await Message.create({
          booking: bookingId,
          sender: socket.user._id,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          text: text.trim()
        });

        // Broadcast to all in the booking room
        io.to(`booking_${bookingId}`).emit('new_message', {
          _id: message._id,
          booking: bookingId,
          sender: socket.user._id,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          text: message.text,
          createdAt: message.createdAt
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`booking_${data.bookingId}`).emit('user_typing', {
        userName: socket.user.name,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });

  console.log('✅ Socket.io initialized');
} catch (err) {
  console.log('[Socket.io] Not initialized:', err.message);
}

// Attach io to app for use in controllers
app.set('io', io);

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/assistants', require('./routes/assistants'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'CarryHand API running' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 CarryHand server running on port ${PORT}`));
