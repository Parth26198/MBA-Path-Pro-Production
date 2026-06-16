import { query, queryOne } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { logActivity } from './activityService.js';
import { ensureRole } from './roleService.js';
import { sqlVal } from '../utils/sql.js';

export async function getDashboardStats() {
  const [students] = await query("SELECT COUNT(*) as count FROM students WHERE status = 'active'");
  const [trainers] = await query('SELECT COUNT(*) as count FROM trainers');
  const [applications] = await query('SELECT COUNT(*) as count FROM applications');
  const [revenue] = await query(
    "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"
  );
  const [activeApps] = await query(
    "SELECT COUNT(*) as count FROM applications WHERE status NOT IN ('Rejected', 'Withdrawn', 'Admitted')"
  );
  const [pendingApps] = await query(
    "SELECT COUNT(*) as count FROM applications WHERE status IN ('Documents Pending', 'Draft')"
  );

  const packageAnalytics = await query(
    `SELECT p.code, p.name, COUNT(s.id) as student_count, COALESCE(SUM(pay.amount), 0) as revenue
     FROM packages p
     LEFT JOIN students s ON s.package_id = p.id
     LEFT JOIN payments pay ON pay.package_id = p.id AND pay.status = 'completed'
     GROUP BY p.id ORDER BY p.sort_order`
  );

  const studentGrowth = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
     FROM students GROUP BY month ORDER BY month LIMIT 12`
  );

  const trainerPerformance = await query(
    `SELECT u.name as trainer_name, COUNT(DISTINCT s.id) as students,
            COUNT(DISTINCT a.id) as applications,
            AVG(CASE WHEN a.status = 'Admitted' THEN 1 ELSE 0 END) * 100 as success_rate
     FROM trainers t
     JOIN users u ON t.user_id = u.id
     LEFT JOIN students s ON s.trainer_id = t.id
     LEFT JOIN applications a ON a.trainer_id = t.id
     GROUP BY t.id`
  );

  const collegeAnalytics = await query(
    `SELECT c.name, COUNT(a.id) as applications,
            SUM(CASE WHEN a.status = 'Under Review' THEN 1 ELSE 0 END) as under_review
     FROM colleges c
     LEFT JOIN applications a ON a.college_id = c.id
     WHERE c.status = 'published'
     GROUP BY c.id ORDER BY applications DESC LIMIT 10`
  );

  const recentStudents = await query(
    `SELECT s.id, u.name, u.email, p.name as package_name, s.created_at
     FROM students s JOIN users u ON s.user_id = u.id
     LEFT JOIN packages p ON s.package_id = p.id
     ORDER BY s.created_at DESC LIMIT 5`
  );

  return {
    totals: {
      students: students.count,
      trainers: trainers.count,
      applications: applications.count,
      revenue: Number(revenue.total),
      activeApplications: activeApps.count,
      pendingApplications: pendingApps.count,
    },
    packageAnalytics,
    studentGrowth,
    trainerPerformance,
    collegeAnalytics,
    recentStudents,
  };
}

export async function getStudents() {
  return query(
    `SELECT s.*, u.name, u.email, u.phone, u.is_active, p.name as package_name, p.code as package_code,
            tu.name as trainer_name, t.id as trainer_id
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN packages p ON s.package_id = p.id
     LEFT JOIN trainers t ON s.trainer_id = t.id
     LEFT JOIN users tu ON t.user_id = tu.id
     ORDER BY s.created_at DESC`
  );
}

export async function assignTrainer(studentId, trainerId, adminUserId) {
  const student = await queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });

  const trainer = await queryOne('SELECT * FROM trainers WHERE id = ?', [trainerId]);
  if (!trainer) throw Object.assign(new Error('Trainer not found'), { status: 404 });

  await query('UPDATE students SET trainer_id = ? WHERE id = ?', [trainerId, studentId]);
  await query(
    'UPDATE trainers SET students_assigned = (SELECT COUNT(*) FROM students WHERE trainer_id = ?) WHERE id = ?',
    [trainerId, trainerId]
  );

  const studentUser = await queryOne('SELECT s.user_id, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?', [studentId]);
  const trainerUser = await queryOne('SELECT t.user_id, u.name FROM trainers t JOIN users u ON t.user_id = u.id WHERE t.id = ?', [trainerId]);

  await query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Trainer Assigned', ?, 'info')`,
    [studentUser.user_id, `Trainer ${trainerUser.name} has been assigned to guide your MBA journey.`]
  );

  await query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'New Student Assigned', ?, 'success')`,
    [trainerUser.user_id, `${studentUser.name} has been assigned to you.`]
  );

  await logActivity(adminUserId, 'ASSIGN_TRAINER', 'student', studentId, `Assigned trainer to student ${studentId}`);

  return getStudents();
}

export async function createTrainer(data, adminUserId) {
  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [data.email]);
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 400 });

  const role = await ensureRole('TRAINER');
  const hash = await bcrypt.hash(data.password || '123456', 10);
  const userResult = await query(
    'INSERT INTO users (role_id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)',
    [role.id, data.name, data.email, hash, sqlVal(data.phone)]
  );
  await query(
    'INSERT INTO trainers (user_id, specialization, experience_years, bio) VALUES (?, ?, ?, ?)',
    [userResult.insertId, sqlVal(data.specialization), data.experience_years ?? 0, sqlVal(data.bio)]
  );
  await logActivity(adminUserId, 'CREATE_TRAINER', 'trainer', userResult.insertId, `Created trainer ${data.name}`);
  return queryOne(
    `SELECT t.*, u.name, u.email FROM trainers t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?`,
    [userResult.insertId]
  );
}

export async function getTrainers() {
  return query(
    `SELECT t.*, u.name, u.email, u.phone, u.is_active,
            (SELECT COUNT(*) FROM students s WHERE s.trainer_id = t.id) as assigned_students
     FROM trainers t JOIN users u ON t.user_id = u.id ORDER BY u.name`
  );
}

export async function approveCollege(collegeId, adminUserId, approved = true) {
  const status = approved ? 'published' : 'rejected';
  await query(
    'UPDATE colleges SET status = ?, approved_by_admin_id = ?, approved_at = NOW() WHERE id = ?',
    [status, adminUserId, collegeId]
  );
  await logActivity(adminUserId, approved ? 'APPROVE_COLLEGE' : 'REJECT_COLLEGE', 'college', collegeId, `College ${collegeId} ${status}`);
  return queryOne('SELECT * FROM colleges WHERE id = ?', [collegeId]);
}

export async function featureCollege(collegeId, featured) {
  await query('UPDATE colleges SET is_featured = ? WHERE id = ?', [featured ? 1 : 0, collegeId]);
  return queryOne('SELECT * FROM colleges WHERE id = ?', [collegeId]);
}

export async function updateTrainer(trainerId, data, adminUserId) {
  const trainer = await queryOne('SELECT * FROM trainers WHERE id = ?', [trainerId]);
  if (!trainer) throw Object.assign(new Error('Trainer not found'), { status: 404 });

  if (data.name !== undefined || data.email !== undefined || data.phone !== undefined) {
    await query(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
      [sqlVal(data.name), sqlVal(data.email), sqlVal(data.phone), trainer.user_id]
    );
  }
  if (data.password) {
    const hash = await bcrypt.hash(data.password, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, trainer.user_id]);
  }
  if (data.specialization !== undefined || data.experience_years !== undefined || data.bio !== undefined) {
    await query(
      'UPDATE trainers SET specialization = COALESCE(?, specialization), experience_years = COALESCE(?, experience_years), bio = COALESCE(?, bio) WHERE id = ?',
      [sqlVal(data.specialization), data.experience_years ?? null, sqlVal(data.bio), trainerId]
    );
  }
  if (data.is_active !== undefined) {
    await query('UPDATE users SET is_active = ? WHERE id = ?', [data.is_active ? 1 : 0, trainer.user_id]);
  }
  await logActivity(adminUserId, 'UPDATE_TRAINER', 'trainer', trainerId, 'Trainer updated');
  return queryOne(
    `SELECT t.*, u.name, u.email, u.phone, u.is_active FROM trainers t JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
    [trainerId]
  );
}

