import logger from '../utils/logger.js';
import { errorResponse } from '../utils/helpers.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 401, 'Unauthorized');
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`User ${req.user.id} attempted unauthorized access with role ${req.user.role}`);
        return errorResponse(res, 403, 'Forbidden - Insufficient permissions');
      }

      next();
    } catch (error) {
      logger.error(`Role middleware error: ${error.message}`);
      return errorResponse(res, 500, 'Authorization error', error.message);
    }
  };
};

export const requireSuperAdmin = requireRole('SUPER_ADMIN');
export const requireBranchManager = requireRole('SUPER_ADMIN', 'BRANCH_MANAGER');
export const requireEmployee = requireRole('SUPER_ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE');
