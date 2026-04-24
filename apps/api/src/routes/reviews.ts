import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.get('/artist/:artistId', reviewController.getArtistReviews);
router.post('/presign', authenticate, reviewController.presignReviewPhoto);
router.post('/', authenticate, authorize(UserRole.CLIENT), reviewController.createReview);
router.post('/:id/respond', authenticate, authorize(UserRole.ARTIST), reviewController.respondToReview);
router.post('/:id/report', authenticate, reviewController.reportReview);

export default router;
