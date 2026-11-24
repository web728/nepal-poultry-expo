import "server-only";
import { collections } from "@/lib/mongodb/client";

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window rate limiter stored in MongoDB, so it holds across serverless
 * instances. Expired windows are removed by a TTL index.
 */
export async function rateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000;
  const expiresAt = new Date(windowStart + windowSeconds * 1000);
  const id = `${key}:${windowStart}`;

  const { rateLimits } = await collections();
  const doc = await rateLimits.findOneAndUpdate(
    { _id: id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" },
  );
  const count = doc?.count ?? 1;
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}
