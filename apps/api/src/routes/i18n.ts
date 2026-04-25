import { Router } from 'express';
import * as i18nController from '../controllers/i18nController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/locales', i18nController.getSupportedLocales);
router.get('/me', authenticate, i18nController.getUserLocale);
router.put('/me', authenticate, i18nController.updateUserLocale);

export default router;
