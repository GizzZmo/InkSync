import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { UserRole, TokenPayload } from '@inksync/shared';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, emailVerified: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Token expired' });
      return;
    }
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }
  authenticate(req, res, next);
}
