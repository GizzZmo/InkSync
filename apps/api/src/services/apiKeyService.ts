import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function createApiKey(userId: string, name: string, expiresAt?: Date) {
  const rawKey = `isk_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: { userId, name, keyHash, keyPrefix, expiresAt },
  });

  return { ...apiKey, rawKey };
}

export async function listApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, expiresAt: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeApiKey(keyId: string, userId: string) {
  const key = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!key) throw new AppError(404, 'API key not found');
  if (key.userId !== userId) throw new AppError(403, 'Not authorized');
  return prisma.apiKey.update({ where: { id: keyId }, data: { isActive: false } });
}

export async function validateApiKey(rawKey: string): Promise<{ userId: string } | null> {
  const keyHash = hashKey(rawKey);
  const key = await prisma.apiKey.findUnique({ where: { keyHash } });

  if (!key || !key.isActive) return null;
  if (key.expiresAt && key.expiresAt < new Date()) return null;

  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return { userId: key.userId };
}
