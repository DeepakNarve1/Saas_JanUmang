const express = require("express");
const jsonBody = express.json({ limit: "5mb" });
const {
  createSubscription,
  verifyPayment,
  getPaymentHistory,
  getPlans,
  handleWebhook,
} = require("../controller/paymentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
router.get("/plans", getPlans);

// ─── RAZORPAY WEBHOOK ────────────────────────────────────────────────────────
// Razorpay webhooks use a different signature but usually JSON body is fine
router.post(
  "/webhook",
  express.json(),
  handleWebhook,
);

// ─── PROTECTED ───────────────────────────────────────────────────────────────
router.use(protect);

// Create a Razorpay Subscription
router.post("/create-subscription", jsonBody, createSubscription);

// Verify a completed payment (called by frontend handler)
router.post("/verify-payment", jsonBody, verifyPayment);

// Payment history for the current tenant
router.get("/history", getPaymentHistory);

module.exports = router;
