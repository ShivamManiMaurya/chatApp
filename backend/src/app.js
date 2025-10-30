import express, { json } from "express";
import env from "dotenv";
import cookieParser from "cookie-parser";
import redis from "redis";

// routes
import authRoutes from "./routes/auth.route.js";
import msgRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import createRateLimiter from "./middlewares/apiRateLimiter.slidingWindowCounter.js";
import rateLimitConfigSwc from "./lib/rate-limiters/sliding-window-counter/rateLimitConfig.swc.js";
import createFixedWindowRateLimiter from "./middlewares/authRateLImiter.fixedWindowCounter.js";
import authRateLimiterConfig from "./lib/rate-limiters/fixed-window-counter/rateLimitConfig.fwc.js";
import createChatRateLimiter from "./middlewares/chatRateLimiter.SlidingWindowLog.js";
import chatRateLimiterConfig from "./lib/rate-limiters/sliding-window-log/rateLimitConfig.swl.js";
import createUploadRateLimiter from "./middlewares/uploadRateLimiter.tokenBucket.js";
import uploadRateLimiterConfig from "./lib/rate-limiters/token-bucket/rateLimitConfig.tb.js";

env.config();

const app = express();
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

const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());
app.use("/api/auth", authRateLimiter);
app.use("/api/message", apiRateLimiter);
app.use("/api/chat", chatRateLimiter);
app.use("/api/upload", uploadRateLimiter);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/message", msgRoutes);
// app.use("/api/other", )

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("server started at port - ", PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB: ", error);
    process.exit(1);
  });
