import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  assignCourse,
  getEmployeeStats,
  calculatePerformanceMetrics
} from '../controllers/employeeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireBranchManager } from '../middleware/roleMiddleware.js';
import { employeeValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireBranchManager, employeeValidation, validate, createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', requireBranchManager, updateEmployee);
router.delete('/:id', requireBranchManager, deleteEmployee);
router.post('/:id/courses', requireBranchManager, assignCourse);
router.get('/:id/stats', getEmployeeStats);
router.post('/:id/performance-metrics', requireBranchManager, calculatePerformanceMetrics);

export default router;
