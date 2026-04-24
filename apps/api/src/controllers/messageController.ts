import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as messageService from '../services/messageService';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  type: z.enum(['TEXT', 'IMAGE']).default('TEXT'),
});

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await messageService.getMessages(req.params.roomId, req.user!.userId, query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = sendMessageSchema.parse(req.body);
    const message = await messageService.sendMessage(req.params.roomId, req.user!.userId, data);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

export async function getRoomByAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const room = await messageService.getRoomByAppointment(req.params.appointmentId, req.user!.userId);
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
}
