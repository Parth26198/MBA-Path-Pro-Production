import { validationResult } from 'express-validator';
import { error as apiError } from '../utils/apiResponse.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiError(res, 'Validation failed', 400, errors.array());
  }
  next();
};
