import { Router } from 'express';
import * as availabilityController from '../controllers/availabilityController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.get('/:artistId', availabilityController.getAvailability);
router.post('/:artistId', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), availabilityController.setAvailability);
router.post('/:artistId/block', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), availabilityController.addBlockedDate);
router.delete('/:artistId/block/:blockedDateId', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), availabilityController.removeBlockedDate);

export default router;
