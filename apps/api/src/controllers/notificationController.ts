import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as notificationService from '../services/notificationService';

const updatePreferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  aftercareReminders: z.boolean().optional(),
  paymentNotifications: z.boolean().optional(),
  fcmToken: z.string().optional(),
});

export async function getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const prefs = await notificationService.getNotificationPreferences(req.user!.userId);
    res.json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updatePreferencesSchema.parse(req.body);
    const prefs = await notificationService.updateNotificationPreferences(req.user!.userId, data);
    res.json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
}
