"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { usePermissions } from "@app/hooks/usePermissions";
import { useDashboardData } from "@app/hooks/useDashboardData";
import SuperAdminDashboard from "@app/views/dashboard/SuperAdminDashboard";
import DashboardStatsGrid from "@app/views/dashboard/DashboardStatsGrid";
import DashboardFilters from "@app/views/dashboard/DashboardFilters";
import SummaryTable from "@app/views/dashboard/SummaryTable";
import { useModuleAccess } from "@app/hooks/useModuleAccess";
import { MODULE_IDS } from "@app/config/modules";

const DashboardCharts = dynamic(
  () => import("@app/views/dashboard/DashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-50 animate-pulse rounded-xl mt-6" />
    ),
  },
);

const OtherModuleGraphs = dynamic(
  () => import("@app/views/dashboard/OtherModuleGraphs"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-50 animate-pulse rounded-xl mt-6" />
    ),
  },
);

const REQUIRED_PERMISSIONS = ["view_dashboard"];

const Dashboard = () => {
  const { isSuperAdmin } = usePermissions();

  return (
    <RouteGuard requiredPermissions={REQUIRED_PERMISSIONS}>
      {isSuperAdmin() ? <SuperAdminDashboard /> : <DashboardContent />}
    </RouteGuard>
  );
};

