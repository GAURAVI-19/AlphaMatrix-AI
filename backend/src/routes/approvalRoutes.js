import express from 'express';
import {
  createApproval,
  getApprovals,
  getApprovalById,
  approveRequest,
  rejectRequest,
  addComment,
  getPendingApprovals
} from '../controllers/approvalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireBranchManager } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireBranchManager, createApproval);
router.get('/', getApprovals);
router.get('/pending', getPendingApprovals);
router.get('/:id', getApprovalById);
router.put('/:id/approve', requireBranchManager, approveRequest);
router.put('/:id/reject', requireBranchManager, rejectRequest);
router.post('/:id/comments', addComment);

export default router;
