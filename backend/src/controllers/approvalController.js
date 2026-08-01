import Approval from '../models/Approval.js';
import Prediction from '../models/Prediction.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse, getPaginationOptions } from '../utils/helpers.js';
import { emitNotification } from '../utils/socket.js';

export const createApproval = async (req, res) => {
  try {
    const { predictionId, type, description, priority, dueDate, requiredApprovals } = req.body;

    const prediction = await Prediction.findOne({ _id: predictionId, isDeleted: { $ne: true } }).populate('employee');
    if (!prediction) {
      return errorResponse(res, 404, 'Prediction not found');
    }

    const approval = await Approval.create({
      prediction: predictionId,
      employee: prediction.employee._id,
      createdBy: req.user.id,
      type,
      description,
      priority,
      dueDate,
      riskLevel: prediction.riskLevel,
      requiredApprovals: requiredApprovals || 1
    });

    prediction.approval.status = 'PENDING';
    await prediction.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_APPROVAL',
      module: 'APPROVAL',
      entity: { type: 'Approval', id: approval._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`Approval created for prediction ${predictionId}`);
    return successResponse(res, 201, 'Approval request created successfully', { approval });
  } catch (error) {
    logger.error(`Create approval error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to create approval', error.message);
  }
};

export const getApprovals = async (req, res) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationOptions(req);
    const { status, priority } = req.query;

    const query = { isDeleted: { $ne: true } };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const approvals = await Approval.find(query)
      .skip(skip)
      .limit(limit)
      .populate('employee')
      .populate('createdBy', 'name email')
      .populate('approvals.approver', 'name email')
      .sort({ [sortBy]: sortOrder });

    const total = await Approval.countDocuments(query);

    return successResponse(res, 200, 'Approvals retrieved successfully', {
      approvals,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get approvals error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch approvals', error.message);
  }
};

export const getApprovalById = async (req, res) => {
  try {
    const approval = await Approval.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('employee')
      .populate('createdBy', 'name email')
      .populate('approvals.approver', 'name email')
      .populate('comments.author', 'name email');

    if (!approval) {
      return errorResponse(res, 404, 'Approval not found');
    }

    return successResponse(res, 200, 'Approval retrieved successfully', { approval });
  } catch (error) {
    logger.error(`Get approval error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch approval', error.message);
  }
};

export const approveRequest = async (req, res) => {
  try {
    const { id: approvalId } = req.params;
    const { comments } = req.body;

    const approval = await Approval.findOne({ _id: approvalId, isDeleted: { $ne: true } });
    if (!approval) {
      return errorResponse(res, 404, 'Approval not found');
    }

    approval.approvals.push({
      approver: req.user.id,
      status: 'APPROVED',
      comments,
      timestamp: new Date()
    });

    const approvedCount = approval.approvals.filter(a => a.status === 'APPROVED').length;
    if (approvedCount >= approval.requiredApprovals) {
      approval.status = 'APPROVED';

      const prediction = await Prediction.findOne({ _id: approval.prediction, isDeleted: { $ne: true } });
      if (prediction) {
        prediction.approval.status = 'APPROVED';
        prediction.approval.approvedBy = req.user.id;
        prediction.approval.approvalDate = new Date();
        await prediction.save();
      }
    }

    await approval.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'APPROVE_REQUEST',
      module: 'APPROVAL',
      entity: { type: 'Approval', id: approval._id },
      changes: { after: { status: 'APPROVED' } },
      status: 'SUCCESS',
      method: 'PUT'
    });

    // Emit real-time notification
    const employeeName = approval.employee?.userId?.name || approval.employee?.employeeId || 'Employee';
    emitNotification('APPROVAL_ACTION', {
      approvalId: approval._id,
      employeeName,
      status: 'APPROVED',
      type: approval.type
    });

    logger.info(`Approval ${approvalId} approved by ${req.user.id}`);
    return successResponse(res, 200, 'Request approved successfully', { approval });
  } catch (error) {
    logger.error(`Approve request error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to approve request', error.message);
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { id: approvalId } = req.params;
    const { comments } = req.body;

    const approval = await Approval.findOne({ _id: approvalId, isDeleted: { $ne: true } });
    if (!approval) {
      return errorResponse(res, 404, 'Approval not found');
    }

    approval.approvals.push({
      approver: req.user.id,
      status: 'REJECTED',
      comments,
      timestamp: new Date()
    });

    approval.status = 'REJECTED';

    const prediction = await Prediction.findOne({ _id: approval.prediction, isDeleted: { $ne: true } });
    if (prediction) {
      prediction.approval.status = 'REJECTED';
      prediction.approval.approvedBy = req.user.id;
      prediction.approval.approvalDate = new Date();
      prediction.approval.comments = comments;
      await prediction.save();
    }

    await approval.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'REJECT_REQUEST',
      module: 'APPROVAL',
      entity: { type: 'Approval', id: approval._id },
      changes: { after: { status: 'REJECTED', comments } },
      status: 'SUCCESS',
      method: 'PUT'
    });

    // Emit real-time notification
    const employeeName = approval.employee?.userId?.name || approval.employee?.employeeId || 'Employee';
    emitNotification('APPROVAL_ACTION', {
      approvalId: approval._id,
      employeeName,
      status: 'REJECTED',
      type: approval.type
    });

    logger.info(`Approval ${approvalId} rejected by ${req.user.id}`);
    return successResponse(res, 200, 'Request rejected successfully', { approval });
  } catch (error) {
    logger.error(`Reject request error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to reject request', error.message);
  }
};

export const addComment = async (req, res) => {
  try {
    const { id: approvalId } = req.params;
    const { text } = req.body;

    const approval = await Approval.findOneAndUpdate(
      { _id: approvalId, isDeleted: { $ne: true } },
      {
        $push: {
          comments: {
            author: req.user.id,
            text,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    ).populate('comments.author', 'name email');

    if (!approval) {
      return errorResponse(res, 404, 'Approval not found');
    }

    logger.info(`Comment added to approval ${approvalId}`);
    return successResponse(res, 200, 'Comment added successfully', { approval });
  } catch (error) {
    logger.error(`Add comment error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to add comment', error.message);
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find({ status: 'PENDING', isDeleted: { $ne: true } })
      .populate('employee')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1 });

    return successResponse(res, 200, 'Pending approvals retrieved successfully', { approvals });
  } catch (error) {
    logger.error(`Get pending approvals error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch pending approvals', error.message);
  }
};
