import * as notificationService from '../services/notificationService.js';
import { success } from '../utils/apiResponse.js';

export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const unreadOnly = req.query.unread === 'true';
    const { rows, total } = await notificationService.getNotifications(req.userId, { unreadOnly, page, limit });
    const unreadCount = await notificationService.getUnreadCount(req.userId);
    success(res, { notifications: rows, unreadCount, pagination: { page, limit, total } });
  } catch (e) {
    next(e);
  }
};

export const unreadCount = async (req, res, next) => {
  try {
    success(res, { count: await notificationService.getUnreadCount(req.userId) });
  } catch (e) {
    next(e);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await notificationService.markRead(req.params.id, req.userId);
    success(res, null, 'Marked as read');
  } catch (e) {
    next(e);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.userId);
    success(res, null, 'All notifications marked as read');
  } catch (e) {
    next(e);
  }
};
