import { Router } from 'express';
import * as publicController from '../controllers/publicController.js';

const router = Router();

router.get('/packages', publicController.getPackages);
router.get('/colleges', publicController.getColleges);
router.get('/colleges/featured', publicController.getFeaturedColleges);
router.get('/colleges/:slug', publicController.getCollege);
router.get('/stats', publicController.getStats);
router.post('/contact', publicController.submitContact);

export default router;
