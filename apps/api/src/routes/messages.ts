import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/appointment/:appointmentId', messageController.getRoomByAppointment);
router.get('/:roomId', messageController.getMessages);
router.post('/:roomId', messageController.sendMessage);

export default router;
