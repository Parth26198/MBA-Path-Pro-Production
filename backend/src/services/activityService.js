import { query } from '../config/database.js';

export async function logActivity(userId, action, entityType, entityId, description, metadata = null) {
  await query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, action, entityType, entityId, description, metadata ? JSON.stringify(metadata) : null]
  );
}

export async function getRecentActivities(limit = 20) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  return query(
    `SELECT al.*, u.name as user_name, u.email
     FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC LIMIT ${safeLimit}`
  );
}
