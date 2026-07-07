const rateLimit = require('express-rate-limit');

// Protects the (expensive) evaluation endpoint from being hammered.
// This is a simple in-memory limiter; in a multi-instance production
// deployment this should be backed by Redis (see the architecture doc).
const evaluationLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many evaluation requests. Please wait a moment and try again.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

module.exports = { evaluationLimiter, authLimiter };