export async function deleteTrainer(trainerId, adminUserId) {
  const trainer = await queryOne('SELECT * FROM trainers WHERE id = ?', [trainerId]);
  if (!trainer) throw Object.assign(new Error('Trainer not found'), { status: 404 });
  await query('UPDATE users SET is_active = 0 WHERE id = ?', [trainer.user_id]);
  await logActivity(adminUserId, 'DEACTIVATE_TRAINER', 'trainer', trainerId, 'Trainer deactivated');
}

export async function createStudent(data, adminUserId) {
  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [data.email]);
  if (existing) throw Object.assign(new Error('Email already exists'), { status: 400 });
  const role = await ensureRole('STUDENT');
  const pkg = await queryOne('SELECT * FROM packages WHERE id = ?', [data.package_id]);
  if (!pkg) throw Object.assign(new Error('Invalid package'), { status: 400 });
  const hash = await bcrypt.hash(data.password || '123456', 10);
  const userResult = await query(
    'INSERT INTO users (role_id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)',
    [role.id, data.name, data.email, hash, sqlVal(data.phone)]
  );
  await query(
    `INSERT INTO students (user_id, package_id, trainer_id, colleges_allowed, enrollment_date, payment_status, status)
     VALUES (?, ?, ?, ?, CURDATE(), ?, 'active')`,
    [userResult.insertId, data.package_id, data.trainer_id || null, pkg.college_limit, data.payment_status || 'completed']
  );
  await logActivity(adminUserId, 'CREATE_STUDENT', 'student', userResult.insertId, `Created student ${data.name}`);
  return getStudents();
}

