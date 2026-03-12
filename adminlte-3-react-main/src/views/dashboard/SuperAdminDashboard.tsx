"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@app/utils/axios";
import { ContentHeader } from "@app/components";
import { Card, CardContent, CardHeader } from "@app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Badge } from "@app/components/ui/badge";
import { Button } from "@app/components/ui/button";
import { Skeleton } from "@app/components/ui/skeleton";
import {
  Building2,
  Users,
  Activity,
  Zap,
  ArrowRight,
  UserPlus,
  History,
} from "lucide-react";

export interface TenantStats {
  totalTenants: number;
  totalUsers: number;
  byStatus: { active: number; suspended: number; trialing: number };
  byPlan: { Basic: number; Pro: number; Enterprise: number };
  recentTenants: Array<{
    _id: string;
    name: string;
    slug: string;
    plan?: string;
    status?: string;
    maxUsers?: number;
    userCount?: number;
    createdAt?: string;
    owner?: { name?: string; email?: string };
  }>;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    level?: string;
    createdAt?: string;
    tenantId?: { name?: string; slug?: string } | string;
  }>;
}

const SuperAdminDashboard = () => {
  const router = useRouter();
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["tenant-stats"],
    queryFn: async () => {
      const res = await axios.get("/tenants/stats");
      return res.data?.data as TenantStats;
    },
  });

  const { data: activityData } = useQuery({
    queryKey: ["activity-logs-recent"],
    queryFn: async () => {
      const res = await axios.get("/activity-logs?limit=10&page=1");
      return res.data?.data || [];
    },
  });

  const recentActivity = (activityData || []) as Array<{
    _id: string;
    action?: string;
    module?: string;
    description?: string;
    createdAt?: string;
    user?: { name?: string };
    tenantId?: string;
  }>;

  const stats = statsData;
  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-IN", { dateStyle: "short" }) : "—";

  if (isLoading) {
    return (
      <>
        <ContentHeader title="SaaS Dashboard" />
        <section className="content">
          <div className="container-fluid px-4 pb-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="SaaS Dashboard" />
      <section className="content">
        <div className="container-fluid px-4 pb-10 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Organizations
                </span>
                <Building2 className="h-5 w-5 text-[#368F8B]" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalTenants ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Users
                </span>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalUsers ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active / Trialing / Suspended
                </span>
                <Activity className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {stats?.byStatus?.active ?? 0} active
                </Badge>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  {stats?.byStatus?.trialing ?? 0} trialing
                </Badge>
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                  {stats?.byStatus?.suspended ?? 0} suspended
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  By Plan
                </span>
                <Zap className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {stats?.byPlan?.Basic ?? 0} Basic
                </Badge>
                <Badge variant="secondary">{stats?.byPlan?.Pro ?? 0} Pro</Badge>
                <Badge className="bg-violet-500/10 text-violet-600">
                  {stats?.byPlan?.Enterprise ?? 0} Enterprise
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Recent organizations */}
          <Card className="border-0 shadow-md bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Organizations
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => router.push("/tenants")}
              >
                View all <ArrowRight size={14} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Slug</TableHead>
                    <TableHead className="font-semibold">Plan</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Users</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="text-right font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!stats?.recentTenants || stats.recentTenants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        No organizations yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentTenants.map((t) => (
                      <TableRow
                        key={t._id}
                        className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                      >
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {t.slug}
                          </code>
                        </TableCell>
                        <TableCell>{t.plan ?? "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.status === "active" ? "default" : "secondary"
                            }
                            className={
                              t.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : t.status === "suspended"
                                  ? "bg-red-500/10 text-red-600"
                                  : ""
                            }
                          >
                            {t.status ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          {t.userCount ?? 0} / {t.maxUsers ?? "—"}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {formatDate(t.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#368F8B]"
                            onClick={() => router.push(`/tenants/${t._id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent platform activity */}
          <Card className="border-0 shadow-md bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <History size={20} className="text-[#368F8B]" />
                Recent platform activity
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800">
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Module</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No recent activity
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentActivity.map((log) => (
                      <TableRow
                        key={log._id}
                        className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                      >
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.action ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          {log.module ?? "—"}
                        </TableCell>
                        <TableCell
                          className="text-sm max-w-[280px] truncate"
                          title={log.description}
                        >
                          {log.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                          {log.user?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent users */}
          <Card className="border-0 shadow-md bg-white dark:bg-card ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-[#368F8B]" />
                Recent Users
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">
                      Organization
                    </TableHead>
                    <TableHead className="font-semibold">Level</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No users yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentUsers.map((u) => (
                      <TableRow
                        key={u._id}
                        className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                      >
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          {typeof u.tenantId === "object" && u.tenantId?.name
                            ? u.tenantId.name
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default SuperAdminDashboard;
