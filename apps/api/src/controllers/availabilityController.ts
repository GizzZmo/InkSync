import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as availabilityService from '../services/availabilityService';

const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean().default(true),
});

const setAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema).min(1),
});

const blockedDateSchema = z.object({
  date: z.string().datetime(),
  reason: z.string().optional(),
});

export async function getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await availabilityService.getAvailability(req.params.artistId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function setAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slots } = setAvailabilitySchema.parse(req.body);
    const result = await availabilityService.setAvailability(req.params.artistId, req.user!.userId, slots);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addBlockedDate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, reason } = blockedDateSchema.parse(req.body);
    const result = await availabilityService.addBlockedDate(req.params.artistId, req.user!.userId, {
      date: new Date(date),
      reason,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeBlockedDate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await availabilityService.removeBlockedDate(req.params.blockedDateId, req.user!.userId);
    res.json({ success: true, message: 'Blocked date removed' });
  } catch (err) {
    next(err);
  }
}
