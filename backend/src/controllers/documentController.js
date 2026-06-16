import * as documentService from '../services/documentService.js';
import { success } from '../utils/apiResponse.js';

export const studentDocuments = async (req, res, next) => {
  try {
    success(res, await documentService.getDocumentsForStudent(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const trainerDocuments = async (req, res, next) => {
  try {
    success(res, await documentService.getDocumentsForTrainer(req.trainer.id, { status: req.query.status }));
  } catch (e) {
    next(e);
  }
};

export const adminDocuments = async (req, res, next) => {
  try {
    success(res, await documentService.getAllDocuments({ status: req.query.status }));
  } catch (e) {
    next(e);
  }
};

export const verifyDocument = async (req, res, next) => {
  try {
    const approved = req.body.approved !== false;
    success(
      res,
      await documentService.verifyDocument(
        req.params.id,
        req.userId,
        req.userRole === 'TRAINER' ? req.trainer.id : null,
        approved,
        req.body.rejection_reason
      ),
      approved ? 'Document verified' : 'Document rejected'
    );
  } catch (e) {
    next(e);
  }
};
