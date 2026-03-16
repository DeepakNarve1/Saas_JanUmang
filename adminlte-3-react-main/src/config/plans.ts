// ─────────────────────────────────────────────────────────────────────────────
// Frontend Plan Definitions
// Must match the backend Server/src/config/modules.js PLANS exactly
// ─────────────────────────────────────────────────────────────────────────────

export interface IModuleItem {
  id: string;
  label: string;
  category: string;
}

export interface IFrontendPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // in INR
  priceYearly: number; // in INR
  maxUsers: number; // -1 = unlimited
  maxStorage: number; // in MB, -1 = unlimited
  features: string[];
  /** Explicit list of modules included in this plan */
  modules: IModuleItem[];
  highlighted?: boolean; // show "Most Popular" badge
  color: string;
  icon?: string;
  /** Whether Razorpay plan IDs are configured for this plan (from backend) */
  enabled?: boolean;
}

// ─── Module catalogue (mirrors server modules.js) ────────────────────────────
export const ALL_MODULES: IModuleItem[] = [
  { id: "dashboard", label: "Dashboard", category: "Core" },
  { id: "users", label: "User Management", category: "Core" },
  { id: "roles", label: "Roles & Permissions", category: "Core" },
  { id: "user_count", label: "User Count", category: "Core" },
  { id: "activity_management", label: "Activity Management", category: "Core" },
  {
    id: "mp_public_problems",
    label: "MP Public Problem",
    category: "Operations",
  },
  { id: "departments", label: "Department", category: "Master Data" },
  { id: "blocks", label: "Block", category: "Master Data" },
  { id: "villages", label: "Village", category: "Master Data" },
  { id: "panchayats", label: "Panchayat", category: "Master Data" },
  { id: "booths", label: "Booth", category: "Master Data" },
  { id: "states", label: "State", category: "Master Data" },
  { id: "divisions", label: "Division", category: "Master Data" },
  { id: "districts", label: "District", category: "Master Data" },
  { id: "parliaments", label: "Parliament", category: "Master Data" },
  { id: "assemblies", label: "Vidhan Sabha", category: "Master Data" },
  { id: "samiti", label: "Samiti", category: "Master Data" },
  { id: "parties", label: "Party", category: "Master Data" },
  { id: "work_types", label: "Work Type", category: "Master Data" },
  { id: "sub_work_types", label: "Sub Type of Work", category: "Master Data" },
  { id: "voters", label: "Voters", category: "People" },
  { id: "visitors", label: "Visitors", category: "Activities" },
  { id: "members", label: "Members", category: "People" },
  { id: "events", label: "Events", category: "Activities" },
  { id: "projects", label: "Projects", category: "Operations" },
  { id: "assembly_issues", label: "Assembly Issues", category: "Operations" },
  { id: "phone_directory", label: "Phone Directory", category: "People" },
  { id: "call_management", label: "Call Management", category: "Activities" },
  { id: "inward_register", label: "Inward Register", category: "Documents" },
  {
    id: "dispatch_register",
    label: "Dispatch Register",
    category: "Documents",
  },
  { id: "in_docs", label: "In Docs (जावक)", category: "Documents" },
  { id: "ganesh_samiti", label: "Ganesh Samiti", category: "Legislative" },
  { id: "tenkar_samiti", label: "Tenkar Samiti", category: "Legislative" },
  { id: "dp_samiti", label: "DP Samiti", category: "Legislative" },
  { id: "mandir_samiti", label: "Mandir Samiti", category: "Legislative" },
  { id: "bhagoria_samiti", label: "Bhagoria Samiti", category: "Legislative" },
  { id: "nirman_samiti", label: "Nirman Samiti", category: "Legislative" },
  { id: "booth_samiti", label: "Booth Samiti", category: "Legislative" },
  { id: "block_samiti", label: "Block Samiti", category: "Legislative" },
  {
    id: "vidhan_sabha_samiti",
    label: "Vidhan Sabha Samiti",
    category: "Legislative",
  },
];

const moduleById = (id: string): IModuleItem =>
  ALL_MODULES.find((m) => m.id === id) ?? { id, label: id, category: "Other" };

// ─── Basic plan module IDs (must match Server/src/config/modules.js PLANS.BASIC) ─
const BASIC_MODULE_IDS = [
  "dashboard",
  "users",
  "roles",
  "user_count",
  "activity_management",
  "mp_public_problems",
  "departments",
  "blocks",
  "villages",
  "panchayats",
  "booths",
  "states",
  "divisions",
  "districts",
  "parliaments",
  "samiti",
  "parties",
  "work_types",
  "sub_work_types",
  "voters",
  "visitors",
];

// ─── Professional plan module IDs ─────────────────────────────────────────────
const PRO_MODULE_IDS = [
  "dashboard",
  "users",
  "roles",
  "user_count",
  "activity_management",
  "mp_public_problems",
  "projects",
  "assembly_issues",
  "departments",
  "blocks",
  "villages",
  "panchayats",
  "booths",
  "members",
  "events",
  "visitors",
  "states",
  "divisions",
  "districts",
  "parliaments",
  "assemblies",
  "samiti",
  "parties",
  "work_types",
  "sub_work_types",
  "voters",
  "phone_directory",
  "call_management",
  "inward_register",
  "dispatch_register",
  "in_docs",
  "ganesh_samiti",
  "tenkar_samiti",
  "dp_samiti",
  "mandir_samiti",
  "bhagoria_samiti",
  "nirman_samiti",
  "booth_samiti",
  "block_samiti",
  "vidhan_sabha_samiti",
];

export const PLANS: IFrontendPlan[] = [
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
    modules: BASIC_MODULE_IDS.map(moduleById),
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
    modules: PRO_MODULE_IDS.map(moduleById),
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
    modules: ALL_MODULES,
    color: "#f59e0b",
  },
];
