/**
 * Server Startup Configuration Validation
 * Ensures that all required environment variables are present before the server starts.
 * This prevents runtime errors that can be hard to debug later.
 */

const validateEnv = () => {
  // ── Hard required: server cannot function without these ───────────────────
  const required = [
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ STARTUP ERROR: Missing required environment variables:");
    missing.forEach((key) => {
      console.error(`   - ${key}`);
    });
    console.error(
      "\nPlease check your .env file and ensure these values are set.",
    );
    process.exit(1);
  }

  // ── Optional: warn but don't crash — email features will fail gracefully ──
  const optional = ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS", "EMAIL_FROM"];
  const missingOptional = optional.filter((key) => !process.env[key]);

  if (missingOptional.length > 0) {
    console.warn(
      "⚠️  EMAIL NOT CONFIGURED — forgot-password & verification emails will not work.",
    );
    console.warn(
      "   Add EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM to your .env to enable email.",
    );
  }

  // ── Format checks ──────────────────────────────────────────────────────────
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    console.warn(
      "⚠️  SECURITY WARNING: JWT_SECRET and JWT_REFRESH_SECRET should be different!",
    );
  }

  console.log("✅ Configuration validation passed.");
};

module.exports = validateEnv;
