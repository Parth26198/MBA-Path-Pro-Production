import * as studentService from '../services/studentService.js';
import * as applicationService from '../services/applicationService.js';
import * as trainerService from '../services/trainerService.js';
import { success } from '../utils/apiResponse.js';

export const dashboard = async (req, res, next) => {
  try {
    success(res, await studentService.getStudentDashboard(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const applications = async (req, res, next) => {
  try {
    success(res, await applicationService.getApplicationsForStudent(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const availableColleges = async (req, res, next) => {
  try {
    success(res, await applicationService.getAvailableCollegesForStudent(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const applyCollege = async (req, res, next) => {
  try {
    const collegeId = parseInt(req.body.college_id, 10);
    if (!collegeId) {
      const err = new Error('Valid college_id is required');
      err.status = 400;
      throw err;
    }
    success(
      res,
      await applicationService.createApplication(
        req.student.id,
        collegeId,
        req.student.trainer_id,
        req.userId
      ),
      'Application created successfully',
      201
    );
  } catch (e) {
    next(e);
  }
};

export const notifications = async (req, res, next) => {
  try {
    success(res, await studentService.getNotifications(req.userId));
  } catch (e) {
    next(e);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await studentService.markNotificationRead(req.params.id, req.userId);
    success(res, null, 'Marked as read');
  } catch (e) {
    next(e);
  }
};

export const completePreparationTask = async (req, res, next) => {
  try {
    success(
      res,
      await trainerService.studentCompletePreparationTask(req.params.id, req.student.id, req.body.notes),
      'Task marked as completed'
    );
  } catch (e) {
    next(e);
  }
};
