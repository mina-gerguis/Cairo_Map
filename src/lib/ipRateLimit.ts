interface RateLimitRecord {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  blocked: boolean;
}

// Global in-memory map to store IP attempt records across requests
const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24-hour window

/**
 * Extracts the client's public IP address from standard request headers.
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp?.trim()) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Checks if the given IP address is currently blocked without incrementing the counter.
 * If 24 hours have passed since the first attempt, the limit is automatically reset.
 */
export function checkIpRateLimit(
  ip: string,
  keyPrefix = "forgot-password",
  maxAttempts = MAX_ATTEMPTS,
  windowMs = WINDOW_MS
): { blocked: boolean; count: number; remaining: number; resetInMs: number } {
  const storeKey = `${keyPrefix}:${ip}`;
  const record = rateLimitStore.get(storeKey);
  const now = Date.now();

  if (!record) {
    return { blocked: false, count: 0, remaining: maxAttempts, resetInMs: 0 };
  }

  // Automatic reset after 24 hours
  if (now - record.firstAttemptAt > windowMs) {
    rateLimitStore.delete(storeKey);
    return { blocked: false, count: 0, remaining: maxAttempts, resetInMs: 0 };
  }

  const isBlocked = record.blocked || record.count >= maxAttempts;
  const remaining = Math.max(0, maxAttempts - record.count);
  const resetInMs = Math.max(0, windowMs - (now - record.firstAttemptAt));

  return { blocked: isBlocked, count: record.count, remaining, resetInMs };
}

/**
 * Records an attempt for the given IP address and updates its blocked status.
 * Resets automatically if 24 hours have passed since the previous window start.
 */
export function recordIpAttempt(
  ip: string,
  keyPrefix = "forgot-password",
  maxAttempts = MAX_ATTEMPTS,
  windowMs = WINDOW_MS
): { blocked: boolean; count: number; remaining: number; resetInMs: number } {
  const storeKey = `${keyPrefix}:${ip}`;
  const now = Date.now();
  let record = rateLimitStore.get(storeKey);

  if (!record || now - record.firstAttemptAt > windowMs) {
    record = {
      count: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
      blocked: false,
    };
  } else {
    record.count += 1;
    record.lastAttemptAt = now;
  }

  if (record.count >= maxAttempts) {
    record.blocked = true;
  }

  rateLimitStore.set(storeKey, record);

  const remaining = Math.max(0, maxAttempts - record.count);
  const resetInMs = Math.max(0, windowMs - (now - record.firstAttemptAt));
  return { blocked: record.blocked, count: record.count, remaining, resetInMs };
}

/**
 * Resets the rate limit for a given IP immediately (e.g. after successful user login).
 */
export function resetIpRateLimit(ip: string, keyPrefix = "forgot-password"): boolean {
  const storeKey = `${keyPrefix}:${ip}`;
  return rateLimitStore.delete(storeKey);
}
