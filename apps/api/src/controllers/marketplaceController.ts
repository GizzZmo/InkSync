import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as marketplaceService from '../services/marketplaceService';
import { TattooStyle } from '@inksync/shared';

const createDesignSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  imageS3Key: z.string().min(1),
  price: z.number().positive(),
  style: z.nativeEnum(TattooStyle),
  licensingTerms: z.string().optional(),
});

const updateDesignSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']).optional(),
  licensingTerms: z.string().optional(),
});

const presignSchema = z.object({ mimeType: z.string().min(1) });

export async function getDesigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await marketplaceService.getFlashDesigns({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      style: req.query.style as TattooStyle | undefined,
      artistId: req.query.artistId as string | undefined,
      status: req.query.status as 'AVAILABLE' | 'SOLD' | 'RESERVED' | undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getDesign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const design = await marketplaceService.getFlashDesignById(req.params.id);
    res.json({ success: true, data: design });
  } catch (err) { next(err); }
}

export async function createDesign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createDesignSchema.parse(req.body);
    const design = await marketplaceService.createFlashDesign(req.user!.userId, data);
    res.status(201).json({ success: true, data: design });
  } catch (err) { next(err); }
}

export async function updateDesign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateDesignSchema.parse(req.body);
    const design = await marketplaceService.updateFlashDesign(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: design });
  } catch (err) { next(err); }
}

export async function deleteDesign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await marketplaceService.deleteFlashDesign(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Design deleted' });
  } catch (err) { next(err); }
}

export async function presignDesignImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mimeType } = presignSchema.parse(req.body);
    const result = await marketplaceService.getPresignedFlashImageUrl(req.user!.userId, mimeType);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function purchaseDesign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const purchase = await marketplaceService.purchaseFlashDesign(req.params.id, req.user!.userId);
    res.status(201).json({ success: true, data: purchase });
  } catch (err) { next(err); }
}

export async function getMyPurchases(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await marketplaceService.getMyPurchases(req.user!.userId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
