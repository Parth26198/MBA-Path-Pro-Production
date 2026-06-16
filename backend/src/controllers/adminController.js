import * as adminService from '../services/adminService.js';
import * as collegeService from '../services/collegeService.js';
import { getRecentActivities } from '../services/activityService.js';
import { success } from '../utils/apiResponse.js';

export const dashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    const recentActivities = await getRecentActivities(15);
    success(res, { ...stats, recentActivities });
  } catch (e) {
    next(e);
  }
};

export const students = async (req, res, next) => {
  try {
    success(res, await adminService.getStudents());
  } catch (e) {
    next(e);
  }
};

export const trainers = async (req, res, next) => {
  try {
    success(res, await adminService.getTrainers());
  } catch (e) {
    next(e);
  }
};

export const createTrainer = async (req, res, next) => {
  try {
    success(res, await adminService.createTrainer(req.body, req.userId), 'Trainer created', 201);
  } catch (e) {
    next(e);
  }
};

export const assignTrainer = async (req, res, next) => {
  try {
    await adminService.assignTrainer(req.params.studentId, req.body.trainer_id, req.userId);
    success(res, await adminService.getStudents(), 'Trainer assigned successfully');
  } catch (e) {
    next(e);
  }
};

export const approveCollege = async (req, res, next) => {
  try {
    success(res, await adminService.approveCollege(req.params.id, req.userId, req.body.approved !== false));
  } catch (e) {
    next(e);
  }
};

export const featureCollege = async (req, res, next) => {
  try {
    success(res, await adminService.featureCollege(req.params.id, req.body.featured));
  } catch (e) {
    next(e);
  }
};

export const colleges = async (req, res, next) => {
  try {
    success(res, await collegeService.listColleges({ status: req.query.status || 'all', featured: req.query.featured === 'true' }));
  } catch (e) {
    next(e);
  }
};

export const updateCollege = async (req, res, next) => {
  try {
    success(res, await collegeService.updateCollege(req.params.id, req.body));
  } catch (e) {
    next(e);
  }
};

export const deleteCollege = async (req, res, next) => {
  try {
    await collegeService.deleteCollege(req.params.id);
    success(res, null, 'College deleted');
  } catch (e) {
    next(e);
  }
};

export const updateTrainer = async (req, res, next) => {
  try {
    success(res, await adminService.updateTrainer(req.params.id, req.body, req.userId), 'Trainer updated');
  } catch (e) {
    next(e);
  }
};

export const deleteTrainer = async (req, res, next) => {
  try {
    await adminService.deleteTrainer(req.params.id, req.userId);
    success(res, null, 'Trainer deactivated');
  } catch (e) {
    next(e);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    success(res, await adminService.createStudent(req.body, req.userId), 'Student created', 201);
  } catch (e) {
    next(e);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    success(res, await adminService.updateStudent(req.params.id, req.body, req.userId), 'Student updated');
  } catch (e) {
    next(e);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    await adminService.deleteStudent(req.params.id, req.userId);
    success(res, null, 'Student deactivated');
  } catch (e) {
    next(e);
  }
};

export const auditLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const { rows, total } = await adminService.getAuditLogs({ page, limit });
    success(res, { logs: rows, pagination: { page, limit, total } });
  } catch (e) {
    next(e);
  }
};
