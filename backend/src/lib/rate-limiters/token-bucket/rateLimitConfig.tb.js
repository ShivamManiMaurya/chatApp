const uploadRateLimiterConfig = {
  perUser: {
    capacity: 10, // Max 10 uploads at once (burst size)
    refillRate: 1, // Refill 1 token per second
  },
  messages: {
    exceeded:
      "Upload rate exceeded. Please wait a few seconds before uploading again.",
  },
};

export default uploadRateLimiterConfig;
