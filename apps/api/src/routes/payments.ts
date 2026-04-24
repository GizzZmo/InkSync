import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.use(authenticate);

router.post('/deposit', authorize(UserRole.CLIENT), paymentController.createDeposit);
router.post('/refund', paymentController.createRefund);
router.get('/artist/:id', authorize(UserRole.ARTIST, UserRole.ADMIN), paymentController.getArtistPayments);

export default router;
