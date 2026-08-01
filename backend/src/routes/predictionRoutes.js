import express from 'express';
import {
  generatePrediction,
  explainPrediction,
  getPredictions,
  getPredictionById,
  getRiskAlerts,
  addAction,
  updateActionStatus,
  getPredictionHistory,
  getLimeExplanation,
  getDecisionCertificate
} from '../controllers/predictionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireBranchManager } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', requireBranchManager, generatePrediction);
router.get('/history', requireBranchManager, getPredictionHistory);
router.get('/', getPredictions);
router.get('/alerts', getRiskAlerts);
router.get('/:id', getPredictionById);
router.get('/:id/lime', getLimeExplanation);
router.get('/:id/certificate', getDecisionCertificate);
router.post('/:id/explain', explainPrediction);
router.post('/:id/actions', requireBranchManager, addAction);
router.put('/:predictionId/actions/:actionIndex', requireBranchManager, updateActionStatus);

export default router;
