const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    socket.on('join:board', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`${socket.user.name} joined board:${boardId}`);
    });

    socket.on('leave:board', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`${socket.user.name} left board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToBoard = (boardId, event, data) => {
  if (io) {
    io.to(`board:${boardId}`).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToBoard };
