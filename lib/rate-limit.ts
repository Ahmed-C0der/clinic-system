import { NextResponse } from 'next/server';
import { redis } from './redis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

const defaults: RateLimitConfig = {
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests, please try again later',
};

export async function rateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
): Promise<NextResponse | null> {
  const { windowMs, max, message } = { ...defaults, ...config };
  const redisKey = `ratelimit:${key}`;

  try {
    const current = await redis.incr(redisKey);
    if (current === 1) {
      await redis.pexpire(redisKey, windowMs);
    }
    if (current > max) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    return null;
  } catch {
    return null;
  }
}

export function rateLimitKey(req: Request, suffix: string): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `${ip}:${suffix}`;
}
