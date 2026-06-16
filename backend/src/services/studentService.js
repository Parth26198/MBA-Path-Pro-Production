import { query, queryOne } from '../config/database.js';
import * as applicationService from './applicationService.js';

export async function getStudentDashboard(studentId) {
  const student = await queryOne(
    `SELECT s.*, u.name, u.email, p.name as package_name, p.code as package_code, p.college_limit, p.price,
            tu.name as trainer_name, tu.email as trainer_email, tu.phone as trainer_phone, t.id as trainer_record_id
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN packages p ON s.package_id = p.id
     LEFT JOIN trainers t ON s.trainer_id = t.id
     LEFT JOIN users tu ON t.user_id = tu.id
     WHERE s.id = ?`,
    [studentId]
  );

  const applications = await applicationService.getApplicationsForStudent(studentId);
  const preparationTasks = await query(
    'SELECT * FROM preparation_tasks WHERE student_id = ? ORDER BY created_at DESC',
    [studentId]
  );
  const sessions = await query(
    `SELECT ts.*, u.name as trainer_name FROM trainer_sessions ts
     JOIN trainers t ON ts.trainer_id = t.id
     JOIN users u ON t.user_id = u.id
     WHERE ts.student_id = ? ORDER BY ts.scheduled_at DESC LIMIT 10`,
    [studentId]
  );
  const notifications = await query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
    [student.user_id]
  );
  const documents = await query(
    'SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC',
    [studentId]
  );
  const timeline = await query(
    'SELECT t.*, u.name as actor_name FROM timelines t LEFT JOIN users u ON t.actor_user_id = u.id WHERE t.student_id = ? ORDER BY t.created_at DESC LIMIT 20',
    [studentId]
  );

  return {
    student: {
      ...student,
      colleges_remaining: Math.max(0, (student.college_limit || 0) - (student.colleges_applied || 0)),
    },
    applications,
    preparationTasks,
    sessions,
    notifications,
    documents,
    timeline,
  };
}

export async function getNotifications(userId) {
  return query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
}

export async function markNotificationRead(id, userId) {
  await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
}
