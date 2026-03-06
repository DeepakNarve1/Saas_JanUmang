"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { getErrorMessage } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Label } from "@app/components/ui/label";
import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Checkbox } from "@app/components/ui/checkbox";
import {
  Building2,
  ArrowLeft,
  Save,
  Package,
  Shield,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Skeleton } from "@app/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@app/components/ui/tabs";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number | null;
  maxUsers: number;
  maxStorage: number;
  enabledModules: string[];
}

interface Module {
  id: string;
  name: string;
  description: string;
  category: string;
  alwaysEnabled: boolean;
  permissions: string[];
}

interface TenantFormProps {
  tenantId?: string;
}

const TenantFormEnhanced: React.FC<TenantFormProps> = ({ tenantId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!tenantId;
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Fetch available plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["tenant-plans"],
    queryFn: async () => {
      const res = await axios.get("/tenants/plans");
      return res.data?.data || [];
    },
  });

  const plans = (plansData || []) as Plan[];

  // Fetch available modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["tenant-modules"],
    queryFn: async () => {
      const res = await axios.get("/tenants/modules");
      return res.data?.data || [];
    },
  });

  const modules = (modulesData || []) as Module[];

  // Group modules by category
  const modulesByCategory = modules.reduce(
    (acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    },
    {} as Record<string, Module[]>,
  );

  // Fetch tenant data for edit mode
  const { data: tenant, isLoading: isFetching } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: async () => {
      const res = await axios.get(`/tenants/${tenantId}`);
      return res.data?.data;
    },
    enabled: isEdit,
  });

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Organization name is required")
      .min(2, "Name must be at least 2 characters"),
    slug: Yup.string()
      .required("URL slug is required")
      .matches(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase with hyphens only",
      ),
    plan: Yup.string().required("Plan is required"),
    contactEmail: Yup.string().email("Invalid email"),
    contactPhone: Yup.string(),
    address: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
      plan: "basic",
      contactEmail: "",
      contactPhone: "",
      address: "",
      enabledModules: [] as string[],
      maxUsers: 10,
      createOwner: true,
      ownerName: "",
      ownerEmail: "",
      ownerPassword: "",
      ownerMobile: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload: any = {
          name: values.name,
          slug: values.slug,
          plan: values.plan,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          address: values.address,
          maxUsers: values.maxUsers,
        };

        // Add modules for custom plan
        if (values.plan === "custom") {
          payload.enabledModules = selectedModules;
        }

        // Add owner details if creating or editing (and explicit createOwner check)
        if (values.createOwner) {
          payload.owner = {
            name: values.ownerName,
            email: values.ownerEmail,
            password: values.ownerPassword,
            mobile: values.ownerMobile,
          };
        }

        if (isEdit) {
          await updateMutation.mutateAsync({ id: tenantId, data: payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
      } catch (error: any) {
        const errorMessage = getErrorMessage(
          error,
          "Failed to save organization",
        );
        toast.error(errorMessage);
      }
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post("/tenants", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Organization created successfully!");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      router.push("/tenants");
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to create organization",
      );
      toast.error(errorMessage);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await axios.put(`/tenants/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Organization updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      router.push("/tenants");
    },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(
        error,
        "Failed to update organization",
      );
      toast.error(errorMessage);
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && formik.values.name && !formik.touched.slug) {
      const slug = formik.values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      formik.setFieldValue("slug", slug);
    }
  }, [formik.values.name, isEdit, formik.touched.slug]);

  // Update selected modules when plan changes
  useEffect(() => {
    const selectedPlan = plans.find((p) => p.id === formik.values.plan);
    if (selectedPlan && formik.values.plan !== "custom") {
      const coreModuleIds = modules
        .filter((m) => m.alwaysEnabled)
        .map((m) => m.id);
      setSelectedModules([
        ...new Set([...coreModuleIds, ...selectedPlan.enabledModules]),
      ]);
      formik.setFieldValue("maxUsers", selectedPlan.maxUsers);
    }
  }, [formik.values.plan, plans, modules]);

  // Load tenant data in edit mode
  useEffect(() => {
    if (tenant && isEdit) {
      formik.setValues({
        name: tenant.name || "",
        slug: tenant.slug || "",
        plan: tenant.plan || "basic",
        contactEmail: tenant.contactEmail || "",
        contactPhone: tenant.contactPhone || "",
        address: tenant.address || "",
        enabledModules: tenant.enabledModules || [],
        maxUsers: tenant.maxUsers || 10,
        createOwner: !tenant.owner,
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
        ownerMobile: "",
      });
      setSelectedModules(tenant.enabledModules || []);
    }
  }, [tenant, isEdit]);

  const handleModuleToggle = (moduleId: string) => {
    const foundModule = modules.find((m) => m.id === moduleId);
    if (foundModule?.alwaysEnabled) return; // Prevent toggling required modules

    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const selectedPlan = plans.find((p) => p.id === formik.values.plan);
  const isCustomPlan = formik.values.plan === "custom";

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "core":
        return <Shield className="h-4 w-4" />;
      case "operations":
        return <Zap className="h-4 w-4" />;
      case "master_data":
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (plansLoading || modulesLoading || (isEdit && isFetching)) {
    return (
      <div className="space-y-4">
        <ContentHeader title="Loading..." />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContentHeader
        title={isEdit ? "Edit Organization" : "Create Organization"}
      />

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="plan">Plan & Modules</TabsTrigger>
            <TabsTrigger value="owner">Admin User</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Details
                </CardTitle>
                <CardDescription>
                  Basic information about the organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold">
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Acme Corporation"
                    className={
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-xs text-red-500">{formik.errors.name}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="font-semibold">
                    URL Slug <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="slug"
                    value={formik.values.slug}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="acme-corp"
                    className={
                      formik.touched.slug && formik.errors.slug
                        ? "border-red-500"
                        : ""
                    }
                    disabled={isEdit}
                  />
                  {formik.touched.slug && formik.errors.slug && (
                    <p className="text-xs text-red-500">{formik.errors.slug}</p>
                  )}
                  {isEdit && (
                    <p className="text-xs text-gray-500">
                      Slug cannot be changed after creation
                    </p>
                  )}
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="font-semibold">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formik.values.contactEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="contact@acme.com"
                    className={
                      formik.touched.contactEmail && formik.errors.contactEmail
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.contactEmail &&
                    formik.errors.contactEmail && (
                      <p className="text-xs text-red-500">
                        {formik.errors.contactEmail}
                      </p>
                    )}
                </div>

                {/* Contact Phone */}
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="font-semibold">
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    value={formik.values.contactPhone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-semibold">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan & Modules Tab */}
          <TabsContent value="plan" className="space-y-4">
            {/* Plan Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Subscription Plan
                </CardTitle>
                <CardDescription>
                  Choose a plan that fits your organization&apos;s needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => formik.setFieldValue("plan", plan.id)}
                      className={`
                        relative cursor-pointer rounded-lg border-2 p-4 transition-all
                        ${
                          formik.values.plan === plan.id
                            ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                            : "border-gray-200 dark:border-gray-700 hover:border-teal-300"
                        }
                      `}
                    >
                      {formik.values.plan === plan.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-teal-500" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className="font-bold text-lg">{plan.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {plan.description}
                        </p>
                        {plan.price !== null ? (
                          <p className="text-2xl font-bold text-teal-600">
                            ₹{plan.price}
                            <span className="text-sm text-gray-500">
                              /month
                            </span>
                          </p>
                        ) : (
                          <p className="text-lg font-semibold text-gray-600">
                            Custom Pricing
                          </p>
                        )}
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {plan.maxUsers === -1
                              ? "Unlimited users"
                              : `Up to ${plan.maxUsers} users`}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {plan.enabledModules.length} modules
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Module Selection (for custom plan) */}
            {isCustomPlan && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Resource Limits
                    </CardTitle>
                    <CardDescription>
                      Configure custom limits for this organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxUsers" className="font-semibold">
                          Maximum Users
                        </Label>
                        <Input
                          id="maxUsers"
                          type="number"
                          value={formik.values.maxUsers}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="50"
                          min={1}
                        />
                        <p className="text-xs text-gray-500">
                          Total number of users allowed in this organization
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Select Modules</CardTitle>
                    <CardDescription>
                      Choose which modules to enable for this organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(modulesByCategory).map(
                        ([category, categoryModules]) => (
                          <div key={category} className="space-y-3">
                            <h3 className="font-semibold text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              {getCategoryIcon(category)}
                              {getCategoryLabel(category)}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {categoryModules.map((module) => (
                                <div
                                  key={module.id}
                                  className={`
                                  flex items-start space-x-3 p-3 rounded-lg border
                                  ${
                                    module.alwaysEnabled
                                      ? "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                  }
                                `}
                                >
                                  <Checkbox
                                    id={module.id}
                                    checked={
                                      module.alwaysEnabled ||
                                      selectedModules.includes(module.id)
                                    }
                                    onCheckedChange={() =>
                                      handleModuleToggle(module.id)
                                    }
                                    disabled={module.alwaysEnabled}
                                  />
                                  <div className="flex-1 space-y-1">
                                    <Label
                                      htmlFor={module.id}
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      {module.name}
                                      {module.alwaysEnabled && (
                                        <Badge
                                          variant="secondary"
                                          className="ml-2 text-xs"
                                        >
                                          Required
                                        </Badge>
                                      )}
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                      {module.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Selected Plan Summary */}
            {!isCustomPlan && selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>Included Modules</CardTitle>
                  <CardDescription>
                    Modules included in the {selectedPlan.name} plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {selectedPlan.enabledModules.map((moduleId) => {
                      const mod = modules.find((m) => m.id === moduleId);
                      return mod ? (
                        <Badge
                          key={moduleId}
                          variant="secondary"
                          className="justify-start"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {mod.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Admin User Tab */}
          <TabsContent value="owner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Organization Administrator
                </CardTitle>
                <CardDescription>
                  {isEdit
                    ? "Add an additional admin user"
                    : "Create the first admin user for this organization"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createOwner"
                    checked={formik.values.createOwner}
                    onCheckedChange={(checked: boolean) =>
                      formik.setFieldValue("createOwner", checked)
                    }
                  />
                  <Label htmlFor="createOwner" className="cursor-pointer">
                    {isEdit ? "Create new admin user" : "Create admin user now"}
                  </Label>
                </div>

                {formik.values.createOwner && (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="ownerName"
                          value={formik.values.ownerName}
                          onChange={formik.handleChange}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ownerEmail">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="ownerEmail"
                          type="email"
                          value={formik.values.ownerEmail}
                          onChange={formik.handleChange}
                          placeholder="admin@acme.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ownerPassword">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="ownerPassword"
                          type="password"
                          value={formik.values.ownerPassword}
                          onChange={formik.handleChange}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ownerMobile">Mobile</Label>
                        <Input
                          id="ownerMobile"
                          value={formik.values.ownerMobile}
                          onChange={formik.handleChange}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/tenants")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : isEdit
                ? "Update Organization"
                : "Create Organization"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TenantFormEnhanced;
