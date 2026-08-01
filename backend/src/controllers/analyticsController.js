import Branch from '../models/Branch.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Prediction from '../models/Prediction.js';
import Course from '../models/Course.js';
import PIPRecord from '../models/PIPRecord.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/helpers.js';
import cache from '../config/redis.js';

const CACHE_TTL = 300; // 5 minutes in seconds

export const getDashboardStats = async (req, res) => {
  try {
    const isManager = req.user.role === 'BRANCH_MANAGER';
    const isEmployee = req.user.role === 'EMPLOYEE';

    let userObj = null;
    if (isManager || isEmployee) {
      userObj = await User.findById(req.user.id);
    }

    let cacheKey = `analytics:dashboard_stats:${req.user.role}`;
    if (isEmployee) {
      cacheKey += `:${req.user.id}`;
    } else if (isManager && userObj?.branch) {
      cacheKey += `:${userObj.branch}`;
    }

    const bypassCache = req.query.bypassCache === 'true';
    const cached = bypassCache ? null : await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 200, 'Dashboard statistics fetched from cache', { stats: cached });
    }

    let stats = {};

    if (isEmployee) {
      // Fetch employee specific profile and metrics
      const employee = await Employee.findOne({ userId: req.user.id, isDeleted: { $ne: true } })
        .populate('courses')
        .populate('branch', 'name code');

      if (!employee) {
        return errorResponse(res, 404, 'Employee profile not found');
      }

      // Fetch active PIP
      const activePIP = await PIPRecord.findOne({ employee: employee._id, status: 'ACTIVE', isDeleted: { $ne: true } });

      stats = {
        role: 'EMPLOYEE',
        name: userObj.name,
        employeeId: employee.employeeId,
        department: employee.department,
        position: employee.position,
        salary: employee.salary,
        branchName: employee.branch?.name || 'N/A',
        performance: {
          currentScore: employee.performance?.currentScore || 0,
          attendance: employee.performance?.attendance || 0,
          productivity: employee.performance?.productivity || 0,
          quality: employee.performance?.quality || 0,
          teamwork: employee.performance?.teamwork || 0,
          initiative: employee.performance?.initiative || 0,
        },
        metrics: {
          projectsCompleted: employee.metrics?.projectsCompleted || 0,
          targetsAchieved: employee.metrics?.targetsAchieved || 0,
          targetsSet: employee.metrics?.targetsSet || 0,
        },
        attritionRisk: employee.attritionRisk || 0,
        courses: employee.courses || [],
        activePIPRecord: activePIP || null
      };
    } else if (isManager) {
      const branchId = userObj?.branch;
      if (!branchId) {
        return errorResponse(res, 400, 'Manager has no branch assigned');
      }

      const totalEmployees = await Employee.countDocuments({ branch: branchId, status: 'ACTIVE', isDeleted: { $ne: true } });
      const employees = await Employee.find({ branch: branchId, status: 'ACTIVE', isDeleted: { $ne: true } });

      const avgPerformance = employees.length > 0
        ? Math.round(employees.reduce((sum, e) => sum + (e.performance.currentScore || 0), 0) / employees.length)
        : 0;

      const avgAttritionRisk = employees.length > 0
        ? Math.round(employees.reduce((sum, e) => sum + (e.attritionRisk || 0), 0) / employees.length)
        : 0;

      const branchEmployees = employees.map(e => e._id);
      const pendingCount = await Prediction.countDocuments({
        employee: { $in: branchEmployees },
        'approval.status': 'PENDING',
        isDeleted: { $ne: true }
      });

      const highRiskCount = await Prediction.countDocuments({
        employee: { $in: branchEmployees },
        status: 'ACTIVE',
        riskLevel: { $in: ['HIGH', 'CRITICAL'] },
        isDeleted: { $ne: true }
      });

      const activePIPs = await PIPRecord.countDocuments({
        employee: { $in: branchEmployees },
        status: 'ACTIVE',
        isDeleted: { $ne: true }
      });

      const branchObj = await Branch.findById(branchId);

      stats = {
        role: 'BRANCH_MANAGER',
        branchName: branchObj?.name || 'My Branch',
        totalEmployees,
        averagePerformance: avgPerformance,
        averageAttritionRisk: avgAttritionRisk,
        pendingPredictions: pendingCount,
        highRiskPredictions: highRiskCount,
        activePIPs
      };
    } else {
      // SUPER_ADMIN global metrics
      const totalBranches = await Branch.countDocuments({ status: 'ACTIVE', isDeleted: { $ne: true } });
      const totalEmployees = await Employee.countDocuments({ status: 'ACTIVE', isDeleted: { $ne: true } });
      const totalManagers = await User.countDocuments({ role: 'BRANCH_MANAGER', status: 'ACTIVE', isDeleted: { $ne: true } });

      const employees = await Employee.find({ status: 'ACTIVE', isDeleted: { $ne: true } });
      const avgPerformance = employees.length > 0
        ? Math.round(employees.reduce((sum, e) => sum + (e.performance.currentScore || 0), 0) / employees.length)
        : 0;

      const avgAttritionRisk = employees.length > 0
        ? Math.round(employees.reduce((sum, e) => sum + (e.attritionRisk || 0), 0) / employees.length)
        : 0;

      const pendingPredictions = await Prediction.countDocuments({ 'approval.status': 'PENDING', isDeleted: { $ne: true } });
      const highRiskPredictions = await Prediction.countDocuments({
        status: 'ACTIVE',
        riskLevel: { $in: ['HIGH', 'CRITICAL'] },
        isDeleted: { $ne: true }
      });

      const coursesInProgress = await Course.countDocuments({ status: 'ACTIVE', isDeleted: { $ne: true } });
      const activePIPs = await PIPRecord.countDocuments({ status: 'ACTIVE', isDeleted: { $ne: true } });

      stats = {
        role: 'SUPER_ADMIN',
        totalBranches,
        totalEmployees,
        totalManagers,
        averagePerformance: avgPerformance,
        averageAttritionRisk: avgAttritionRisk,
        pendingPredictions,
        highRiskPredictions,
        coursesInProgress,
        activePIPs
      };
    }

    await cache.set(cacheKey, stats, CACHE_TTL);
    return successResponse(res, 200, 'Dashboard statistics fetched successfully', { stats });
  } catch (error) {
    logger.error(`Get dashboard stats error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch dashboard stats', error.message);
  }
};

export const getPerformanceAnalytics = async (req, res) => {
  try {
    let { branch } = req.query;

    // Enforce branch boundaries for branch managers
    if (req.user.role === 'BRANCH_MANAGER') {
      const managerUser = await User.findById(req.user.id);
      if (managerUser && managerUser.branch) {
        branch = managerUser.branch.toString();
      } else {
        return errorResponse(res, 400, 'Branch manager has no branch assigned');
      }
    }

    const cacheKey = `analytics:performance_analytics_${branch || 'all'}`;
    const bypassCache = req.query.bypassCache === 'true';
    const cached = bypassCache ? null : await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 200, 'Performance analytics fetched from cache', { analytics: cached });
    }

    const query = { status: 'ACTIVE', isDeleted: { $ne: true } };
    if (branch) query.branch = branch;

    const employees = await Employee.find(query);

    const excellent = employees.filter(e => e.performance.currentScore >= 90).length;
    const good = employees.filter(e => e.performance.currentScore >= 75 && e.performance.currentScore < 90).length;
    const average = employees.filter(e => e.performance.currentScore >= 60 && e.performance.currentScore < 75).length;
    const belowAvg = employees.filter(e => e.performance.currentScore >= 45 && e.performance.currentScore < 60).length;
    const poor = employees.filter(e => e.performance.currentScore < 45).length;

    const avgAttendance = employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + (e.performance.attendance || 0), 0) / employees.length)
      : 0;

    const avgProductivity = employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + (e.performance.productivity || 0), 0) / employees.length)
      : 0;

    const avgQuality = employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + (e.performance.quality || 0), 0) / employees.length)
      : 0;

    const avgTeamwork = employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + (e.performance.teamwork || 0), 0) / employees.length)
      : 0;

    const analytics = {
      distribution: {
        excellent,
        good,
        average,
        belowAverage: belowAvg,
        poor
      },
      metrics: {
        attendance: avgAttendance,
        productivity: avgProductivity,
        quality: avgQuality,
        teamwork: avgTeamwork
      }
    };

    await cache.set(cacheKey, analytics, CACHE_TTL);
    return successResponse(res, 200, 'Performance analytics fetched successfully', { analytics });
  } catch (error) {
    logger.error(`Get performance analytics error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch performance analytics', error.message);
  }
};

