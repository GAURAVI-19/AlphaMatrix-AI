import express from 'express';
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  assignManager,
  getBranchStats
} from '../controllers/branchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireSuperAdmin } from '../middleware/roleMiddleware.js';
import { branchValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireSuperAdmin, branchValidation, validate, createBranch);
router.get('/', getBranches);
router.get('/:id', getBranchById);
router.put('/:id', requireSuperAdmin, branchValidation, validate, updateBranch);
router.delete('/:id', requireSuperAdmin, deleteBranch);
router.put('/:id/assign-manager', requireSuperAdmin, assignManager);
router.get('/:id/stats', getBranchStats);

export default router;
