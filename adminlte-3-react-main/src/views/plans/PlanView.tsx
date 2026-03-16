"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import { Skeleton } from "@app/components/ui/skeleton";
import { 
  ArrowLeft, 
  Edit, 
  Layers, 
  CheckCircle2, 
  Users, 
  HardDrive, 
  IndianRupee, 
  Calendar,
  Globe,
  Star
} from "lucide-react";
import { IPlan } from "@app/types/plan";
import { ALL_MODULES } from "@app/config/plans";

interface PlanViewProps {
  id: string;
}

const PlanView = ({ id }: PlanViewProps) => {
  const router = useRouter();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["plan", id],
    queryFn: async () => {
      const res = await axios.get(`/plans/${id}`);
      return res.data.data as IPlan;
    },
  });

  if (isLoading) {
    return (
      <div className="content-wrapper">
        <ContentHeader title="Loading Plan Details..." />
        <div className="p-8">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="content-wrapper">
        <ContentHeader title="Plan Not Found" />
        <div className="p-20 text-center">
          <p className="text-gray-500">The requested plan could not be found.</p>
          <Button onClick={() => router.push("/plans")} className="mt-4">
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <ContentHeader 
        title={`${plan.name} Details`} 
      />
      
      <section className="content">
        <div className="container-fluid px-4">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/plans")}
              className="text-gray-400 hover:text-[#368F8B] gap-2"
            >
              <ArrowLeft size={20} /> Back to List
            </Button>
            <Button 
              onClick={() => router.push(`/plans/${plan._id}/edit`)}
              className="bg-[#368F8B] hover:bg-[#2d7a76] text-white gap-2 px-6"
            >
              <Edit size={18} /> Edit Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="card shadow-lg border-0 rounded-2xl bg-white dark:bg-card overflow-hidden">
                <div 
                  className="h-3 w-full" 
                  style={{ backgroundColor: plan.color || "#368F8B" }}
                />
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        {plan.name}
                        {plan.highlighted && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase font-bold flex items-center gap-1 shadow-sm">
                            <Star size={12} fill="currentColor" /> Popular
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500 mt-2 text-lg">
                        {plan.description || "No description provided."}
                      </p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
                      plan.isActive 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-50 dark:border-gray-800">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Monthly</p>
                      <div className="flex items-center gap-1 text-2xl font-black text-[#368F8B]">
                        <IndianRupee size={20} />
                        {(plan.priceMonthlyPaise / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Yearly</p>
                      <div className="flex items-center gap-1 text-2xl font-black text-[#368F8B]">
                        <IndianRupee size={20} />
                        {(plan.priceYearlyPaise / 100).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Max Users</p>
                      <div className="flex items-center gap-2 text-2xl font-black text-gray-700 dark:text-gray-200">
                        <Users size={20} className="text-gray-400" />
                        {plan.maxUsers === -1 ? "∞" : plan.maxUsers}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Storage</p>
                      <div className="flex items-center gap-2 text-2xl font-black text-gray-700 dark:text-gray-200">
                        <HardDrive size={20} className="text-gray-400" />
                        {plan.maxStorage === -1 ? "∞" : `${(plan.maxStorage / 1024).toFixed(1)}GB`}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                       <Layers size={18} className="text-[#368F8B]" /> Features Included
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.features?.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-50 dark:border-gray-800">
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                      {(!plan.features || plan.features.length === 0) && (
                        <p className="text-gray-400 italic text-sm">No special features listed for this plan.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Stats/Detail Card */}
            <div className="space-y-8">
              <div className="card shadow-lg border-0 rounded-2xl bg-[#368F8B] text-white overflow-hidden p-8">
                <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                   <Globe size={20} /> Module Access
                </h4>
                <div className="space-y-3">
                  {plan.enabledModules?.map(moduleId => {
                    const mod = ALL_MODULES.find(m => m.id === moduleId);
                    return (
                      <div key={moduleId} className="flex items-center justify-between text-white/90 bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
                        <span className="text-sm font-bold">{mod?.label || moduleId}</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">{mod?.category || "Other"}</span>
                      </div>
                    );
                  })}
                  {(!plan.enabledModules || plan.enabledModules.length === 0) && (
                    <p className="text-white/60 italic text-sm">No modules enabled for this plan.</p>
                  )}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between font-black">
                  <span className="text-sm">Total Modules</span>
                  <span className="text-2xl">{plan.enabledModules?.length || 0}</span>
                </div>
              </div>

              <div className="card shadow-lg border-0 rounded-2xl bg-white dark:bg-card p-8 space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Plan Metadata</h4>
                <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50 dark:border-gray-800">
                   <span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> Created</span>
                   <span className="font-bold text-gray-600 dark:text-gray-300">
                     {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A'}
                   </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                   <span className="text-gray-400 flex items-center gap-2"><Calendar size={14} /> Last Updated</span>
                   <span className="font-bold text-gray-600 dark:text-gray-300">
                     {plan.updatedAt ? new Date(plan.updatedAt).toLocaleDateString() : 'N/A'}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlanView;
