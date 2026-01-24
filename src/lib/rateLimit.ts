import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Sliding window rate limiter
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;

  const current = await redis.incr(windowKey);

  // set expiry only once
  if (current === 1) {
    await redis.expire(windowKey, Math.ceil(windowMs / 1000));
  }

  return current <= limit;
}
