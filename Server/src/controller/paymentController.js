const asyncHandler = require("express-async-handler");
const { getStripe } = require("../services/stripeService");
const Payment = require("../models/paymentModel");
const Tenant = require("../models/tenantModel");
const PLANS = require("../config/plans");
const AppError = require("../utils/AppError");

// ─── Helper: apply plan limits to a Tenant document ────────────────────────────
const applyPlanToTenant = (tenant, planId, billingCycle, endDate) => {
  const plan = PLANS[planId];
  if (!plan) return;

  tenant.plan = planId;
  tenant.subscriptionStatus = "active";
  tenant.subscriptionEndDate = endDate;
  tenant.maxUsers = plan.maxUsers;
  tenant.maxStorage = plan.maxStorage;

  // ─── Set Enabled Modules ──────────────────────────────────────────────────
  // We use the existing getPlanConfig from modules.js so that we always pull
  // the exact master list of modules for this plan, ensuring no permissions are lost.
  const { getPlanConfig } = require("../config/modules");
  const modulePlanConfig = getPlanConfig(planId);

  if (
    modulePlanConfig.enabledModules &&
    modulePlanConfig.enabledModules.includes("*")
  ) {
    const { getAllModuleIds } = require("../config/modules");
    tenant.enabledModules = getAllModuleIds();
  } else {
    // We strictly use the master modules.js configuration
    tenant.enabledModules = Array.from(
      new Set(modulePlanConfig.enabledModules || []),
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-checkout-session
// Creates a Stripe Checkout session. Tenant admin calls this to start payment.
// ─────────────────────────────────────────────────────────────────────────────
exports.createCheckoutSession = asyncHandler(async (req, res) => {
  const { plan, billingCycle = "monthly" } = req.body;
  const stripe = getStripe();

  // Validate plan
  if (!PLANS[plan]) {
    throw new AppError(`Invalid plan: ${plan}`, 400);
  }
  if (!["monthly", "yearly"].includes(billingCycle)) {
    throw new AppError("billingCycle must be 'monthly' or 'yearly'", 400);
  }

  const planConfig = PLANS[plan];
  const priceId =
    billingCycle === "yearly"
      ? planConfig.stripePriceIdYearly
      : planConfig.stripePriceIdMonthly;

  if (!priceId) {
    throw new AppError(
      `Stripe Price ID not configured for ${plan} ${billingCycle}. ` +
        `Set STRIPE_PRICE_${plan.toUpperCase()}_${billingCycle.toUpperCase()} in .env`,
      500,
    );
  }

  // Find or create a Stripe customer for this tenant
  const tenant = await Tenant.findById(req.user.tenantId);
  if (!tenant) throw new AppError("Tenant not found", 404);

  let stripeCustomerId = tenant.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: tenant.name,
      metadata: {
        tenantId: tenant._id.toString(),
        userId: req.user._id.toString(),
      },
    });
    stripeCustomerId = customer.id;
    tenant.stripeCustomerId = stripeCustomerId;
    await tenant.save();
  }

  // Create the Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/subscription?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription?payment=cancelled`,
    metadata: {
      tenantId: tenant._id.toString(),
      userId: req.user._id.toString(),
      plan,
      billingCycle,
    },
    // Collect billing address for tax / invoicing
    billing_address_collection: "auto",
    // Allow promotion codes
    allow_promotion_codes: true,
    // Automatically create invoice
    invoice_creation: undefined, // handled by subscription mode
    subscription_data: {
      metadata: {
        tenantId: tenant._id.toString(),
        plan,
        billingCycle,
      },
    },
  });

  // Create a pending Payment record immediately so we can track it
  await Payment.create({
    tenantId: tenant._id,
    userId: req.user._id,
    stripeSessionId: session.id,
    stripeCustomerId,
    plan,
    billingCycle,
    amount:
      billingCycle === "yearly"
        ? planConfig.priceYearlyPaise
        : planConfig.priceMonthlyPaise,
    currency: "inr",
    status: "pending",
    metadata: { sessionUrl: session.url },
  });

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      url: session.url,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/verify-session
// Called by the frontend after Stripe redirects back to success_url.
// Double-checks the session status and syncs the tenant if needed.
// ─────────────────────────────────────────────────────────────────────────────
exports.verifySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) throw new AppError("sessionId is required", 400);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.payment_status !== "paid") {
    return res.json({
      success: false,
      message: "Payment not completed yet",
      status: session.payment_status,
    });
  }

  // Find our payment record
  const payment = await Payment.findOne({ stripeSessionId: sessionId });
  if (!payment) throw new AppError("Payment record not found", 404);

  if (payment.status === "paid") {
    // Already processed via webhook — just return success
    return res.json({ success: true, message: "Payment already confirmed" });
  }

  // Sync in case webhook hasn't fired yet
  const subscription = session.subscription;
  const tenant = await Tenant.findById(payment.tenantId);

  if (tenant && subscription) {
    const endDate = new Date(subscription.current_period_end * 1000);
    applyPlanToTenant(tenant, payment.plan, payment.billingCycle, endDate);
    tenant.stripeSubscriptionId = subscription.id;
    await tenant.save();

    payment.status = "paid";
    payment.stripeSubscriptionId = subscription.id;
    payment.stripePaymentIntentId =
      typeof subscription.latest_invoice === "object"
        ? subscription.latest_invoice?.payment_intent
        : null;
    payment.paidAt = new Date();
    payment.subscriptionStartDate = new Date(
      subscription.current_period_start * 1000,
    );
    payment.subscriptionEndDate = endDate;
    await payment.save();
  }

  res.json({
    success: true,
    message: "Payment verified successfully",
    data: {
      plan: payment.plan,
      billingCycle: payment.billingCycle,
      subscriptionEndDate: payment.subscriptionEndDate,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-portal-session
// Opens the Stripe Customer Portal so tenants can manage/cancel subscriptions.
// ─────────────────────────────────────────────────────────────────────────────
exports.createPortalSession = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const tenant = await Tenant.findById(req.user.tenantId);
  if (!tenant) throw new AppError("Tenant not found", 404);

  if (!tenant.stripeCustomerId) {
    throw new AppError(
      "No active subscription found. Please upgrade first.",
      400,
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/subscription`,
  });

  res.json({ success: true, data: { url: portalSession.url } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/history
// Returns paginated payment history for the current tenant.
// ─────────────────────────────────────────────────────────────────────────────
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({ tenantId: req.user.tenantId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-metadata -stripeEventType")
      .lean(),
    Payment.countDocuments({ tenantId: req.user.tenantId }),
  ]);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/plans
// Public — returns available plans and pricing. No auth required.
// ─────────────────────────────────────────────────────────────────────────────
exports.getPlans = asyncHandler(async (req, res) => {
  // Strip internal Stripe Price IDs before sending to frontend
  const publicPlans = Object.values(PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    maxUsers: p.maxUsers,
    maxStorage: p.maxStorage,
    priceMonthly: p.priceMonthlyPaise / 100,
    priceYearly: p.priceYearlyPaise / 100,
    features: p.features,
    enabled: !!p.stripePriceIdMonthly, // true if configured
  }));

  res.json({ success: true, data: publicPlans });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/webhook  ← NO AUTH MIDDLEWARE on this route
// Stripe calls this endpoint when payment events occur.
// CRITICAL: uses raw body buffer for HMAC signature verification.
// ─────────────────────────────────────────────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isDev = process.env.NODE_ENV !== "production";

  let event;

  // In production: ALWAYS verify the Stripe signature (HMAC-SHA256).
  // In development: if no webhook secret is configured, parse the raw body
  //   directly so you can test without the Stripe CLI or ngrok.
  if (webhookSecret && !webhookSecret.startsWith("whsec_REPLACE")) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(
        "[Stripe Webhook] Signature verification failed:",
        err.message,
      );
      return res
        .status(400)
        .json({ error: `Webhook signature error: ${err.message}` });
    }
  } else if (isDev) {
    // Dev fallback — parse raw body without signature check
    try {
      event = JSON.parse(req.body.toString());
      console.warn(
        "[Stripe Webhook] ⚠️  Running WITHOUT signature verification (dev only)",
      );
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON in webhook body" });
    }
  } else {
    // Production with no secret configured — reject
    console.error(
      "[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set in production!",
    );
    return res.status(500).json({ error: "Webhook not configured" });
  }

  try {
    switch (event.type) {
      // ── Checkout completed (first payment) ──────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;
        await handleCheckoutCompleted(session, stripe);
        break;
      }

      // ── Subscription renewed ────────────────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.billing_reason === "subscription_cycle") {
          await handleSubscriptionRenewed(invoice, stripe);
        }
        break;
      }

      // ── Payment failed ──────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      // ── Subscription cancelled or expired ───────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      // ── Subscription updated (plan change) ──────────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription, stripe);
        break;
      }

      default:
        // Ignore events we don't handle
        break;
    }
  } catch (err) {
    // Log processing errors but always return 200 to Stripe
    // (returning non-200 causes Stripe to retry the event indefinitely)
    console.error(
      `[Stripe Webhook] Error processing ${event.type}:`,
      err.message,
    );
  }

  // Always acknowledge receipt to Stripe immediately
  res.json({ received: true });
};

// ─── Webhook Handlers ─────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session, stripe) {
  const { tenantId, userId, plan, billingCycle } = session.metadata || {};
  if (!tenantId || !plan) return;

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription,
  );

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return;

  const endDate = new Date(subscription.current_period_end * 1000);
  applyPlanToTenant(tenant, plan, billingCycle, endDate);
  tenant.stripeCustomerId = session.customer;
  tenant.stripeSubscriptionId = subscription.id;
  await tenant.save();

  // Update the pending Payment record
  await Payment.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      status: "paid",
      stripeSubscriptionId: subscription.id,
      stripePaymentIntentId: subscription.latest_invoice?.payment_intent,
      stripeCustomerId: session.customer,
      paidAt: new Date(),
      subscriptionStartDate: new Date(subscription.current_period_start * 1000),
      subscriptionEndDate: endDate,
      stripeEventType: "checkout.session.completed",
    },
  );
}

async function handleSubscriptionRenewed(invoice, stripe) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription,
  );
  const { tenantId, plan, billingCycle } = subscription.metadata || {};
  if (!tenantId) return;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return;

  const endDate = new Date(subscription.current_period_end * 1000);
  applyPlanToTenant(tenant, plan || tenant.plan, billingCycle, endDate);
  await tenant.save();

  // Create a new Payment record for this renewal
  await Payment.create({
    tenantId,
    userId: tenant.owner,
    stripeSubscriptionId: subscription.id,
    stripeInvoiceId: invoice.id,
    stripeCustomerId: invoice.customer,
    stripePaymentIntentId: invoice.payment_intent,
    plan: plan || tenant.plan,
    billingCycle: billingCycle || "monthly",
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: "paid",
    paidAt: new Date(invoice.status_transitions?.paid_at * 1000 || Date.now()),
    subscriptionStartDate: new Date(subscription.current_period_start * 1000),
    subscriptionEndDate: endDate,
    stripeEventType: "invoice.payment_succeeded",
  });
}

async function handlePaymentFailed(invoice) {
  const tenant = await Tenant.findOne({
    stripeCustomerId: invoice.customer,
  });
  if (!tenant) return;

  // After multiple retries Stripe will cancel the subscription.
  // Here we just flag it — don't immediately suspend the tenant.
  await Payment.findOneAndUpdate(
    { stripeInvoiceId: invoice.id },
    {
      status: "failed",
      stripeEventType: "invoice.payment_failed",
    },
  );

  console.warn(
    `[Stripe Webhook] Payment failed for tenant ${tenant._id} (${tenant.name})`,
  );
  // TODO: send email to tenant admin warning of payment failure
}

async function handleSubscriptionCancelled(subscription) {
  const { tenantId } = subscription.metadata || {};
  if (!tenantId) return;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return;

  tenant.subscriptionStatus = "cancelled";
  // Don't immediately disable access — let them use until subscriptionEndDate
  await tenant.save();
}

async function handleSubscriptionUpdated(subscription, stripe) {
  const { tenantId } = subscription.metadata || {};
  if (!tenantId) return;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return;

  // Determine new plan from subscription items
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!priceId) return;

  // Find matching plan by Price ID
  const matchedPlan = Object.values(PLANS).find(
    (p) =>
      p.stripePriceIdMonthly === priceId || p.stripePriceIdYearly === priceId,
  );
  if (!matchedPlan) return;

  const billingCycle =
    matchedPlan.stripePriceIdYearly === priceId ? "yearly" : "monthly";
  const endDate = new Date(subscription.current_period_end * 1000);
  applyPlanToTenant(tenant, matchedPlan.id, billingCycle, endDate);
  await tenant.save();
}
