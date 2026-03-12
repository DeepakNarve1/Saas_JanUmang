const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ─── Tenant & User ────────────────────────────────────────────────────────
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Stripe IDs ───────────────────────────────────────────────────────────
    stripeSessionId: {
      type: String,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
    stripeInvoiceId: {
      type: String,
    },

    // ─── Plan Details ─────────────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ["basic", "professional", "enterprise"],
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    // ─── Financials ───────────────────────────────────────────────────────────
    // Amounts stored in smallest currency unit (paise for INR, cents for USD)
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "inr",
    },

    // ─── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "expired"],
      default: "pending",
      index: true,
    },

    // ─── Timestamps ───────────────────────────────────────────────────────────
    paidAt: Date,
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,

    // ─── Raw Stripe Event data (for debugging / audit trail) ──────────────────
    stripeEventType: String,
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

// Virtual: human-readable amount string
paymentSchema.virtual("amountFormatted").get(function () {
  return `${this.currency.toUpperCase()} ${(this.amount / 100).toFixed(2)}`;
});

module.exports = mongoose.model("Payment", paymentSchema);
