const express = require("express");
const {
  createCheckoutSession,
  verifySession,
  createPortalSession,
  getPaymentHistory,
  getPlans,
  handleWebhook,
} = require("../controller/paymentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
// Plan pricing — no auth required (used on marketing/upgrade pages)
router.get("/plans", getPlans);

// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────────
// MUST be registered BEFORE express.json() — uses raw body for HMAC verification
// This route is NOT protected by auth middleware (Stripe calls it directly)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// ─── JSON PARSING FOR OTHER ROUTES ───────────────────────────────────────────
// Since this router is mounted before the global express.json() in app.js
// to allow the webhook to read the raw body, we explicitly enable JSON
// parsing here for the checkout and verify endpoints.
router.use(express.json());

// ─── PROTECTED ───────────────────────────────────────────────────────────────
router.use(protect);

// Create a Stripe Checkout session to start a payment
router.post("/create-checkout-session", createCheckoutSession);

// Verify a completed session (called by frontend after Stripe redirect)
router.post("/verify-session", verifySession);

// Open Stripe Customer Portal (manage subscription, cancel, update payment method)
router.post("/create-portal-session", createPortalSession);

// Payment history for the current tenant
router.get("/history", getPaymentHistory);

module.exports = router;
