import express from 'express';
import {
  getEthicalRules,
  createEthicalRule,
  updateEthicalRule,
  deleteEthicalRule
} from '../controllers/ethicalRuleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireSuperAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// All actions require Super Admin access, except reading (which managers can do)
router.get('/', getEthicalRules);
router.post('/', requireSuperAdmin, createEthicalRule);
router.put('/:id', requireSuperAdmin, updateEthicalRule);
router.delete('/:id', requireSuperAdmin, deleteEthicalRule);

export default router;
