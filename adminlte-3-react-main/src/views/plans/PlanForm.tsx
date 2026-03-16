"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Checkbox } from "@app/components/ui/checkbox";
import { toast } from "react-toastify";
import { IPlan } from "@app/types/plan";
import { ALL_MODULES } from "@app/config/plans";
import { handleError } from "@app/utils/errorHandler";
import {
  Layers, ShieldCheck, Zap, Crown, Rocket, Star, Gem, Globe,
  Building2, Users, Briefcase, Package, Award, Sparkles, Infinity,
} from "lucide-react";

// ─── Available plan icons ──────────────────────────────────────────────────
export const PLAN_ICONS: { name: string; component: React.ElementType }[] = [
  { name: "Layers",      component: Layers },
  { name: "ShieldCheck", component: ShieldCheck },
  { name: "Zap",         component: Zap },
  { name: "Crown",       component: Crown },
  { name: "Rocket",      component: Rocket },
  { name: "Star",        component: Star },
  { name: "Gem",         component: Gem },
  { name: "Globe",       component: Globe },
  { name: "Building2",   component: Building2 },
  { name: "Users",       component: Users },
  { name: "Briefcase",   component: Briefcase },
  { name: "Package",     component: Package },
  { name: "Award",       component: Award },
  { name: "Sparkles",    component: Sparkles },
  { name: "Infinity",    component: Infinity },
];

interface PlanFormProps {
  plan: IPlan | null;
  onClose: () => void;
}

const PlanForm = ({ plan, onClose }: PlanFormProps) => {
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

  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        icon: plan.icon || "Layers" // Fallback back-compat
      });
    }
  }, [plan]);

  const mutation = useMutation({
    mutationFn: (data: Partial<IPlan>) => {
      if (plan?._id) {
        return axios.put(`/plans/${plan._id}`, data);
      }
      return axios.post("/plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      toast.success(`Plan ${plan ? "updated" : "created"} successfully`);
      onClose();
    },
    onError: (err: any) => handleError(err),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const toggleModule = (moduleId: string) => {
    const current = formData.enabledModules || [];
    if (current.includes(moduleId)) {
      setFormData({ ...formData, enabledModules: current.filter(id => id !== moduleId) });
    } else {
      setFormData({ ...formData, enabledModules: [...current, moduleId] });
    }
  };

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

  // Group modules by category for better UI
  const categories = Array.from(new Set(ALL_MODULES.map(m => m.category)));

  // Icon preview component
  const selectedIconEntry = PLAN_ICONS.find(i => i.name === formData.icon) ?? PLAN_ICONS[0];
  const SelectedIconComponent = selectedIconEntry.component;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{plan ? "Edit Plan" : "Create New Plan"}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="planId">Plan ID (Slug)</Label>
          <Input 
            id="planId" 
            value={formData.planId} 
            onChange={e => setFormData({ ...formData, planId: e.target.value })}
            placeholder="e.g. basic_2024"
            disabled={!!plan}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Basic Plan"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          value={formData.description} 
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Short description of the plan"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priceMonthly">Monthly Price (Paise - 100 paise = 1 ₹)</Label>
          <Input 
            id="priceMonthly" 
            type="number"
            value={formData.priceMonthlyPaise} 
            onChange={e => setFormData({ ...formData, priceMonthlyPaise: parseInt(e.target.value) })}
            required
          />
          <p className="text-[10px] text-gray-500">₹{formData.priceMonthlyPaise ? (formData.priceMonthlyPaise / 100).toLocaleString() : 0}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceYearly">Yearly Price (Paise)</Label>
          <Input 
            id="priceYearly" 
            type="number"
            value={formData.priceYearlyPaise} 
            onChange={e => setFormData({ ...formData, priceYearlyPaise: parseInt(e.target.value) })}
            required
          />
          <p className="text-[10px] text-gray-500">₹{formData.priceYearlyPaise ? (formData.priceYearlyPaise / 100).toLocaleString() : 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxUsers">Max Users (-1 for unlimited)</Label>
          <Input 
            id="maxUsers" 
            type="number"
            value={formData.maxUsers} 
            onChange={e => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxStorage">Max Storage (MB)</Label>
          <Input 
            id="maxStorage" 
            type="number"
            value={formData.maxStorage} 
            onChange={e => setFormData({ ...formData, maxStorage: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rzpMonthly">Razorpay Plan ID (Monthly)</Label>
          <Input 
            id="rzpMonthly" 
            value={formData.razorpayPlanIdMonthly || ""} 
            onChange={e => setFormData({ ...formData, razorpayPlanIdMonthly: e.target.value })}
            placeholder="plan_SXXXXXXX (optional)"
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rzpYearly">Razorpay Plan ID (Yearly)</Label>
          <Input 
            id="rzpYearly" 
            value={formData.razorpayPlanIdYearly || ""} 
            onChange={e => setFormData({ ...formData, razorpayPlanIdYearly: e.target.value })}
            placeholder="plan_SXXXXXXX (optional)"
            className="font-mono text-xs"
          />
        </div>
      </div>

      {/* ─── Icon Picker ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="font-semibold">Plan Icon</Label>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
            style={{ backgroundColor: `${formData.color || "#368F8B"}20`, border: `2px solid ${formData.color || "#368F8B"}40` }}
          >
            <SelectedIconComponent size={22} style={{ color: formData.color || "#368F8B" }} />
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
        <p className="text-[10px] text-gray-400">Selected: <strong>{formData.icon}</strong></p>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-semibold block border-b pb-2">Enabled Modules</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(category => (
            <div key={category} className="space-y-2">
              <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">{category}</h3>
              <div className="grid grid-cols-1 gap-2">
                {ALL_MODULES.filter(m => m.category === category).map(module => (
                  <div key={module.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                    <Checkbox 
                      id={`mod-${module.id}`}
                      checked={formData.enabledModules?.includes(module.id)}
                      onCheckedChange={() => toggleModule(module.id)}
                    />
                    <label 
                      htmlFor={`mod-${module.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      {module.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Features Badge List</Label>
        <div className="flex gap-2">
          <Input 
            value={featureInput} 
            onChange={e => setFeatureInput(e.target.value)}
            placeholder="Add a feature..."
            onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addFeature())}
          />
          <Button type="button" onClick={addFeature} variant="secondary">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.features?.map((feature, i) => (
            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center">
              {feature}
              <button type="button" onClick={() => removeFeature(i)} className="ml-2 text-gray-400 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="highlighted" 
            checked={formData.highlighted} 
            onCheckedChange={checked => setFormData({ ...formData, highlighted: !!checked })}
          />
          <Label htmlFor="highlighted">Highlight (Popular)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isActive" 
            checked={formData.isActive} 
            onCheckedChange={checked => setFormData({ ...formData, isActive: !!checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="color">Theme Color</Label>
          <Input 
            id="color" 
            type="color" 
            className="w-12 h-8 p-1 cursor-pointer"
            value={formData.color} 
            onChange={e => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="bg-[#368F8B] hover:bg-[#2d7a76] min-w-[120px]"
        >
          {mutation.isPending ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  );
};

export default PlanForm;
