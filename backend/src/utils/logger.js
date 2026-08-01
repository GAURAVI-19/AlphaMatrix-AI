import winston from 'winston';
import { requestContextStore } from '../middleware/requestId.js';

// Custom Winston formatter to automatically inject active request context
const contextFormat = winston.format((info) => {
  try {
    const store = requestContextStore ? requestContextStore.getStore() : null;
    if (store) {
      info.requestId = store.requestId || info.requestId;
      info.method = store.method || info.method;
      info.url = store.url || info.url;
    }
  } catch (err) {
    // Avoid interrupting log flow on error
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    contextFormat(), // Apply request ID mapping
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Configure console transports
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    contextFormat(),
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, stack, requestId, method, url }) => {
      const trace = requestId ? ` [ReqID: ${requestId}] [${method} ${url}]` : '';
      const errStack = stack ? `\n${stack}` : '';
      return `${timestamp} ${level}: ${message}${trace}${errStack}`;
    })
  )
}));

export default logger;
