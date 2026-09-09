const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication routes to prevent brute-force attacks.
 * Allows 15 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

/**
 * General API rate limiter to protect against DoS attacks.
 * Allows 300 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down and try again later.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
