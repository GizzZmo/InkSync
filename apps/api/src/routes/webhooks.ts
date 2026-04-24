import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController';

const router = Router();

// Note: raw body parsing is set up in index.ts before this route
router.post('/stripe', handleStripeWebhook);

export default router;
