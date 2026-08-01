import PIPRecord from '../models/PIPRecord.js';
import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse, getPaginationOptions } from '../utils/helpers.js';

export const createPIP = async (req, res) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
      reason,
      goals,
      manager,
      hr,
      successCriteria,
      supportActions,
      training
    } = req.body;

    const employee = await Employee.findOne({ _id: employeeId, isDeleted: { $ne: true } });
    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    const pip = await PIPRecord.create({
      employee: employeeId,
      startDate,
      endDate,
      reason,
      goals,
      manager,
      hr,
      successCriteria,
      supportActions,
      training,
      status: 'ACTIVE'
    });

    // Update employee status
    employee.status = 'ON_PIP';
    await employee.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_PIP',
      module: 'PIP',
      entity: { type: 'PIPRecord', id: pip._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`PIP created for employee ${employeeId}`);
    return successResponse(res, 201, 'PIP created successfully', { pip });
  } catch (error) {
    logger.error(`Create PIP error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to create PIP', error.message);
  }
};

export const getPIPs = async (req, res) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationOptions(req);
    const { status, employee } = req.query;

    const query = { isDeleted: { $ne: true } };
    if (status) query.status = status;
    if (employee) query.employee = employee;

    const pips = await PIPRecord.find(query)
      .skip(skip)
      .limit(limit)
      .populate('employee')
      .populate('manager', 'name email')
      .populate('hr', 'name email')
      .sort({ [sortBy]: sortOrder });

    const total = await PIPRecord.countDocuments(query);

    return successResponse(res, 200, 'PIPs retrieved successfully', {
      pips,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get PIPs error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch PIPs', error.message);
  }
};

export const getPIPById = async (req, res) => {
  try {
    const pip = await PIPRecord.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('employee')
      .populate('manager', 'name email')
      .populate('hr', 'name email')
      .populate('training');

    if (!pip) {
      return errorResponse(res, 404, 'PIP not found');
    }

    return successResponse(res, 200, 'PIP retrieved successfully', { pip });
  } catch (error) {
    logger.error(`Get PIP error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch PIP', error.message);
  }
};

export const updatePIP = async (req, res) => {
  try {
    const {
      endDate,
      reason,
      goals,
      supportActions,
      training,
      successCriteria
    } = req.body;

    const pip = await PIPRecord.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      {
        endDate,
        reason,
        goals,
        supportActions,
        training,
        successCriteria
      },
      { new: true, runValidators: true }
    );

    if (!pip) {
      return errorResponse(res, 404, 'PIP not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_PIP',
      module: 'PIP',
      entity: { type: 'PIPRecord', id: pip._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`PIP ${req.params.id} updated`);
    return successResponse(res, 200, 'PIP updated successfully', { pip });
  } catch (error) {
    logger.error(`Update PIP error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update PIP', error.message);
  }
};

export const addReview = async (req, res) => {
  try {
    const { id: pipId } = req.params;
    const { reviewDate, performanceScore, comments, status, goalsProgress } = req.body;

    const pip = await PIPRecord.findOneAndUpdate(
      { _id: pipId, isDeleted: { $ne: true } },
      {
        $push: {
          reviewCycle: {
            reviewDate,
            reviewer: req.user.id,
            performanceScore,
            comments,
            status,
            goalsProgress
          }
        }
      },
      { new: true }
    );

    if (!pip) {
      return errorResponse(res, 404, 'PIP not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'ADD_PIP_REVIEW',
      module: 'PIP',
      entity: { type: 'PIPRecord', id: pip._id },
      changes: { after: { performanceScore, status } },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`Review added to PIP ${pipId}`);
    return successResponse(res, 200, 'Review added successfully', { pip });
  } catch (error) {
    logger.error(`Add review error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to add review', error.message);
  }
};

export const completePIP = async (req, res) => {
  try {
    const { id: pipId } = req.params;
    const { result, finalScore, comments } = req.body;

    const pip = await PIPRecord.findOne({ _id: pipId, isDeleted: { $ne: true } });
    if (!pip) {
      return errorResponse(res, 404, 'PIP not found');
    }

    pip.status = 'COMPLETED';
    pip.outcome = {
      result,
      finalDate: new Date(),
      finalScore,
      comments
    };

    await pip.save();

    const employee = await Employee.findOne({ _id: pip.employee, isDeleted: { $ne: true } });
    if (employee) {
      if (result === 'PASS') {
        employee.status = 'ACTIVE';
      } else if (result === 'FAIL') {
        employee.status = 'TERMINATED';
      }
      await employee.save();
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'COMPLETE_PIP',
      module: 'PIP',
      entity: { type: 'PIPRecord', id: pip._id },
      changes: { after: { status: 'COMPLETED', result, finalScore } },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`PIP ${pipId} completed with result ${result}`);
    return successResponse(res, 200, 'PIP completed successfully', { pip });
  } catch (error) {
    logger.error(`Complete PIP error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to complete PIP', error.message);
  }
};

export const getPIPStats = async (req, res) => {
  try {
    const { id: pipId } = req.params;

    const pip = await PIPRecord.findOne({ _id: pipId, isDeleted: { $ne: true } });
    if (!pip) {
      return errorResponse(res, 404, 'PIP not found');
    }

    const achievedGoals = pip.goals.filter(g => g.achieved).length;
    const totalGoals = pip.goals.length;
    const goalAchievementRate = totalGoals > 0
      ? Math.round((achievedGoals / totalGoals) * 100)
      : 0;

    const latestReview = pip.reviewCycle.length > 0
      ? pip.reviewCycle[pip.reviewCycle.length - 1]
      : null;

    const stats = {
      status: pip.status,
      startDate: pip.startDate,
      endDate: pip.endDate,
      daysRemaining: Math.max(0, Math.floor((new Date(pip.endDate) - new Date()) / (1000 * 60 * 60 * 24))),
      goals: {
        total: totalGoals,
        achieved: achievedGoals,
        achievementRate: goalAchievementRate
      },
      reviews: {
        totalReviews: pip.reviewCycle.length,
        latestReviewDate: latestReview?.reviewDate,
        latestPerformanceScore: latestReview?.performanceScore,
        latestStatus: latestReview?.status
      },
      outcome: pip.outcome.result ? {
        result: pip.outcome.result,
        finalDate: pip.outcome.finalDate,
        finalScore: pip.outcome.finalScore
      } : null
    };

    return successResponse(res, 200, 'PIP statistics retrieved successfully', { stats });
  } catch (error) {
    logger.error(`Get PIP stats error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch PIP statistics', error.message);
  }
};

export const updateGoalProgress = async (req, res) => {
  try {
    const { pipId, goalIndex } = req.params;
    const { achieved, currentValue } = req.body;

    const pip = await PIPRecord.findOne({ _id: pipId, isDeleted: { $ne: true } });
    if (!pip || !pip.goals[goalIndex]) {
      return errorResponse(res, 404, 'PIP goal not found');
    }

    pip.goals[goalIndex].achieved = achieved;
    pip.goals[goalIndex].currentValue = currentValue;
    if (achieved) {
      pip.goals[goalIndex].completionDate = new Date();
    }

    await pip.save();

    logger.info(`Goal progress updated for PIP ${pipId}`);
    return successResponse(res, 200, 'Goal progress updated successfully', { pip });
  } catch (error) {
    logger.error(`Update goal progress error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update goal progress', error.message);
  }
};
