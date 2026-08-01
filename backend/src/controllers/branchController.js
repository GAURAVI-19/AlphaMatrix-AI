import Branch from '../models/Branch.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse, getPaginationOptions } from '../utils/helpers.js';

export const createBranch = async (req, res) => {
  try {
    const { name, code, location, manager, contact, metadata } = req.body;

    const branch = await Branch.create({
      name,
      code,
      location,
      manager,
      contact,
      metadata
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_BRANCH',
      module: 'BRANCH',
      entity: { type: 'Branch', id: branch._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`Branch ${name} created`);
    return successResponse(res, 201, 'Branch created successfully', { branch });
  } catch (error) {
    logger.error(`Create branch error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to create branch', error.message);
  }
};

export const getBranches = async (req, res) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder } = getPaginationOptions(req);
    const { status } = req.query;

    const query = { isDeleted: { $ne: true } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const branches = await Branch.find(query)
      .skip(skip)
      .limit(limit)
      .populate('manager', 'name email')
      .sort({ [sortBy]: sortOrder });

    const total = await Branch.countDocuments(query);

    return successResponse(res, 200, 'Branches retrieved successfully', {
      branches,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get branches error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch branches', error.message);
  }
};

export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('manager', 'name email')
      .populate('employees', 'name email position');

    if (!branch) {
      return errorResponse(res, 404, 'Branch not found');
    }

    const employees = await Employee.find({ branch: branch._id, isDeleted: { $ne: true } });
    const avgPerformance = employees.length > 0
      ? employees.reduce((sum, emp) => sum + (emp.performance.currentScore || 0), 0) / employees.length
      : 0;

    const branchObj = {
      ...branch.toObject(),
      statistics: {
        totalEmployees: employees.length,
        averagePerformance: Math.round(avgPerformance),
        activeEmployees: employees.filter(e => e.status === 'ACTIVE').length
      }
    };

    return successResponse(res, 200, 'Branch retrieved successfully', { branch: branchObj });
  } catch (error) {
    logger.error(`Get branch error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch branch', error.message);
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { name, code, location, manager, contact, status, metadata } = req.body;

    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { name, code, location, manager, contact, status, metadata },
      { new: true, runValidators: true }
    ).populate('manager', 'name email');

    if (!branch) {
      return errorResponse(res, 404, 'Branch not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_BRANCH',
      module: 'BRANCH',
      entity: { type: 'Branch', id: branch._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`Branch ${branch.name} updated`);
    return successResponse(res, 200, 'Branch updated successfully', { branch });
  } catch (error) {
    logger.error(`Update branch error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update branch', error.message);
  }
};

export const deleteBranch = async (req, res) => {
  try {
    // Soft delete
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true }
    );

    if (!branch) {
      return errorResponse(res, 404, 'Branch not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_BRANCH',
      module: 'BRANCH',
      entity: { type: 'Branch', id: branch._id },
      status: 'SUCCESS',
      method: 'DELETE'
    });

    logger.info(`Branch ${branch.name} soft-deleted`);
    return successResponse(res, 200, 'Branch deleted successfully');
  } catch (error) {
    logger.error(`Delete branch error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to delete branch', error.message);
  }
};

export const assignManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const { id: branchId } = req.params;

    const manager = await User.findOne({ _id: managerId, isDeleted: { $ne: true } });
    if (!manager || manager.role !== 'BRANCH_MANAGER') {
      return errorResponse(res, 400, 'Invalid manager or insufficient credentials');
    }

    const branch = await Branch.findOneAndUpdate(
      { _id: branchId, isDeleted: { $ne: true } },
      { manager: managerId },
      { new: true }
    ).populate('manager', 'name email');

    if (!branch) {
      return errorResponse(res, 404, 'Branch not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'ASSIGN_MANAGER',
      module: 'BRANCH',
      entity: { type: 'Branch', id: branch._id },
      changes: { after: { manager: managerId } },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`Manager assigned to branch ${branch.name}`);
    return successResponse(res, 200, 'Manager assigned successfully', { branch });
  } catch (error) {
    logger.error(`Assign manager error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to assign manager', error.message);
  }
};

export const getBranchStats = async (req, res) => {
  try {
    const { id: branchId } = req.params;

    const branch = await Branch.findOne({ _id: branchId, isDeleted: { $ne: true } });
    if (!branch) {
      return errorResponse(res, 404, 'Branch not found');
    }

    const employees = await Employee.find({ branch: branchId, isDeleted: { $ne: true } });
    const avgPerformance = employees.length > 0
      ? employees.reduce((sum, emp) => sum + (emp.performance.currentScore || 0), 0) / employees.length
      : 0;

    const attritionRisk = employees.reduce((sum, emp) => sum + (emp.attritionRisk || 0), 0) / Math.max(employees.length, 1);

    const stats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'ACTIVE').length,
      inactiveEmployees: employees.filter(e => e.status === 'INACTIVE').length,
      onPIPEmployees: employees.filter(e => e.status === 'ON_PIP').length,
      averagePerformance: Math.round(avgPerformance),
      averageAttritionRisk: Math.round(attritionRisk),
      highPerformers: employees.filter(e => e.performance.currentScore >= 80).length,
      lowPerformers: employees.filter(e => e.performance.currentScore < 50).length
    };

    return successResponse(res, 200, 'Branch statistics fetched successfully', { stats });
  } catch (error) {
    logger.error(`Get branch stats error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch branch statistics', error.message);
  }
};
