import express from 'express';
import {
  createPIP,
  getPIPs,
  getPIPById,
  updatePIP,
  addReview,
  completePIP,
  getPIPStats,
  updateGoalProgress
} from '../controllers/pipController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireBranchManager } from '../middleware/roleMiddleware.js';

const router = express.Router(); // express router

router.use(authMiddleware);

router.post('/', requireBranchManager, createPIP);
router.get('/', getPIPs);
router.get('/:id', getPIPById);
router.put('/:id', requireBranchManager, updatePIP);
router.post('/:id/reviews', requireBranchManager, addReview);
router.post('/:id/complete', requireBranchManager, completePIP);
router.get('/:id/stats', getPIPStats);
router.put('/:pipId/goals/:goalIndex', requireBranchManager, updateGoalProgress);

export default router;
