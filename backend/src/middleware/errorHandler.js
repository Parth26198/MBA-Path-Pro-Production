import logger from '../utils/logger.js';
import { error as apiError } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  apiError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  if (err.name === 'ValidationError' || err.status === 400) {
    return apiError(res, err.message, 400, err.errors);
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return apiError(res, err.message || 'Unauthorized', 401);
  }

  if (err.status === 403) {
    return apiError(res, err.message || 'Forbidden', 403);
  }

  return apiError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    err.status || 500
  );
};
