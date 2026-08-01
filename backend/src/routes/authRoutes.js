import express from 'express';
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { loginValidation, registerValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

export default router;
