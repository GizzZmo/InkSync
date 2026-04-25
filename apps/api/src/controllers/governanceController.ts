import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as governanceService from '../services/governanceService';

const reportSchema = z.object({
  targetType: z.enum(['REVIEW', 'BLOG_POST', 'ARTIST_PROFILE', 'MESSAGE', 'FLASH_DESIGN']),
  targetId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
});

const resolveReportSchema = z.object({
  status: z.enum(['REVIEWED', 'RESOLVED', 'DISMISSED']),
  resolution: z.string().max(2000).optional(),
});

const badgeRequestSchema = z.object({
  badgeType: z.enum(['VERIFIED_ARTIST', 'TOP_RATED', 'FEATURED', 'SAFETY_TRAINED', 'APPRENTICE_CERTIFIED']),
});

const reviewBadgeSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ── Content Reporting ─────────────────────────────────────────────────────

export async function reportContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = reportSchema.parse(req.body);
    const report = await governanceService.reportContent(req.user!.userId, data);
    res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
}

export async function listContentReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await governanceService.listContentReports(req.user!.userId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
      targetType: req.query.targetType as string | undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function resolveContentReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = resolveReportSchema.parse(req.body);
    const report = await governanceService.resolveContentReport(req.user!.userId, req.params.id, data);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
}

// ── Artist Badges / Verification ──────────────────────────────────────────

export async function requestBadge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { badgeType } = badgeRequestSchema.parse(req.body);
    const badge = await governanceService.requestBadge(req.user!.userId, badgeType);
    res.status(201).json({ success: true, data: badge });
  } catch (err) { next(err); }
}

export async function getArtistBadges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const badges = await governanceService.getArtistBadges(req.params.artistId);
    res.json({ success: true, data: badges });
  } catch (err) { next(err); }
}

export async function listBadgeRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await governanceService.listBadgeRequests(req.user!.userId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as string | undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function reviewBadgeRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = reviewBadgeSchema.parse(req.body);
    const badge = await governanceService.reviewBadgeRequest(req.user!.userId, req.params.id, {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
    res.json({ success: true, data: badge });
  } catch (err) { next(err); }
}

// ── GDPR / Data Rights ────────────────────────────────────────────────────

export async function requestDataExport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const request = await governanceService.requestDataExport(req.user!.userId);
    res.status(201).json({ success: true, data: request });
  } catch (err) { next(err); }
}

export async function getUserDataExports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await governanceService.getUserDataExports(req.user!.userId);
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
}

export async function getMyData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await governanceService.getMyData(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function requestAccountDeletion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await governanceService.requestAccountDeletion(req.user!.userId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
