"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";
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
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  PauseCircle,
  PlayCircle,
  Users,
  UserPlus,
} from "lucide-react";
import { ITenant } from "@app/types/tenant";
import { toast } from "react-toastify";
import { Skeleton } from "@app/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@app/components/ui/dialog";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";

interface TenantViewProps {
  tenantId: string;
}

const TenantView: React.FC<TenantViewProps> = ({ tenantId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAddAdminOpen, setIsAddAdminOpen] = React.useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = React.useState(false);
  const [adminForm, setAdminForm] = React.useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: async () => {
      const res = await axios.get(`/tenants/${tenantId}`);
      return res.data?.data as ITenant & {
        owner?: { name?: string; email?: string };
        settings?: any;
        userCount?: number;
      };
    },
    enabled: !!tenantId,
  });

  const { data: tenantUsersData, isLoading: usersLoading } = useQuery({
    queryKey: ["tenant-users", tenantId],
    queryFn: async () => {
      const res = await axios.get(`/tenants/${tenantId}/users`);
      return res.data?.data || [];
    },
    enabled: !!tenantId,
  });

  const tenantUsers = (tenantUsersData || []) as Array<{
    _id: string;
    name: string;
    email: string;
    level?: string;
    role?: { name?: string; displayName?: string };
    createdAt?: string;
  }>;

  const handleStatusChange = async (newStatus: "active" | "suspended") => {
    try {
      await axios.put(`/tenants/${tenantId}`, { status: newStatus });
      toast.success(
        `Organization ${newStatus === "suspended" ? "suspended" : "activated"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-stats"] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this organization? This action cannot be undone.",
      )
    )
      return;
    try {
      await axios.delete(`/tenants/${tenantId}`);
      toast.success("Organization deleted");
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-stats"] });
      router.push("/tenants");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete organization");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }

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

    try {
      await axios.delete(`/tenants/${tenantId}/admins/${userId}`);
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tenant-users", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="content-wrapper">
        <ContentHeader title="Loading..." />
        <section className="content">
          <div className="container-fluid flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#368F8B]" />
          </div>
        </section>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="content-wrapper">
        <ContentHeader title="Not found" />
        <section className="content">
          <div className="container-fluid py-10 text-center text-gray-500">
            Organization not found.
            <Button variant="link" onClick={() => router.push("/tenants")}>
              Back to list
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";

  return (
    <div className="content-wrapper">
      <ContentHeader title="Organization Details" />
      <section className="content">
        <div className="container-fluid">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-600"
                onClick={() => router.push("/tenants")}
              >
                <ArrowLeft size={16} /> Back to list
              </Button>
              <div className="flex flex-wrap gap-2">
                {(tenant as any).status === "suspended" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-emerald-600 border-emerald-500/30"
                    onClick={() => handleStatusChange("active")}
                  >
                    <PlayCircle size={16} /> Activate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-amber-600 border-amber-500/30"
                    onClick={() => handleStatusChange("suspended")}
                  >
                    <PauseCircle size={16} /> Suspend
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push(`/tenants/${tenantId}/edit`)}
                >
                  <Edit size={16} /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-lg bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#368F8B]/10 flex items-center justify-center">
                    <Building2 className="text-[#368F8B]" size={28} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                      {(tenant as any).name}
                    </h1>
                    <code className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      /{(tenant as any).slug}
                    </code>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Plan
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white mt-1">
                      {(tenant as any).plan ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Status
                    </p>
                    <div className="mt-1">
                      <Badge
                        variant={
                          (tenant as any).status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          (tenant as any).status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : ""
                        }
                      >
                        {(tenant as any).status ?? "—"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Users (used / limit)
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white mt-1">
                      {(tenant as any).userCount ?? 0} /{" "}
                      {(tenant as any).maxUsers ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Created
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">
                      {formatDate((tenant as any).createdAt)}
                    </p>
                  </div>
                </div>

                {(tenant as any).owner && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Owner
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User size={18} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {(tenant as any).owner?.name ?? "—"}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail size={12} />
                          {(tenant as any).owner?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(tenant as any).settings?.theme && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Theme
                    </p>
                    <div className="flex items-center gap-4">
                      {(tenant as any).settings.theme.primaryColor && (
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                            style={{
                              backgroundColor: (tenant as any).settings.theme
                                .primaryColor,
                            }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {(tenant as any).settings.theme.primaryColor}
                          </span>
                        </div>
                      )}
                      {(tenant as any).settings.theme.logoUrl && (
                        <span className="text-sm text-gray-500 truncate max-w-[200px]">
                          Logo: {(tenant as any).settings.theme.logoUrl}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Users in this organization */}
            <Card className="border-0 shadow-lg bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <Users size={20} className="text-[#368F8B]" />
                    Users in this organization ({(tenant as any).userCount ??
                      0}{" "}
                    / {(tenant as any).maxUsers ?? "—"})
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
                        <TableHead className="font-semibold">Created</TableHead>
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
                                onClick={() => handleDeleteUser(u._id, u.name)}
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default TenantView;
