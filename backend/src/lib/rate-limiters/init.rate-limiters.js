import redis from "redis";

// local imports
import createRateLimiter from "../../middlewares/apiRateLimiter.slidingWindowCounter.js";
import rateLimitConfigSwc from "./sliding-window-counter/rateLimitConfig.swc.js";
import createFixedWindowRateLimiter from "../../middlewares/authRateLImiter.fixedWindowCounter.js";
import authRateLimiterConfig from "./fixed-window-counter/rateLimitConfig.fwc.js";
import createChatRateLimiter from "../../middlewares/chatRateLimiter.SlidingWindowLog.js";
import chatRateLimiterConfig from "./sliding-window-log/rateLimitConfig.swl.js";
import createUploadRateLimiter from "../../middlewares/uploadRateLimiter.tokenBucket.js";
import uploadRateLimiterConfig from "./token-bucket/rateLimitConfig.tb.js";

const redisClient = redis.createClient();

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.connect();

const apiRateLimiter = createRateLimiter({
  redisClient,
  limit: rateLimitConfigSwc.presets.api.write.limit,
  windowMs: rateLimitConfigSwc.presets.api.write.windowMs,
});

const authRateLimiter = createFixedWindowRateLimiter({
  redisClient,
  limit: authRateLimiterConfig.signin.limit,
  windowMs: authRateLimiterConfig.signin.windowMs,
});

const chatRateLimiter = createChatRateLimiter({
  redisClient,
  limit: chatRateLimiterConfig.perUser.limit,
  windowMs: chatRateLimiterConfig.perUser.windowMs,
});

const uploadRateLimiter = createUploadRateLimiter({
  redisClient,
  limit: uploadRateLimiterConfig.perUser.limit,
  windowMs: uploadRateLimiterConfig.perUser.windowMs,
});

export { apiRateLimiter, authRateLimiter, chatRateLimiter, uploadRateLimiter };
