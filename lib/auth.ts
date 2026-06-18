import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { redis } from './redis';
import type { AuthContext, accessTokenPayload, refreshTokenPayload } from './models';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-clinic-key-for-jwt-at-least-32-chars-clinic-management'; 
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret-clinic-key-for-jwt-at-least-32-chars-clinic-management';


// --- Redis Session Logic ---

export async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  // SETEX: Key, Seconds (7 days), Value
  await redis.setex(`session:${userId}`, 604800, refreshToken);
}

export async function isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
  const storedToken = await redis.get(`session:${userId}`);
  return storedToken === token;
}

export async function deleteRefreshToken(userId: string): Promise<void> {
  await redis.del(`session:${userId}`);
}

// --- JWT Logic ---

export function signAccessToken(payload: accessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function signRefreshToken(payload: refreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): accessTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as accessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// --- Password Hashing ---

export function hashPassword(password: string, salt: number = 12): string {
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}


// --- Middleware/Handler Authentication ---

// in this v2 i will use cookies not headers  to 
export async function authenticate(req: NextRequest, allowedRoles?: string[]): Promise<AuthContext | NextResponse> {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get('access_token')?.value;
  
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized: Missing token' ,path:req.nextUrl.pathname}, { status: 401 });
  }

  const payload = verifyAccessToken(accessToken);

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  return { user: payload };
}

export async function saveTokenInCookies(token: string, name: string = 'access_token'): Promise<void> {
  const cookiesStore = await cookies();
  const isRefreshToken = name === 'refresh_token';
  const isProd = process.env.NODE_ENV === 'production';

  cookiesStore.set(name, token, {
    httpOnly: true,
    secure: isProd, 
    sameSite: 'strict',
    maxAge: isRefreshToken ? 60 * 60 * 24 * 7 : 60 * 15,
    path: isRefreshToken ? '/api/auth/refresh-token' : '/',
  });
  console.log("save token in cookies ")
}

export async function deleteAccessToken(): Promise<void> {
  const cookiesStore = await cookies();
  cookiesStore.delete('access_token');
}
