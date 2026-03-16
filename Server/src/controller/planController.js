const asyncHandler = require("express-async-handler");
const Plan = require("../models/planModel");
const AppError = require("../utils/AppError");
const { getRazorpay } = require("../services/razorpayService");

// ─── Helper: Create a Razorpay Plan ─────────────────────────────────────────
// Razorpay requires amount in paise (smallest currency unit).
// interval: "monthly" or "yearly"
const createRazorpayPlan = async (razorpay, plan, interval) => {
  const isYearly = interval === "yearly";
  const amountPaise = isYearly ? plan.priceYearlyPaise : plan.priceMonthlyPaise;

  const rzpPlan = await razorpay.plans.create({
    period: isYearly ? "yearly" : "monthly",
    interval: 1,
    item: {
      name: `${plan.name} - ${isYearly ? "Yearly" : "Monthly"}`,
      amount: amountPaise,
      currency: "INR",
      description: plan.description || `${plan.name} subscription`,
    },
    notes: {
      planId: plan.planId,
      interval,
    },
  });

  return rzpPlan.id;
};

// ─── Helper: Sync plan to Razorpay (create or recreate if price changed) ────
const syncToRazorpay = async (razorpay, plan, existingPlan = null) => {
  const updates = {};

  // If the incoming plan already has an ID manually set by the admin, NEVER overwrite it.
  // Only auto-create if: the ID is missing AND (it's a new plan OR the price changed).
  const monthlyNeedsAutoCreate =
    !plan.razorpayPlanIdMonthly && // no manually provided ID
    (
      !existingPlan ||                                                      // new plan
      !existingPlan.razorpayPlanIdMonthly ||                                // had no ID before either
      existingPlan.priceMonthlyPaise !== plan.priceMonthlyPaise             // price changed
    );

  const yearlyNeedsAutoCreate =
    !plan.razorpayPlanIdYearly && // no manually provided ID
    (
      !existingPlan ||
      !existingPlan.razorpayPlanIdYearly ||
      existingPlan.priceYearlyPaise !== plan.priceYearlyPaise
    );

  if (monthlyNeedsAutoCreate) {
    // Razorpay does NOT allow editing price of an existing plan — must create a new one
    const id = await createRazorpayPlan(razorpay, plan, "monthly");
    updates.razorpayPlanIdMonthly = id;
    console.log(`[Razorpay] Auto-created monthly plan: ${id}`);
  } else if (plan.razorpayPlanIdMonthly) {
    console.log(`[Razorpay] Keeping manually provided monthly plan ID: ${plan.razorpayPlanIdMonthly}`);
  }

  if (yearlyNeedsAutoCreate) {
    const id = await createRazorpayPlan(razorpay, plan, "yearly");
    updates.razorpayPlanIdYearly = id;
    console.log(`[Razorpay] Auto-created yearly plan: ${id}`);
  } else if (plan.razorpayPlanIdYearly) {
    console.log(`[Razorpay] Keeping manually provided yearly plan ID: ${plan.razorpayPlanIdYearly}`);
  }

  return updates;
};

// @desc    Get all plans (public - active only)
// @route   GET /api/plans
// @access  Public
exports.getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort({ priceMonthlyPaise: 1 });
  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
  });
});

// @desc    Get all plans (Admin view - includes inactive)
// @route   GET /api/plans/admin
// @access  Private/GlobalAdmin
exports.getAdminPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({}).sort({ priceMonthlyPaise: 1 });
  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans,
  });
});

// @desc    Get single plan
// @route   GET /api/plans/:id
// @access  Public
exports.getPlanById = asyncHandler(async (req, res) => {
  let plan = await Plan.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { planId: req.params.id },
    ],
  });

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  res.status(200).json({
    success: true,
    data: plan,
  });
});

