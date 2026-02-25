"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "@app/utils/axios";
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
  Users,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Crown,
  Zap,
  Briefcase,
} from "lucide-react";
import { ITenant } from "@app/types/tenant";
import { Skeleton } from "@app/components/ui/skeleton";

const Subscription = () => {
  const router = useRouter();
  const currentUser = useAppSelector(
    (state: ReduxState) => state.auth.currentUser,
  );

  // Strict check for Organization Admin (tenant_admin)
  const hasAccess = React.useMemo(() => {
    if (!currentUser) return false;
    return currentUser.level === "tenant_admin";
  }, [currentUser]);

  const {
    data: tenant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-tenant"],
    queryFn: async () => {
      const res = await axios.get("/tenants/me");
      return res.data?.data as ITenant & {
        userCount?: number;
      };
    },
    enabled: hasAccess,
  });

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
              Only the Organization Administrator has permission to view
              subscription details.
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
        <ContentHeader title="Subscription Details" />
        <section className="content p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const planName =
    (tenant?.plan || "Basic").charAt(0).toUpperCase() +
    (tenant?.plan || "Basic").slice(1);
  const isCustom = tenant?.plan === "custom";
  const isUnlimited = tenant?.maxUsers === -1;

  const getPlanIcon = (plan?: string) => {
    switch (plan?.toLowerCase()) {
      case "enterprise":
        return <Crown className="text-amber-500" />;
      case "professional":
        return <Zap className="text-blue-500" />;
      case "custom":
        return <Briefcase className="text-[#368F8B]" />;
      default:
        return <ShieldCheck className="text-emerald-500" />;
    }
  };

  return (
    <div className="content-wrapper">
      <ContentHeader title="Manage Subscription" />
      <section className="content p-4 md:p-6 bg-gray-50/50 dark:bg-[#1a1b1e]">
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Current Plan Card */}
          <div className="relative overflow-hidden bg-white dark:bg-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Building2 size={120} />
            </div>

            <div className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#368F8B]/10 flex items-center justify-center border border-[#368F8B]/20">
                    <div className="scale-125">{getPlanIcon(tenant?.plan)}</div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {planName} Plan
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Active
                      </Badge>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                      Organization:{" "}
                      <span className="text-[#368F8B] font-bold">
                        {tenant?.name}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white px-8 rounded-xl h-12 font-bold shadow-lg shadow-[#368F8B]/20 group transition-all"
                    onClick={() =>
                      window.open("https://jitalsolution.com/contact", "_blank")
                    }
                  >
                    Upgrade Plan
                    <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-[#368F8B]/5 dark:bg-[#368F8B]/10 px-8 py-6 border-t border-[#368F8B]/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    User Allocation
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-gray-800 dark:text-gray-200">
                      {tenant?.userCount ?? 0}
                    </span>
                    <span className="text-sm font-bold text-gray-400 mb-1">
                      / {isUnlimited ? "∞" : tenant?.maxUsers ?? "—"} limit
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        (tenant?.userCount || 0) / (tenant?.maxUsers || 1) > 0.9
                          ? "bg-red-500"
                          : "bg-[#368F8B]"
                      }`}
                      style={{
                        width: `${Math.min(((tenant?.userCount || 0) / (tenant?.maxUsers || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Status
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                    <span className="text-lg font-bold text-emerald-600">
                      Active Subscription
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    Auto-renewal enabled
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Storage
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-gray-800 dark:text-gray-200">
                      5.2
                    </span>
                    <span className="text-sm font-bold text-gray-400 mb-1">
                      / 10 GB
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium italic">
                    Estimated usage
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Features List */}
            <Card className="lg:col-span-12 border-0 shadow-lg bg-white dark:bg-card">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="text-[#368F8B] w-5 h-5" />
                  Enabled Modules
                </CardTitle>
                <CardDescription>
                  Your plan currently includes access to the following modules
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tenant?.enabledModules?.map((moduleId) => (
                    <div
                      key={moduleId}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-[#368F8B]/30 hover:bg-[#368F8B]/5 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#368F8B] group-hover:text-white transition-colors">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">
                        {moduleId.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support/Upgrade Notice */}
            <Card className="lg:col-span-12 border-0 shadow-lg bg-linear-to-r from-[#368F8B] to-[#2d7a76] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <AlertTriangle size={150} />
              </div>
              <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-black">Need More Resources?</h3>
                  <p className="text-emerald-50 max-w-lg font-medium">
                    If you are hitting your user limits or need additional
                    modules, contact our team to customize a plan for you.
                  </p>
                </div>
                <Button
                  className="bg-white text-[#368F8B] hover:bg-emerald-50 px-10 rounded-xl h-14 font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
                  onClick={() =>
                    window.open("https://jitalsolution.com/contact", "_blank")
                  }
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Subscription;