export const getAttritionAnalytics = async (req, res) => {
  try {
    let { branch } = req.query;

    // Enforce branch boundaries for branch managers
    if (req.user.role === 'BRANCH_MANAGER') {
      const managerUser = await User.findById(req.user.id);
      if (managerUser && managerUser.branch) {
        branch = managerUser.branch.toString();
      } else {
        return errorResponse(res, 400, 'Branch manager has no branch assigned');
      }
    }

    const cacheKey = `analytics:attrition_analytics_${branch || 'all'}`;
    const bypassCache = req.query.bypassCache === 'true';
    const cached = bypassCache ? null : await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 200, 'Attrition analytics fetched from cache', { analytics: cached });
    }

    const query = { status: 'ACTIVE', isDeleted: { $ne: true } };
    if (branch) query.branch = branch;

    const employees = await Employee.find(query);

    const criticalRisk = employees.filter(e => e.attritionRisk >= 80).length;
    const highRisk = employees.filter(e => e.attritionRisk >= 60 && e.attritionRisk < 80).length;
    const mediumRisk = employees.filter(e => e.attritionRisk >= 40 && e.attritionRisk < 60).length;
    const lowRisk = employees.filter(e => e.attritionRisk < 40).length;

    const avgRisk = employees.length > 0
      ? Math.round(employees.reduce((sum, e) => sum + (e.attritionRisk || 0), 0) / employees.length)
      : 0;

    const analytics = {
      distribution: {
        criticalRisk,
        highRisk,
        mediumRisk,
        lowRisk
      },
      averageRisk: avgRisk,
      employeesAtRisk: criticalRisk + highRisk
    };

    await cache.set(cacheKey, analytics, CACHE_TTL);
    return successResponse(res, 200, 'Attrition analytics fetched successfully', { analytics });
  } catch (error) {
    logger.error(`Get attrition analytics error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch attrition analytics', error.message);
  }
};

export const getBranchComparison = async (req, res) => {
  try {
    const cacheKey = 'analytics:branch_comparison';
    const cached = await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 200, 'Branch comparison fetched from cache', { comparison: cached });
    }

    const branches = await Branch.find({ status: 'ACTIVE', isDeleted: { $ne: true } });

    const comparison = await Promise.all(
      branches.map(async (branch) => {
        const employees = await Employee.find({ branch: branch._id, isDeleted: { $ne: true } });
        const avgPerformance = employees.length > 0
          ? Math.round(employees.reduce((sum, e) => sum + (e.performance.currentScore || 0), 0) / employees.length)
          : 0;

        const avgAttrition = employees.length > 0
          ? Math.round(employees.reduce((sum, e) => sum + (e.attritionRisk || 0), 0) / employees.length)
          : 0;

        return {
          branchId: branch._id,
          branchName: branch.name,
          totalEmployees: employees.length,
          averagePerformance: avgPerformance,
          averageAttrition: avgAttrition
        };
      })
    );

    await cache.set(cacheKey, comparison, CACHE_TTL);
    return successResponse(res, 200, 'Branch comparison fetched successfully', { comparison });
  } catch (error) {
    logger.error(`Get branch comparison error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch branch comparison', error.message);
  }
};

