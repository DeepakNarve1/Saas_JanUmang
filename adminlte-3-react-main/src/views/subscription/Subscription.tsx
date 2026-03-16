"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { handleError } from "@app/utils/errorHandler";
import { useAppSelector, ReduxState } from "@app/store/store";
import { ContentHeader } from "@app/components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
import { Badge } from "@app/components/ui/badge";
import {
  Building2,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Zap,
  ChevronRight,
  Loader2,
  ExternalLink,
  Receipt,
  Grid3X3,
  List,
  Download,
  Layers,
} from "lucide-react";
import { ITenant } from "@app/types/tenant";
import { Skeleton } from "@app/components/ui/skeleton";
import { IFrontendPlan } from "@app/config/plans";
import {
  initiateSubscription,
  formatPrice,
  BillingCycle,
  PlanId,
} from "@app/utils/razorpay";
import { toast } from "react-toastify";
import { PLAN_ICONS } from "@app/views/plans/PlanForm";

// ─── Payment History Row ──────────────────────────────────────────────────────
interface IPaymentRecord {
  _id: string;
  plan: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "expired";
  paidAt?: string;
  subscriptionEndDate?: string;
  createdAt: string;
}

// ─── Module Category colour map ───────────────────────────────────────────────
const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Core: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Operations: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  "Master Data": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  People: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  Activities: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  Documents: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  Legislative: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  Other: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};

const CATEGORY_ORDER = [
  "Core",
  "Operations",
  "Master Data",
  "People",
  "Activities",
  "Documents",
  "Legislative",
  "Other",
];

