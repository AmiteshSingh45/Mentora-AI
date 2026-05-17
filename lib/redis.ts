import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Singleton Redis client
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Return a mock Redis for development without credentials
      console.warn("⚠️  Upstash Redis not configured. Using mock cache.");
      return createMockRedis();
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// Mock Redis for development
function createMockRedis(): Redis {
  const store = new Map<string, { value: unknown; expiry?: number }>();
  return {
    get: async (key: string) => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiry && Date.now() > item.expiry) { store.delete(key); return null; }
      return item.value;
    },
    set: async (key: string, value: unknown, opts?: { ex?: number }) => {
      store.set(key, { value, expiry: opts?.ex ? Date.now() + opts.ex * 1000 : undefined });
      return "OK";
    },
    del: async (...keys: string[]) => { keys.forEach(k => store.delete(k)); return keys.length; },
    incr: async (key: string) => {
      const item = store.get(key);
      const newVal = ((item?.value as number) ?? 0) + 1;
      store.set(key, { value: newVal, expiry: item?.expiry });
      return newVal;
    },
  } as unknown as Redis;
}

// ==========================================
// Rate Limiters by Plan
// ==========================================

export function getChatRateLimiter(plan: "FREE" | "PRO" | "PREMIUM") {
  const r = getRedis();
  const limits = {
    FREE: { requests: 5, window: "24 h" as const },
    PRO: { requests: 100, window: "24 h" as const },
    PREMIUM: { requests: 1000, window: "24 h" as const },
  };
  const { requests, window } = limits[plan];
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `learnai:chat:${plan.toLowerCase()}`,
  });
}

export function getPDFRateLimiter(plan: "FREE" | "PRO" | "PREMIUM") {
  const r = getRedis();
  const limits = {
    FREE: { requests: 2, window: "24 h" as const },
    PRO: { requests: 20, window: "24 h" as const },
    PREMIUM: { requests: 100, window: "24 h" as const },
  };
  const { requests, window } = limits[plan];
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `learnai:pdf:${plan.toLowerCase()}`,
  });
}

// ==========================================
// Cache Utilities
// ==========================================

export async function getCached<T>(key: string): Promise<T | null> {
  const r = getRedis();
  return (await r.get(key)) as T | null;
}

export async function setCached<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  const r = getRedis();
  await r.set(key, value, { ex: ttlSeconds });
}

export async function invalidateCache(key: string): Promise<void> {
  const r = getRedis();
  await r.del(key);
}

// Cache key builders
export const cacheKeys = {
  userProgress: (userId: string) => `user:${userId}:progress`,
  userStreak: (userId: string) => `user:${userId}:streak`,
  quizHistory: (userId: string) => `user:${userId}:quizzes`,
  document: (docId: string) => `doc:${docId}:meta`,
};
