import { Router } from 'express';
import * as communityController from '../controllers/communityController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

// ── Blog ──────────────────────────────────────────────────────────────────
router.get('/blog', communityController.listBlogPosts);
router.get('/blog/:id', communityController.getBlogPost);
router.post('/blog', authenticate, authorize(UserRole.ARTIST), communityController.createBlogPost);
router.patch('/blog/:id', authenticate, authorize(UserRole.ARTIST), communityController.updateBlogPost);

// ── Events ────────────────────────────────────────────────────────────────
router.get('/events', communityController.listEvents);
router.get('/events/:id', communityController.getEvent);
router.post('/events', authenticate, communityController.createEvent);
router.patch('/events/:id', authenticate, communityController.updateEvent);

// ── Apprenticeships ───────────────────────────────────────────────────────
router.get('/apprenticeships', communityController.listApprenticeships);
router.get('/apprenticeships/:id', communityController.getApprenticeship);
router.post('/apprenticeships', authenticate, authorize(UserRole.ARTIST), communityController.createApprenticeship);
router.patch('/apprenticeships/:id', authenticate, authorize(UserRole.ARTIST), communityController.updateApprenticeship);

// ── Academy (Courses) ─────────────────────────────────────────────────────
router.get('/academy/courses', communityController.listCourses);
router.get('/academy/courses/:id', communityController.getCourse);
router.post('/academy/courses', authenticate, authorize(UserRole.ARTIST), communityController.createCourse);
router.post('/academy/courses/:courseId/lessons', authenticate, authorize(UserRole.ARTIST), communityController.addLesson);
router.post('/academy/courses/:courseId/enroll', authenticate, communityController.enrollInCourse);
router.post('/academy/courses/:courseId/complete', authenticate, communityController.completeLesson);
router.get('/academy/enrollments', authenticate, communityController.getUserEnrollments);

export default router;
