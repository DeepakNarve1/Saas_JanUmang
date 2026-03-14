/**
 * PLAN DEFINITIONS
 * ─────────────────────────────────────────────────────────────────────────────
 * priceMonthlyPaise / priceYearlyPaise: amounts in paise (1 INR = 100 paise)
 * razorpayPlanIdMonthly / razorpayPlanIdYearly: Razorpay Plan IDs — set these after creating
 *   plans in your Razorpay Dashboard.
 *
 * HOW TO CREATE RAZORPAY PLAN IDs:
 * 1. Go to https://dashboard.razorpay.com/app/subscriptions/plans
 * 2. Click "Create Plan" for each tier
 * 3. Copy each Plan ID (starts with "plan_") into the env vars below
 *
 * Then add to Server/.env:
 *   RAZORPAY_PLAN_BASIC_MONTHLY=plan_xxxx
 *   RAZORPAY_PLAN_BASIC_YEARLY=plan_xxxx
 *   RAZORPAY_PLAN_PRO_MONTHLY=plan_xxxx
 *   RAZORPAY_PLAN_PRO_YEARLY=plan_xxxx
 *   RAZORPAY_PLAN_ENT_MONTHLY=plan_xxxx
 *   RAZORPAY_PLAN_ENT_YEARLY=plan_xxxx
 */

const PLANS = {
  basic: {
    id: "basic",
    name: "Basic",
    description: "Perfect for small teams getting started",
    maxUsers: 10,
    maxStorage: 5120, // 5 GB in MB
    priceMonthlyPaise: 99900, // ₹999/month
    priceYearlyPaise: 999900, // ₹9,999/year (save ~17%)
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_BASIC_MONTHLY || "",
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_BASIC_YEARLY || "",
    features: [
      "Up to 10 users",
      "5 GB storage",
      "Core modules",
      "Email support",
      "Activity logs",
    ],
    color: "#22c55e",
  },

  professional: {
    id: "professional",
    name: "Professional",
    description: "For growing organizations with advanced needs",
    maxUsers: 50,
    maxStorage: 20480, // 20 GB in MB
    priceMonthlyPaise: 249900, // ₹2,499/month
    priceYearlyPaise: 2499900, // ₹24,999/year (save ~17%)
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY || "",
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_PRO_YEARLY || "",
    features: [
      "Up to 50 users",
      "20 GB storage",
      "All modules",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom roles",
    ],
    highlighted: true,
    color: "#368F8B",
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited scale for large organizations",
    maxUsers: -1, // unlimited
    maxStorage: -1, // unlimited
    priceMonthlyPaise: 499900, // ₹4,999/month
    priceYearlyPaise: 4999900, // ₹49,999/year (save ~17%)
    razorpayPlanIdMonthly: process.env.RAZORPAY_PLAN_ENT_MONTHLY || "",
    razorpayPlanIdYearly: process.env.RAZORPAY_PLAN_ENT_YEARLY || "",
    features: [
      "Unlimited users",
      "Unlimited storage",
      "All modules",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
      "White labeling",
    ],
    color: "#f59e0b",
  },
};

module.exports = PLANS;
