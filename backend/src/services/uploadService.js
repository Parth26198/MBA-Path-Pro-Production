import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/index.js';
import { query, queryOne } from '../config/database.js';
import { createNotification } from './notificationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.join(__dirname, '../../', config.upload.dir);

export function ensureUploadDir() {
  if (!fs.existsSync(uploadRoot)) {
    fs.mkdirSync(uploadRoot, { recursive: true });
    fs.mkdirSync(path.join(uploadRoot, 'documents'), { recursive: true });
    fs.mkdirSync(path.join(uploadRoot, 'colleges'), { recursive: true });
    fs.mkdirSync(path.join(uploadRoot, 'resources'), { recursive: true });
    fs.mkdirSync(path.join(uploadRoot, 'invoices'), { recursive: true });
  }
}

export function getFileUrl(filename, subfolder = '') {
  const base = `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`;
  return base;
}

export async function saveDocument({ student_id, uploaded_by_user_id, application_id, title, file, category }) {
  const subfolder = 'documents';
  const fileUrl = getFileUrl(file.filename, subfolder);
  const result = await query(
    `INSERT INTO documents (student_id, uploaded_by_user_id, application_id, title, file_url, file_type, file_size, category, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [student_id, uploaded_by_user_id, application_id || null, title || file.originalname, fileUrl, file.mimetype, file.size, category || 'other']
  );

  const student = await queryOne(
    `SELECT s.trainer_id, u.id as user_id, tu.id as trainer_user_id
     FROM students s JOIN users u ON s.user_id = u.id
     LEFT JOIN trainers t ON s.trainer_id = t.id
     LEFT JOIN users tu ON t.user_id = tu.id
     WHERE s.id = ?`,
    [student_id]
  );

  if (student?.trainer_user_id) {
    await createNotification({
      user_id: student.trainer_user_id,
      title: 'New Document Uploaded',
      message: `A new document "${title || file.originalname}" was uploaded and needs review.`,
      type: 'info',
      link: '/trainer/documents',
    });
  }

  return { id: result.insertId, file_url: fileUrl, status: 'pending' };
}

// AWS S3 ready: swap local save with S3 upload when config.aws.enabled
export function getStorageStrategy() {
  if (config.aws.enabled) {
    return 's3';
  }
  return 'local';
}
