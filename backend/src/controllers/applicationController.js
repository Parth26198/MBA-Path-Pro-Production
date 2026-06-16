import * as applicationService from '../services/applicationService.js';
import { query } from '../config/database.js';
import { success } from '../utils/apiResponse.js';

export const listAll = async (req, res, next) => {
  try {
    success(res, await applicationService.getAllApplications());
  } catch (e) {
    next(e);
  }
};

export const notifications = async (req, res, next) => {
  try {
    const rows = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    success(res, rows);
  } catch (e) {
    next(e);
  }
};
