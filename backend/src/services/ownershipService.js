import { queryOne } from '../config/database.js';

export async function assertTrainerOwnsStudent(trainerId, studentId) {
  const student = await queryOne(
    'SELECT id, trainer_id FROM students WHERE id = ?',
    [studentId]
  );
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }
  if (student.trainer_id !== trainerId) {
    throw Object.assign(new Error('You can only manage your assigned students'), { status: 403 });
  }
  return student;
}

export async function assertTrainerOwnsApplication(trainerId, applicationId) {
  const app = await queryOne(
    `SELECT a.*, s.trainer_id as student_trainer_id
     FROM applications a
     JOIN students s ON a.student_id = s.id
     WHERE a.id = ?`,
    [applicationId]
  );
  if (!app) {
    throw Object.assign(new Error('Application not found'), { status: 404 });
  }
  if (app.student_trainer_id !== trainerId) {
    throw Object.assign(new Error('You can only manage applications for your assigned students'), { status: 403 });
  }
  return app;
}

export async function assertStudentOwnsApplication(studentId, applicationId) {
  const app = await queryOne(
    'SELECT * FROM applications WHERE id = ? AND student_id = ?',
    [applicationId, studentId]
  );
  if (!app) {
    throw Object.assign(new Error('Application not found'), { status: 404 });
  }
  return app;
}

export async function assertTrainerOwnsChecklistItem(trainerId, itemId) {
  const item = await queryOne(
    `SELECT ac.*, a.id as application_id, s.trainer_id
     FROM application_checklists ac
     JOIN applications a ON ac.application_id = a.id
     JOIN students s ON a.student_id = s.id
     WHERE ac.id = ?`,
    [itemId]
  );
  if (!item) {
    throw Object.assign(new Error('Checklist item not found'), { status: 404 });
  }
  if (item.trainer_id !== trainerId) {
    throw Object.assign(new Error('You can only update checklist items for your assigned students'), { status: 403 });
  }
  return item;
}
