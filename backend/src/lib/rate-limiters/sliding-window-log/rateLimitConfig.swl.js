const chatRateLimiterConfig = {
  perUser: {
    limit: 20, // Max 20 messages
    windowMs: 10 * 1000, // Every 10 seconds
  },
  messages: {
    rateLimitExceeded: "You're sending messages too fast. Please slow down.",
  },
};

export default chatRateLimiterConfig;
