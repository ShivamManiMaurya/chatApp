import redis from "redis";

class FixedWindowCounterRateLimiter {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Fixed Window Counter
   * @param {string} key - Unique key (e.g., userId, IP)
   * @param {number} limit - Max allowed requests
   * @param {number} windowMs - Window size in milliseconds
   */
  async checkLimit(key, limit, windowMs) {
    const redisKey = `fixed_limit:${key}`;
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);

    // Increment the counter atomically
    const count = await this.redis.incr(redisKey);

    if (count === 1) {
      // If first request in this window, set expiry
      await this.redis.expire(redisKey, windowSeconds);
    }

    // Determine if allowed
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    // Get TTL (remaining time for current window)
    const ttl = await this.redis.ttl(redisKey);
    const resetTime = now + ttl * 1000;

    return {
      allowed,
      count,
      remaining,
      resetTime,
      retryAfter: allowed ? null : ttl,
    };
  }

  /** Reset key (optional helper) */
  async reset(key) {
    const redisKey = `fixed_limit:${key}`;
    await this.redis.del(redisKey);
  }
}

export default FixedWindowCounterRateLimiter;
