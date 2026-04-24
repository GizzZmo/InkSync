import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as reviewService from '../services/reviewService';

const createReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string().max(2000).optional(),
  photoUrls: z.array(z.object({ url: z.string().url(), s3Key: z.string().min(1) })).optional(),
});

const respondSchema = z.object({ response: z.string().min(1).max(2000) });
const presignSchema = z.object({ mimeType: z.string().min(1) });

export async function getArtistReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await reviewService.getArtistReviews(req.params.artistId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createReviewSchema.parse(req.body);
    const review = await reviewService.createReview(req.user!.userId, data);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
}

export async function respondToReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { response } = respondSchema.parse(req.body);
    const review = await reviewService.respondToReview(req.params.id, req.user!.userId, response);
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
}

export async function reportReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await reviewService.reportReview(req.params.id);
    res.json({ success: true, message: 'Review reported' });
  } catch (err) { next(err); }
}

export async function presignReviewPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mimeType } = presignSchema.parse(req.body);
    const result = await reviewService.getPresignedReviewPhotoUrl(mimeType);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
