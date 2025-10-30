import redis from "redis";

class SlidingWindowLogRateLimiter {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Sliding Window Log Algorithm
   * @param {string} key - Unique identifier (userId)
   * @param {number} limit - Max number of messages allowed
   * @param {number} windowMs - Time window in milliseconds
   */
  async checkLimit(key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `chat_rate:${key}`;

    // Remove old timestamps outside the window
    await this.redis.zRemRangeByScore(redisKey, "-inf", windowStart);

    // Add current timestamp
    await this.redis.zAdd(redisKey, {
      score: now,
      value: `${now}-${Math.random()}`,
    });

    // Count how many messages are within the current window
    const count = await this.redis.zCard(redisKey);

    // Set expiry to avoid stale data
    await this.redis.expire(redisKey, Math.ceil(windowMs / 1000) + 1);

    // Allow or block
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    // Calculate when reset happens (when oldest timestamp expires)
    let resetTime = now + windowMs;
    if (count > 0) {
      const oldest = await this.redis.zRangeWithScores(redisKey, 0, 0);
      if (oldest.length > 0) {
        resetTime = oldest[0].score + windowMs;
      }
    }

    return {
      allowed,
      count,
      remaining,
      resetTime,
      retryAfter: allowed ? null : Math.ceil((resetTime - now) / 1000),
    };
  }

  /** Reset a specific user's chat limit */
  async reset(key) {
    const redisKey = `chat_rate:${key}`;
    await this.redis.del(redisKey);
  }
}

export default SlidingWindowLogRateLimiter;
