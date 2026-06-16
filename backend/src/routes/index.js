import { Router } from 'express';
import authRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';
import adminRoutes from './adminRoutes.js';
import trainerRoutes from './trainerRoutes.js';
import studentRoutes from './studentRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import * as applicationController from '../controllers/applicationController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.use(apiLimiter);

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/trainer', trainerRoutes);
router.use('/student', studentRoutes);
router.use('/uploads', uploadRoutes);

router.get('/payments/razorpay-key', paymentController.razorpayKey);
router.get('/applications', authenticate, authorize('ADMIN'), applicationController.listAll);

router.get('/notifications', authenticate, notificationController.list);
router.get('/notifications/unread-count', authenticate, notificationController.unreadCount);
router.patch('/notifications/:id/read', authenticate, notificationController.markRead);
router.patch('/notifications/read-all', authenticate, notificationController.markAllRead);

export default router;
