import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload, AuthTokens, UserRole } from '@inksync/shared';

export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY } as jwt.SignOptions);
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function generateAuthTokens(userId: string, email: string, role: UserRole): AuthTokens {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = { userId, email, role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}
