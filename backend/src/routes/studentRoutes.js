import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as studentController from '../controllers/studentController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as documentController from '../controllers/documentController.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();
router.use(authenticate, authorize('STUDENT'));

router.get('/dashboard', studentController.dashboard);
router.get('/applications', studentController.applications);
router.get('/colleges/available', studentController.availableColleges);
router.post('/applications', studentController.applyCollege);

router.get('/documents', documentController.studentDocuments);
router.patch('/preparation/:id/complete', studentController.completePreparationTask);

router.post('/payments/create-order', paymentController.createOrder);
router.post('/payments/verify', paymentController.verifyPayment);
router.post('/payments/failed', paymentController.paymentFailed);
router.get('/payments/history', paymentController.history);

router.get('/notifications', notificationController.list);
router.get('/notifications/unread-count', notificationController.unreadCount);
router.patch('/notifications/:id/read', notificationController.markRead);
router.patch('/notifications/read-all', notificationController.markAllRead);

export default router;
