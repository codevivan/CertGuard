import rateLimit from 'express-rate-limit';

export const verifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many verification attempts from this IP address. Please try again after 15 minutes.',
  },
});
