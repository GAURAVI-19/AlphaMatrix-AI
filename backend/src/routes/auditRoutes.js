import express from 'express';
import {
  getAuditLogs,
  getAuditLogById,
  getUserActivityLog,
  getLoginLogs,
  getAuditStatistics,
  exportAuditLogs
} from '../controllers/auditController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireSuperAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireSuperAdmin);

router.get('/', getAuditLogs);
router.get('/export', exportAuditLogs);
router.get('/statistics', getAuditStatistics);
router.get('/login-logs', getLoginLogs);
router.get('/user/:userId', getUserActivityLog);
router.get('/:id', getAuditLogById);

export default router;
