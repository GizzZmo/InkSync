import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', appointmentController.getAppointments);
router.post('/', appointmentController.createAppointment);
router.get('/:id', appointmentController.getAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
router.post('/:id/cancel', appointmentController.cancelAppointment);
router.post('/:id/reschedule', appointmentController.rescheduleAppointment);

export default router;
