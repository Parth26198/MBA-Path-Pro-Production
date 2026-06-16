import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { fileFilter } from '../middleware/fileFilter.js';
import * as uploadController from '../controllers/uploadController.js';
import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../', config.upload.dir, 'documents'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const collegeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../', config.upload.dir, 'colleges'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const imageFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
  else cb(Object.assign(new Error('Only JPG, PNG, WEBP images allowed'), { status: 400 }), false);
};

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter,
});

const uploadCollege = multer({
  storage: collegeStorage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter: imageFilter,
});

const router = Router();
router.post(
  '/document',
  uploadLimiter,
  authenticate,
  authorize('STUDENT', 'TRAINER', 'ADMIN'),
  uploadDoc.single('file'),
  uploadController.uploadDocument
);

router.post(
  '/college-image',
  uploadLimiter,
  authenticate,
  authorize('TRAINER', 'ADMIN'),
  uploadCollege.single('file'),
  uploadController.uploadCollegeImage
);

export default router;