export const getLearningAnalytics = async (req, res) => {
  try {
    const cacheKey = 'analytics:learning_analytics';
    const cached = await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 200, 'Learning analytics fetched from cache', { analytics: cached });
    }

    const courses = await Course.find({ status: 'ACTIVE', isDeleted: { $ne: true } });

    const completedCourses = courses.filter(c =>
      c.enrolledStudents.some(s => s.status === 'COMPLETED')
    ).length;

    const totalEnrollments = courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
    const completedEnrollments = courses.reduce((sum, c) =>
      sum + c.enrolledStudents.filter(s => s.status === 'COMPLETED').length, 0
    );

    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    const avgRating = courses.length > 0
      ? (courses.reduce((sum, c) => sum + c.rating.average, 0) / courses.length).toFixed(2)
      : 0;

    const analytics = {
      totalCourses: courses.length,
      completedCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate,
      averageRating: parseFloat(avgRating)
    };

    await cache.set(cacheKey, analytics, CACHE_TTL);
    return successResponse(res, 200, 'Learning analytics fetched successfully', { analytics });
  } catch (error) {
    logger.error(`Get learning analytics error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch learning analytics', error.message);
  }
};

export const getPIPAnalytics = async (req, res) => {
  try {
    const cacheKey = 'analytics:pip_analytics';
    const cached = await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 200, 'PIP analytics fetched from cache', { analytics: cached });
    }

    const pipRecords = await PIPRecord.find({ isDeleted: { $ne: true } });

    const activePIPs = pipRecords.filter(p => p.status === 'ACTIVE').length;
    const completedPIPs = pipRecords.filter(p => p.status === 'COMPLETED').length;
    const terminatedPIPs = pipRecords.filter(p => p.status === 'TERMINATED').length;

    const successRate = completedPIPs + terminatedPIPs > 0
      ? Math.round((completedPIPs / (completedPIPs + terminatedPIPs)) * 100)
      : 0;

    const analytics = {
      activePIPs,
      completedPIPs,
      terminatedPIPs,
      totalPIPs: pipRecords.length,
      successRate
    };

    await cache.set(cacheKey, analytics, CACHE_TTL);
    return successResponse(res, 200, 'PIP analytics fetched successfully', { analytics });
  } catch (error) {
    logger.error(`Get PIP analytics error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch PIP analytics', error.message);
  }
};

