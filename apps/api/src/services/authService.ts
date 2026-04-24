import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { generateAuthTokens, verifyRefreshToken } from '../utils/jwt';
import { sendEmail, getVerificationEmailHtml, getPasswordResetEmailHtml } from '../utils/email';
import { AppError } from '../middleware/errorHandler';
import { UserRole, AuthTokens } from '@inksync/shared';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}): Promise<{ user: { id: string; email: string; role: UserRole }; tokens: AuthTokens }> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phone: data.phone,
      emailVerifyToken,
    },
  });

  if (data.role === UserRole.ARTIST) {
    await prisma.artistProfile.create({ data: { userId: user.id } });
  }

  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your InkSync account',
    html: getVerificationEmailHtml(user.firstName, verifyUrl),
  }).catch(console.error);

  const tokens = generateAuthTokens(user.id, user.email, user.role as UserRole);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });

  return {
    user: { id: user.id, email: user.email, role: user.role as UserRole },
    tokens,
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: { id: string; email: string; role: UserRole; firstName: string }; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new AppError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  const tokens = generateAuthTokens(user.id, user.email, user.role as UserRole);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt },
  });

  return {
    user: { id: user.id, email: user.email, role: user.role as UserRole, firstName: user.firstName },
    tokens,
  };
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  const payload = verifyRefreshToken(refreshToken);
  if (payload.userId !== stored.userId) throw new AppError(401, 'Token mismatch');

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });

  const newTokens = generateAuthTokens(stored.user.id, stored.user.email, stored.user.role as UserRole);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: newTokens.refreshToken, userId: stored.user.id, expiresAt },
  });

  return newTokens;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { isRevoked: true },
  });
}

export async function verifyEmail(token: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) throw new AppError(400, 'Invalid verification token');

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Don't reveal if email exists

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: resetToken, passwordResetExpiry: expiry },
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your InkSync password',
    html: getPasswordResetEmailHtml(user.firstName, resetUrl),
  }).catch(console.error);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  });

  if (!user) throw new AppError(400, 'Invalid or expired reset token');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { isRevoked: true },
  });
}
