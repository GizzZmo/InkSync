import { Router } from 'express';
import * as waiverController from '../controllers/waiverController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.use(authenticate);

// Templates
router.get('/templates', waiverController.getTemplates);
router.post('/templates', authorize(UserRole.ARTIST, UserRole.ADMIN), waiverController.createTemplate);
router.put('/templates/:id', authorize(UserRole.ARTIST, UserRole.ADMIN), waiverController.updateTemplate);

// Waivers
router.post('/', waiverController.createWaiver);
router.get('/:id', waiverController.getWaiver);
router.post('/:id/sign', waiverController.signWaiver);
router.get('/:id/pdf', waiverController.getWaiverPdf);

export default router;