const DashboardContent = () => {
  const {
    rawData,
    loadingCharts,
    setDateFilter,
    deptFilter,
    setDeptFilter,
    filteredProblems,
    filteredProjects,
    stats,
    cardStats,
    departmentSummary,
    mpDepartmentSummary,
    blockSummary,
    mpBlockSummary,
    memberBlockSummary,
    memberDistrictSummary,
    problemsByDepartment,
    problemsByStatus,
  } = useDashboardData();

  const { checkModuleAccess } = useModuleAccess();

  const showMPProblems = checkModuleAccess(MODULE_IDS.MP_PUBLIC_PROBLEMS);
  const showEvents = checkModuleAccess(MODULE_IDS.EVENTS);
  const showVisitors = checkModuleAccess(MODULE_IDS.VISITORS);
  const showMembers = checkModuleAccess(MODULE_IDS.MEMBERS);

  return (
    <>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid px-4 pb-10">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                System Overview
              </h2>
            </div>

            <div className="p-6">
              <DashboardStatsGrid
                stats={stats}
                cardStats={cardStats}
                isLoading={loadingCharts}
              />

              <DashboardFilters
                onApply={(dates) => setDateFilter(dates)}
                onClear={() => setDateFilter({ start: "", end: "" })}
              />

              {!loadingCharts ? (
                <>
                  <DashboardCharts
                    problemsByDepartment={problemsByDepartment}
                    problemsByStatus={problemsByStatus}
                    stats={stats}
                  />
                  {(showEvents || showVisitors) && (
                    <OtherModuleGraphs
                      events={showEvents ? rawData.events : []}
                      visitors={showVisitors ? rawData.visitors : []}
                    />
                  )}
                </>
              ) : (
                <div className="mt-6 h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              )}

              {/* Department Summary Reports */}
              {showMPProblems && (
                <div className="mt-12 space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b dark:border-gray-800 pb-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      Department Summary Reports
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
                      <select
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                        value={deptFilter.block}
                        onChange={(e) =>
                          setDeptFilter({
                            ...deptFilter,
                            block: e.target.value,
                          })
                        }
                      >
                        <option value="">All Blocks</option>
                        {rawData.blocks.map((b: any) => (
                          <option
                            key={b._id}
                            value={b.name}
                            className="dark:bg-gray-800"
                          >
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          setDeptFilter({ block: "", start: "", end: "" })
                        }
                        className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border dark:border-gray-700 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-8">
                    <SummaryTable
                      title="Department - Summary Report"
                      data={departmentSummary}
                      columns={[
                        { header: "Department Name", accessorKey: "name" },
                        {
                          header: "Complete",
                          accessorKey: "complete",
                          render: (row) => (
                            <span className="text-green-600 font-medium">
                              {row.complete}
                            </span>
                          ),
                        },
                        {
                          header: "Incomplete",
                          accessorKey: "incomplete",
                          render: (row) => (
                            <span className="text-red-500 font-medium">
                              {row.incomplete}
                            </span>
                          ),
                        },
                        {
                          header: "In Progress",
                          accessorKey: "inProgress",
                          render: (row) => (
                            <span className="text-orange-500 font-medium">
                              {row.inProgress}
                            </span>
                          ),
                        },
                        { header: "Total", accessorKey: "total" },
                      ]}
                      isLoading={loadingCharts}
                    />

                    {/* MP Public Problems Summary - kept if needed, though data might be empty */}
                    <SummaryTable
                      title="MP Public Problems - Department Summary Report"
                      data={mpDepartmentSummary}
                      columns={[
                        { header: "Department Name", accessorKey: "name" },
                        {
                          header: "Complete",
                          accessorKey: "complete",
                          render: (row) => (
                            <span className="text-green-600 font-medium">
                              {row.complete}
                            </span>
                          ),
                        },
                        {
                          header: "Incomplete",
                          accessorKey: "incomplete",
                          render: (row) => (
                            <span className="text-red-500 font-medium">
                              {row.incomplete}
                            </span>
                          ),
                        },
                        {
                          header: "In Progress",
                          accessorKey: "inProgress",
                          render: (row) => (
                            <span className="text-orange-500 font-medium">
                              {row.inProgress}
                            </span>
                          ),
                        },
                        { header: "Total Problems", accessorKey: "total" },
                      ]}
                      isLoading={loadingCharts}
                    />
                  </div>
                </div>
              )}

              {/* Other Summary Tables */}
              <div className="mt-12 flex flex-col gap-8">
                {showMPProblems && (
                  <SummaryTable
                    title="Public Problems - Summary Report"
                    data={blockSummary}
                    columns={[
                      { header: "Block Name", accessorKey: "name" },
                      { header: "Total Records", accessorKey: "total" },
                      { header: "Today Records", accessorKey: "today" },
                      {
                        header: "Incomplete",
                        accessorKey: "incomplete",
                        render: (row) => (
                          <span className="text-red-500">{row.incomplete}</span>
                        ),
                      },
                      {
                        header: "Complete",
                        accessorKey: "complete",
                        render: (row) => (
                          <span className="text-green-600">{row.complete}</span>
                        ),
                      },
                    ]}
                    isLoading={loadingCharts}
                  />
                )}

                {showMPProblems && (
                  <SummaryTable
                    title="MP Public Problems - Summary Report"
                    data={mpBlockSummary}
                    columns={[
                      { header: "Block Name", accessorKey: "name" },
                      { header: "Total Records", accessorKey: "total" },
                      { header: "Today Records", accessorKey: "today" },
                      {
                        header: "Incomplete",
                        accessorKey: "incomplete",
                        render: (row) => (
                          <span className="text-red-500">{row.incomplete}</span>
                        ),
                      },
                      {
                        header: "Complete",
                        accessorKey: "complete",
                        render: (row) => (
                          <span className="text-green-600">{row.complete}</span>
                        ),
                      },
                    ]}
                    isLoading={loadingCharts}
                  />
                )}

                {showMembers && (
                  <SummaryTable
                    title="New Member Summary"
                    data={memberBlockSummary}
                    columns={[
                      { header: "Block Name", accessorKey: "name" },
                      { header: "BC Count", accessorKey: "bc" },
                      { header: "PP Count", accessorKey: "pp" },
                      { header: "IP Count", accessorKey: "ip" },
                      { header: "FH Count", accessorKey: "fh" },
                      { header: "SMM Count", accessorKey: "smm" },
                      { header: "MS Count", accessorKey: "ms" },
                      { header: "FP Count", accessorKey: "fp" },
                      { header: "ER Count", accessorKey: "er" },
                      { header: "AK Count", accessorKey: "ak" },
                      { header: "FM Count", accessorKey: "fm" },
                      { header: "Varist Count", accessorKey: "varist" },
                      { header: "Yuva Count", accessorKey: "yuva" },
                    ]}
                    isLoading={loadingCharts}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
