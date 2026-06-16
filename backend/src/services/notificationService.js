import { query, queryOne } from '../config/database.js';

export async function createNotification({ user_id, title, message, type = 'info', link = null }) {
  const result = await query(
    `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
    [user_id, title, message, type, link]
  );
  return result.insertId;
}

export async function getNotifications(userId, { unreadOnly = false, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let sql = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [userId];
  if (unreadOnly) {
    sql += ' AND is_read = 0';
  }
  sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const rows = await query(sql, params);
  const [countRow] = await query(
    `SELECT COUNT(*) as total FROM notifications WHERE user_id = ?${unreadOnly ? ' AND is_read = 0' : ''}`,
    [userId]
  );
  return { rows, total: countRow.total };
}

export async function getUnreadCount(userId) {
  const [row] = await query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return row.count;
}

export async function markRead(id, userId) {
  await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
}

export async function markAllRead(userId) {
  await query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId]);
}
