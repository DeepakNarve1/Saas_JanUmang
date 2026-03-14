import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";

export interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalPublicProblems: number;
  pendingProblems: number;
  resolvedProblems: number;
  inProgressProblems: number;
  totalProjects: number;
  completedProjects: number;
  totalAssemblyIssues: number;
  totalEvents: number;
  totalDepartments: number;
  totalBlocks: number;
  totalMembers: number;
  todayMembers: number;
  totalVisitors: number;
  totalInDocs: number;
  totalSamitis: number;
  totalVillages: number;
  totalPanchayats: number;
  totalBooths: number;
}

export interface DepartmentSummary {
  name: string;
  total: number;
  complete: number;
  incomplete: number;
  inProgress: number;
}

export interface BlockSummary {
  name: string;
  total: number;
  today: number;
  complete: number;
  incomplete: number;
  inProgress: number;
}

export interface MemberDistrictSummary {
  name: string;
  bc: number;
  pp: number;
  ip: number;
  fh: number;
  smm: number;
  ms: number;
  fp: number;
  er: number;
  ak: number;
  fm: number;
  varist: number;
  yuva: number;
}

export const useDashboardData = () => {
  const { hasPermission } = usePermissions();
  const canViewDashboard = hasPermission(PERMISSIONS.VIEW_DASHBOARD);

  // --- Filter State ---
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [deptFilter, setDeptFilter] = useState({
    block: "",
    start: "",
    end: "",
  });

  // Shared query options
  const baseQueryOptions = {
    enabled: canViewDashboard,
    staleTime: 60 * 1000, // 1 minute — fresh enough for a dashboard
    refetchOnWindowFocus: true, // re-fetch when user switches tabs and comes back
    refetchOnMount: true, // always fetch fresh data when component mounts
  };

  // --- Stats: total counts for all stat cards ---
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await axios.get("/dashboard/stats");
      return res.data?.data || {};
    },
    ...baseQueryOptions,
  });

  // --- Department summary (re-fetches when block filter changes) ---
  const { data: departmentData, isLoading: departmentLoading } = useQuery({
    queryKey: ["dashboard-department-summary", deptFilter.block],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (deptFilter.block) params.append("block", deptFilter.block);
      const res = await axios.get(`/dashboard/department-summary?${params}`);
      return res.data?.data || [];
    },
    ...baseQueryOptions,
  });

  // --- Block summary ---
  const { data: blockData, isLoading: blockLoading } = useQuery({
    queryKey: ["dashboard-block-summary"],
    queryFn: async () => {
      const res = await axios.get("/dashboard/block-summary");
      return res.data?.data || [];
    },
    ...baseQueryOptions,
  });

  // --- Member district summary ---
  const { data: memberDistrictData, isLoading: memberDistrictLoading } = useQuery({
    queryKey: ["dashboard-member-district-summary"],
    queryFn: async () => {
      const res = await axios.get("/dashboard/member-district-summary");
      return res.data?.data || [];
    },
    ...baseQueryOptions,
  });

  // --- Chart data (re-fetches when date filter changes) ---
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard-charts", dateFilter.start, dateFilter.end],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter.start) params.append("startDate", dateFilter.start);
      if (dateFilter.end) params.append("endDate", dateFilter.end);
      const res = await axios.get(`/dashboard/charts?${params}`);
      return res.data?.data || {};
    },
    ...baseQueryOptions,
  });

  // --- Blocks for dropdown (always enabled for authenticated users) ---
  const { data: blocksData = [] } = useQuery({
    queryKey: ["dashboard-blocks"],
    queryFn: async () => {
      const res = await axios.get("/blocks?limit=200");
      return res.data?.data || [];
    },
    enabled: true, // Don't gate on a specific permission — any authenticated user needs blocks
    staleTime: 5 * 60 * 1000, // 5 minutes — block list changes rarely
    refetchOnWindowFocus: false,
  });

  // Granular loading states
  const loadingStats = statsLoading;
  const loadingCharts =
    chartLoading ||
    departmentLoading ||
    blockLoading ||
    memberDistrictLoading ||
    statsLoading;

  // --- Stats object ---
  const stats: DashboardStats = useMemo(
    () => ({
      totalUsers: statsData?.totalUsers || 0,
      totalRoles: statsData?.totalRoles || 0,
      totalPublicProblems: statsData?.totalPublicProblems || 0,
      pendingProblems: statsData?.pendingProblems || 0,
      resolvedProblems: statsData?.resolvedProblems || 0,
      inProgressProblems: statsData?.inProgressProblems || 0,
      totalProjects: statsData?.totalProjects || 0,
      completedProjects: statsData?.completedProjects || 0,
      totalAssemblyIssues: statsData?.totalAssemblyIssues || 0,
      totalEvents: statsData?.totalEvents || 0,
      totalDepartments: statsData?.totalDepartments || 0,
      totalBlocks: statsData?.totalBlocks || 0,
      totalMembers: statsData?.totalMembers || 0,
      todayMembers: statsData?.todayMembers || 0,
      totalVisitors: statsData?.totalVisitors || 0,
      totalInDocs: statsData?.totalInDocs || 0,
      totalSamitis: statsData?.totalSamitis || 0,
      totalVillages: statsData?.totalVillages || 0,
      totalPanchayats: statsData?.totalPanchayats || 0,
      totalBooths: statsData?.totalBooths || 0,
    }),
    [statsData],
  );

  // --- Card stats for problem stat cards ---
  const cardStats = useMemo(
    () => ({
      public: {
        total: stats.totalPublicProblems,
        complete: stats.resolvedProblems,
        incomplete: stats.pendingProblems,
        inProgress: stats.inProgressProblems,
      },
      mp: {
        total: 0,
        complete: 0,
        incomplete: 0,
        inProgress: 0,
      },
    }),
    [stats],
  );

  // --- Derived data ---
  const departmentSummary: DepartmentSummary[] = useMemo(
    () => departmentData || [],
    [departmentData],
  );

  const blockSummary: BlockSummary[] = useMemo(
    () => blockData || [],
    [blockData],
  );

  const memberDistrictSummary: MemberDistrictSummary[] = useMemo(
    () => memberDistrictData || [],
    [memberDistrictData],
  );

  const problemsByDepartment = useMemo(
    () => chartData?.problemsByDepartment || [],
    [chartData],
  );

  const problemsByStatus = useMemo(
    () => chartData?.problemsByStatus || [],
    [chartData],
  );

  // rawData — only blocks list is genuinely fetched; rest are empty placeholders
  const rawData = useMemo(
    () => ({
      publicProblems: [],
      projects: [],
      assemblyIssues: [],
      events: [],
      departments: [],
      blocks: blocksData,
      visitors: [],
      members: [],
      inDocs: [],
      samitis: [],
      villages: [],
      panchayats: [],
      booths: [],
      users: [],
      roles: [],
    }),
    [blocksData],
  );

  return {
    // Core data
    stats,
    cardStats,
    departmentSummary,
    blockSummary,
    memberDistrictSummary,
    problemsByDepartment,
    problemsByStatus,

    // Loading states (granular)
    loadingStats, // for stat cards only
    loadingCharts, // for charts + summary tables

    // Filters
    dateFilter,
    setDateFilter,
    deptFilter,
    setDeptFilter,

    // Raw / legacy compatibility
    rawData,
    filteredProblems: [],
    filteredProjects: [],
    mpDepartmentSummary: [],
    mpBlockSummary: [],
  };
};
