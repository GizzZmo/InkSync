import { Router } from 'express';
import * as webhookManagementController from '../controllers/webhookManagementController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/events', webhookManagementController.listWebhookEvents);
router.get('/', authenticate, webhookManagementController.getWebhooks);
router.post('/', authenticate, webhookManagementController.createWebhook);
router.put('/:id', authenticate, webhookManagementController.updateWebhook);
router.delete('/:id', authenticate, webhookManagementController.deleteWebhook);

export default router;
