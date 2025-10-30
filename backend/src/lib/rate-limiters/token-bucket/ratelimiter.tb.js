import redis from "redis";

class TokenBucketRateLimiter {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Token Bucket Algorithm
   * @param {string} key - Unique user identifier (e.g. userId or IP)
   * @param {number} capacity - Max number of tokens in the bucket (burst size)
   * @param {number} refillRate - Tokens added per second
   */
  async checkLimit(key, capacity, refillRate) {
    const redisKey = `upload_bucket:${key}`;
    const now = Date.now();

    // Get current bucket data
    const data = await this.redis.hGetAll(redisKey);
    let tokens = data.tokens ? parseFloat(data.tokens) : capacity;
    const lastRefill = data.lastRefill ? parseInt(data.lastRefill) : now;

    // Calculate elapsed time and refill tokens
    const elapsedSeconds = (now - lastRefill) / 1000;
    const refill = elapsedSeconds * refillRate;
    tokens = Math.min(capacity, tokens + refill);

    // Consume a token
    const allowed = tokens >= 1;
    if (allowed) {
      tokens -= 1;
    }

    // Save updated bucket state
    await this.redis.hSet(redisKey, {
      tokens: tokens.toFixed(3),
      lastRefill: now,
    });

    // Expire key after some idle time (e.g., 10x capacity seconds)
    await this.redis.expire(redisKey, Math.ceil(capacity / refillRate) * 10);

    const remaining = Math.floor(tokens);
    const retryAfter = allowed ? null : Math.ceil((1 - tokens) / refillRate);

    return {
      allowed,
      remaining,
      retryAfter,
      capacity,
    };
  }

  /** Reset a user's token bucket */
  async reset(key) {
    const redisKey = `upload_bucket:${key}`;
    await this.redis.del(redisKey);
  }
}

export default TokenBucketRateLimiter;
