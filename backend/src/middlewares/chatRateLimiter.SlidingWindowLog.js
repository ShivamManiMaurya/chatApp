import SlidingWindowLogRateLimiter from "../lib/rate-limiters/sliding-window-log/ratelimiter.swl.js";
import chatRateLimiterConfig from "../lib/rate-limiters/sliding-window-log/rateLimitConfig.swl.js";

/**
 * Chat message rate limiter middleware for socket.io
 * Most accurate per-user limiter (sliding window log)
 */
export default function createChatRateLimiter(redisClient) {
  const limiter = new SlidingWindowLogRateLimiter(redisClient);
  const { limit, windowMs } = chatRateLimiterConfig.perUser;

  return async (socket, next) => {
    try {
      const userId = socket.user?.id || socket.id;
      socket.chatLimiter = async () => {
        const result = await limiter.checkLimit(userId, limit, windowMs);
        if (!result.allowed) {
          socket.emit("rate_limit_exceeded", {
            message: chatRateLimiterConfig.messages.rateLimitExceeded,
            retryAfter: result.retryAfter,
          });
          return false;
        }
        return true;
      };
      next();
    } catch (err) {
      console.error("Chat rate limiter error:", err);
      next(); // Continue if Redis fails
    }
  };
}
