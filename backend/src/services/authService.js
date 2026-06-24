import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import { query, queryOne } from '../config/database.js';
import { logActivity } from './activityService.js';
import { createNotification } from './notificationService.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from './emailService.js';
import { ensureRole } from './roleService.js';
import { getTierMeta } from './studentTierService.js';
import * as subscriptionService from './subscriptionService.js';
import logger from '../utils/logger.js';
import { normalizeOnboardingStep } from '../utils/onboarding.js';

export async function login(email, password) {
  const user = await queryOne(
    `SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?`,
    [email]
  );

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  if (!user.is_active) {
    throw Object.assign(new Error('Account is deactivated'), { status: 403 });
  }

  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
  await logActivity(user.id, 'LOGIN', 'user', user.id, `${user.name} logged in`);

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const profile = await getUserProfile(user.id, user.role);
  delete user.password_hash;

  return { token, user: { ...user, password_hash: undefined }, profile };
}

export async function registerStudent({ name, email, password, phone }) {
  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { status: 400 });
  }

  const role = await ensureRole('STUDENT');
  const hash = await bcrypt.hash(password, 10);

  const userResult = await query(
    'INSERT INTO users (role_id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)',
    [role.id, name, email, hash, phone || null]
  );

  const userId = userResult.insertId;

  const studentResult = await query(
    `INSERT INTO students (user_id, package_id, colleges_allowed, enrollment_date, payment_status, status)
     VALUES (?, NULL, 0, CURDATE(), 'pending', 'active')`,
    [userId]
  );

  const studentId = studentResult.insertId;

  await logActivity(userId, 'STUDENT_REGISTERED', 'student', studentId, `${name} created a free student account`);

  await createNotification({
    user_id: userId,
    title: 'Welcome to MBA Path Pro',
    message: 'Explore universities and programs. Upgrade anytime to start applying.',
    type: 'info',
    link: '/onboarding',
  });

  const admins = await query(
    `SELECT u.id FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE r.name = 'ADMIN' AND u.is_active = 1`
  );
  for (const admin of admins) {
    await createNotification({
      user_id: admin.id,
      title: 'New Student Registered',
      message: `${name} signed up for a free account`,
      type: 'success',
      link: '/admin/students',
    });
  }

  try {
    await sendWelcomeEmail({ name, email });
  } catch (emailErr) {
    logger.warn('Welcome email failed:', emailErr.message);
  }

  return login(email, password);
}

export async function getUserProfile(userId, role) {
  if (role === 'STUDENT') {
    const student = await queryOne(
      `SELECT s.*, u.name, u.email, u.phone, u.avatar_url,
              p.name as package_name, p.code as package_code, p.college_limit, p.price as package_price,
              t.id as trainer_record_id, tu.name as trainer_name, tu.email as trainer_email, tu.phone as trainer_phone
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN packages p ON s.package_id = p.id
       LEFT JOIN trainers t ON s.trainer_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       WHERE s.user_id = ?`,
      [userId]
    );
    if (!student) return null;
    const tier = getTierMeta(student);
    const subscription = await subscriptionService.getSubscriptionSummary(student.id);
    return {
      ...student,
      ...tier,
      subscription: subscription.subscription,
      profile_completion: computeProfileCompletion(student),
      onboarding_completed: !!student.onboarding_completed,
      onboarding_step: normalizeOnboardingStep(student.onboarding_step),
    };
  }
  if (role === 'TRAINER') {
    return queryOne(
      `SELECT t.*, u.name, u.email, u.phone, u.avatar_url
       FROM trainers t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?`,
      [userId]
    );
  }
  return null;
}

function computeProfileCompletion(student) {
  const checks = [
    { key: 'name', label: 'Full name', done: !!student.name },
    { key: 'email', label: 'Email address', done: !!student.email },
    { key: 'phone', label: 'Phone number', done: !!student.phone },
    { key: 'city', label: 'City', done: !!student.city },
    { key: 'career_goal', label: 'Career goal', done: !!student.career_goal },
    { key: 'target_countries', label: 'Target countries', done: !!student.target_countries },
  ];
  const done = checks.filter((c) => c.done).length;
  const percent = Math.round((done / checks.length) * 100);
  return {
    percent,
    missing: checks.filter((c) => !c.done).map((c) => c.label),
    checks,
  };
}

export async function getMe(userId) {
  const user = await queryOne(
    `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.last_login_at, r.name as role
     FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
    [userId]
  );
  const profile = await getUserProfile(userId, user.role);
  return { ...user, profile };
}

export async function requestPasswordReset(email) {
  const user = await queryOne('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
  if (!user) {
    return { message: 'If the email exists, a reset link has been sent.' };
  }
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000);
  await query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, token, expires]
  );
  await sendPasswordResetEmail(user, token);
  return { message: 'If the email exists, a reset link has been sent.' };
}

export async function resetPassword(token, newPassword) {
  const record = await queryOne(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used_at IS NULL AND expires_at > NOW()',
    [token]
  );
  if (!record) throw Object.assign(new Error('Invalid or expired reset token'), { status: 400 });
  const hash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, record.user_id]);
  await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [record.id]);
  await logActivity(record.user_id, 'PASSWORD_RESET', 'user', record.user_id, 'Password reset completed');
  return { message: 'Password updated successfully' };
}
