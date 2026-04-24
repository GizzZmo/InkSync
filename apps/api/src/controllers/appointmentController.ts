import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as appointmentService from '../services/appointmentService';
import { AppointmentStatus } from '@inksync/shared';

const createSchema = z.object({
  artistId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  serviceType: z.string().min(1),
  description: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  depositAmount: z.number().positive().optional(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
});

const cancelSchema = z.object({ reason: z.string().optional() });

const rescheduleSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export async function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      status: req.query.status as AppointmentStatus | undefined,
    };
    const result = await appointmentService.getAppointments(req.user!.userId, req.user!.role, query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id, req.user!.userId, req.user!.role);
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

export async function createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSchema.parse(req.body);
    const appointment = await appointmentService.createAppointment(req.user!.userId, {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

export async function updateAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateSchema.parse(req.body);
    const appointment = await appointmentService.updateAppointment(req.params.id, req.user!.userId, req.user!.role, {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    });
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

export async function deleteAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await appointmentService.cancelAppointment(req.params.id, req.user!.userId, req.user!.role, 'Deleted by user');
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    next(err);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { reason } = cancelSchema.parse(req.body);
    const appointment = await appointmentService.cancelAppointment(req.params.id, req.user!.userId, req.user!.role, reason);
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

export async function rescheduleAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = rescheduleSchema.parse(req.body);
    const appointment = await appointmentService.rescheduleAppointment(req.params.id, req.user!.userId, req.user!.role, {
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });
    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}
