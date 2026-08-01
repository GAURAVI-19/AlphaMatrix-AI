import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, position } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return errorResponse(res, 400, 'Email already exists');
    }

    user = await User.create({
      name,
      email,
      password,
      role: role || 'EMPLOYEE',
      phone,
      department,
      position
    });

    await AuditLog.create({
      user: user._id,
      action: 'REGISTER',
      module: 'AUTH',
      entity: { type: 'User', id: user._id },
      status: 'SUCCESS',
      method: 'POST'
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    user.refreshTokens.push(refreshToken);
    await user.save();

    logger.info(`User ${email} registered successfully`);

    return successResponse(res, 201, 'User registered successfully', {
      accessToken,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return errorResponse(res, 500, 'Registration failed', error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return errorResponse(res, 429, 'Account temporarily locked. Try again later');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return errorResponse(res, 401, 'Invalid credentials');
    }

    user.loginAttempts = 0;
    user.lockedUntil = null;
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    user.refreshTokens.push(refreshToken);
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      module: 'AUTH',
      entity: { type: 'User', id: user._id },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`User ${email} logged in successfully`);

    return successResponse(res, 200, 'Login successful', {
      accessToken,
      refreshToken,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return errorResponse(res, 500, 'Login failed', error.message);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return errorResponse(res, 400, 'Refresh token required');
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return errorResponse(res, 401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'User not found');
    }

    // Refresh Token Rotation (RTR) check
    if (!user.refreshTokens.includes(token)) {
      // Replay attack / Reuse detection!
      user.refreshTokens = []; // Clear all tokens
      await user.save();
      logger.error(`⚠️ Security Alert: Refresh token reuse detected for user ${user.email}. All sessions cleared.`);
      return errorResponse(res, 403, 'Compromise warning - sessions revoked');
    }

    // Rotate current token
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return successResponse(res, 200, 'Token refreshed', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    return errorResponse(res, 500, 'Token refresh failed', error.message);
  }
};

export const logout = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Optional: remove current refresh token from DB if supplied
    const user = await User.findById(req.user.id);
    if (user && token) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
      await user.save();
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'LOGOUT',
      module: 'AUTH',
      entity: { type: 'User', id: req.user.id },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`User ${req.user.id} logged out`);
    return successResponse(res, 200, 'Logout successful');
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return errorResponse(res, 500, 'Logout failed', error.message);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    return successResponse(res, 200, 'Current user profile', { user: user.toJSON() });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch user', error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, position, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, department, position, profileImage },
      { new: true, runValidators: true }
    );

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_PROFILE',
      module: 'AUTH',
      entity: { type: 'User', id: user._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'PUT'
    });

    return successResponse(res, 200, 'Profile updated successfully', { user: user.toJSON() });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    return errorResponse(res, 500, 'Profile update failed', error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'CHANGE_PASSWORD',
      module: 'AUTH',
      entity: { type: 'User', id: user._id },
      status: 'SUCCESS',
      method: 'PUT'
    });

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    return errorResponse(res, 500, 'Password change failed', error.message);
  }
};
