import { NextResponse } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

const defaults: RateLimitConfig = {
  maxRequests: 30,
  windowMs: 60_000,
};

/**
 * Lightweight in-memory rate limiter.
 * In production on Vercel, replace with Redis-based rate limiting.
 */
export function rateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {},
): { ok: boolean } {
  const { maxRequests, windowMs } = { ...defaults, ...config };
  const now = Date.now();

  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= maxRequests) {
    return { ok: false };
  }

  entry.count += 1;
  return { ok: true };
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    { status: 429 },
  );
}
