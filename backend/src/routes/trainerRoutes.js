import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as trainerController from '../controllers/trainerController.js';
import * as documentController from '../controllers/documentController.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();
router.use(authenticate, authorize('TRAINER'));

router.get('/dashboard', trainerController.dashboard);
router.get('/students', trainerController.students);
router.get('/applications', trainerController.applications);
router.get('/applications/statuses', trainerController.getApplicationStatuses);
router.put('/applications/:id', trainerController.updateApplication);
router.patch('/checklist/:itemId', trainerController.updateChecklist);
router.post('/timeline', trainerController.addTimeline);

router.get('/preparation', trainerController.preparation);
router.post('/preparation', trainerController.createPreparation);
router.put('/preparation/:id', trainerController.updatePreparation);

router.get('/sessions', trainerController.sessions);
router.post('/sessions', trainerController.createSession);
router.put('/sessions/:id', trainerController.updateSession);

router.get('/colleges', trainerController.colleges);
router.get('/colleges/:id', trainerController.getCollege);
router.post('/colleges', trainerController.createCollege);
router.put('/colleges/:id', trainerController.updateCollege);
router.delete('/colleges/:id', trainerController.deleteCollege);
router.post('/colleges/:id/submit', trainerController.submitCollege);

router.get('/documents', documentController.trainerDocuments);
router.post('/documents/:id/verify', documentController.verifyDocument);

router.get('/notifications', notificationController.list);
router.get('/notifications/unread-count', notificationController.unreadCount);
router.patch('/notifications/:id/read', notificationController.markRead);

export default router;
