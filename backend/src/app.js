import express, { json } from "express";
import env from "dotenv";
import cookieParser from "cookie-parser";
import redis from "redis";

// routes
import authRoutes from "./routes/auth.route.js";
import msgRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import createRateLimiter from "./middlewares/rateLimiter.slidingWindowCounter.js";
import rateLimitConfigSwc from "./lib/rate-limiters/sliding-window-counter/rateLimitConfig.swc.js";
import createFixedWindowRateLimiter from "./middlewares/rateLImiter.fixedWindowCounter.js";
import authRateLimiterConfig from "./lib/rate-limiters/fixed-window-counter/rateLimitConfig.fwc.js";

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

const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());
app.use("/api/auth", authRateLimiter);
app.use("/api/message", apiRateLimiter);

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
