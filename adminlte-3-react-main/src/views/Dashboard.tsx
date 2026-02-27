"use client";

import React from "react";
import { useAppSelector } from "@app/store/store";
import SuperAdminDashboard from "./dashboard/SuperAdminDashboard";
import DashboardCharts from "./dashboard/DashboardCharts";
import { useDashboardData } from "@app/hooks/useDashboardData";
import { ContentHeader } from "@app/components";

/**
 * Root dashboard router.
 * - Global platform admins (no tenantId, level=system_admin/superadmin) → SuperAdminDashboard
 * - Everyone else (tenant users) → Tenant DashboardCharts
 */
const Dashboard = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { stats, problemsByDepartment, problemsByStatus, loadingCharts } =
    useDashboardData();

  const isGlobalAdmin =
    !currentUser?.tenantId &&
    (currentUser?.level === "system_admin" ||
      currentUser?.level === "superadmin");

  if (isGlobalAdmin) {
    return <SuperAdminDashboard />;
  }

  return (
    <>
      <ContentHeader title="Organization Dashboard" />
      {loadingCharts ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#368F8B]"></div>
        </div>
      ) : (
        <DashboardCharts
          stats={stats}
          problemsByDepartment={problemsByDepartment}
          problemsByStatus={problemsByStatus}
        />
      )}
    </>
  );
};

export default Dashboard;
