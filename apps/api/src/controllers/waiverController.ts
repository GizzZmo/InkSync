import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as waiverService from '../services/waiverService';
import { getPresignedDownloadUrl } from '../utils/s3Upload';

const createTemplateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const updateTemplateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  isActive: z.boolean().optional(),
});

const createWaiverSchema = z.object({
  appointmentId: z.string().uuid(),
  templateId: z.string().uuid(),
  medicalHistory: z.record(z.unknown()).optional(),
});

const signWaiverSchema = z.object({
  signatureData: z.string().min(1),
  medicalHistory: z.record(z.unknown()).optional(),
});

export async function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const templates = await waiverService.getWaiverTemplates(req.params.artistId ?? req.user!.userId);
    res.json({ success: true, data: templates });
  } catch (err) {
    next(err);
  }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createTemplateSchema.parse(req.body);
    const artist = await import('../config/database').then(({ prisma }) =>
      prisma.artistProfile.findUnique({ where: { userId: req.user!.userId } })
    );
    if (!artist) { res.status(404).json({ success: false, error: 'Artist profile not found' }); return; }
    const template = await waiverService.createWaiverTemplate(artist.id, req.user!.userId, data);
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateTemplateSchema.parse(req.body);
    const template = await waiverService.updateWaiverTemplate(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: template });
  } catch (err) {
    next(err);
  }
}

export async function createWaiver(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createWaiverSchema.parse(req.body);
    const waiver = await waiverService.createWaiver({ ...data, clientId: req.user!.userId });
    res.status(201).json({ success: true, data: waiver });
  } catch (err) {
    next(err);
  }
}

export async function getWaiver(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const waiver = await waiverService.getWaiver(req.params.id, req.user!.userId);
    res.json({ success: true, data: waiver });
  } catch (err) {
    next(err);
  }
}

export async function signWaiver(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = signWaiverSchema.parse(req.body);
    const waiver = await waiverService.signWaiver(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: waiver });
  } catch (err) {
    next(err);
  }
}

export async function getWaiverPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const waiver = await waiverService.getWaiver(req.params.id, req.user!.userId);
    if (!waiver.pdfS3Key) {
      res.status(404).json({ success: false, error: 'PDF not yet generated' });
      return;
    }
    const url = await getPresignedDownloadUrl(waiver.pdfS3Key);
    res.json({ success: true, data: { url } });
  } catch (err) {
    next(err);
  }
}
