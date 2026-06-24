import * as studentService from '../services/studentService.js';
import * as applicationService from '../services/applicationService.js';
import * as trainerService from '../services/trainerService.js';
import * as savedUniversityService from '../services/savedUniversityService.js';
import * as recommendationService from '../services/recommendationService.js';
import { success } from '../utils/apiResponse.js';

export const dashboard = async (req, res, next) => {
  try {
    success(res, await studentService.getStudentDashboard(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const packages = async (req, res, next) => {
  try {
    success(res, await studentService.listStudentPackages());
  } catch (e) {
    next(e);
  }
};

export const subscription = async (req, res, next) => {
  try {
    success(res, await studentService.getStudentSubscription(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const profile = async (req, res, next) => {
  try {
    success(res, await studentService.getStudentProfile(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    success(res, await studentService.updateStudentProfile(req.student.id, req.userId, req.body), 'Profile updated');
  } catch (e) {
    next(e);
  }
};

export const universities = async (req, res, next) => {
  try {
    success(res, await studentService.listStudentUniversities(req.student.id, req.query));
  } catch (e) {
    next(e);
  }
};

export const universityDetail = async (req, res, next) => {
  try {
    success(res, await studentService.getUniversityDetail(req.student.id, req.params.slug));
  } catch (e) {
    next(e);
  }
};

export const compareUniversities = async (req, res, next) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map((id) => parseInt(id, 10))
      .filter(Boolean);
    if (ids.length < 2) {
      const err = new Error('At least 2 university ids required');
      err.status = 400;
      throw err;
    }
    success(res, await studentService.compareUniversities(req.student.id, ids.slice(0, 3)));
  } catch (e) {
    next(e);
  }
};

export const savedUniversities = async (req, res, next) => {
  try {
    success(res, await savedUniversityService.listSaved(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const saveUniversity = async (req, res, next) => {
  try {
    const collegeId = parseInt(req.params.collegeId, 10);
    success(res, await savedUniversityService.saveUniversity(req.student.id, collegeId), 'University saved');
  } catch (e) {
    next(e);
  }
};

export const unsaveUniversity = async (req, res, next) => {
  try {
    const collegeId = parseInt(req.params.collegeId, 10);
    success(res, await savedUniversityService.unsaveUniversity(req.student.id, collegeId), 'University removed');
  } catch (e) {
    next(e);
  }
};

export const recommendedUniversities = async (req, res, next) => {
  try {
    success(res, await recommendationService.getRecommendedUniversities(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const recommendedPrograms = async (req, res, next) => {
  try {
    success(res, await recommendationService.getRecommendedPrograms(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const programs = async (req, res, next) => {
  try {
    success(res, await studentService.listStudentPrograms(req.student.id, req.query));
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
