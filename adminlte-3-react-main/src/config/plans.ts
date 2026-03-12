// ─────────────────────────────────────────────────────────────────────────────
// Frontend Plan Definitions
// Must match the backend Server/src/config/plans.js exactly
// ─────────────────────────────────────────────────────────────────────────────

export interface IPlan {
  id: "basic" | "professional" | "enterprise";
  name: string;
  description: string;
  priceMonthly: number; // in INR
  priceYearly: number; // in INR
  maxUsers: number; // -1 = unlimited
  maxStorage: number; // in MB, -1 = unlimited
  features: string[];
  highlighted?: boolean; // show "Most Popular" badge
  color: string;
}

export const PLANS: IPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for small teams getting started",
    priceMonthly: 999,
    priceYearly: 9999,
    maxUsers: 10,
    maxStorage: 5120,
    features: [
      "Up to 10 users",
      "5 GB storage",
      "Core modules (Voters, Visitors)",
      "Dashboard & Reports",
      "Email support",
      "Activity logs",
    ],
    color: "#22c55e",
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing organizations with advanced needs",
    priceMonthly: 2499,
    priceYearly: 24999,
    maxUsers: 50,
    maxStorage: 20480,
    features: [
      "Up to 50 users",
      "20 GB storage",
      "All modules",
      "Events, Members & Projects",
      "Priority email support",
      "Advanced analytics",
      "Custom roles & permissions",
      "API access",
    ],
    highlighted: true,
    color: "#368F8B",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Unlimited scale for large organizations",
    priceMonthly: 4999,
    priceYearly: 49999,
    maxUsers: -1,
    maxStorage: -1,
    features: [
      "Unlimited users",
      "Unlimited storage",
      "All modules + future modules",
      "Dedicated account manager",
      "SLA guarantee (99.9% uptime)",
      "Custom integrations",
      "White labeling",
      "On-premise deployment option",
    ],
    color: "#f59e0b",
  },
];
