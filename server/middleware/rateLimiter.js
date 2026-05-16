const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,                 // 100 attempts allowed
  message: { error: 'Too many attempts. Please wait 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };