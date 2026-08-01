import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import AuditLog from '../models/AuditLog.js';
import { calculatePerformanceScore, calculateAttritionRisk, getPaginationOptions, successResponse, errorResponse } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import { emitNotification } from '../utils/socket.js';

export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      position,
      branch,
      salary,
      joinDate,
      employeeId
    } = req.body;

    // Create user first
    const user = await User.create({
      name,
      email,
      phone,
      department,
      position,
      branch,
      role: 'EMPLOYEE',
      password: 'Temp@123456'
    });

    // Create employee record
    const employee = await Employee.create({
      userId: user._id,
      employeeId: employeeId || `EMP-${Date.now()}`,
      branch,
      department,
      position,
      salary,
      joinDate
    });

    // Add employee to branch
    await Branch.findOneAndUpdate(
      { _id: branch, isDeleted: { $ne: true } },
      { $push: { employees: user._id } }
    );

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_EMPLOYEE',
      module: 'EMPLOYEE',
      entity: { type: 'Employee', id: employee._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'POST'
    });

    // Emit real-time notification
    emitNotification('NEW_EMPLOYEE', {
      employeeId: employee._id,
      name,
      department,
      position
    });

    logger.info(`Employee ${name} created`);
    return successResponse(res, 201, 'Employee created successfully', { employee });
  } catch (error) {
    logger.error(`Create employee error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to create employee', error.message);
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder } = getPaginationOptions(req);
    let { status, branch } = req.query;

    const query = { isDeleted: { $ne: true } };
    if (status) query.status = status;

    // Enforce branch manager boundaries
    if (req.user.role === 'BRANCH_MANAGER') {
      const managerUser = await User.findById(req.user.id);
      if (managerUser && managerUser.branch) {
        branch = managerUser.branch.toString();
      }
    }

    if (branch) query.branch = branch;

    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phone')
      .populate('branch', 'name code')
      .sort({ [sortBy]: sortOrder })
      .lean();

    const total = await Employee.countDocuments(query);

    return successResponse(res, 200, 'Employees retrieved successfully', {
      employees,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get employees error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch employees', error.message);
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('userId', 'name email phone profileImage')
      .populate('branch', 'name code')
      .populate('courses')
      .lean();

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    return successResponse(res, 200, 'Employee retrieved successfully', { employee });
  } catch (error) {
    logger.error(`Get employee error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch employee', error.message);
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { department, position, salary, status, performance, skills, certifications } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      {
        department,
        position,
        salary,
        status,
        skills,
        certifications
      },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    // Recalculate performance score if supplied
    if (performance) {
      const score = calculatePerformanceScore(performance);
      employee.performance.currentScore = score;
      employee.performance.productivity = performance.productivity || employee.performance.productivity;
      employee.performance.attendance = performance.attendance || employee.performance.attendance;
      employee.performance.quality = performance.quality || employee.performance.quality;
      employee.performance.teamwork = performance.teamwork || employee.performance.teamwork;
      employee.performance.initiative = performance.initiative || employee.performance.initiative;
      employee.performance.lastReviewDate = new Date();
      await employee.save();
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_EMPLOYEE',
      module: 'EMPLOYEE',
      entity: { type: 'Employee', id: employee._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`Employee ${employee._id} updated`);
    return successResponse(res, 200, 'Employee updated successfully', { employee });
  } catch (error) {
    logger.error(`Update employee error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update employee', error.message);
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true }
    );

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    // Soft delete associated user
    await User.findByIdAndUpdate(employee.userId, { isDeleted: true });

    // Remove from branch list
    await Branch.findOneAndUpdate(
      { _id: employee.branch, isDeleted: { $ne: true } },
      { $pull: { employees: employee.userId } }
    );

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_EMPLOYEE',
      module: 'EMPLOYEE',
      entity: { type: 'Employee', id: employee._id },
      status: 'SUCCESS',
      method: 'DELETE'
    });

    logger.info(`Employee ${employee._id} soft-deleted`);
    return successResponse(res, 200, 'Employee deleted successfully');
  } catch (error) {
    logger.error(`Delete employee error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to delete employee', error.message);
  }
};

export const assignCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { id: employeeId } = req.params;

    const employee = await Employee.findOneAndUpdate(
      { _id: employeeId, isDeleted: { $ne: true } },
      { $addToSet: { courses: courseId } },
      { new: true }
    ).populate('courses');

    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'ASSIGN_COURSE',
      module: 'EMPLOYEE',
      entity: { type: 'Employee', id: employee._id },
      changes: { after: { courseId } },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`Course assigned to employee ${employeeId}`);
    return successResponse(res, 200, 'Course assigned successfully', { employee });
  } catch (error) {
    logger.error(`Assign course error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to assign course', error.message);
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const { id: employeeId } = req.params;

    const employee = await Employee.findOne({ _id: employeeId, isDeleted: { $ne: true } }).lean();
    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    const stats = {
      performanceScore: employee.performance.currentScore,
      performanceLevel: employee.performance.level,
      attendance: employee.performance.attendance,
      attritionRisk: employee.attritionRisk,
      coursesCompleted: employee.courses.length,
      skillsCount: employee.skills.length,
      certificationsCount: employee.certifications.length,
      projectsCompleted: employee.metrics.projectsCompleted,
      targetsAchievementRate: employee.metrics.targetsSet > 0
        ? Math.round((employee.metrics.targetsAchieved / employee.metrics.targetsSet) * 100)
        : 0
    };

    return successResponse(res, 200, 'Employee statistics fetched successfully', { stats });
  } catch (error) {
    logger.error(`Get employee stats error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch employee statistics', error.message);
  }
};

export const calculatePerformanceMetrics = async (req, res) => {
  try {
    const { id: employeeId } = req.params;
    const { productivity, attendance, quality, teamwork, initiative } = req.body;

    const employee = await Employee.findOne({ _id: employeeId, isDeleted: { $ne: true } });
    if (!employee) {
      return errorResponse(res, 404, 'Employee not found');
    }

    const metrics = { productivity, attendance, quality, teamwork, initiative };
    const score = calculatePerformanceScore(metrics);

    employee.performance.currentScore = score;
    employee.performance.productivity = productivity || 0;
    employee.performance.attendance = attendance || 0;
    employee.performance.quality = quality || 0;
    employee.performance.teamwork = teamwork || 0;
    employee.performance.initiative = initiative || 0;
    employee.performance.lastReviewDate = new Date();

    await employee.save();

    logger.info(`Performance metrics calculated for employee ${employeeId}`);
    return successResponse(res, 200, 'Performance metrics calculated successfully', { performance: employee.performance });
  } catch (error) {
    logger.error(`Calculate metrics error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to calculate metrics', error.message);
  }
};