// @desc    Force-sync a plan's Razorpay IDs using the correct API key
// @route   POST /api/plans/:id/sync-razorpay
// @access  Private/GlobalAdmin
exports.syncPlanToRazorpay = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();

  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  if (plan.priceMonthlyPaise < 100 || plan.priceYearlyPaise < 100) {
    throw new AppError("Plan prices must be at least ₹1 (100 paise) to sync with Razorpay.", 400);
  }

  // Always create fresh Razorpay plans (old IDs from wrong account are useless)
  let monthlyId, yearlyId;
  try {
    monthlyId = await createRazorpayPlan(razorpay, plan, "monthly");
    console.log(`[Razorpay] Synced monthly plan: ${monthlyId}`);
  } catch (err) {
    throw new AppError(
      `Failed to create monthly Razorpay plan: ${err?.error?.description || err.message}`,
      502
    );
  }

  try {
    yearlyId = await createRazorpayPlan(razorpay, plan, "yearly");
    console.log(`[Razorpay] Synced yearly plan: ${yearlyId}`);
  } catch (err) {
    throw new AppError(
      `Failed to create yearly Razorpay plan: ${err?.error?.description || err.message}`,
      502
    );
  }

  plan.razorpayPlanIdMonthly = monthlyId;
  plan.razorpayPlanIdYearly = yearlyId;
  await plan.save();

  res.status(200).json({
    success: true,
    message: "Plan successfully synced with Razorpay using your configured API key.",
    data: {
      razorpayPlanIdMonthly: monthlyId,
      razorpayPlanIdYearly: yearlyId,
    },
  });
});

// @desc    Create a plan (auto-syncs to Razorpay)
// @route   POST /api/plans
// @access  Private/GlobalAdmin
exports.createPlan = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();

  // 1. Build the plan data — ensure prices are integers
  const planData = { ...req.body };
  planData.priceMonthlyPaise = Math.round(parseInt(planData.priceMonthlyPaise) || 0);
  planData.priceYearlyPaise  = Math.round(parseInt(planData.priceYearlyPaise)  || 0);

  // Guard: Razorpay requires minimum amount of 100 paise (₹1)
  if (planData.priceMonthlyPaise < 100 || planData.priceYearlyPaise < 100) {
    throw new AppError("Plan prices must be at least ₹1 (100 paise) each.", 400);
  }

  // 2. Sync to Razorpay — create plans for both billing cycles
  try {
    const rzpUpdates = await syncToRazorpay(razorpay, planData, null);
    Object.assign(planData, rzpUpdates);
  } catch (err) {
    console.error("[Razorpay] Failed to create plan on Razorpay:", err?.error?.description || err.message);
    // Don't block plan creation — admin can link manually later.
    console.warn("[Razorpay] Plan saved without Razorpay IDs. Go to Razorpay Dashboard → Subscriptions → Plans and link the IDs to this plan to enable checkout.");
  }

  // 3. Save to DB
  const plan = await Plan.create(planData);

  res.status(201).json({
    success: true,
    data: plan,
    razorpaySynced: !!(plan.razorpayPlanIdMonthly && plan.razorpayPlanIdYearly),
  });
});

// @desc    Update a plan (auto-syncs to Razorpay if price changed)
// @route   PUT /api/plans/:id
// @access  Private/GlobalAdmin
exports.updatePlan = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();

  const existingPlan = await Plan.findById(req.params.id);
  if (!existingPlan) {
    throw new AppError("Plan not found", 404);
  }

  const updateData = { ...req.body };

  // Ensure prices are integers
  if (updateData.priceMonthlyPaise !== undefined) {
    updateData.priceMonthlyPaise = Math.round(parseInt(updateData.priceMonthlyPaise) || 0);
  }
  if (updateData.priceYearlyPaise !== undefined) {
    updateData.priceYearlyPaise = Math.round(parseInt(updateData.priceYearlyPaise) || 0);
  }

  // Merge existing plan with incoming changes to check price differences
  const mergedPlan = {
    ...existingPlan.toObject(),
    ...updateData,
  };

  // Sync to Razorpay — will only create new Razorpay plans if price changed
  try {
    const rzpUpdates = await syncToRazorpay(razorpay, mergedPlan, existingPlan);
    Object.assign(updateData, rzpUpdates);
  } catch (err) {
    console.error("[Razorpay] Failed to sync plan update to Razorpay:", err?.error?.description || err.message);
    // Continue saving to DB — admin will see old Razorpay IDs still linked
  }

  const plan = await Plan.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: plan,
    razorpaySynced: !!(plan.razorpayPlanIdMonthly && plan.razorpayPlanIdYearly),
  });
});

// @desc    Delete a plan (Soft delete)
// @route   DELETE /api/plans/:id
// @access  Private/GlobalAdmin
exports.deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  // Soft delete — deactivates plan without removing Razorpay IDs
  plan.isActive = false;
  await plan.save();

  res.status(200).json({
    success: true,
    message: "Plan deactivated",
  });
});
