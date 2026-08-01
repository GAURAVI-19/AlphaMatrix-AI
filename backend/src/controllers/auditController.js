import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse, getPaginationOptions } from '../utils/helpers.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationOptions(req);
    const { user, action, module, status, startDate, endDate } = req.query;

    const query = {};
    if (user) query.user = user;
    if (action) query.action = action;
    if (module) query.module = module;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email role')
      .sort({ [sortBy]: sortOrder });

    const total = await AuditLog.countDocuments(query);

    return successResponse(res, 200, 'Audit logs retrieved successfully', {
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get audit logs error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch audit logs', error.message);
  }
};

export const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('user', 'name email role');
    if (!log) {
      return errorResponse(res, 404, 'Audit log not found');
    }
    return successResponse(res, 200, 'Audit log retrieved successfully', { log });
  } catch (error) {
    logger.error(`Get audit log error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch audit log', error.message);
  }
};

export const getUserActivityLog = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, skip, sortBy, sortOrder } = getPaginationOptions(req);

    const logs = await AuditLog.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    const total = await AuditLog.countDocuments({ user: userId });

    return successResponse(res, 200, 'User activity logs retrieved', {
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get user activity error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch user activity', error.message);
  }
};

export const getLoginLogs = async (req, res) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationOptions(req);

    const logs = await AuditLog.find({ action: 'LOGIN', status: 'SUCCESS' })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .sort({ [sortBy]: sortOrder });

    const total = await AuditLog.countDocuments({ action: 'LOGIN', status: 'SUCCESS' });

    return successResponse(res, 200, 'Login logs retrieved', {
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get login logs error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch login logs', error.message);
  }
};

export const getAuditStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const totalActions = await AuditLog.countDocuments(dateQuery);
    const successCount = await AuditLog.countDocuments({ ...dateQuery, status: 'SUCCESS' });
    const failureCount = await AuditLog.countDocuments({ ...dateQuery, status: 'FAILURE' });

    const actionBreakdown = await AuditLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const moduleBreakdown = await AuditLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statistics = {
      totalActions,
      successCount,
      failureCount,
      successRate: totalActions > 0 ? Math.round((successCount / totalActions) * 100) : 0,
      actionBreakdown,
      moduleBreakdown
    };

    return successResponse(res, 200, 'Audit statistics retrieved successfully', { statistics });
  } catch (error) {
    logger.error(`Get audit statistics error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch statistics', error.message);
  }
};

export const exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    const csv = [
      ['Date', 'User', 'Action', 'Module', 'Status', 'IP Address', 'Method', 'Resource Path'].join(',')
    ];

    logs.forEach(log => {
      csv.push([
        new Date(log.createdAt).toISOString(),
        log.user?.name || 'Unknown',
        log.action,
        log.module,
        log.status,
        log.ipAddress || '-',
        log.method || '-',
        log.resourcePath || '-'
      ].join(','));
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=audit-logs.csv');
    return res.send(csv.join('\n'));
  } catch (error) {
    logger.error(`Export audit logs error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to export logs', error.message);
  }
};
