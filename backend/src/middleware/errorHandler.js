import logger from '../utils/logger.js';
import { errorResponse } from '../utils/helpers.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  const defaultError = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    defaultError.statusCode = 400;
    defaultError.message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    defaultError.statusCode = 400;
    defaultError.message = `${Object.keys(err.keyPattern || {})[0] || 'Field'} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    defaultError.statusCode = 401;
    defaultError.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    defaultError.statusCode = 401;
    defaultError.message = 'Token expired';
  }

  return errorResponse(
    res,
    defaultError.statusCode,
    defaultError.message,
    process.env.NODE_ENV === 'development' ? err.stack : defaultError.message
  );
};

export const notFound = (req, res) => {
  return errorResponse(res, 404, 'Route not found');
};
