import { query, queryOne } from '../config/database.js';

export async function getActiveSubscription(studentId) {
  return queryOne(
    `SELECT sub.*, p.name as package_name, p.code as package_code, p.price, p.features
     FROM subscriptions sub
     JOIN packages p ON sub.package_id = p.id
     WHERE sub.student_id = ? AND sub.status = 'active'
     ORDER BY sub.starts_at DESC
     LIMIT 1`,
    [studentId]
  );
}

export async function createPendingSubscription({ studentId, packageId, paymentId, collegeLimit }) {
  const result = await query(
    `INSERT INTO subscriptions (student_id, package_id, payment_id, status, college_limit)
     VALUES (?, ?, ?, 'pending', ?)`,
    [studentId, packageId, paymentId, collegeLimit]
  );
  return result.insertId;
}

export async function activateSubscription({ studentId, packageId, paymentId, collegeLimit }) {
  await query(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW()
     WHERE student_id = ? AND status = 'active'`,
    [studentId]
  );

  const pending = paymentId
    ? await queryOne(
        'SELECT id FROM subscriptions WHERE student_id = ? AND payment_id = ? AND status = ?',
        [studentId, paymentId, 'pending']
      )
    : null;

  if (pending) {
    await query(
      `UPDATE subscriptions SET status = 'active', starts_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [pending.id]
    );
    return pending.id;
  }

  const result = await query(
    `INSERT INTO subscriptions (student_id, package_id, payment_id, status, college_limit, starts_at)
     VALUES (?, ?, ?, 'active', ?, NOW())`,
    [studentId, packageId, paymentId, collegeLimit]
  );
  return result.insertId;
}

export async function getSubscriptionSummary(studentId) {
  const active = await getActiveSubscription(studentId);
  if (!active) {
    return { active: false, subscription: null };
  }

  const student = await queryOne(
    'SELECT colleges_applied, colleges_allowed FROM students WHERE id = ?',
    [studentId]
  );

  return {
    active: true,
    subscription: {
      ...active,
      features:
        typeof active.features === 'string' ? JSON.parse(active.features) : active.features || [],
      colleges_used: student?.colleges_applied || 0,
      colleges_remaining: Math.max(
        0,
        (student?.colleges_allowed || active.college_limit) - (student?.colleges_applied || 0)
      ),
    },
  };
}
