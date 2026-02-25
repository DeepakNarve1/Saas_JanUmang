"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import { useListManagement } from "@app/hooks/useListManagement";
import { ITenant, ITenantResponse } from "@app/types/tenant";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Badge } from "@app/components/ui/badge";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Globe,
  Eye,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";

const TenantsList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { response, isLoading, searchTerm, setSearchTerm, handleDelete } =
    useListManagement<ITenant, ITenantResponse>({
      queryKey: "tenants-list",
      endpoint: "/tenants",
      initialVisibleColumns: {
        name: true,
        slug: true,
        status: true,
        actions: true,
      },
    });

  const tenants = response?.data || [];

  const handleStatusChange = async (
    tenantId: string,
    newStatus: "active" | "suspended",
  ) => {
    try {
      await axios.put(`/tenants/${tenantId}`, { status: newStatus });
      toast.success(
        `Organization ${newStatus === "suspended" ? "suspended" : "activated"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-stats"] });
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update status");
    }
  };

  const getBadgeVariant = (status: string = "") => {
    switch (status) {
      case "active":
        return "default";
      case "suspended":
      case "cancelled":
      case "expired":
        return "destructive";
      case "trialing":
      case "inactive":
        return "secondary";
      default:
        return "secondary"; // Fallback
    }
  };

  const getBadgeClassName = (status: string = "") => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "suspended":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "trialing":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "inactive":
      case "cancelled":
      case "expired":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200"; // Fallback for unknown/missing
    }
  };

  const formatStatus = (status: string = "") => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="content-wrapper">
      <ContentHeader title="Organizations Management" />
      <section className="content">
        <div className="container-fluid">
          <div className="card shadow-lg border-0 rounded-xl overflow-hidden bg-white dark:bg-card">
            <div className="card-header bg-white dark:bg-card border-b border-gray-100 dark:border-gray-800 p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#368F8B]/10 flex items-center justify-center">
                    <Building2 className="text-[#368F8B]" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Active Organizations
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage multi-tenant environment
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
                      placeholder="Search organizations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 dark:bg-gray-800/50"
                    />
                  </div>
                  <Button
                    onClick={() => router.push("/tenants/new")}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white whitespace-nowrap gap-2"
                  >
                    <Plus size={18} /> New Org
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50 dark:bg-gray-800/30">
                  <TableRow className="border-gray-100 dark:border-gray-800">
                    <TableHead className="text-xs uppercase text-white dark:text-white py-4 font-bold">
                      S.No
                    </TableHead>
                    <TableHead className="text-xs uppercase text-white dark:text-white py-4 font-bold">
                      Organization Name
                    </TableHead>
                    <TableHead className="text-xs uppercase text-white dark:text-white py-4 font-bold">
                      URL Slug
                    </TableHead>
                    <TableHead className="text-xs uppercase text-white dark:text-white py-4 font-bold">
                      Users
                    </TableHead>
                    <TableHead className="text-xs uppercase text-white dark:text-white py-4 font-bold">
                      Status
                    </TableHead>
                    <TableHead className="text-xs uppercase text-white dark:text-white py-4 text-right font-bold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : tenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20">
                        <div className="flex flex-col items-center text-gray-400">
                          <Globe size={48} className="mb-4 opacity-20" />
                          <p>No organizations found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenants.map((tenant, idx) => (
                      <TableRow
                        key={tenant._id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors border-gray-100 dark:border-gray-800"
                      >
                        <TableCell className="font-medium text-black text-xs">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                              {tenant.name[0]}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/tenants/${tenant._id}`)
                              }
                              className="font-semibold text-gray-700 dark:text-gray-200 hover:text-[#368F8B] text-left"
                            >
                              {tenant.name}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-[#368F8B]">
                            /{tenant.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          {tenant.userCount ?? 0} /{" "}
                          {tenant.maxUsers === -1
                            ? "Unlimited"
                            : tenant.maxUsers ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getBadgeVariant(tenant.status) as any}
                            className={getBadgeClassName(tenant.status)}
                            title={
                              tenant.subscriptionStatus
                                ? `Subscription: ${formatStatus(
                                    tenant.subscriptionStatus,
                                  )}`
                                : undefined
                            }
                          >
                            {formatStatus(tenant.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {tenant.status === "suspended" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10"
                                onClick={() =>
                                  handleStatusChange(tenant._id, "active")
                                }
                                title="Activate"
                              >
                                <PlayCircle size={16} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:bg-amber-500/10"
                                onClick={() =>
                                  handleStatusChange(tenant._id, "suspended")
                                }
                                title="Suspend"
                              >
                                <PauseCircle size={16} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-[#368F8B] hover:bg-[#368F8B]/10"
                              onClick={() =>
                                router.push(`/tenants/${tenant._id}`)
                              }
                              title="View"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-[#368F8B] hover:bg-[#368F8B]/10"
                              onClick={() =>
                                router.push(`/tenants/${tenant._id}/edit`)
                              }
                              title="Edit"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => handleDelete(tenant._id)}
                              title="Delete"
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
    </div>
  );
};

export default TenantsList;
