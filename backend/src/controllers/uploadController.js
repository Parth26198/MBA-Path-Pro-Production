import * as uploadService from '../services/uploadService.js';
import { assertTrainerOwnsStudent } from '../services/ownershipService.js';
import { success } from '../utils/apiResponse.js';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No file uploaded');
      err.status = 400;
      throw err;
    }

    let studentId = parseInt(req.body.student_id, 10) || req.student?.id;
    if (req.userRole === 'STUDENT') {
      studentId = req.student.id;
    } else if (req.userRole === 'TRAINER') {
      if (!studentId) {
        const err = new Error('student_id is required');
        err.status = 400;
        throw err;
      }
      await assertTrainerOwnsStudent(req.trainer.id, studentId);
    } else if (req.userRole === 'ADMIN' && !studentId) {
      const err = new Error('student_id is required');
      err.status = 400;
      throw err;
    }

    const doc = await uploadService.saveDocument({
      student_id: studentId,
      uploaded_by_user_id: req.userId,
      application_id: req.body.application_id,
      title: req.body.title,
      file: req.file,
      category: req.body.category,
    });
    success(res, doc, 'File uploaded', 201);
  } catch (e) {
    next(e);
  }
};

export const uploadCollegeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No image uploaded');
      err.status = 400;
      throw err;
    }
    const fileUrl = `/uploads/colleges/${req.file.filename}`;
    success(res, { file_url: fileUrl }, 'Image uploaded', 201);
  } catch (e) {
    next(e);
  }
};
