import { query, queryOne } from '../config/database.js';
import { assertTrainerOwnsStudent } from './ownershipService.js';
import { createNotification } from './notificationService.js';
import { logActivity } from './activityService.js';
import { sendApplicationUpdateEmail } from './emailService.js';

export async function getDocumentsForStudent(studentId) {
  return query(
    `SELECT d.*, u.name as uploaded_by_name FROM documents d
     JOIN users u ON d.uploaded_by_user_id = u.id
     WHERE d.student_id = ? ORDER BY d.created_at DESC`,
    [studentId]
  );
}

export async function getDocumentsForTrainer(trainerId, { status, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let sql = `SELECT d.*, u.name as student_name, u2.name as uploaded_by_name
             FROM documents d
             JOIN students s ON d.student_id = s.id
             JOIN users u ON s.user_id = u.id
             JOIN users u2 ON d.uploaded_by_user_id = u2.id
             WHERE s.trainer_id = ?`;
  const params = [trainerId];
  if (status) {
    sql += ' AND d.status = ?';
    params.push(status);
  }
  sql += ` ORDER BY d.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  return query(sql, params);
}

export async function getAllDocuments({ status, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let sql = `SELECT d.*, u.name as student_name, u2.name as uploaded_by_name
             FROM documents d
             JOIN students s ON d.student_id = s.id
             JOIN users u ON s.user_id = u.id
             JOIN users u2 ON d.uploaded_by_user_id = u2.id WHERE 1=1`;
  const params = [];
  if (status) {
    sql += ' AND d.status = ?';
    params.push(status);
  }
  sql += ` ORDER BY d.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  return query(sql, params);
}

export async function verifyDocument(docId, userId, trainerId = null, approved = true, rejectionReason = null) {
  const doc = await queryOne(
    `SELECT d.*, s.trainer_id, su.id as student_user_id, su.email as student_email, su.name as student_name
     FROM documents d
     JOIN students s ON d.student_id = s.id
     JOIN users su ON s.user_id = su.id
     WHERE d.id = ?`,
    [docId]
  );
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });

  if (trainerId && doc.trainer_id !== trainerId) {
    throw Object.assign(new Error('You can only verify documents for assigned students'), { status: 403 });
  }

  const status = approved ? 'verified' : 'rejected';
  await query(
    `UPDATE documents SET status = ?, rejection_reason = ?, verified_by_user_id = ?, verified_at = NOW() WHERE id = ?`,
    [status, approved ? null : rejectionReason, userId, docId]
  );

  const title = approved ? 'Document Verified' : 'Document Rejected';
  const message = approved
    ? `Your document "${doc.title}" has been verified.`
    : `Your document "${doc.title}" was rejected: ${rejectionReason || 'Please re-upload.'}`;

  await createNotification({
    user_id: doc.student_user_id,
    title,
    message,
    type: approved ? 'success' : 'warning',
    link: '/student/documents',
  });

  await sendApplicationUpdateEmail({ email: doc.student_email, name: doc.student_name }, title, message);
  await logActivity(userId, approved ? 'VERIFY_DOCUMENT' : 'REJECT_DOCUMENT', 'document', docId, doc.title);

  return queryOne('SELECT * FROM documents WHERE id = ?', [docId]);
}

export async function getDocumentById(docId, studentId = null) {
  const doc = await queryOne('SELECT * FROM documents WHERE id = ?', [docId]);
  if (!doc) return null;
  if (studentId && doc.student_id !== studentId) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }
  return doc;
}
