const asyncHandler = require("express-async-handler");
const { getRazorpay } = require("../services/razorpayService");
const Payment = require("../models/paymentModel");
const Tenant = require("../models/tenantModel");
const Plan = require("../models/planModel");
const AppError = require("../utils/AppError");
const crypto = require("crypto");

// ─── Helper: apply plan limits to a Tenant document ────────────────────────────
const applyPlanToTenant = async (tenant, planId, billingCycle, endDate) => {
  const plan = await Plan.findOne({ planId });
  if (!plan) return;

  tenant.plan = planId;
  tenant.subscriptionStatus = "active";
  tenant.subscriptionEndDate = endDate;
  tenant.maxUsers = plan.maxUsers;
  tenant.maxStorage = plan.maxStorage;

  const { getCoreModuleIds, getAllModuleIds } = require("../config/modules");

  if (plan.enabledModules && plan.enabledModules.includes("*")) {
    tenant.enabledModules = getAllModuleIds();
  } else {
    // Merge core modules with plan modules to be safe
    const coreModules = getCoreModuleIds();
    tenant.enabledModules = Array.from(
      new Set([...coreModules, ...(plan.enabledModules || [])])
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

  const planConfig = await Plan.findOne({ planId: plan });
  if (!planConfig) {
    throw new AppError(`Invalid plan: ${plan}`, 400);
  }

  if (!["monthly", "yearly"].includes(billingCycle)) {
    throw new AppError("billingCycle must be 'monthly' or 'yearly'", 400);
  }

  const razorpayPlanId =
    billingCycle === "yearly"
      ? planConfig.razorpayPlanIdYearly
      : planConfig.razorpayPlanIdMonthly;

  if (!razorpayPlanId || razorpayPlanId.startsWith("plan_REPLACE")) {
    throw new AppError(
      `Razorpay Plan ID is not configured for the "${plan}" ${billingCycle} plan. Please contact support.`,
      503
    );
  }

  const tenant = await Tenant.findById(req.user.tenantId);
  if (!tenant) throw new AppError("Tenant not found", 404);

  // Create Razorpay Subscription
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
    await applyPlanToTenant(tenant, payment.plan, payment.billingCycle, endDate);
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
// GET /api/payment/history/:id/invoice
// ─────────────────────────────────────────────────────────────────────────────
exports.downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findOne({
    _id: id,
    tenantId: req.user.tenantId,
  }).lean();

  if (!payment) {
    res.status(404);
    throw new Error("Payment record not found");
  }

  if (payment.status !== "paid") {
    res.status(400);
    throw new Error("Invoice only available for paid transactions");
  }

  const tenant = await Tenant.findById(req.user.tenantId).select("name").lean();

  // Load PDF generator
  const { generateInvoice } = require("../utils/invoiceGenerator");

  const filename = `Invoice_${payment.razorpayPaymentId || payment._id}.pdf`;
  
  res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-type", "application/pdf");

  // Generate and pipe directly to response
  generateInvoice(payment, tenant, res);
});
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/cancel-subscription
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelSubscription = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.user.tenantId);
  const subscriptionId = tenant.razorpaySubscriptionId;

  if (!subscriptionId) {
    res.status(400);
    throw new Error("No active Razorpay subscription found to cancel");
  }

  const razorpay = getRazorpay();
  
  try {
    // Note: cancelAtCycleEnd=true means they keep access until current paid period ends
    await razorpay.subscriptions.cancel(subscriptionId, true);
    
    tenant.subscriptionStatus = "cancelled";
    // We do NOT clear the subscriptionEndDate immediately because they paid for the current cycle
    await tenant.save();

    res.json({
      success: true,
      message: "Subscription has been successfully cancelled. You will retain access until the end of the current billing cycle."
    });
  } catch (error) {
    console.error("[Razorpay] Cancel error:", error);
    res.status(500);
    throw new Error(error.error?.description || "Failed to cancel subscription with payment gateway");
  }
});
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/plans
// ─────────────────────────────────────────────────────────────────────────────
exports.getPlans = asyncHandler(async (req, res) => {
  const { MODULES } = require("../config/modules");
  const plans = await Plan.find({ isActive: true }).sort({ priceMonthlyPaise: 1 });

  const publicPlans = plans.map((p) => {
    const moduleIds = p.enabledModules || [];

    // Map to full module objects
    const planModules = moduleIds
      .map((id) => {
        const mod = Object.values(MODULES).find((m) => m.id === id);
        
        const formatCategory = (cat) => {
          if (!cat) return "Other";
          return cat.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        };

        return mod
          ? { id: mod.id, label: mod.name, category: formatCategory(mod.category) }
          : null;
      })
      .filter(Boolean);

    return {
      id: p.planId,
      name: p.name,
      description: p.description,
      maxUsers: p.maxUsers,
      maxStorage: p.maxStorage,
      priceMonthly: p.priceMonthlyPaise / 100,
      priceYearly: p.priceYearlyPaise / 100,
      features: p.features,
      modules: planModules,
      enabled: !!p.razorpayPlanIdMonthly,
      color: p.color,
      icon: p.icon,
      highlighted: p.highlighted,
    };
  });

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
  await applyPlanToTenant(tenant, plan || tenant.plan, billingCycle, endDate);
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
