import { query, queryOne } from '../config/database.js';
import {
  assertTrainerOwnsApplication,
  assertTrainerOwnsChecklistItem,
  assertTrainerOwnsStudent,
} from './ownershipService.js';
import { logActivity } from './activityService.js';
import { assertCanApply } from './studentTierService.js';

const DEFAULT_CHECKLIST_ITEMS = [
  'Form Filled',
  'SOP Uploaded',
  'Resume Uploaded',
  'Transcript Uploaded',
  'Fees Paid',
  'Mock Interview Pending',
];

const APPLICATION_STATUSES = [
  'Draft',
  'Documents Pending',
  'Under Review',
  'GDPI Preparation',
  'Interview Scheduled',
  'Admitted',
  'Rejected',
  'Withdrawn',
];

export { APPLICATION_STATUSES };

export async function getApplicationsForStudent(studentId) {
  const apps = await query(
    `SELECT a.*, c.name as college_name, c.logo_url, c.location, c.ranking
     FROM applications a
     JOIN colleges c ON a.college_id = c.id
     WHERE a.student_id = ?
     ORDER BY a.updated_at DESC`,
    [studentId]
  );

  return Promise.all(apps.map(enrichApplication));
}

export async function getApplicationsForTrainer(trainerId) {
  const apps = await query(
    `SELECT a.*, c.name as college_name, c.logo_url, c.location, u.name as student_name, s.id as student_record_id
     FROM applications a
     JOIN colleges c ON a.college_id = c.id
     JOIN students s ON a.student_id = s.id
     JOIN users u ON s.user_id = u.id
     WHERE s.trainer_id = ?
     ORDER BY a.updated_at DESC`,
    [trainerId]
  );
  return Promise.all(apps.map(enrichApplication));
}

export async function getAllApplications() {
  const apps = await query(
    `SELECT a.*, c.name as college_name, u.name as student_name, tu.name as trainer_name
     FROM applications a
     JOIN colleges c ON a.college_id = c.id
     JOIN students s ON a.student_id = s.id
     JOIN users u ON s.user_id = u.id
     LEFT JOIN trainers t ON a.trainer_id = t.id
     LEFT JOIN users tu ON t.user_id = tu.id
     ORDER BY a.updated_at DESC`
  );
  return Promise.all(apps.map(enrichApplication));
}

export async function getAvailableCollegesForStudent(studentId) {
  return query(
    `SELECT c.id, c.name, c.slug, c.location, c.ranking, c.fees_min, c.avg_package
     FROM colleges c
     WHERE c.status = 'published'
       AND c.id NOT IN (
         SELECT college_id FROM applications WHERE student_id = ?
       )
     ORDER BY c.ranking ASC, c.name ASC`,
    [studentId]
  );
}

async function enrichApplication(app) {
  const checklist = await query(
    'SELECT * FROM application_checklists WHERE application_id = ? ORDER BY sort_order',
    [app.id]
  );
  const timeline = await query(
    `SELECT t.*, u.name as actor_name FROM timelines t
     LEFT JOIN users u ON t.actor_user_id = u.id
     WHERE t.application_id = ? ORDER BY t.created_at DESC`,
    [app.id]
  );
  return { ...app, checklist, timeline };
}

async function seedDefaultChecklist(applicationId) {
  let order = 0;
  for (const title of DEFAULT_CHECKLIST_ITEMS) {
    await query(
      `INSERT INTO application_checklists (application_id, title, is_completed, completed_by_trainer, sort_order)
       VALUES (?, ?, 0, 0, ?)`,
      [applicationId, title, order++]
    );
  }
}

