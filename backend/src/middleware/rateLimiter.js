import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/helpers.js';

export const roleBasedRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: (req) => {
    // If authMiddleware was called and req.user exists, set custom limits
    if (req.user) {
      if (req.user.role === 'SUPER_ADMIN') return 1000;
      if (req.user.role === 'BRANCH_MANAGER') return 500;
      if (req.user.role === 'EMPLOYEE') return 200;
    }
    return 100; // Default anonymous limit
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res, next, options) => {
    return errorResponse(res, 429, options.message);
  }
});
