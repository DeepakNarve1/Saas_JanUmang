"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
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
import {
  Building2,
  ArrowLeft,
  Save,
  Settings2,
  UserPlus,
  User,
  Users,
  Trash2,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@app/components/ui/dialog";
import { Skeleton } from "@app/components/ui/skeleton";

interface TenantFormProps {
  tenantId?: string;
}

const TenantForm: React.FC<TenantFormProps> = ({ tenantId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!tenantId;
  const [isAddAdminOpen, setIsAddAdminOpen] = React.useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = React.useState(false);
  const [adminForm, setAdminForm] = React.useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });

  // Fetch tenant data for edit mode
  const { data: tenant, isLoading: isFetching } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: async () => {
      const res = await axios.get(`/tenants/${tenantId}`);
      return res.data?.data;
    },
    enabled: isEdit,
  });

  // Fetch tenant users for edit mode (to set owner and display users)
  const { data: tenantUsersData, isLoading: usersLoading } = useQuery({
    queryKey: ["tenant-users", tenantId],
    queryFn: async () => {
      const res = await axios.get(`/tenants/${tenantId}/users`);
      return res.data?.data || [];
    },
    enabled: isEdit && !!tenantId,
  });

  const tenantUsers = (tenantUsersData || []) as Array<{
    _id: string;
    name: string;
    email: string;
    level?: string;
    role?: { name?: string; displayName?: string };
    createdAt?: string;
  }>;

  // Fetch roles for creating tenant admin (create mode)
  const { data: roles = [] } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: async () => {
      const res = await axios.get("/rbac/roles?limit=-1");
      return res.data?.data || [];
    },
    enabled: !isEdit,
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
    status: Yup.string().required("Status is required"),
    maxUsers: Yup.number()
      .min(1, "Must allow at least 1 user")
      .required("Max users is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
      plan: "Basic",
      status: "active",
      maxUsers: 5,
      createOwner: true,
      ownerName: "",
      ownerEmail: "",
      ownerPassword: "",
      ownerPasswordConfirm: "",
      ownerRoleId: "",
      ownerId: "" as string | null,
      settings: {
        theme: {
          primaryColor: "#008080",
          logoUrl: "",
        },
      },
    },
    validationSchema,
    onSubmit: (values) => {
      if (!isEdit && values.createOwner) {
        if (!values.ownerName?.trim()) {
          formik.setFieldError("ownerName", "Name is required");
          return;
        }
        if (!values.ownerEmail?.trim()) {
          formik.setFieldError("ownerEmail", "Email is required");
          return;
        }
        if (!values.ownerPassword) {
          formik.setFieldError(
            "ownerPassword",
            "Password is required (min 6 characters)",
          );
          return;
        }
        if (values.ownerPassword.length < 6) {
          formik.setFieldError(
            "ownerPassword",
            "Password must be at least 6 characters",
          );
          return;
        }
        if (values.ownerPassword !== values.ownerPasswordConfirm) {
          formik.setFieldError(
            "ownerPasswordConfirm",
            "Passwords do not match",
          );
          return;
        }
      }
      mutation.mutate(values);
    },
  });

  // Update form when tenant data is loaded
  useEffect(() => {
    if (tenant) {
      formik.setValues({
        ...formik.values,
        name: tenant.name || "",
        slug: tenant.slug || "",
        plan: tenant.plan || "Basic",
        status: tenant.status || "active",
        maxUsers: tenant.maxUsers || 5,
        ownerId: tenant.owner?._id ?? "",
        settings: {
          theme: {
            primaryColor: tenant.settings?.theme?.primaryColor || "#008080",
            logoUrl: tenant.settings?.theme?.logoUrl || "",
          },
        },
      });
    }
  }, [tenant]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload: any = {
        name: values.name,
        slug: values.slug,
        plan: values.plan,
        status: values.status,
        maxUsers: values.maxUsers,
        settings: values.settings,
      };
      if (isEdit) {
        if (values.ownerId !== undefined && values.ownerId !== null)
          payload.owner = values.ownerId || null;
        return await axios.put(`/tenants/${tenantId}`, payload);
      } else {
        if (
          values.createOwner &&
          values.ownerEmail &&
          values.ownerName &&
          values.ownerPassword
        ) {
          payload.owner = {
            name: values.ownerName,
            email: values.ownerEmail,
            password: values.ownerPassword,
            roleId: values.ownerRoleId || undefined,
          };
        }
        return await axios.post("/tenants", payload);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Organization ${isEdit ? "updated" : "created"} successfully!${
          !isEdit && variables.createOwner && variables.ownerEmail
            ? " The organization admin can now log in with the email and password you set."
            : ""
        }`,
      );
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-stats"] });
      if (isEdit && tenantId)
        queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      router.push("/tenants");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to save organization",
      );
    },
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    formik.setFieldValue("name", name);
    if (!isEdit) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      formik.setFieldValue("slug", slug);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!tenantId) return;

    setIsCreatingAdmin(true);
    try {
      await axios.post(`/tenants/${tenantId}/admins`, adminForm);
      toast.success("Administrator created successfully");
      setAdminForm({ name: "", email: "", password: "", mobile: "" });
      setIsAddAdminOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tenant-users", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || "Failed to create administrator",
      );
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    )
      return;

    if (!tenantId) return;

    try {
      await axios.delete(`/tenants/${tenantId}/admins/${userId}`);
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-users", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete user");
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

  if (isFetching) {
    return (
      <div className="content-wrapper">
        <ContentHeader title="Loading..." />
        <section className="content">
          <div className="container-fluid">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#368F8B]"></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <ContentHeader
        title={isEdit ? "Edit Organization" : "Create Organization"}
      />
      <section className="content">
        <div className="container-fluid">
          <div className="max-w-3xl mx-auto">
            <div className="card shadow-lg border-0 rounded-xl overflow-hidden bg-white dark:bg-card">
              <div className="card-header bg-white dark:bg-card border-b border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#368F8B]/10 flex items-center justify-center">
                    <Building2 className="text-[#368F8B]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {isEdit
                        ? "Edit Organization Details"
                        : "Create New Organization"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isEdit
                        ? "Update organization settings"
                        : "Add a new organization to your platform"}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Organization Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-semibold">
                      Organization Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formik.values.name}
                      onChange={handleNameChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g., Acme Corporation"
                      className={
                        formik.touched.name && formik.errors.name
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-xs text-red-500">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>

                  {/* URL Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="font-semibold">
                      URL Slug <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">/</span>
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
                    </div>
                    {formik.touched.slug && formik.errors.slug && (
                      <p className="text-xs text-red-500">
                        {formik.errors.slug}
                      </p>
                    )}
                    {isEdit && (
                      <p className="text-xs text-gray-500">
                        Slug cannot be changed after creation
                      </p>
                    )}
                  </div>

                  {/* Plan & Status Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Plan */}
                    <div className="space-y-2">
                      <Label htmlFor="plan" className="font-semibold">
                        Subscription Plan{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formik.values.plan}
                        onValueChange={(value) =>
                          formik.setFieldValue("plan", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            formik.touched.plan && formik.errors.plan
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Pro">Pro</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status" className="font-semibold">
                        Status <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formik.values.status}
                        onValueChange={(value) =>
                          formik.setFieldValue("status", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            formik.touched.status && formik.errors.status
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="trialing">Trialing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Max Users */}
                  <div className="space-y-2">
                    <Label htmlFor="maxUsers" className="font-semibold">
                      Maximum Users <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={formik.values.maxUsers}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      min="1"
                      className={
                        formik.touched.maxUsers && formik.errors.maxUsers
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formik.touched.maxUsers && formik.errors.maxUsers && (
                      <p className="text-xs text-red-500">
                        {formik.errors.maxUsers}
                      </p>
                    )}
                  </div>

                  {/* Organization admin (create) or Set owner (edit) */}
                  {!isEdit ? (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="createOwner"
                          checked={formik.values.createOwner}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "createOwner",
                              e.target.checked,
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor="createOwner"
                          className="font-semibold flex items-center gap-2"
                        >
                          <UserPlus size={16} className="text-[#368F8B]" />
                          Create organization admin (first user)
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500">
                        This user can log in and create employees and manage
                        this organization.
                      </p>
                      {formik.values.createOwner && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg space-y-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label>Admin name *</Label>
                            <Input
                              value={formik.values.ownerName}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  "ownerName",
                                  e.target.value,
                                )
                              }
                              onBlur={formik.handleBlur}
                              placeholder="e.g. John Doe"
                              className={
                                formik.errors.ownerName ? "border-red-500" : ""
                              }
                            />
                            {formik.errors.ownerName && (
                              <p className="text-xs text-red-500">
                                {formik.errors.ownerName}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Admin email *</Label>
                            <Input
                              type="email"
                              value={formik.values.ownerEmail}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  "ownerEmail",
                                  e.target.value,
                                )
                              }
                              onBlur={formik.handleBlur}
                              placeholder="admin@organization.com"
                              className={
                                formik.errors.ownerEmail ? "border-red-500" : ""
                              }
                            />
                            {formik.errors.ownerEmail && (
                              <p className="text-xs text-red-500">
                                {formik.errors.ownerEmail}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                              value={formik.values.ownerRoleId || "none"}
                              onValueChange={(v) =>
                                formik.setFieldValue(
                                  "ownerRoleId",
                                  v === "none" ? "" : v,
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Default (admin)
                                </SelectItem>
                                {roles.map((r: any) => (
                                  <SelectItem key={r._id} value={r._id}>
                                    {r.displayName || r.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Password *</Label>
                            <Input
                              type="password"
                              value={formik.values.ownerPassword}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  "ownerPassword",
                                  e.target.value,
                                )
                              }
                              onBlur={formik.handleBlur}
                              placeholder="Min 6 characters"
                              className={
                                formik.errors.ownerPassword
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {formik.errors.ownerPassword && (
                              <p className="text-xs text-red-500">
                                {formik.errors.ownerPassword}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Confirm password *</Label>
                            <Input
                              type="password"
                              value={formik.values.ownerPasswordConfirm}
                              onChange={(e) =>
                                formik.setFieldValue(
                                  "ownerPasswordConfirm",
                                  e.target.value,
                                )
                              }
                              onBlur={formik.handleBlur}
                              placeholder="Repeat password"
                              className={
                                formik.errors.ownerPasswordConfirm
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {formik.errors.ownerPasswordConfirm && (
                              <p className="text-xs text-red-500">
                                {formik.errors.ownerPasswordConfirm}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <User size={16} className="text-[#368F8B]" />
                        Organization owner
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        The owner (tenant admin) can log in and manage users for
                        this organization.
                      </p>
                      <Select
                        value={formik.values.ownerId ?? "none"}
                        onValueChange={(v) =>
                          formik.setFieldValue(
                            "ownerId",
                            v === "none" ? null : v,
                          )
                        }
                      >
                        <SelectTrigger className="max-w-md">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No owner set</SelectItem>
                          {tenantUsers.map((u: any) => (
                            <SelectItem key={u._id} value={u._id}>
                              {u.name} ({u.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Settings Section */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <Settings2 size={16} className="text-[#368F8B]" />
                      Branding & Settings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary Color */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="settings.theme.primaryColor"
                          className="font-semibold"
                        >
                          Primary Color
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            id="settings.theme.primaryColor"
                            value={formik.values.settings?.theme?.primaryColor}
                            onChange={formik.handleChange}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={formik.values.settings?.theme?.primaryColor}
                            onChange={formik.handleChange}
                            name="settings.theme.primaryColor"
                            placeholder="#000000"
                            className="uppercase"
                          />
                        </div>
                      </div>

                      {/* Logo URL */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="settings.theme.logoUrl"
                          className="font-semibold"
                        >
                          Logo URL
                        </Label>
                        <Input
                          id="settings.theme.logoUrl"
                          name="settings.theme.logoUrl"
                          value={formik.values.settings?.theme?.logoUrl}
                          onChange={formik.handleChange}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 mt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/tenants")}
                    disabled={mutation.isPending}
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to List
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#368F8B] hover:bg-[#2d7a76]"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        {isEdit ? "Update" : "Create"} Organization
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Users in this organization - Only show in edit mode */}
            {isEdit && tenantId && (
              <Card className="border-0 shadow-lg bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden mt-6">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <Users size={20} className="text-[#368F8B]" />
                      Users in this organization ({tenant?.userCount ??
                        0} / {tenant?.maxUsers ?? "—"})
                    </h3>

                    <Dialog
                      open={isAddAdminOpen}
                      onOpenChange={setIsAddAdminOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-[#368F8B] hover:bg-[#2d7a76] text-white gap-2"
                        >
                          <UserPlus size={16} />
                          Add Administrator
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">
                            Add New Administrator
                          </DialogTitle>
                          <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Create a new administrator account for this
                            organization
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={handleCreateAdmin}
                          className="space-y-4 mt-4"
                        >
                          <div className="space-y-2">
                            <Label
                              htmlFor="admin-name"
                              className="text-sm font-medium"
                            >
                              Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="admin-name"
                              placeholder="Enter full name"
                              value={adminForm.name}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  name: e.target.value,
                                })
                              }
                              required
                              className="dark:bg-gray-800"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="admin-email"
                              className="text-sm font-medium"
                            >
                              Email Address{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="admin-email"
                              type="email"
                              placeholder="admin@example.com"
                              value={adminForm.email}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  email: e.target.value,
                                })
                              }
                              required
                              className="dark:bg-gray-800"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="admin-password"
                              className="text-sm font-medium"
                            >
                              Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="admin-password"
                              type="password"
                              placeholder="Enter password"
                              value={adminForm.password}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  password: e.target.value,
                                })
                              }
                              required
                              minLength={6}
                              className="dark:bg-gray-800"
                            />
                            <p className="text-xs text-gray-500">
                              Minimum 6 characters
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="admin-mobile"
                              className="text-sm font-medium"
                            >
                              Mobile Number (Optional)
                            </Label>
                            <Input
                              id="admin-mobile"
                              type="tel"
                              placeholder="Enter mobile number"
                              value={adminForm.mobile}
                              onChange={(e) =>
                                setAdminForm({
                                  ...adminForm,
                                  mobile: e.target.value,
                                })
                              }
                              className="dark:bg-gray-800"
                            />
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAddAdminOpen(false);
                                setAdminForm({
                                  name: "",
                                  email: "",
                                  password: "",
                                  mobile: "",
                                });
                              }}
                              disabled={isCreatingAdmin}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="bg-[#368F8B] hover:bg-[#2d7a76]"
                              disabled={isCreatingAdmin}
                            >
                              {isCreatingAdmin
                                ? "Creating..."
                                : "Create Administrator"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {usersLoading ? (
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Role</TableHead>
                          <TableHead className="font-semibold">Level</TableHead>
                          <TableHead className="font-semibold">
                            Created
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tenantUsers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-8 text-gray-500"
                            >
                              No users in this organization
                            </TableCell>
                          </TableRow>
                        ) : (
                          tenantUsers.map((u) => (
                            <TableRow
                              key={u._id}
                              className="border-gray-100 dark:border-gray-800"
                            >
                              <TableCell className="font-medium">
                                {u.name}
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                {u.email}
                              </TableCell>
                              <TableCell>
                                {typeof u.role === "object" && u.role?.name
                                  ? u.role.name
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {u.level ?? "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-500 text-sm">
                                {formatDate(u.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() =>
                                    handleDeleteUser(u._id, u.name)
                                  }
                                  title="Delete User"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TenantForm;
