import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as aftercareService from '../services/aftercareService';

const createAftercareSchema = z.object({
  instructions: z.string().min(1),
  customMilestones: z.array(z.object({
    dayNumber: z.number().int().positive(),
    title: z.string().min(1),
    instructions: z.string().min(1),
  })).optional(),
  products: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    affiliateUrl: z.string().url().optional(),
  })).optional(),
});

const addPhotoSchema = z.object({
  s3Key: z.string().min(1),
  url: z.string().url(),
  dayNumber: z.number().int().positive(),
});

const addCommentSchema = z.object({
  comment: z.string().min(1),
});

const presignSchema = z.object({ mimeType: z.string().min(1) });

export async function getAftercare(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const aftercare = await aftercareService.getAftercare(req.params.appointmentId, req.user!.userId);
    res.json({ success: true, data: aftercare });
  } catch (err) {
    next(err);
  }
}

export async function createAftercare(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createAftercareSchema.parse(req.body);
    const aftercare = await aftercareService.createAftercare(req.params.appointmentId, req.user!.userId, data);
    res.status(201).json({ success: true, data: aftercare });
  } catch (err) {
    next(err);
  }
}

export async function getPhotoUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mimeType } = presignSchema.parse(req.body);
    const result = await aftercareService.getPhotoUploadUrl(req.params.id, req.user!.userId, mimeType);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = addPhotoSchema.parse(req.body);
    const photo = await aftercareService.addPhoto(req.params.id, req.user!.userId, data);
    res.status(201).json({ success: true, data: photo });
  } catch (err) {
    next(err);
  }
}

export async function addPhotoComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { comment } = addCommentSchema.parse(req.body);
    const photo = await aftercareService.addPhotoComment(req.params.photoId, req.user!.userId, comment);
    res.json({ success: true, data: photo });
  } catch (err) {
    next(err);
  }
}

export async function completeMilestone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const milestone = await aftercareService.completeMilestone(req.params.milestoneId, req.user!.userId);
    res.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
}
