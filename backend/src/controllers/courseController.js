import Course from '../models/Course.js';
import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import { successResponse, errorResponse, getPaginationOptions } from '../utils/helpers.js';

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      duration,
      provider,
      instructor,
      skills,
      startDate,
      endDate,
      capacity,
      type,
      costPerStudent,
      certification
    } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      level,
      duration,
      provider,
      instructor,
      skills,
      startDate,
      endDate,
      capacity,
      type,
      costPerStudent,
      certification,
      status: 'DRAFT'
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_COURSE',
      module: 'COURSE',
      entity: { type: 'Course', id: course._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`Course ${title} created`);
    return successResponse(res, 201, 'Course created successfully', { course });
  } catch (error) {
    logger.error(`Create course error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to create course', error.message);
  }
};

export const getCourses = async (req, res) => {
  try {
    const { page, limit, skip, search, sortBy, sortOrder } = getPaginationOptions(req);
    const { status, category } = req.query;

    const query = { isDeleted: { $ne: true } };
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .skip(skip)
      .limit(limit)
      .populate('instructor.id', 'name email')
      .sort({ [sortBy]: sortOrder });

    const total = await Course.countDocuments(query);

    return successResponse(res, 200, 'Courses retrieved successfully', {
      courses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    logger.error(`Get courses error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch courses', error.message);
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('instructor.id', 'name email')
      .populate('enrolledStudents.student');

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    return successResponse(res, 200, 'Course retrieved successfully', { course });
  } catch (error) {
    logger.error(`Get course error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch course', error.message);
  }
};

export const updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      duration,
      provider,
      instructor,
      skills,
      startDate,
      endDate,
      capacity,
      status,
      type,
      costPerStudent,
      certification
    } = req.body;

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      {
        title,
        description,
        category,
        level,
        duration,
        provider,
        instructor,
        skills,
        startDate,
        endDate,
        capacity,
        status,
        type,
        costPerStudent,
        certification
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_COURSE',
      module: 'COURSE',
      entity: { type: 'Course', id: course._id },
      changes: { after: req.body },
      status: 'SUCCESS',
      method: 'PUT'
    });

    logger.info(`Course ${course.title} updated`);
    return successResponse(res, 200, 'Course updated successfully', { course });
  } catch (error) {
    logger.error(`Update course error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update course', error.message);
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true }
    );

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_COURSE',
      module: 'COURSE',
      entity: { type: 'Course', id: course._id },
      status: 'SUCCESS',
      method: 'DELETE'
    });

    logger.info(`Course ${course.title} soft-deleted`);
    return successResponse(res, 200, 'Course deleted successfully');
  } catch (error) {
    logger.error(`Delete course error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to delete course', error.message);
  }
};

export const enrollEmployee = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { employeeId } = req.body;

    const course = await Course.findOne({ _id: courseId, isDeleted: { $ne: true } });
    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    if (course.enrolledStudents.length >= course.capacity) {
      return errorResponse(res, 400, 'Course is full');
    }

    const alreadyEnrolled = course.enrolledStudents.some(
      s => s.student.toString() === employeeId
    );
    if (alreadyEnrolled) {
      return errorResponse(res, 400, 'Employee already enrolled');
    }

    course.enrolledStudents.push({
      student: employeeId,
      enrollmentDate: new Date(),
      status: 'ASSIGNED'
    });

    await course.save();

    await Employee.findOneAndUpdate(
      { _id: employeeId, isDeleted: { $ne: true } },
      { $addToSet: { courses: courseId } }
    );

    await AuditLog.create({
      user: req.user.id,
      action: 'ENROLL_EMPLOYEE_COURSE',
      module: 'COURSE',
      entity: { type: 'Course', id: course._id },
      changes: { after: { employeeId } },
      status: 'SUCCESS',
      method: 'POST'
    });

    logger.info(`Employee ${employeeId} enrolled in course ${courseId}`);
    return successResponse(res, 200, 'Employee enrolled successfully', { course });
  } catch (error) {
    logger.error(`Enroll employee error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to enroll employee', error.message);
  }
};

export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { courseId, enrollmentIndex } = req.params;
    const { status, progressPercentage, score } = req.body;

    const course = await Course.findOne({ _id: courseId, isDeleted: { $ne: true } });
    if (!course || !course.enrolledStudents[enrollmentIndex]) {
      return errorResponse(res, 404, 'Enrollment not found');
    }

    course.enrolledStudents[enrollmentIndex].status = status;
    course.enrolledStudents[enrollmentIndex].progressPercentage = progressPercentage;
    if (score !== undefined) {
      course.enrolledStudents[enrollmentIndex].score = score;
    }
    if (status === 'COMPLETED') {
      course.enrolledStudents[enrollmentIndex].completionDate = new Date();
    }

    await course.save();

    logger.info(`Enrollment status updated for course ${courseId}`);
    return successResponse(res, 200, 'Enrollment status updated successfully', { course });
  } catch (error) {
    logger.error(`Update enrollment error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to update enrollment status', error.message);
  }
};

export const getCourseStats = async (req, res) => {
  try {
    const { id: courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, isDeleted: { $ne: true } });
    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    const totalEnrolled = course.enrolledStudents.length;
    const completed = course.enrolledStudents.filter(e => e.status === 'COMPLETED').length;
    const inProgress = course.enrolledStudents.filter(e => e.status === 'IN_PROGRESS').length;
    const scoredStudents = course.enrolledStudents.filter(e => e.score !== undefined);
    const avgScore = scoredStudents.length > 0
      ? (scoredStudents.reduce((sum, e) => sum + e.score, 0) / scoredStudents.length).toFixed(2)
      : 0;

    const stats = {
      totalEnrolled,
      completed,
      inProgress,
      completionRate: totalEnrolled > 0 ? Math.round((completed / totalEnrolled) * 100) : 0,
      averageScore: parseFloat(avgScore),
      capacity: course.capacity,
      availableSeats: course.capacity - totalEnrolled,
      rating: course.rating.average
    };

    return successResponse(res, 200, 'Course statistics retrieved successfully', { stats });
  } catch (error) {
    logger.error(`Get course stats error: ${error.message}`);
    return errorResponse(res, 500, 'Failed to fetch course statistics', error.message);
  }
};
