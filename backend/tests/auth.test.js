import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import AuditLog from '../src/models/AuditLog.js';
import { jest } from '@jest/globals';

// Mock the Winston logger to prevent polluting test output
jest.unmock('../src/utils/logger.js');
jest.mock('../src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock User & AuditLog Models to prevent live DB calls and buffering timeouts
jest.mock('../src/models/User.js');
jest.mock('../src/models/AuditLog.js');

describe('Authentication Flow Integration Tests', () => {
  const validMockId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default AuditLog.create mock to resolve immediately
    AuditLog.create = jest.fn().mockResolvedValue({ _id: validMockId });
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user with valid details', async () => {
      const mockUserData = {
        name: 'John Doe',
        email: 'john@alphamatrix.com',
        phone: '1234567890',
        department: 'Engineering',
        position: 'Software Developer',
        role: 'EMPLOYEE',
        password: 'SecurePassword123'
      };

      // Mock User.findOne to resolve to null (no email conflict)
      User.findOne = jest.fn().mockResolvedValue(null);

      // Mock user creation with toJSON support
      User.create = jest.fn().mockResolvedValue({
        _id: validMockId,
        ...mockUserData,
        password: 'hashedPassword',
        refreshTokens: [],
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          _id: validMockId,
          name: 'John Doe',
          email: 'john@alphamatrix.com',
          role: 'EMPLOYEE'
        })
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUserData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user._id).toBe(validMockId);
    });

    it('should fail registration when email already exists', async () => {
      const mockUserData = {
        name: 'John Doe',
        email: 'john@alphamatrix.com',
        phone: '1234567890',
        department: 'Engineering',
        position: 'Software Developer',
        role: 'EMPLOYEE',
        password: 'SecurePassword123'
      };

      // Mock user found check (resolves to existing user)
      User.findOne = jest.fn().mockResolvedValue({ email: 'john@alphamatrix.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(mockUserData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return secure tokens', async () => {
      const mockCredentials = {
        email: 'john@alphamatrix.com',
        password: 'SecurePassword123'
      };

      const mockUser = {
        _id: validMockId,
        name: 'John Doe',
        email: 'john@alphamatrix.com',
        role: 'EMPLOYEE',
        refreshTokens: [],
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          _id: validMockId,
          name: 'John Doe',
          email: 'john@alphamatrix.com',
          role: 'EMPLOYEE'
        })
      };

      // Mock login query chain: User.findOne().select()
      User.findOne = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));

      const response = await request(app)
        .post('/api/auth/login')
        .send(mockCredentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });
  });
});
