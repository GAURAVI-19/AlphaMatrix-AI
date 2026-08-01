import { validationResult, body } from 'express-validator';
import logger from '../utils/logger.js';
import { errorResponse } from '../utils/helpers.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error: ${JSON.stringify(errors.array())}`);
    const errorMsg = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
    return errorResponse(res, 400, 'Validation failed', errorMsg);
  }
  next();
};

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['SUPER_ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE']).withMessage('Invalid role')
];

export const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('joinDate').isISO8601().withMessage('Please provide a valid join date'),
  body('salary').isNumeric().withMessage('Salary must be a number')
];

export const branchValidation = [
  body('name').trim().notEmpty().withMessage('Branch name is required'),
  body('code').trim().notEmpty().withMessage('Branch code is required'),
  body('location.city').trim().notEmpty().withMessage('Location city is required'),
  body('location.state').trim().notEmpty().withMessage('Location state is required')
];
