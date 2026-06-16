import * as trainerService from '../services/trainerService.js';
import * as applicationService from '../services/applicationService.js';
import * as collegeService from '../services/collegeService.js';
import { assertTrainerOwnsStudent } from '../services/ownershipService.js';
import { success } from '../utils/apiResponse.js';

export const dashboard = async (req, res, next) => {
  try {
    success(res, await trainerService.getTrainerDashboard(req.trainer.id));
  } catch (e) {
    next(e);
  }
};

export const students = async (req, res, next) => {
  try {
    success(res, await trainerService.getAssignedStudents(req.trainer.id));
  } catch (e) {
    next(e);
  }
};

export const applications = async (req, res, next) => {
  try {
    success(res, await applicationService.getApplicationsForTrainer(req.trainer.id));
  } catch (e) {
    next(e);
  }
};

export const updateApplication = async (req, res, next) => {
  try {
    success(
      res,
      await applicationService.updateApplication(
        req.params.id,
        req.body,
        req.trainer.id,
        req.userId
      ),
      'Application updated'
    );
  } catch (e) {
    next(e);
  }
};

export const updateChecklist = async (req, res, next) => {
  try {
    success(
      res,
      await applicationService.updateChecklistItem(
        req.params.itemId,
        req.body,
        req.userRole,
        req.trainer.id,
        req.userId
      ),
      'Checklist updated'
    );
  } catch (e) {
    next(e);
  }
};

export const addTimeline = async (req, res, next) => {
  try {
    const { application_id, student_id, title, description, event_type } = req.body;
    if (!application_id || !student_id || !title) {
      const err = new Error('application_id, student_id, and title are required');
      err.status = 400;
      throw err;
    }
    const event = await applicationService.addTimelineEvent(
      {
        application_id,
        student_id,
        actor_user_id: req.userId,
        title,
        description,
        event_type,
      },
      req.trainer.id
    );
    success(res, event, 'Timeline event added', 201);
  } catch (e) {
    next(e);
  }
};

export const getApplicationStatuses = async (req, res, next) => {
  try {
    success(res, applicationService.APPLICATION_STATUSES);
  } catch (e) {
    next(e);
  }
};

export const preparation = async (req, res, next) => {
  try {
    if (req.query.student_id) {
      await assertTrainerOwnsStudent(req.trainer.id, parseInt(req.query.student_id, 10));
    }
    success(res, await trainerService.getPreparationTasks(req.trainer.id, req.query.student_id));
  } catch (e) {
    next(e);
  }
};

export const createPreparation = async (req, res, next) => {
  try {
    await assertTrainerOwnsStudent(req.trainer.id, req.body.student_id);
    success(
      res,
      await trainerService.createPreparationTask({ ...req.body, trainer_id: req.trainer.id }),
      'Task created',
      201
    );
  } catch (e) {
    next(e);
  }
};

export const updatePreparation = async (req, res, next) => {
  try {
    success(res, await trainerService.updatePreparationTask(req.params.id, req.body, req.userRole, req.trainer.id));
  } catch (e) {
    next(e);
  }
};

export const sessions = async (req, res, next) => {
  try {
    if (req.query.student_id) {
      await assertTrainerOwnsStudent(req.trainer.id, parseInt(req.query.student_id, 10));
    }
    success(res, await trainerService.getSessions(req.trainer.id, req.query.student_id));
  } catch (e) {
    next(e);
  }
};

export const createSession = async (req, res, next) => {
  try {
    await assertTrainerOwnsStudent(req.trainer.id, req.body.student_id);
    success(
      res,
      await trainerService.createSession({ ...req.body, trainer_id: req.trainer.id }),
      'Session created',
      201
    );
  } catch (e) {
    next(e);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    success(res, await trainerService.updateSession(req.params.id, req.body, req.trainer.id));
  } catch (e) {
    next(e);
  }
};

export const colleges = async (req, res, next) => {
  try {
    const status = req.query.status || 'all';
    success(res, await collegeService.listColleges({ status, limit: 100, trainerId: req.trainer.id }));
  } catch (e) {
    next(e);
  }
};

export const getCollege = async (req, res, next) => {
  try {
    await collegeService.assertTrainerOwnsCollege(req.trainer.id, parseInt(req.params.id, 10));
    const college = await collegeService.getCollegeById(req.params.id, true);
    success(res, college);
  } catch (e) {
    next(e);
  }
};

export const createCollege = async (req, res, next) => {
  try {
    success(res, await collegeService.createCollege(req.body, req.trainer.id), 'College created', 201);
  } catch (e) {
    next(e);
  }
};

export const updateCollege = async (req, res, next) => {
  try {
    success(res, await collegeService.updateCollege(req.params.id, req.body, { trainerId: req.trainer.id }), 'College updated');
  } catch (e) {
    next(e);
  }
};

export const deleteCollege = async (req, res, next) => {
  try {
    await collegeService.deleteCollege(req.params.id, { trainerId: req.trainer.id });
    success(res, null, 'College deleted');
  } catch (e) {
    next(e);
  }
};

export const submitCollege = async (req, res, next) => {
  try {
    success(res, await collegeService.submitCollegeForApproval(req.params.id, req.trainer.id), 'Submitted for approval');
  } catch (e) {
    next(e);
  }
};
