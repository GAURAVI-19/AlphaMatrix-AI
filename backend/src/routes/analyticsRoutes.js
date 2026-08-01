import express from 'express';
import {
  getDashboardStats,
  getPerformanceAnalytics,
  getAttritionAnalytics,
  getBranchComparison,
  getLearningAnalytics,
  getPIPAnalytics,
  getPredictionAnalytics
} from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/performance', getPerformanceAnalytics);
router.get('/attrition', getAttritionAnalytics);
router.get('/branches-comparison', getBranchComparison);
router.get('/learning', getLearningAnalytics);
router.get('/pip', getPIPAnalytics);
router.get('/predictions', getPredictionAnalytics);

export default router;
