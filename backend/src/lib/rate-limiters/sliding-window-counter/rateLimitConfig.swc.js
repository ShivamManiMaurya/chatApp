// config/rateLimiterConfig.js

const config = {
  // Strategy (we only need per-IP or per-user for CRUD APIs)
  strategies: {
    perIP: {
      keyGenerator: (req) => req.ip || req.connection.remoteAddress,
      limit: 100, // max 100 requests
      windowMs: 60 * 1000, // per minute
    },
    perUser: {
      keyGenerator: (req) => req.user?.id || req.ip,
      limit: 200, // per user limit (if login)
      windowMs: 60 * 1000,
    },
  },

  // Only keep CRUD preset configuration
  presets: {
    api: {
      read: {
        limit: 100,
        windowMs: 60 * 1000, // 1 minute
      },
      write: {
        limit: 50,
        windowMs: 60 * 1000,
      },
      delete: {
        limit: 20,
        windowMs: 60 * 1000,
      },
      upload: {
        limit: 10,
        windowMs: 5 * 60 * 1000, // 5 minutes
      },
      search: {
        limit: 30,
        windowMs: 60 * 1000,
      },
    },
  },

  // Messages
  messages: {
    rateLimitExceeded: {
      api: "API rate limit exceeded. Please try again later or upgrade your plan.",
    },
  },

  // Headers for rate-limit info
  headers: {
    standard: {
      limit: "RateLimit-Limit",
      remaining: "RateLimit-Remaining",
      reset: "RateLimit-Reset",
    },
  },

  // Redis key patterns (still useful)
  redisKeys: {
    prefix: "rate_limit",
    patterns: {
      api: (ip) => `rate_limit:api:${ip}`,
      user: (userId) => `rate_limit:user:${userId}`,
    },
  },
};

export default config;
