const rateLimit = require("express-rate-limit");

/**
 * Creates a standardised rate limit error response consistent
 * with the rest of the API error format.
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    status: "fail",
    message:
      "Too many requests from this IP address. Please wait a few minutes and try again.",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. LOGIN  — strictest limit: 10 attempts per 15 minutes per IP
//    Protects against credential-stuffing and brute-force attacks.
// ─────────────────────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // Return RateLimit-* headers to the client
  legacyHeaders: false, // Disable the old X-RateLimit-* headers
  message: rateLimitHandler,
  handler: rateLimitHandler,
  // Skip in test environment so automated tests are never blocked
  skip: () => process.env.NODE_ENV === "test",
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. REGISTER  — 20 new accounts per hour per IP
//    Prevents account-farming / spam registrations without blocking
//    legitimate tenant admin who onboards many employees in one session.
// ─────────────────────────────────────────────────────────────────────────────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitHandler,
  handler: rateLimitHandler,
  skip: () => process.env.NODE_ENV === "test",
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PASSWORD RESET — 5 resets per hour per IP
//    Very sensitive endpoint — keeps it tight.
// ─────────────────────────────────────────────────────────────────────────────
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitHandler,
  handler: rateLimitHandler,
  skip: () => process.env.NODE_ENV === "test",
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. GOOGLE LOGIN — 15 attempts per 15 minutes per IP
// ─────────────────────────────────────────────────────────────────────────────
const googleLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitHandler,
  handler: rateLimitHandler,
  skip: () => process.env.NODE_ENV === "test",
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. GENERAL API — broad safety net for all other routes
//    500 requests per 10 minutes — generous enough for normal use
//    but still blocks runaway scripts or scrapers.
// ─────────────────────────────────────────────────────────────────────────────
const generalApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitHandler,
  handler: rateLimitHandler,
  skip: () => process.env.NODE_ENV === "test",
});

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  googleLoginLimiter,
  generalApiLimiter,
};
