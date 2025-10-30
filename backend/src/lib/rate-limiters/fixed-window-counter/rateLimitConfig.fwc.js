const authRateLimiterConfig = {
  signin: {
    limit: 5, // Max 5 sign-in attempts
    windowMs: 60 * 1000, // per minute
  },
  signup: {
    limit: 3, // Max 3 sign-up attempts
    windowMs: 5 * 60 * 1000, // per 5 minutes
  },
  messages: {
    exceeded: "Too many attempts. Please try again later.",
  },
};

export default authRateLimiterConfig;
