import EthicalRule from '../models/EthicalRule.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse, getPaginationOptions } from '../utils/helpers.js';

export const getEthicalRules = async (req, res) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder } = getPaginationOptions(req);
    const { status, type } = req.query;

    const query = { isDeleted: { $ne: true } };
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const rules = await EthicalRule.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy || 'createdAt']: sortOrder || -1 });

    const total = await EthicalRule.countDocuments(query);

    return successResponse(res, 200, 'Ethical rules retrieved successfully', {
      rules,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get ethical rules error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch ethical rules', error.message);
  }
};

export const createEthicalRule = async (req, res) => {
  try {
    const { name, description, type, ruleType, conditions, thresholds, actions, groups, status, priority } = req.body;

    // Check if name already exists
    const existing = await EthicalRule.findOne({ name, isDeleted: { $ne: true } });
    if (existing) {
      return errorResponse(res, 400, 'An ethical rule with this name already exists');
    }

    const rule = await EthicalRule.create({
      name,
      description,
      type,
      ruleType,
      conditions,
      thresholds,
      actions,
      groups,
      status: status || 'ACTIVE',
      priority: priority || 'MEDIUM',
      createdBy: req.user.id
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_ETHICAL_RULE',
      module: 'ETHICAL_SETTINGS',
      entity: { type: 'EthicalRule', id: rule._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`Ethical rule created: ${name}`);
    return successResponse(res, 201, 'Ethical rule created successfully', { rule });
  } catch (error) {
    logger.error(`Create ethical rule error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to create ethical rule', error.message);
  }
};

export const updateEthicalRule = async (req, res) => {
  try {
    const { name, description, type, ruleType, conditions, thresholds, actions, groups, status, priority } = req.body;

    const rule = await EthicalRule.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { name, description, type, ruleType, conditions, thresholds, actions, groups, status, priority },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return errorResponse(res, 404, 'Ethical rule not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_ETHICAL_RULE',
      module: 'ETHICAL_SETTINGS',
      entity: { type: 'EthicalRule', id: rule._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`Ethical rule updated: ${rule.name}`);
    return successResponse(res, 200, 'Ethical rule updated successfully', { rule });
  } catch (error) {
    logger.error(`Update ethical rule error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update ethical rule', error.message);
  }
};

export const deleteEthicalRule = async (req, res) => {
  try {
    const rule = await EthicalRule.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true }
    );

    if (!rule) {
      return errorResponse(res, 404, 'Ethical rule not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_ETHICAL_RULE',
      module: 'ETHICAL_SETTINGS',
      entity: { type: 'EthicalRule', id: rule._id },
      status: 'SUCCESS',
      method: 'DELETE'
    });

    logger.info(`Ethical rule deleted: ${rule.name}`);
    return successResponse(res, 200, 'Ethical rule deleted successfully');
  } catch (error) {
    logger.error(`Delete ethical rule error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to delete ethical rule', error.message);
  }
};
