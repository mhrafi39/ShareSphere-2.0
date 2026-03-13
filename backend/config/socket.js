const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store active user connections
const userSockets = new Map();

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);
    
    // Store socket connection
    userSockets.set(socket.userId, socket.id);

    // Join user's personal room for notifications
    socket.join(`user:${socket.userId}`);

    // If admin, join admin room
    if (socket.user.role === 'admin') {
      socket.join('admin-room');
      console.log('Admin joined admin room:', socket.userId);
    }

    // Send online status to all users
    socket.broadcast.emit('user-online', { userId: socket.userId });

    // Handle joining conversation rooms
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation:${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation:${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing', ({ conversationId, receiverId }) => {
      io.to(`conversation:${conversationId}`).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
      });
    });

    // Handle stop typing
    socket.on('stop-typing', ({ conversationId }) => {
      io.to(`conversation:${conversationId}`).emit('user-stop-typing', {
        userId: socket.userId,
      });
    });

    // Handle message read receipt
    socket.on('message-read', ({ messageId, conversationId, senderId }) => {
      io.to(`user:${senderId}`).emit('message-read-receipt', {
        messageId,
        conversationId,
        readBy: socket.userId,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
      userSockets.delete(socket.userId);
      
      // Notify others that user is offline
      socket.broadcast.emit('user-offline', { userId: socket.userId });
    });
  });

  return io;
};

// Helper function to emit message to specific user
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to conversation
const emitToConversation = (io, conversationId, event, data) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};

// Helper function to emit to all admins
const emitToAdmins = (io, event, data) => {
  io.to('admin-room').emit(event, data);
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return userSockets.has(userId);
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToConversation,
  emitToAdmins,
  isUserOnline,
  userSockets,
};
