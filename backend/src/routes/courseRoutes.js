import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollEmployee,
  updateEnrollmentStatus,
  getCourseStats
} from '../controllers/courseController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireBranchManager } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireBranchManager, createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.put('/:id', requireBranchManager, updateCourse);
router.delete('/:id', requireBranchManager, deleteCourse);
router.post('/:id/enroll', requireBranchManager, enrollEmployee);
router.put('/:courseId/enrollment/:enrollmentIndex', requireBranchManager, updateEnrollmentStatus);
router.get('/:id/stats', getCourseStats);

export default router;
