import TokenBucketRateLimiter from "../lib/rate-limiters/token-bucket/ratelimiter.tb.js";
import uploadRateLimiterConfig from "../lib/rate-limiters/token-bucket/rateLimitConfig.tb.js";

/**
 * Token Bucket Rate Limiter Middleware (for file/media uploads)
 * Allows short bursts but maintains average rate
 */
export default function createUploadRateLimiter(redisClient) {
  if (!redisClient) {
    throw new Error("Redis client is required for Token Bucket limiter");
  }

  const limiter = new TokenBucketRateLimiter(redisClient);
  const { capacity, refillRate } = uploadRateLimiterConfig.perUser;

  return async (req, res, next) => {
    try {
      const key = req.user?.id || req.ip;
      const result = await limiter.checkLimit(key, capacity, refillRate);

      res.setHeader("RateLimit-Limit", capacity);
      res.setHeader("RateLimit-Remaining", result.remaining);

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter);
        return res.status(429).json({
          error: "Too Many Uploads",
          message: uploadRateLimiterConfig.messages.exceeded,
          retryAfter: result.retryAfter,
        });
      }

      next();
    } catch (err) {
      console.error("Upload rate limiter error:", err);
      next(); // Don’t block if Redis fails
    }
  };
}
