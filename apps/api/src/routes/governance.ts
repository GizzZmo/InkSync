import { Router } from 'express';
import * as governanceController from '../controllers/governanceController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@inksync/shared';

const router = Router();

// ── Trust & Safety – Content Reporting ───────────────────────────────────
router.post('/reports', authenticate, governanceController.reportContent);
router.get('/reports', authenticate, authorize(UserRole.ADMIN), governanceController.listContentReports);
router.patch('/reports/:id', authenticate, authorize(UserRole.ADMIN), governanceController.resolveContentReport);

// ── Artist Verification & Badges ──────────────────────────────────────────
router.get('/badges/artist/:artistId', governanceController.getArtistBadges);
router.post('/badges/request', authenticate, authorize(UserRole.ARTIST), governanceController.requestBadge);
router.get('/badges/requests', authenticate, authorize(UserRole.ADMIN), governanceController.listBadgeRequests);
router.patch('/badges/requests/:id', authenticate, authorize(UserRole.ADMIN), governanceController.reviewBadgeRequest);

// ── GDPR / Data Rights ────────────────────────────────────────────────────
router.get('/gdpr/my-data', authenticate, governanceController.getMyData);
router.post('/gdpr/export', authenticate, governanceController.requestDataExport);
router.get('/gdpr/exports', authenticate, governanceController.getUserDataExports);
router.delete('/gdpr/account', authenticate, governanceController.requestAccountDeletion);

export default router;
