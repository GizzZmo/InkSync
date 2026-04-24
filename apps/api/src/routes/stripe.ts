import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.post('/connect', authenticate, authorize(UserRole.ARTIST), paymentController.createStripeConnect);
router.get('/connect/:id/link', authenticate, authorize(UserRole.ARTIST), paymentController.getStripeConnectLink);

export default router;
