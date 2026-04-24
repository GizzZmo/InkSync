import { Router } from 'express';
import * as artistController from '../controllers/artistController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.get('/', artistController.getArtists);
router.get('/:id', artistController.getArtist);
router.put('/:id', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), artistController.updateArtist);

// Portfolio
router.get('/:id/portfolio', artistController.getPortfolio);
router.post('/:id/portfolio/presign', authenticate, authorize(UserRole.ARTIST), artistController.getPortfolioPresignedUrl);
router.post('/:id/portfolio', authenticate, authorize(UserRole.ARTIST), artistController.addPortfolioImage);
router.delete('/:id/portfolio/:imageId', authenticate, authorize(UserRole.ARTIST), artistController.deletePortfolioImage);

export default router;
