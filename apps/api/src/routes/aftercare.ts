import { Router } from 'express';
import * as aftercareController from '../controllers/aftercareController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

router.use(authenticate);

router.get('/:appointmentId', aftercareController.getAftercare);
router.post('/:appointmentId', authorize(UserRole.ARTIST, UserRole.ADMIN), aftercareController.createAftercare);
router.post('/:id/photos/presign', aftercareController.getPhotoUploadUrl);
router.post('/:id/photos', aftercareController.addPhoto);
router.post('/:id/photos/:photoId/comments', authorize(UserRole.ARTIST), aftercareController.addPhotoComment);
router.post('/:id/milestones/:milestoneId/complete', aftercareController.completeMilestone);

export default router;
