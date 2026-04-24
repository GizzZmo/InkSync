import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplaceController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.get('/', marketplaceController.getDesigns);
router.get('/purchases/me', authenticate, marketplaceController.getMyPurchases);
router.get('/:id', marketplaceController.getDesign);
router.post('/presign', authenticate, authorize(UserRole.ARTIST), marketplaceController.presignDesignImage);
router.post('/', authenticate, authorize(UserRole.ARTIST), marketplaceController.createDesign);
router.put('/:id', authenticate, authorize(UserRole.ARTIST), marketplaceController.updateDesign);
router.delete('/:id', authenticate, authorize(UserRole.ARTIST), marketplaceController.deleteDesign);
router.post('/:id/purchase', authenticate, marketplaceController.purchaseDesign);

export default router;
