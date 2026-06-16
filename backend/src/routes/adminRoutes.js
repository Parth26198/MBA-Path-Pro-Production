import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';
import * as applicationController from '../controllers/applicationController.js';
import * as packageController from '../controllers/packageController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as documentController from '../controllers/documentController.js';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.dashboard);
router.get('/students', adminController.students);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.post('/students/:studentId/assign-trainer', adminController.assignTrainer);

router.get('/trainers', adminController.trainers);
router.post('/trainers', adminController.createTrainer);
router.put('/trainers/:id', adminController.updateTrainer);
router.delete('/trainers/:id', adminController.deleteTrainer);

router.get('/applications', applicationController.listAll);
router.get('/payments', paymentController.adminPayments);
router.get('/documents', documentController.adminDocuments);
router.get('/audit-logs', adminController.auditLogs);

router.get('/packages', packageController.list);
router.post('/packages', packageController.create);
router.put('/packages/:id', packageController.update);
router.delete('/packages/:id', packageController.remove);

router.get('/colleges', adminController.colleges);
router.put('/colleges/:id', adminController.updateCollege);
router.delete('/colleges/:id', adminController.deleteCollege);
router.post('/colleges/:id/approve', adminController.approveCollege);
router.post('/colleges/:id/feature', adminController.featureCollege);

export default router;
