import redis from "redis";

class SlidingWindowCounterRateLimiter {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /*
   * @params key {string} - unique identifier (e.g. userId, IP addressess)
   * @params limit {number} - Maximum numbers of request allowed
   * @params windowMS {number} - Time window in milliseconds
   */

  async checkLimit(key, limit, windowMS) {
    const now = Date.now();
    const windowStart = now - windowMS;

    // create a unique redis key for this limiter
    const redisKey = `rate_limit:${key}`;

    // start a redis transaction
    const multi = this.redis.multi();

    // remove old entries outside the current window
    multi.zRemRangeByScore(redisKey, "-inf", windowStart);

    // add current request timestamp
    // Note: Redis v5+ uses zAdd with score-member pairs as objects
    multi.zAdd(redisKey, { score: now, value: `${now}-${Math.random()}` });

    // count request in the current window
    multi.zCard(redisKey);

    // set expiration for cleanup (slightly longer then window)
    multi.expire(redisKey, Math.ceil(windowMS / 1000) + 1);

    // execute transaction --- here all the process now execute so that no other execution other then redis will come in
    // it provides atomic execution
    const results = await multi.exec();

    // get the count from zCard result
    // Redis v5+ returns results as an array directly (no nested error/result pairs)
    const count = results[2];

    // calculate remaining requests
    const remaining = Math.max(0, limit - count);

    // calculate when the oldest request will expire
    let resetTime = now + windowMS;
    if (count > 0) {
      // Redis v5+ uses zRangeWithScores
      const oldestTimestamp = await this.redis.zRangeWithScores(
        redisKey,
        0,
        0
      );
      if (oldestTimestamp.length > 0) {
        resetTime = parseInt(oldestTimestamp[0].score) + windowMS;
      }
    }

    // check if request should be allowed
    const allowed = count <= limit;

    // if not allowed then remove the current request we just added
    if (!allowed) {
      await this.redis.zRemRangeByScore(redisKey, now, now);
    }

    return {
      allowed,
      count: allowed ? count : count - 1,
      remaining,
      resetTime,
      retryAfter: allowed ? null : Math.ceil((resetTime - now) / 1000),
    };
  }

  /**
   * Reset rate limit for a specific key
   * @param {string} key - Unique identifier to reset
   */
  async reset(key) {
    const redisKey = `rate_limit:${key}`;
    await this.redis.del(redisKey);
  }

  /**
   * Get current usage for a key without incrementing
   * @param {string} key - Unique identifier
   * @param {number} windowMs - Time window in milliseconds
   */
  async getUsage(key, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `rate_limit:${key}`;

    // Remove old entries and count current ones
    await this.redis.zRemRangeByScore(redisKey, "-inf", windowStart);
    const count = await this.redis.zCard(redisKey);

    return count;
  }
}

export default SlidingWindowCounterRateLimiter;
