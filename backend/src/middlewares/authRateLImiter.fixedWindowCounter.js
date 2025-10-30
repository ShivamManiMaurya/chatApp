import FixedWindowCounterRateLimiter from "../lib/rate-limiters/fixed-window-counter/ratelimiter.fwc.js";

/**
 * Fixed Window Rate Limiter Middleware (for signin/signup)
 */
function createFixedWindowRateLimiter({ redisClient, limit, windowMs }) {
  if (!redisClient) {
    throw new Error("Redis client is required for fixed window limiter");
  }

  const limiter = new FixedWindowCounterRateLimiter(redisClient);

  return async (req, res, next) => {
    try {
      // Key: either IP or user identifier
      const key = req.ip;

      const result = await limiter.checkLimit(key, limit, windowMs);

      res.setHeader("RateLimit-Limit", limit);
      res.setHeader("RateLimit-Remaining", result.remaining);
      res.setHeader(
        "RateLimit-Reset",
        new Date(result.resetTime).toISOString()
      );

      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter);
        return res.status(429).json({
          error: "Too Many Requests",
          message: `You’ve exceeded the auth limit. Try again in ${result.retryAfter}s.`,
        });
      }

      next();
    } catch (err) {
      console.error("Auth rate limiter error:", err);
      next(); // Allow request if Redis fails
    }
  };
}

export default createFixedWindowRateLimiter;
