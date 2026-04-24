import { Router } from 'express';
import * as styleMatchController from '../controllers/styleMatchController';

const router = Router();

router.post('/match', styleMatchController.getStyleMatch);

export default router;
