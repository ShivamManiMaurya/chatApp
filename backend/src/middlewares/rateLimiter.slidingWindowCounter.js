import SlidingWindowCounterRateLimiter from "../lib/rate-limiters/sliding-window-counter/ratelimiter.swc.js";

/**
 * Simple Sliding Window Rate Limiter Middleware
 * for normal CRUD APIs
 */
function createRateLimiter({ redisClient, limit = 100, windowMs = 60 * 1000 }) {
  if (!redisClient) {
    throw new Error("Redis client is required for rate limiter");
  }

  const limiter = new SlidingWindowCounterRateLimiter(redisClient);

  return async (req, res, next) => {
    try {
      // Use IP as key (or user ID if available)
      const key = req.user?.id || req.ip;

      // Check limit
      const result = await limiter.checkLimit(key, limit, windowMs);

      // Send rate limit headers
      res.setHeader("RateLimit-Limit", limit);
      res.setHeader("RateLimit-Remaining", result.remaining);
      res.setHeader(
        "RateLimit-Reset",
        new Date(result.resetTime).toISOString()
      );

      // Block if exceeded
      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter);
        return res.status(429).json({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
          limit,
          remaining: result.remaining,
          resetTime: new Date(result.resetTime).toISOString(),
        });
      }

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      // In case of Redis issue, let the request continue
      next();
    }
  };
}

export default createRateLimiter;
