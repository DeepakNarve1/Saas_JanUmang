"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Button } from "@app/components/ui/button";
import { Skeleton } from "@app/components/ui/skeleton";
import { Plus, Edit, Trash2, Layers, Search, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { IPlan } from "@app/types/plan";
import { ConfirmDialog } from "@app/components/common/ConfirmDialog";
import { Input } from "@app/components/ui/input";

const PlanList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const res = await axios.get("/plans/admin");
      return res.data.data as IPlan[];
    },
  });

  const filteredPlans = (data || []).filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success("Plan deactivated successfully");
      setIsConfirmOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to deactivate plan");
    },
  });

  const handleEdit = (plan: IPlan) => {
    router.push(`/plans/${plan._id}/edit`);
  };

  const handleView = (plan: IPlan) => {
    router.push(`/plans/${plan._id}`);
  };

  const handleAdd = () => {
    router.push("/plans/create");
  };

  const handleDeleteClick = (id: string) => {
    setPlanToDelete(id);
    setIsConfirmOpen(true);
  };

  return (
    <div className="content-wrapper">
      <ContentHeader title="SaaS Plans Management" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="card shadow-lg border-0 rounded-xl overflow-hidden bg-white dark:bg-card mt-6">
            <div className="card-header bg-white dark:bg-card border-b border-gray-100 dark:border-gray-800 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#368F8B]/10 flex items-center justify-center">
                    <Layers className="text-[#368F8B]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Subscription Plans
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage pricing tiers and module access
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <Input
                      placeholder="Search plans..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 dark:bg-gray-800/50"
                    />
                  </div>
                  <Button
                    onClick={handleAdd}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white whitespace-nowrap gap-2"
                  >
                    <Plus size={18} /> Add Plan
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 dark:border-gray-800">
                    <TableHead>NAME</TableHead>
                    <TableHead>MONTHLY (₹)</TableHead>
                    <TableHead>YEARLY (₹)</TableHead>
                    <TableHead>LIMITS</TableHead>
                    <TableHead>MODULES</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead className="text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-gray-100 dark:border-gray-800">
                        <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPlans?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20">
                        <div className="flex flex-col items-center text-gray-400">
                          <Layers size={48} className="mb-4 opacity-20" />
                          <p>No subscription plans found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlans?.map((plan) => (
                      <TableRow 
                        key={plan._id} 
                        className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors border-gray-100 dark:border-gray-800 ${!plan.isActive ? "opacity-60" : ""}`}
                      >
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-200">
                          <div className="flex items-center justify-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: plan.color }}
                            />
                            {plan.name}
                            {plan.highlighted && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                          ₹{plan.priceMonthlyPaise / 100}
                        </TableCell>
                        <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                          ₹{plan.priceYearlyPaise / 100}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex flex-col gap-0.5">
                            <span>{plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers} Users</span>
                            <span>{plan.maxStorage === -1 ? "Unlimited" : (plan.maxStorage / 1024).toFixed(1)} GB Storage</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold">
                            {plan.enabledModules?.length || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                            plan.isActive 
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                              : "bg-red-500/10 text-red-600 border border-red-500/20"
                          }`}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10"
                              onClick={() => handleView(plan)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-[#368F8B] hover:bg-[#368F8B]/10"
                              onClick={() => handleEdit(plan)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => handleDeleteClick(plan._id || "")}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => planToDelete && deleteMutation.mutate(planToDelete)}
        title="Deactivate Plan"
        description="Are you sure you want to deactivate this plan? This will hide it from the registration page for new customers."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default PlanList;