export async function createApplication(studentId, collegeId, trainerId, actorUserId) {
  const student = await queryOne('SELECT * FROM students WHERE id = ?', [studentId]);
  if (!student) {
    throw Object.assign(new Error('Student not found'), { status: 404 });
  }

  assertCanApply(student);

  if (student.colleges_applied >= student.colleges_allowed) {
    throw Object.assign(new Error('College application limit reached for your package'), { status: 400 });
  }

  const college = await queryOne(
    "SELECT id, name FROM colleges WHERE id = ? AND status = 'published'",
    [collegeId]
  );
  if (!college) {
    throw Object.assign(new Error('College not found or not available for applications'), { status: 404 });
  }

  const existing = await queryOne(
    'SELECT id FROM applications WHERE student_id = ? AND college_id = ?',
    [studentId, collegeId]
  );
  if (existing) {
    throw Object.assign(new Error('Application already exists for this college'), { status: 400 });
  }

  const assignedTrainerId = student.trainer_id || trainerId;

  const result = await query(
    `INSERT INTO applications (student_id, college_id, trainer_id, status, preparation_status, submitted_at)
     VALUES (?, ?, ?, 'Draft', 'Not Started', NOW())`,
    [studentId, collegeId, assignedTrainerId]
  );

  const applicationId = result.insertId;

  await seedDefaultChecklist(applicationId);

  await query('UPDATE students SET colleges_applied = colleges_applied + 1 WHERE id = ?', [studentId]);

  await addTimelineEvent({
    application_id: applicationId,
    student_id: studentId,
    actor_user_id: actorUserId,
    title: 'Application initiated',
    description: `Student started application to ${college.name}`,
    event_type: 'application',
  });

  const studentUser = await queryOne('SELECT user_id FROM students WHERE id = ?', [studentId]);
  await query(
    `INSERT INTO notifications (user_id, title, message, type, link)
     VALUES (?, 'New Application', ?, 'info', '/trainer/applications')`,
    [studentUser.user_id, `Your application to ${college.name} has been created.`]
  );

  if (assignedTrainerId) {
    const trainerUser = await queryOne(
      'SELECT u.id FROM trainers t JOIN users u ON t.user_id = u.id WHERE t.id = ?',
      [assignedTrainerId]
    );
    if (trainerUser) {
      const studentName = await queryOne(
        'SELECT u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
        [studentId]
      );
      await query(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'New Application', ?, 'success', '/trainer/applications')`,
        [trainerUser.id, `${studentName?.name || 'Student'} applied to ${college.name}`]
      );
    }
  }

  await logActivity(actorUserId, 'CREATE_APPLICATION', 'application', applicationId, `Applied to ${college.name}`);

  return enrichApplication(
    await queryOne(
      `SELECT a.*, c.name as college_name, c.location FROM applications a
       JOIN colleges c ON a.college_id = c.id WHERE a.id = ?`,
      [applicationId]
    )
  );
}

export async function updateApplication(id, data, trainerId, actorUserId) {
  const app = await assertTrainerOwnsApplication(trainerId, id);

  const fields = [];
  const params = [];

  if (data.status) {
    if (!APPLICATION_STATUSES.includes(data.status)) {
      throw Object.assign(new Error('Invalid application status'), { status: 400 });
    }
    fields.push('status = ?');
    params.push(data.status);
  }
  if (data.preparation_status) {
    fields.push('preparation_status = ?');
    params.push(data.preparation_status);
  }
  if (data.trainer_remarks !== undefined) {
    fields.push('trainer_remarks = ?');
    params.push(data.trainer_remarks);
  }

  if (fields.length) {
    params.push(id);
    await query(`UPDATE applications SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  if (data.status && data.status !== app.status) {
    await addTimelineEvent({
      application_id: id,
      student_id: app.student_id,
      actor_user_id: actorUserId,
      title: `Status updated to ${data.status}`,
      description: data.status_note || `Application status changed from ${app.status} to ${data.status}`,
      event_type: 'status',
    }, trainerId);
  }

  if (data.trainer_remarks !== undefined && data.trainer_remarks !== app.trainer_remarks) {
    await addTimelineEvent({
      application_id: id,
      student_id: app.student_id,
      actor_user_id: actorUserId,
      title: 'Trainer remarks updated',
      description: data.trainer_remarks,
      event_type: 'remarks',
    }, trainerId);
  }

  await logActivity(actorUserId, 'UPDATE_APPLICATION', 'application', id, 'Application updated by trainer');

  return enrichApplication(
    await queryOne(
      `SELECT a.*, c.name as college_name, c.location FROM applications a
       JOIN colleges c ON a.college_id = c.id WHERE a.id = ?`,
      [id]
    )
  );
}

export async function updateChecklistItem(itemId, { is_completed, completed_by_trainer }, userRole, trainerId, actorUserId = null) {
  if (userRole !== 'TRAINER' && userRole !== 'ADMIN') {
    throw Object.assign(new Error('Only trainers can update checklist items'), { status: 403 });
  }

  let item;
  if (userRole === 'TRAINER') {
    item = await assertTrainerOwnsChecklistItem(trainerId, itemId);
  } else {
    item = await queryOne('SELECT * FROM application_checklists WHERE id = ?', [itemId]);
    if (!item) throw Object.assign(new Error('Checklist item not found'), { status: 404 });
  }

  await query(
    `UPDATE application_checklists SET is_completed = ?, completed_by_trainer = ?,
     completed_at = CASE WHEN ? = 1 THEN NOW() ELSE NULL END WHERE id = ?`,
    [is_completed ? 1 : 0, completed_by_trainer ? 1 : 0, is_completed ? 1 : 0, itemId]
  );

  if (is_completed && userRole === 'TRAINER') {
    const app = await queryOne('SELECT * FROM applications WHERE id = ?', [item.application_id]);
    const checklistItem = await queryOne('SELECT title FROM application_checklists WHERE id = ?', [itemId]);
    await addTimelineEvent({
      application_id: item.application_id,
      student_id: app.student_id,
      actor_user_id: actorUserId,
      title: `Checklist completed: ${checklistItem?.title || item.title}`,
      description: 'Marked complete by trainer',
      event_type: 'checklist',
    }, trainerId);
  }

  return queryOne('SELECT * FROM application_checklists WHERE id = ?', [itemId]);
}

export async function addTimelineEvent(
  { application_id, student_id, actor_user_id, title, description, event_type },
  trainerId = null
) {
  if (trainerId) {
    await assertTrainerOwnsApplication(trainerId, application_id);
    await assertTrainerOwnsStudent(trainerId, student_id);
  }

  await query(
    `INSERT INTO timelines (application_id, student_id, actor_user_id, title, description, event_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [application_id, student_id, actor_user_id, title, description, event_type || 'general']
  );

  const studentUser = await queryOne('SELECT user_id FROM students WHERE id = ?', [student_id]);
  if (studentUser) {
    await query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Application Update', ?, 'info', '/student/applications')`,
      [studentUser.user_id, title]
    );
  }

  return queryOne(
    `SELECT t.*, u.name as actor_name FROM timelines t
     LEFT JOIN users u ON t.actor_user_id = u.id
     WHERE t.application_id = ? ORDER BY t.id DESC LIMIT 1`,
    [application_id]
  );
}
