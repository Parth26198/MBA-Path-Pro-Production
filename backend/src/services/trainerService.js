import { query, queryOne } from '../config/database.js';
import { assertTrainerOwnsStudent } from './ownershipService.js';

export async function getTrainerDashboard(trainerId) {
  const [assignedStudents] = await query(
    'SELECT COUNT(*) as count FROM students WHERE trainer_id = ?',
    [trainerId]
  );

  const students = await query(
    `SELECT s.*, u.name, u.email, u.phone, p.name as package_name,
            (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id) as application_count
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN packages p ON s.package_id = p.id
     WHERE s.trainer_id = ?
     ORDER BY u.name`,
    [trainerId]
  );

  const pendingWork = await query(
    `SELECT COUNT(*) as count FROM application_checklists ac
     JOIN applications a ON ac.application_id = a.id
     JOIN students s ON a.student_id = s.id
     WHERE s.trainer_id = ? AND ac.is_completed = 0`,
    [trainerId]
  );

  const upcomingSessions = await query(
    `SELECT ts.*, u.name as student_name FROM trainer_sessions ts
     JOIN students s ON ts.student_id = s.id
     JOIN users u ON s.user_id = u.id
     WHERE ts.trainer_id = ? AND ts.status = 'scheduled' AND ts.scheduled_at >= NOW()
     ORDER BY ts.scheduled_at ASC LIMIT 5`,
    [trainerId]
  );

  const applicationStatuses = await query(
    `SELECT a.status, COUNT(*) as count FROM applications a
     JOIN students s ON a.student_id = s.id
     WHERE s.trainer_id = ? GROUP BY a.status`,
    [trainerId]
  );

  const prepProgress = await query(
    `SELECT status, COUNT(*) as count FROM preparation_tasks
     WHERE trainer_id = ? GROUP BY status`,
    [trainerId]
  );

  return {
    stats: {
      assignedStudents: assignedStudents.count,
      pendingWork: pendingWork.count,
      upcomingSessions: upcomingSessions.length,
    },
    students,
    upcomingSessions,
    applicationStatuses,
    prepProgress,
  };
}

export async function getAssignedStudents(trainerId) {
  return query(
    `SELECT s.*, u.name, u.email, u.phone, p.name as package_name, p.college_limit,
            (SELECT COUNT(*) FROM applications WHERE student_id = s.id) as colleges_applied
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN packages p ON s.package_id = p.id
     WHERE s.trainer_id = ?`,
    [trainerId]
  );
}

export async function getPreparationTasks(trainerId, studentId = null) {
  let sql = `SELECT pt.*, u.name as student_name FROM preparation_tasks pt
             JOIN students s ON pt.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE pt.trainer_id = ?`;
  const params = [trainerId];
  if (studentId) {
    sql += ' AND pt.student_id = ?';
    params.push(studentId);
  }
  sql += ' ORDER BY pt.created_at DESC';
  return query(sql, params);
}

export async function createPreparationTask(data) {
  const result = await query(
    `INSERT INTO preparation_tasks (student_id, trainer_id, title, description, task_type, resource_url, status, trainer_remarks, due_date)
     VALUES (?, ?, ?, ?, ?, ?, 'assigned', ?, ?)`,
    [
      data.student_id,
      data.trainer_id,
      data.title,
      data.description ?? null,
      data.task_type || 'other',
      data.resource_url ?? null,
      data.trainer_remarks ?? null,
      data.due_date ?? null,
    ]
  );
  return queryOne('SELECT * FROM preparation_tasks WHERE id = ?', [result.insertId]);
}

export async function studentCompletePreparationTask(taskId, studentId, studentNotes) {
  const task = await queryOne(
    'SELECT pt.*, tu.id as trainer_user_id FROM preparation_tasks pt JOIN trainers t ON pt.trainer_id = t.id JOIN users tu ON t.user_id = tu.id WHERE pt.id = ? AND pt.student_id = ?',
    [taskId, studentId]
  );
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  if (task.status === 'verified') {
    throw Object.assign(new Error('Task already verified by trainer'), { status: 400 });
  }
  await query(
    `UPDATE preparation_tasks SET status = 'completed', student_notes = ?, student_completed_at = NOW() WHERE id = ?`,
    [studentNotes || null, taskId]
  );
  const { createNotification } = await import('./notificationService.js');
  await createNotification({
    user_id: task.trainer_user_id,
    title: 'Task Completed by Student',
    message: `Student marked "${task.title}" as completed. Please verify.`,
    type: 'info',
    link: '/trainer/preparation',
  });
  return queryOne('SELECT * FROM preparation_tasks WHERE id = ?', [taskId]);
}

