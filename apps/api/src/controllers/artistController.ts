import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as artistService from '../services/artistService';
import { TattooStyle } from '@inksync/shared';

const updateProfileSchema = z.object({
  bio: z.string().optional(),
  styles: z.array(z.nativeEnum(TattooStyle)).optional(),
  hourlyRate: z.number().positive().optional(),
  minimumDeposit: z.number().positive().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

const addPortfolioSchema = z.object({
  s3Key: z.string().min(1),
  url: z.string().url(),
  style: z.nativeEnum(TattooStyle),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const presignedUrlSchema = z.object({
  mimeType: z.string().min(1),
});

export async function getArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      style: req.query.style as TattooStyle | undefined,
      city: req.query.city as string | undefined,
      isAvailable: req.query.isAvailable === 'true' ? true : req.query.isAvailable === 'false' ? false : undefined,
    };
    const result = await artistService.getArtists(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const artist = await artistService.getArtistById(req.params.id);
    res.json({ success: true, data: artist });
  } catch (err) {
    next(err);
  }
}

export async function updateArtist(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateProfileSchema.parse(req.body);
    const artist = await artistService.updateArtistProfile(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: artist });
  } catch (err) {
    next(err);
  }
}

export async function getPortfolioPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mimeType } = presignedUrlSchema.parse(req.body);
    const result = await artistService.getPortfolioPresignedUrl(req.params.id, req.user!.userId, mimeType);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addPortfolioImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = addPortfolioSchema.parse(req.body);
    const image = await artistService.addPortfolioImage(req.params.id, req.user!.userId, data);
    res.status(201).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
}

export async function getPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      style: req.query.style as TattooStyle | undefined,
    };
    const result = await artistService.getPortfolio(req.params.id, query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function deletePortfolioImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await artistService.deletePortfolioImage(req.params.imageId, req.user!.userId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
}