export async function updateStudent(studentId, data, adminUserId) {
  const student = await queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });
  if (data.name !== undefined || data.email !== undefined || data.phone !== undefined) {
    await query(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
      [sqlVal(data.name), sqlVal(data.email), sqlVal(data.phone), student.user_id]
    );
  }
  if (data.package_id) {
    const pkg = await queryOne('SELECT * FROM packages WHERE id = ?', [data.package_id]);
    await query(
      'UPDATE students SET package_id = ?, colleges_allowed = ? WHERE id = ?',
      [data.package_id, pkg.college_limit, studentId]
    );
  }
  if (data.trainer_id !== undefined) {
    await query('UPDATE students SET trainer_id = ? WHERE id = ?', [data.trainer_id || null, studentId]);
  }
  if (data.status) await query('UPDATE students SET status = ? WHERE id = ?', [data.status, studentId]);
  if (data.is_active !== undefined) {
    await query('UPDATE users SET is_active = ? WHERE id = ?', [data.is_active ? 1 : 0, student.user_id]);
  }
  await logActivity(adminUserId, 'UPDATE_STUDENT', 'student', studentId, 'Student updated');
  return getStudents();
}

export async function deleteStudent(studentId, adminUserId) {
  const student = await queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });
  await query('UPDATE users SET is_active = 0 WHERE id = ?', [student.user_id]);
  await query("UPDATE students SET status = 'inactive' WHERE id = ?", [studentId]);
  await logActivity(adminUserId, 'DEACTIVATE_STUDENT', 'student', studentId, 'Student deactivated');
}

export async function getAuditLogs({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const rows = await query(
    `SELECT al.*, u.name as user_name FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC LIMIT ${limit} OFFSET ${offset}`
  );
  const [countRow] = await query('SELECT COUNT(*) as total FROM activity_logs');
  return { rows, total: countRow.total };
}