export async function updatePreparationTask(id, data, userRole, trainerId = null) {
  if (userRole !== 'TRAINER' && userRole !== 'ADMIN') {
    throw Object.assign(new Error('Only trainers can update preparation tasks'), { status: 403 });
  }

  const task = await queryOne('SELECT * FROM preparation_tasks WHERE id = ?', [id]);
  if (!task) throw Object.assign(new Error('Preparation task not found'), { status: 404 });
  if (userRole === 'TRAINER' && trainerId && task.trainer_id !== trainerId) {
    throw Object.assign(new Error('You can only update your own preparation tasks'), { status: 403 });
  }
  if (userRole === 'TRAINER' && trainerId) {
    await assertTrainerOwnsStudent(trainerId, task.student_id);
  }

  const fields = [];
  const params = [];
  ['status', 'trainer_remarks', 'confidence_score', 'title', 'description', 'resource_url'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  });
  if (data.status === 'verified') {
    fields.push('verified_at = NOW()');
  }
  if (fields.length) {
    params.push(id);
    await query(`UPDATE preparation_tasks SET ${fields.join(', ')} WHERE id = ?`, params);
  }
  return queryOne('SELECT * FROM preparation_tasks WHERE id = ?', [id]);
}

export async function getSessions(trainerId, studentId = null) {
  let sql = `SELECT ts.*, u.name as student_name FROM trainer_sessions ts
             JOIN students s ON ts.student_id = s.id
             JOIN users u ON s.user_id = u.id WHERE ts.trainer_id = ?`;
  const params = [trainerId];
  if (studentId) {
    sql += ' AND ts.student_id = ?';
    params.push(studentId);
  }
  sql += ' ORDER BY ts.scheduled_at DESC';
  return query(sql, params);
}

export async function createSession(data) {
  const result = await query(
    `INSERT INTO trainer_sessions (student_id, trainer_id, session_type, title, scheduled_at, duration_minutes, status, meet_link, notes, remarks, progress_rating, attendance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.student_id,
      data.trainer_id,
      data.session_type,
      data.title ?? null,
      data.scheduled_at,
      data.duration_minutes || 60,
      data.status || 'scheduled',
      data.meet_link ?? null,
      data.notes ?? null,
      data.remarks ?? null,
      data.progress_rating ?? null,
      data.attendance || 'scheduled',
    ]
  );
  const session = await queryOne('SELECT * FROM trainer_sessions WHERE id = ?', [result.insertId]);
  const studentUser = await queryOne('SELECT user_id FROM students WHERE id = ?', [data.student_id]);
  if (studentUser) {
    const { createNotification } = await import('./notificationService.js');
    await createNotification({
      user_id: studentUser.user_id,
      title: 'Session Scheduled',
      message: data.title || `${data.session_type} session scheduled`,
      type: 'info',
      link: '/student',
    });
  }
  return session;
}

export async function updateSession(id, data, trainerId = null) {
  const session = await queryOne('SELECT * FROM trainer_sessions WHERE id = ?', [id]);
  if (!session) throw Object.assign(new Error('Session not found'), { status: 404 });
  if (trainerId && session.trainer_id !== trainerId) {
    throw Object.assign(new Error('You can only update your own sessions'), { status: 403 });
  }
  if (trainerId) {
    await assertTrainerOwnsStudent(trainerId, session.student_id);
  }

  const fields = [];
  const params = [];
  ['session_type', 'title', 'scheduled_at', 'duration_minutes', 'status', 'meet_link', 'notes', 'remarks', 'progress_rating', 'attendance'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  });
  if (fields.length) {
    params.push(id);
    await query(`UPDATE trainer_sessions SET ${fields.join(', ')} WHERE id = ?`, params);
  }
  return queryOne('SELECT * FROM trainer_sessions WHERE id = ?', [id]);
}
