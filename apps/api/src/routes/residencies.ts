import { Router } from 'express';
import * as residencyController from '../controllers/residencyController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.get('/', residencyController.getResidencies);
router.get('/:id', residencyController.getResidency);
router.post('/', authenticate, authorize(UserRole.ARTIST), residencyController.createResidency);
router.put('/:id', authenticate, authorize(UserRole.ARTIST), residencyController.updateResidency);
router.delete('/:id', authenticate, authorize(UserRole.ARTIST), residencyController.deleteResidency);

export default router;
