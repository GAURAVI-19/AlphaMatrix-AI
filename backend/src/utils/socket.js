import { Server } from 'socket.io';
import logger from './logger.js';

let io = null;

/**
 * Initialize Socket.io server
 * @param {object} server - HTTP server instance
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Dynamic CORS handled by gateway; allow broad for development/testing
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected to WebSocket: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected from WebSocket: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get active Socket.io server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized.');
  }
  return io;
};

/**
 * Emit dynamic notification event to all connected clients
 * @param {string} type - Notification action type
 * @param {object} data - Dynamic event details payload
 */
export const emitNotification = (type, data) => {
  if (io) {
    const payload = {
      id: `noti-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date(),
      read: false
    };
    io.emit('notification', payload);
    logger.info(`WebSocket notification successfully emitted [Type: ${type}]`);
  } else {
    logger.warn('WebSocket server not initialized. Skipping notification event.');
  }
};