export const getPredictionAnalytics = async (req, res) => {
  try {
    const cacheKey = 'analytics:prediction_analytics';
    const cached = await cache.get(cacheKey);
    if (cached) {
      return successResponse(res, 200, 'Prediction analytics fetched from cache', { analytics: cached });
    }

    const predictions = await Prediction.find({ isDeleted: { $ne: true } });

    const byType = {};
    predictions.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + 1;
    });

    const byRiskLevel = {
      LOW: predictions.filter(p => p.riskLevel === 'LOW').length,
      MEDIUM: predictions.filter(p => p.riskLevel === 'MEDIUM').length,
      HIGH: predictions.filter(p => p.riskLevel === 'HIGH').length,
      CRITICAL: predictions.filter(p => p.riskLevel === 'CRITICAL').length
    };

    const avgConfidence = predictions.length > 0
      ? (predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length).toFixed(2)
      : 0;

    const analytics = {
      totalPredictions: predictions.length,
      byType,
      byRiskLevel,
      averageConfidence: parseFloat(avgConfidence)
    };

    await cache.set(cacheKey, analytics, CACHE_TTL);
    return successResponse(res, 200, 'Prediction analytics fetched successfully', { analytics });
  } catch (error) {
    logger.error(`Get prediction analytics error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch prediction analytics', error.message);
  }
};
