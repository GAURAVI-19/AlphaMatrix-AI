import dotenv from 'dotenv';
// Load environment variables before validation
dotenv.config();

// Run schema compiler checks
import './src/config/envValidation.js';

import app from './src/app.js';
import connectDB from './src/config/database.js';
import logger from './src/utils/logger.js';
import { initSocket } from './src/utils/socket.js';

const PORT = process.env.PORT || 5000;

// Establish secure DB session
connectDB();

// Initiate HTTP listener
const server = app.listen(PORT, () => {
  logger.info(`Server initialized successfully on port ${PORT}`);
  console.log(`🚀 [AlphaMatrix Backend] running at: http://localhost:${PORT}`);
  console.log(`📄 [OpenAPI Swagger Docs] served at: http://localhost:${PORT}/api/docs`);
  console.log(`💓 [API Health Check] live at: http://localhost:${PORT}/health`);
});

// Initialize Socket.io integration
initSocket(server);

// Capture unexpected promises rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed. Exiting process with code 1.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Capture uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception thrown: ${err.message}`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed. Exiting process with code 1.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle termination signals gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Commencing graceful termination.');
  if (server) {
    server.close(() => {
      logger.info('HTTP server terminated successfully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