// ─── Plan Card ────────────────────────────────────────────────────────────────
const PlanCard = ({
  plan,
  currentPlan,
  billingCycle,
  upgrading,
  onSelect,
}: {
  plan: IFrontendPlan;
  currentPlan?: string;
  billingCycle: BillingCycle;
  upgrading: string | null;
  onSelect: (planId: PlanId) => void;
}) => {
  const isCurrentPlan = currentPlan === plan.id;
  const [activeTab, setActiveTab] = useState<"features" | "modules">(
    "features",
  );

  const monthlyEquivalent =
    billingCycle === "yearly"
      ? Math.round(plan.priceYearly / 12)
      : plan.priceMonthly;
  const savings = Math.round(
    ((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) *
      100,
  );

  // Group modules by category
  const modulesByCategory = plan.modules.reduce(
    (acc, mod) => {
      const cat = mod.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(mod);
      return acc;
    },
    {} as Record<string, typeof plan.modules>,
  );

  const sortedCategories = CATEGORY_ORDER.filter((c) => modulesByCategory[c]);

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-300 flex flex-col ${
        plan.highlighted && !isCurrentPlan
          ? "border-[#368F8B] shadow-xl shadow-[#368F8B]/15 scale-[1.02]"
          : isCurrentPlan
            ? "border-emerald-400 shadow-lg shadow-emerald-500/10"
            : "border-gray-200 dark:border-gray-700 hover:border-[#368F8B]/50"
      } bg-white dark:bg-[#1e2023] overflow-visible`}
    >
      {/* Badges */}
      {plan.highlighted && !isCurrentPlan && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <span className="bg-[#368F8B] text-white text-xs font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
            ⭐ Most Popular
          </span>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
          <span className="bg-emerald-500 text-white text-xs font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
            ✓ Current Plan
          </span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 pt-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${plan.color}20` }}
        >
          {(() => {
            const iconEntry = PLAN_ICONS.find((i) => i.name === plan.icon) || PLAN_ICONS.find((i) => i.name === "Layers");
            const Icon = iconEntry?.component || Layers;
            return <Icon className="w-5 h-5" style={{ color: plan.color }} />;
          })()}
        </div>

        <h3 className="text-xl font-black text-gray-900 dark:text-white">
          {plan.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {plan.description}
        </p>

        {/* Price */}
        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              {formatPrice(monthlyEquivalent)}
            </span>
            <span className="text-gray-400 text-sm font-medium">/month</span>
          </div>
          {billingCycle === "yearly" && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(plan.priceMonthly)}/mo
              </span>
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border-0">
                Save {savings}%
              </Badge>
            </div>
          )}
          {billingCycle === "yearly" && (
            <p className="text-xs text-gray-400 mt-1">
              Billed annually at {formatPrice(plan.priceYearly)}
            </p>
          )}
        </div>
      </div>

      {/* Internal tab switcher: Features | Modules */}
      <div className="px-6 mb-3">
        <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800/60 p-0.5 rounded-lg w-fit text-xs">
          <button
            id={`plan-features-tab-${plan.id}`}
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
              activeTab === "features"
                ? "bg-white dark:bg-[#1e2023] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <List className="w-3 h-3" /> Features
          </button>
          <button
            id={`plan-modules-tab-${plan.id}`}
            onClick={() => setActiveTab("modules")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
              activeTab === "modules"
                ? "bg-white dark:bg-[#1e2023] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Grid3X3 className="w-3 h-3" /> Modules
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white ml-0.5"
              style={{ backgroundColor: plan.color }}
            >
              {plan.id === "enterprise" ? "All" : plan.modules.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-4 flex-1" style={{ minHeight: 200 }}>
        {activeTab === "features" && (
          <ul className="space-y-3">
            {plan.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300"
              >
                <CheckCircle2
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: plan.color }}
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "modules" && (
          <div
            className="space-y-3 overflow-y-auto pr-1"
            style={{ maxHeight: 300 }}
          >
            {sortedCategories.map((category) => {
              const colors =
                CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Other"];
              return (
                <div key={category}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {modulesByCategory[category].map((mod) => (
                      <span
                        key={mod.id}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}
                      >
                        {mod.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 pt-2">
        {plan.enabled === false && !isCurrentPlan && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center mb-2 font-medium">
            ⚠️ Payment gateway not yet configured for this plan
          </p>
        )}
        <Button
          id={`plan-cta-${plan.id}`}
          className="w-full h-11 font-bold rounded-xl transition-all"
          disabled={isCurrentPlan || upgrading === plan.id || plan.enabled === false}
          onClick={() => onSelect(plan.id)}
          style={
            !isCurrentPlan && plan.enabled !== false
              ? { backgroundColor: plan.color, color: "white" }
              : undefined
          }
          variant={isCurrentPlan || plan.enabled === false ? "outline" : "default"}
        >
          {upgrading === plan.id ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : plan.enabled === false ? (
            "Coming Soon"
          ) : (
            <>
              Upgrade to {plan.name} <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Subscription = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(
    (state: ReduxState) => state.auth.currentUser,
  );

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");

  // Only tenant_admin can access this page
  const hasAccess = React.useMemo(() => {
    if (!currentUser) return false;
    return currentUser.level === "tenant_admin";
  }, [currentUser]);

  // Inject Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Razorpay handle post-payment is done via handler usually,
  // but we can still check searchParams for success/cancel if we add a callback_url.
  // For now, most logic is moving to handleUpgrade.

  // Fetch tenant
  const { data: tenant, isLoading } = useQuery({
    queryKey: ["my-tenant"],
    queryFn: async () => {
      const res = await axios.get("/tenants/me");
      return res.data?.data as ITenant & { userCount?: number };
    },
    enabled: hasAccess,
  });

  // Fetch payment history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const res = await axios.get("/payment/history?limit=10");
      return res.data;
    },
    enabled: hasAccess && activeTab === "history",
  });

  // Fetch available plans from backend
  const { data: availablePlans, isLoading: plansLoading } = useQuery({
    queryKey: ["payment-plans"],
    queryFn: async () => {
      const res = await axios.get("/payment/plans");
      return res.data?.data as IFrontendPlan[];
    },
    enabled: hasAccess,
  });

  const handleUpgrade = async (planId: PlanId) => {
    if (!currentUser) return;
    try {
      setUpgrading(planId);
      await initiateSubscription(
        planId,
        billingCycle,
        {
          name: currentUser.name || "User",
          email: currentUser.email || "",
        },
        (data) => {
          toast.success(`🎉 Successfully upgraded to ${data.plan} plan!`);
          queryClient.invalidateQueries({ queryKey: ["my-tenant"] });
          queryClient.invalidateQueries({ queryKey: ["payment-history"] });
          setUpgrading(null);
        },
        (error) => {
          toast.error(error);
          setUpgrading(null);
        },
      );
    } catch (error) {
      handleError(error, "Failed to start checkout");
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    toast.info("Billing management is available via your Razorpay account.");
  };

  if (!hasAccess) {
    return (
      <div className="content-wrapper">
        <section className="content p-20 text-center">
          <div className="max-w-md mx-auto bg-white dark:bg-card p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
            <AlertTriangle className="mx-auto text-amber-500 w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Only the Organization Administrator can manage subscriptions.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-[#368F8B] hover:bg-[#2d7a76]"
            >
              Return to Dashboard
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="content-wrapper">
        <ContentHeader title="Subscription" />
        <section className="content p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const currentPlan = tenant?.plan || "basic";
  const isActive = tenant?.subscriptionStatus === "active";
  const isTrial = tenant?.subscriptionStatus === "trial";
  const isUnlimited = tenant?.maxUsers === -1;
  const userUsage = tenant?.userCount || 0;
  const userLimit = tenant?.maxUsers || 10;
  const usagePct = isUnlimited
    ? 0
    : Math.min((userUsage / userLimit) * 100, 100);

  // Build an easy-to-display modules list for the current plan banner
  const currentPlanDef = availablePlans?.find((p) => p.id === currentPlan);

  return (
    <div className="content-wrapper">
      <ContentHeader title="Subscription & Billing" />
      <section className="content p-4 md:p-6 bg-gray-50/50 dark:bg-[#1a1b1e]">
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Current Plan Summary Banner */}
          <div className="relative overflow-hidden bg-white dark:bg-[#1e2023] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Building2 size={100} />
            </div>
            <div className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white capitalize">
                      {currentPlan} Plan
                    </h2>
                    <Badge
                      className={`text-[10px] font-black uppercase tracking-wider border-0 ${
                        isActive
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700"
                          : isTrial
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700"
                      }`}
                    >
                      {tenant?.subscriptionStatus}
                    </Badge>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {tenant?.name}
                    {tenant?.subscriptionEndDate && (
                      <span className="ml-2 text-xs">
                        · Renews{" "}
                        {new Date(
                          tenant.subscriptionEndDate,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {isTrial && tenant?.trialEndsAt && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        · Trial ends{" "}
                        {new Date(tenant.trialEndsAt).toLocaleDateString(
                          "en-IN",
                        )}
                      </span>
                    )}
                  </p>

                  {/* Usage */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span className="font-bold uppercase tracking-wider">
                          User Allocation
                        </span>
                        <span className="font-bold">
                          {userUsage} / {isUnlimited ? "∞" : userLimit}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            usagePct > 90
                              ? "bg-red-500"
                              : usagePct > 70
                                ? "bg-amber-500"
                                : "bg-[#368F8B]"
                          }`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span className="font-bold uppercase tracking-wider">
                          Enabled Modules
                        </span>
                        <span className="font-bold">
                          {tenant?.enabledModules?.length || 0}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tenant?.enabledModules?.slice(0, 5).map((m) => (
                          <span
                            key={m}
                            className="text-[10px] px-2 py-0.5 bg-[#368F8B]/10 text-[#368F8B] dark:text-[#4EADA9] rounded-full font-bold capitalize"
                          >
                            {m.replace(/_/g, " ")}
                          </span>
                        ))}
                        {(tenant?.enabledModules?.length || 0) > 5 && (
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full font-bold">
                            +{(tenant?.enabledModules?.length || 0) - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {tenant?.razorpayCustomerId && (
                    <Button
                      id="manage-billing-btn"
                      variant="outline"
                      onClick={handleManageBilling}
                      className="h-10 text-sm font-bold rounded-xl border-gray-200 dark:border-gray-700"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Manage Billing
                      <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Current Plan – Modules list breakdown */}
              {currentPlanDef && (
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                    Modules included in your current plan
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPlanDef.modules.map((mod) => {
                      const colors =
                        CATEGORY_COLORS[mod.category] ??
                        CATEGORY_COLORS["Other"];
                      return (
                        <span
                          key={mod.id}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text}`}
                        >
                          {mod.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl w-fit">
            {(["plans", "history"] as const).map((tab) => (
              <button
                key={tab}
                id={`subscription-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#1e2023] text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab === "plans" ? "Upgrade Plan" : "Payment History"}
              </button>
            ))}
          </div>

          {/* Plans Tab */}
          {activeTab === "plans" && (
            <>
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span
                  className={`text-sm font-bold ${billingCycle === "monthly" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
                >
                  Monthly
                </span>
                <button
                  id="billing-cycle-toggle"
                  onClick={() =>
                    setBillingCycle((c) =>
                      c === "monthly" ? "yearly" : "monthly",
                    )
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    billingCycle === "yearly"
                      ? "bg-[#368F8B]"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      billingCycle === "yearly"
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-bold ${billingCycle === "yearly" ? "text-gray-900 dark:text-white" : "text-gray-400"}`}
                >
                  Yearly
                  <span className="ml-1.5 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-black">
                    Save 17%
                  </span>
                </span>
              </div>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {plansLoading
                  ? [1, 2, 3].map((i) => (
                      <Skeleton
                        key={i}
                        className="h-[500px] w-full rounded-2xl"
                      />
                    ))
                  : availablePlans?.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        currentPlan={currentPlan}
                        billingCycle={billingCycle}
                        upgrading={upgrading}
                        onSelect={handleUpgrade}
                      />
                    ))}
              </div>

              <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                All prices in INR. Billed via Razorpay — supports UPI, PhonePe,
                Google Pay & Cards.
              </p>
            </>
          )}

          {/* Payment History Tab */}
          {activeTab === "history" && (
            <Card className="border-0 shadow-lg bg-white dark:bg-[#1e2023]">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#368F8B]" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  Your past invoices and payments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {historyLoading ? (
                  <div className="p-8 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                ) : !historyData?.data?.length ? (
                  <div className="p-12 text-center">
                    <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No payments yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Upgrade to a paid plan to see your invoices here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {historyData.data.map((p: IPaymentRecord) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-100   dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              p.status === "paid"
                                ? "bg-emerald-100 dark:bg-emerald-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            {p.status === "paid" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                              {p.plan} Plan · {p.billingCycle}
                            </p>
                            <p className="text-xs text-gray-400">
                              {p.paidAt
                                ? new Date(p.paidAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : new Date(p.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                              ₹{(p.amount / 100).toLocaleString("en-IN")}
                            </p>
                            <Badge
                              className={`text-[10px] font-bold border-0 capitalize ${
                                p.status === "paid"
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700"
                                  : p.status === "failed"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                              }`}
                            >
                              {p.status}
                            </Badge>
                          </div>
                          {p.status === "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Download Invoice"
                              onClick={() => {
                                const token =
                                  localStorage.getItem("token") || "";
                                fetch(
                                  `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api"}/payment/history/${p._id}/invoice`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                )
                                  .then((res) => res.blob())
                                  .then((blob) => {
                                    const url =
                                      window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `Invoice_${p._id}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                  })
                                  .catch(() =>
                                    toast.error("Failed to download invoice"),
                                  );
                              }}
                              className="h-8 w-8 p-0 shrink-0 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#368F8B] hover:bg-[#368F8B]/10"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Subscription;
