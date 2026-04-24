import { Router } from 'express';
import * as studioController from '../controllers/studioController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.get('/', studioController.getStudios);
router.get('/:id', studioController.getStudio);
router.post('/', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), studioController.createStudio);
router.put('/:id', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), studioController.updateStudio);
router.get('/:id/inventory', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), studioController.getInventory);
router.post('/:id/inventory', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), studioController.createInventoryItem);
router.put('/:id/inventory/:itemId', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), studioController.updateInventoryItem);
router.get('/:id/analytics', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), studioController.getAnalytics);

export default router;
