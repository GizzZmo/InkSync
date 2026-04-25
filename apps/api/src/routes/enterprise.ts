import { Router } from 'express';
import * as enterpriseController from '../controllers/enterpriseController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

// Public – widget embed config (no auth)
router.get('/widget/:slug', enterpriseController.getWidgetConfig);

// Authenticated routes
router.get('/mine', authenticate, enterpriseController.getMyEnterprises);
router.get('/:id', authenticate, enterpriseController.getEnterprise);
router.post('/', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), enterpriseController.createEnterprise);
router.patch('/:id', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), enterpriseController.updateEnterprise);

// Brand management
router.put('/:id/brand', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), enterpriseController.upsertBrand);

// Studio membership
router.post('/:id/studios', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), enterpriseController.addStudio);
router.delete('/:id/studios/:studioId', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), enterpriseController.removeStudio);

// Cross-location analytics
router.get('/:id/analytics', authenticate, authorize(UserRole.STUDIO_OWNER, UserRole.ADMIN), enterpriseController.getAnalytics);

export default router;
