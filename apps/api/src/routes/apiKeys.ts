import { Router } from 'express';
import * as apiKeyController from '../controllers/apiKeyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, apiKeyController.listApiKeys);
router.post('/', authenticate, apiKeyController.createApiKey);
router.delete('/:id', authenticate, apiKeyController.revokeApiKey);

export default router;
