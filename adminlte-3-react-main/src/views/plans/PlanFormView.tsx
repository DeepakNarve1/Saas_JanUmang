"use client";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Checkbox } from "@app/components/ui/checkbox";
import { toast } from "react-toastify";
import { IPlan } from "@app/types/plan";
import { ALL_MODULES } from "@app/config/plans";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Layers, ArrowLeft, Save, Plus, X, RefreshCw } from "lucide-react";
import { PLAN_ICONS } from "@app/views/plans/PlanForm";

interface PlanFormViewProps {
  id?: string;
}

const PlanFormView = ({ id }: PlanFormViewProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<IPlan>>({
    planId: "",
    name: "",
    description: "",
    priceMonthlyPaise: 0,
    priceYearlyPaise: 0,
    maxUsers: 10,
    maxStorage: 5120,
    enabledModules: [],
    features: [],
    isActive: true,
    highlighted: false,
    color: "#368F8B",
    icon: "Layers",
  });

  const [featureInput, setFeatureInput] = useState("");

  // Fetch plan data if ID is provided
  const { data: planData, isLoading: isFetching } = useQuery({
    queryKey: ["plan", id],
    queryFn: async () => {
      const res = await axios.get(`/plans/${id}`);
      return res.data.data as IPlan;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (planData) {
      setFormData(planData);
    }
  }, [planData]);

  const mutation = useMutation({
    mutationFn: (data: Partial<IPlan>) => {
      if (id) {
        return axios.put(`/plans/${id}`, data);
      }
      return axios.post("/plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success(`Plan ${id ? "updated" : "created"} successfully`);
      router.push("/plans");
    },
    onError: (err: any) => handleError(err),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const syncMutation = useMutation({
    mutationFn: () => axios.post(`/plans/${id}/sync-razorpay`),
    onSuccess: (res) => {
      const updated = res.data?.data;
      if (updated) {
        setFormData((prev) => ({
          ...prev,
          razorpayPlanIdMonthly: updated.razorpayPlanIdMonthly,
          razorpayPlanIdYearly: updated.razorpayPlanIdYearly,
        }));
      }
      toast.success(res.data?.message || "Synced successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      queryClient.invalidateQueries({ queryKey: ["plan", id] });
    },
    onError: (err: any) => handleError(err),
  });

  const toggleModule = useCallback((moduleId: string) => {
    // Prevent toggling of core modules
    const coreModuleIds = ALL_MODULES.filter(m => m.category === "Core").map(m => m.id);
    if (coreModuleIds.includes(moduleId)) return;

    setFormData(prev => {
      const current = prev.enabledModules || [];
      const updated = current.includes(moduleId)
        ? current.filter(id => id !== moduleId)
        : [...current, moduleId];
      return { ...prev, enabledModules: updated };
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    const categoryModules = ALL_MODULES.filter(m => m.category === category).map(m => m.id);
    const coreModuleIds = ALL_MODULES.filter(m => m.category === "Core").map(m => m.id);
    
    setFormData(prev => {
      const current = prev.enabledModules || [];
      // If all non-core modules in category are checked, uncheck them (keep core modules)
      const allChecked = categoryModules.every(id => current.includes(id) || coreModuleIds.includes(id));
      
      let updated: string[];
      if (allChecked) {
        // Remove non-core modules of this category
        updated = current.filter(id => !categoryModules.includes(id) || coreModuleIds.includes(id));
      } else {
        // Add all modules of this category and deduplicate
        const combined = current.concat(categoryModules).concat(coreModuleIds);
        updated = combined.filter((val, index) => combined.indexOf(val) === index);
      }
      return { ...prev, enabledModules: updated };
    });
  }, []);

  // Ensure core modules are always checked when component mounts or data loads
  useEffect(() => {
    const coreModuleIds = ALL_MODULES.filter(m => m.category === "Core").map(m => m.id);
    setFormData(prev => {
      const current = prev.enabledModules || [];
      const missingCore = coreModuleIds.filter(id => !current.includes(id));
      if (missingCore.length > 0) {
        return { ...prev, enabledModules: [...current, ...missingCore] };
      }
      return prev;
    });
  }, [planData]);

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ 
        ...formData, 
        features: [...(formData.features || []), featureInput.trim()] 
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: (formData.features || []).filter((_, i) => i !== index)
    });
  };

  const categories = Array.from(new Set(ALL_MODULES.map(m => m.category)));

  if (id && isFetching) {
    return (
      <div className="content-wrapper">
        <ContentHeader title="Processing..." />
        <div className="p-10 text-center text-gray-400">Loading plan details...</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <ContentHeader title={id ? "Edit Subscription Plan" : "Create New Plan"} />
      
      <section className="content">
        <div className="container-fluid px-4">
          <form onSubmit={handleSubmit}>
            <div className="card shadow-lg border-0 rounded-xl overflow-hidden bg-white dark:bg-card mt-6">
              <div className="card-header bg-white dark:bg-card border-b border-gray-100 dark:border-gray-800 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => router.push("/plans")}
                      className="text-gray-400 hover:text-[#368F8B]"
                    >
                      <ArrowLeft size={20} />
                    </Button>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Plan Configuration
                      </h3>
                      <p className="text-xs text-gray-500">
                        Define pricing, limits, and module availability
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push("/plans")}
                      className="border-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={mutation.isPending}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white gap-2 px-6"
                    >
                      <Save size={18} />
                      {mutation.isPending ? "Saving..." : id ? "Update Plan" : "Create Plan"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="card-body p-8 space-y-10">
                {/* Basic Details Section */}
                <div>
                  <h4 className="text-sm font-bold text-[#368F8B] uppercase tracking-widest mb-6 border-l-4 border-[#368F8B] pl-3">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="planId" className="text-gray-600 dark:text-gray-300 font-semibold">Plan ID (Slug)</Label>
                      <Input 
                        id="planId" 
                        value={formData.planId} 
                        onChange={e => setFormData({ ...formData, planId: e.target.value })}
                        placeholder="e.g. enterprise_v1"
                        disabled={!!id}
                        required
                        className="h-11 dark:bg-gray-800/50"
                      />
                      <p className="text-[10px] text-gray-400 italic">Unique identifier for internal use (cannot be changed after creation)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-600 dark:text-gray-300 font-semibold">Display Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Premium Business"
                        required
                        className="h-11 dark:bg-gray-800/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color" className="text-gray-600 dark:text-gray-300 font-semibold">Theme Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="color" 
                          type="color" 
                          className="w-11 h-11 p-1 cursor-pointer dark:bg-gray-800/50"
                          value={formData.color} 
                          onChange={e => setFormData({ ...formData, color: e.target.value })}
                        />
                        <Input 
                          value={formData.color}
                          onChange={e => setFormData({ ...formData, color: e.target.value })}
                          className="h-11 flex-1 font-mono uppercase dark:bg-gray-800/50"
                        />
                      </div>
                    </div>

                    {/* Icon Picker */}
                    <div className="md:col-span-2 lg:col-span-3 space-y-3">
                      <Label className="text-gray-600 dark:text-gray-300 font-semibold">Plan Icon</Label>
                      <div className="flex items-center gap-4">
                        {/* Preview */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                          style={{ backgroundColor: `${formData.color || "#368F8B"}20`, border: `2px solid ${formData.color || "#368F8B"}40` }}
                        >
                          {(() => {
                            const iconEntry = PLAN_ICONS.find(i => i.name === formData.icon) ?? PLAN_ICONS[0];
                            const Icon = iconEntry.component;
                            return <Icon size={22} style={{ color: formData.color || "#368F8B" }} />;
                          })()}
                        </div>
                        {/* Grid of icons */}
                        <div className="flex flex-wrap gap-2">
                          {PLAN_ICONS.map(({ name, component: Icon }) => (
                            <button
                              key={name}
                              type="button"
                              title={name}
                              onClick={() => setFormData({ ...formData, icon: name })}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border-2 ${
                                formData.icon === name
                                  ? "border-[#368F8B] bg-[#368F8B]/10"
                                  : "border-gray-200 hover:border-gray-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                              }`}
                            >
                              <Icon size={16} className={formData.icon === name ? "text-[#368F8B]" : "text-gray-500"} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400">Selected: <strong>{formData.icon || "Layers"}</strong></p>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 space-y-2">
                      <Label htmlFor="description" className="text-gray-600 dark:text-gray-300 font-semibold">Description</Label>
                      <Input 
                        id="description" 
                        value={formData.description} 
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Marketing text shown on the pricing page..."
                        className="h-11 dark:bg-gray-800/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Limits Section */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-[#368F8B] uppercase tracking-widest mb-6 border-l-4 border-[#368F8B] pl-3">
                    Pricing & Usage Limits
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="priceMonthly" className="text-gray-600 dark:text-gray-300 font-semibold text-xs">MONTHLY PRICE (PAISE)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <Input 
                          id="priceMonthly" 
                          type="number"
                          value={formData.priceMonthlyPaise} 
                          onChange={e => setFormData({ ...formData, priceMonthlyPaise: parseInt(e.target.value) || 0 })}
                          className="h-11 pl-7 dark:bg-gray-800/50"
                        />
                      </div>
                      <p className="text-xs text-emerald-600 font-bold">= ₹{(formData.priceMonthlyPaise || 0) / 100} / month</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceYearly" className="text-gray-600 dark:text-gray-300 font-semibold text-xs">YEARLY PRICE (PAISE)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <Input 
                          id="priceYearly" 
                          type="number"
                          value={formData.priceYearlyPaise} 
                          onChange={e => setFormData({ ...formData, priceYearlyPaise: parseInt(e.target.value) || 0 })}
                          className="h-11 pl-7 dark:bg-gray-800/50"
                        />
                      </div>
                      <p className="text-xs text-emerald-600 font-bold">= ₹{(formData.priceYearlyPaise || 0) / 100} / year</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxUsers" className="text-gray-600 dark:text-gray-300 font-semibold text-xs">MAX USERS</Label>
                      <Input 
                        id="maxUsers" 
                        type="number"
                        value={formData.maxUsers} 
                        onChange={e => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                        className="h-11 dark:bg-gray-800/50"
                        placeholder="-1 for unlimited"
                      />
                      <p className="text-[10px] text-gray-400 italic">Use -1 for unlimited seats</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxStorage" className="text-gray-600 dark:text-gray-300 font-semibold text-xs">STORAGE LIMIT (MB)</Label>
                      <Input 
                        id="maxStorage" 
                        type="number"
                        value={formData.maxStorage} 
                        onChange={e => setFormData({ ...formData, maxStorage: parseInt(e.target.value) || 0 })}
                        className="h-11 dark:bg-gray-800/50"
                      />
                      <p className="text-[10px] text-gray-400 italic">= {((formData.maxStorage || 0) / 1024).toFixed(2)} GB</p>
                    </div>

                    {/* Razorpay Setup Optional */}
                    <div className="lg:col-span-4 mt-2">
                      <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200">Razorpay API Integration</h5>
                          <p className="text-xs text-gray-500">Auto-create plan IDs using your configured Razorpay API keys.</p>
                        </div>
                        {id && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => syncMutation.mutate()} 
                            disabled={syncMutation.isPending}
                            className="text-[#368F8B] border-[#368F8B] hover:bg-[#368F8B]/10 shrink-0 shadow-sm"
                          >
                            <RefreshCw size={14} className={`mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                            {syncMutation.isPending ? "Syncing..." : "Auto-Sync with Razorpay"}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                      <Label htmlFor="rzpMonthly" className="text-gray-600 dark:text-gray-300 font-semibold text-xs">RAZORPAY PLAN ID (MONTHLY)</Label>
                      <Input 
                        id="rzpMonthly" 
                        value={formData.razorpayPlanIdMonthly || ""} 
                        onChange={e => setFormData({ ...formData, razorpayPlanIdMonthly: e.target.value })}
                        className="h-11 dark:bg-gray-800/50 font-mono text-sm"
                        placeholder="e.g. plan_SXXXXXXX"
                      />
                      <p className="text-[10px] text-gray-400 italic">Optional: Paste manually if auto-sync fails</p>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                      <Label htmlFor="rzpYearly" className="text-gray-600 dark:text-gray-300 font-semibold text-xs">RAZORPAY PLAN ID (YEARLY)</Label>
                      <Input 
                        id="rzpYearly" 
                        value={formData.razorpayPlanIdYearly || ""} 
                        onChange={e => setFormData({ ...formData, razorpayPlanIdYearly: e.target.value })}
                        className="h-11 dark:bg-gray-800/50 font-mono text-sm"
                        placeholder="e.g. plan_SXXXXXXX"
                      />
                      <p className="text-[10px] text-gray-400 italic">Optional: Paste manually if auto-sync fails</p>
                    </div>
                  </div>
                </div>

                {/* Modules Selection Section */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-[#368F8B] uppercase tracking-widest mb-6 border-l-4 border-[#368F8B] pl-3">
                    Module Access Control
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map(category => {
                      const categoryModules = ALL_MODULES.filter(m => m.category === category);
                      const isCoreCategory = category === "Core";
                      const isAllChecked = categoryModules.length > 0 && categoryModules.every(m => 
                        (formData.enabledModules || []).includes(m.id)
                      );

                      return (
                        <div key={category} className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Layers size={14} className="text-[#368F8B]" />
                              <h5 className="font-bold text-xs text-gray-400 uppercase tracking-wider">{category}</h5>
                            </div>
                            {!isCoreCategory && (
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`select-all-${category.replace(/\s+/g, '-')}`}
                                  checked={isAllChecked}
                                  onCheckedChange={() => toggleCategory(category)}
                                  className="w-4 h-4 border-gray-300 data-[state=checked]:bg-[#368F8B]"
                                />
                                <Label 
                                  htmlFor={`select-all-${category.replace(/\s+/g, '-')}`}
                                  className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-[#368F8B] transition-colors"
                                >
                                  Select All
                                </Label>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            {categoryModules.map(module => {
                              const isCore = isCoreCategory;
                              const isChecked = isCore || (formData.enabledModules || []).includes(module.id);
                              
                              return (
                                <Label 
                                  key={module.id} 
                                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all group ${
                                    isCore ? 'opacity-80 bg-gray-100/50 dark:bg-gray-800/50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm cursor-pointer'
                                  }`}
                                >
                                  <Checkbox 
                                    id={`mod-${module.id}`}
                                    checked={isChecked}
                                    disabled={isCore}
                                    onCheckedChange={() => !isCore && toggleModule(module.id)}
                                    className="border-gray-300 data-[state=checked]:bg-[#368F8B] disabled:opacity-70 disabled:cursor-not-allowed"
                                  />
                                  <span className={`text-sm font-medium flex-1 ${
                                      isCore 
                                        ? 'text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-700 dark:text-gray-300 cursor-pointer group-hover:text-[#368F8B]'
                                    }`}>
                                    {module.label}
                                  </span>
                                </Label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Features & Options Section */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#368F8B] uppercase tracking-widest border-l-4 border-[#368F8B] pl-3 mb-4">
                      Public Features List
                    </h4>
                    <div className="flex gap-2">
                      <Input 
                        value={featureInput} 
                        onChange={e => setFeatureInput(e.target.value)}
                        placeholder="e.g. 24/7 Priority Support"
                        onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addFeature())}
                        className="h-11 dark:bg-gray-800/50"
                      />
                      <Button type="button" onClick={addFeature} variant="secondary" className="h-11">
                        <Plus size={18} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.features?.map((feature, i) => (
                        <span key={i} className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 group">
                          {feature}
                          <button 
                            type="button" 
                            onClick={() => removeFeature(i)} 
                            className="text-emerald-300 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      {(!formData.features || formData.features.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No features added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#368F8B] uppercase tracking-widest border-l-4 border-[#368F8B] pl-3 mb-4">
                      Visibility & Status
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div 
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                          formData.highlighted 
                            ? "bg-amber-50 border-amber-200 shadow-sm" 
                            : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox 
                          id="highlighted" 
                          checked={formData.highlighted} 
                          onCheckedChange={(checked) => setFormData({ ...formData, highlighted: !!checked })}
                        />
                        <div className="flex-1">
                          <Label htmlFor="highlighted" className="font-bold text-gray-800 dark:text-white cursor-pointer block w-full">Popular Badge</Label>
                          <p className="text-[10px] text-gray-500">Adds &quot;Most Popular&quot; highlight on pricing</p>
                        </div>
                      </div>

                      <div 
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                          formData.isActive 
                            ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                            : "bg-red-50 border-red-200 shadow-sm"
                        }`}
                      >
                        <Checkbox 
                          id="isActive" 
                          checked={formData.isActive} 
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                        />
                        <div className="flex-1">
                          <Label htmlFor="isActive" className="font-bold text-gray-800 dark:text-white cursor-pointer block w-full">Active Status</Label>
                          <p className="text-[10px] text-gray-500">If disabled, plan is hidden from checkout</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-10 flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => router.push("/plans")}
                    className="text-gray-500 hover:bg-gray-100"
                  >
                    Discard Changes
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white min-w-[200px] h-12 shadow-lg shadow-[#368F8B]/20"
                  >
                    {mutation.isPending ? "Processing..." : id ? "Save Changes" : "Create Subscription Plan"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default PlanFormView;
