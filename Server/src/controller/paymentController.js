const asyncHandler = require("express-async-handler");
const { getRazorpay } = require("../services/razorpayService");
const Payment = require("../models/paymentModel");
const Tenant = require("../models/tenantModel");
const PLANS = require("../config/plans");
const AppError = require("../utils/AppError");
const crypto = require("crypto");

// ─── Helper: apply plan limits to a Tenant document ────────────────────────────
const applyPlanToTenant = (tenant, planId, billingCycle, endDate) => {
  const plan = PLANS[planId];
  if (!plan) return;

  tenant.plan = planId;
  tenant.subscriptionStatus = "active";
  tenant.subscriptionEndDate = endDate;
  tenant.maxUsers = plan.maxUsers;
  tenant.maxStorage = plan.maxStorage;

  const { getPlanConfig } = require("../config/modules");
  const modulePlanConfig = getPlanConfig(planId);

  if (
    modulePlanConfig.enabledModules &&
    modulePlanConfig.enabledModules.includes("*")
  ) {
    const { getAllModuleIds } = require("../config/modules");
    tenant.enabledModules = getAllModuleIds();
  } else {
    tenant.enabledModules = Array.from(
      new Set(modulePlanConfig.enabledModules || []),
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create-subscription
// Creates a Razorpay Subscription.
// ─────────────────────────────────────────────────────────────────────────────
exports.createSubscription = asyncHandler(async (req, res) => {
  const { plan, billingCycle = "monthly" } = req.body;
  const razorpay = getRazorpay();

  if (!PLANS[plan]) {
    throw new AppError(`Invalid plan: ${plan}`, 400);
  }
  if (!["monthly", "yearly"].includes(billingCycle)) {
    throw new AppError("billingCycle must be 'monthly' or 'yearly'", 400);
  }

  const planConfig = PLANS[plan];
  const razorpayPlanId =
    billingCycle === "yearly"
      ? planConfig.razorpayPlanIdYearly
      : planConfig.razorpayPlanIdMonthly;

  if (!razorpayPlanId || razorpayPlanId.startsWith("plan_REPLACE")) {
    throw new AppError(
      `Razorpay Plan ID is not configured for the "${plan}" ${billingCycle} plan. Please add the correct plan_ ID to your .env file.`,
      503,
    );
  }

  const tenant = await Tenant.findById(req.user.tenantId);
  if (!tenant) throw new AppError("Tenant not found", 404);

  // Create Razorpay Subscription
  console.log(`[Razorpay DEBUG] KEY_ID: ${process.env.RAZORPAY_KEY_ID}`);
  console.log(`[Razorpay DEBUG] plan_id being sent: ${razorpayPlanId}`);
  let subscription;
  try {
    subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: billingCycle === "yearly" ? 10 : 120,
      notes: {
        tenantId: tenant._id.toString(),
        userId: req.user._id.toString(),
        plan,
        billingCycle,
      },
    });
  } catch (rzpErr) {
    // Razorpay errors have shape: { statusCode, error: { code, description } }
    const description =
      rzpErr?.error?.description ||
      rzpErr?.message ||
      "Razorpay subscription creation failed";
    const statusCode = rzpErr?.statusCode || 502;
    throw new AppError(description, statusCode);
  }

  // Create pending payment record
  await Payment.create({
    tenantId: tenant._id,
    userId: req.user._id,
    razorpaySubscriptionId: subscription.id,
    plan,
    billingCycle,
    amount:
      billingCycle === "yearly"
        ? planConfig.priceYearlyPaise
        : planConfig.priceMonthlyPaise,
    currency: "INR",
    status: "pending",
  });

  res.json({
    success: true,
    data: {
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/verify-payment
// Verifies the Razorpay payment signature after frontend checkout.
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
  } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    throw new AppError("Invalid payment signature", 400);
  }

  const payment = await Payment.findOne({
    razorpaySubscriptionId: razorpay_subscription_id,
  });
  if (!payment) throw new AppError("Payment record not found", 404);

  if (payment.status === "paid") {
    return res.json({ success: true, message: "Payment already verified" });
  }

  const razorpay = getRazorpay();
  const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);

  const tenant = await Tenant.findById(payment.tenantId);
  if (tenant) {
    // Razorpay ends_at is in seconds
    const endDate = new Date(subscription.end_at * 1000);
    applyPlanToTenant(tenant, payment.plan, payment.billingCycle, endDate);
    tenant.razorpaySubscriptionId = subscription.id;
    await tenant.save();

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();
    payment.subscriptionStartDate = new Date(subscription.start_at * 1000);
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
// GET /api/payment/history
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
      .select("-metadata -razorpayEventType")
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
// ─────────────────────────────────────────────────────────────────────────────
exports.getPlans = asyncHandler(async (req, res) => {
  const publicPlans = Object.values(PLANS).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    maxUsers: p.maxUsers,
    maxStorage: p.maxStorage,
    priceMonthly: p.priceMonthlyPaise / 100,
    priceYearly: p.priceYearlyPaise / 100,
    features: p.features,
    enabled: !!p.razorpayPlanIdMonthly,
  }));

  res.json({ success: true, data: publicPlans });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/webhook
// ─────────────────────────────────────────────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const event = req.body;
  try {
    switch (event.event) {
      case "subscription.charged":
        await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity);
        break;
      case "subscription.cancelled":
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      // Add more events as needed
    }
  } catch (err) {
    console.error(`[Razorpay Webhook] Error processing ${event.event}:`, err.message);
  }

  res.json({ status: "ok" });
};

async function handleSubscriptionCharged(subscription, paymentEntity) {
  const { tenantId, plan, billingCycle } = subscription.notes || {};
  if (!tenantId) return;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return;

  const endDate = new Date(subscription.end_at * 1000);
  applyPlanToTenant(tenant, plan || tenant.plan, billingCycle, endDate);
  tenant.razorpaySubscriptionId = subscription.id;
  await tenant.save();

  // Create or update payment record
  await Payment.findOneAndUpdate(
    { razorpaySubscriptionId: subscription.id, status: "pending" },
    {
      status: "paid",
      razorpayPaymentId: paymentEntity.id,
      paidAt: new Date(),
      subscriptionStartDate: new Date(subscription.start_at * 1000),
      subscriptionEndDate: endDate,
      razorpayEventType: "subscription.charged",
    },
    { upsert: true }
  );
}

async function handleSubscriptionCancelled(subscription) {
  const { tenantId } = subscription.notes || {};
  if (!tenantId) return;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return;

  tenant.subscriptionStatus = "cancelled";
  await tenant.save();
}
