/**
 * PLAN DEFINITIONS
 * ─────────────────────────────────────────────────────────────────────────────
 * priceMonthlyPaise / priceYearlyPaise: amounts in paise (1 INR = 100 paise)
 * priceIdMonthly / priceIdYearly: Stripe Price IDs — set these after creating
 *   products in your Stripe Dashboard or via the Stripe CLI.
 *
 * HOW TO CREATE STRIPE PRICE IDs:
 * 1. Go to https://dashboard.stripe.com/products
 * 2. Click "Add product" for each plan
 * 3. Add a monthly recurring price and a yearly recurring price
 * 4. Copy each Price ID (starts with "price_") into the env vars below
 *
 * Then add to Server/.env:
 *   STRIPE_PRICE_BASIC_MONTHLY=price_xxxx
 *   STRIPE_PRICE_BASIC_YEARLY=price_xxxx
 *   STRIPE_PRICE_PRO_MONTHLY=price_xxxx
 *   STRIPE_PRICE_PRO_YEARLY=price_xxxx
 *   STRIPE_PRICE_ENT_MONTHLY=price_xxxx
 *   STRIPE_PRICE_ENT_YEARLY=price_xxxx
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
    stripePriceIdMonthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_BASIC_YEARLY || "",
    features: [
      "Up to 10 users",
      "5 GB storage",
      "Core modules",
      "Email support",
      "Activity logs",
    ],
  },

  professional: {
    id: "professional",
    name: "Professional",
    description: "For growing organizations with advanced needs",
    maxUsers: 50,
    maxStorage: 20480, // 20 GB in MB
    priceMonthlyPaise: 249900, // ₹2,499/month
    priceYearlyPaise: 2499900, // ₹24,999/year (save ~17%)
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY || "",
    features: [
      "Up to 50 users",
      "20 GB storage",
      "All modules",
      "Priority support",
      "Advanced analytics",
      "API access",
      "Custom roles",
    ],
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited scale for large organizations",
    maxUsers: -1, // unlimited
    maxStorage: -1, // unlimited
    priceMonthlyPaise: 499900, // ₹4,999/month
    priceYearlyPaise: 4999900, // ₹49,999/year (save ~17%)
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENT_MONTHLY || "",
    stripePriceIdYearly: process.env.STRIPE_PRICE_ENT_YEARLY || "",
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
  },
};

module.exports = PLANS;
