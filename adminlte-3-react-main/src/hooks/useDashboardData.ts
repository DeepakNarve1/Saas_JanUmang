import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { usePermissions } from "@app/hooks/usePermissions";

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

export interface MemberBlockSummary {
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

  // --- Filter State ---
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [deptFilter, setDeptFilter] = useState({
    block: "",
    start: "",
    end: "",
  });

  // --- OPTIMIZED: Single API call for all statistics ---
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await axios.get("/dashboard/stats");
      return res.data?.data || {};
    },
    enabled: hasPermission("view_dashboard"),
    staleTime: 30000, // Cache for 30 seconds
  });

  // --- OPTIMIZED: Department summary with optional filters ---
  const { data: departmentData, isLoading: departmentLoading } = useQuery({
    queryKey: ["dashboard-department-summary", deptFilter.block],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (deptFilter.block) params.append("block", deptFilter.block);
      const res = await axios.get(`/dashboard/department-summary?${params}`);
      return res.data?.data || [];
    },
    enabled: hasPermission("view_dashboard"),
    staleTime: 30000,
  });

  // --- OPTIMIZED: Block summary ---
  const { data: blockData, isLoading: blockLoading } = useQuery({
    queryKey: ["dashboard-block-summary"],
    queryFn: async () => {
      const res = await axios.get("/dashboard/block-summary");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_dashboard"),
    staleTime: 30000,
  });

  // --- OPTIMIZED: Member block summary ---
  const { data: memberBlockData, isLoading: memberBlockLoading } = useQuery({
    queryKey: ["dashboard-member-block-summary"],
    queryFn: async () => {
      const res = await axios.get("/dashboard/member-block-summary");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_dashboard"), // Could also check module access
    staleTime: 30000,
  });

  // --- OPTIMIZED: Chart data with date filters ---
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard-charts", dateFilter.start, dateFilter.end],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter.start) params.append("startDate", dateFilter.start);
      if (dateFilter.end) params.append("endDate", dateFilter.end);
      const res = await axios.get(`/dashboard/charts?${params}`);
      return res.data?.data || {};
    },
    enabled: hasPermission("view_dashboard"),
    staleTime: 30000,
  });

  // --- Fetch blocks for dropdown (lightweight) ---
  const { data: blocksData = [] } = useQuery({
    queryKey: ["dashboard-blocks"],
    queryFn: async () => {
      const res = await axios.get("/blocks?limit=100");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_blocks"),
    staleTime: 60000, // Cache for 1 minute
  });

  // --- Loading states ---
  const loadingCharts =
    statsLoading ||
    departmentLoading ||
    blockLoading ||
    memberBlockLoading ||
    chartLoading;

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

  // --- Card stats for problem cards ---
  const cardStats = useMemo(() => {
    return {
      public: {
        total: stats.totalPublicProblems,
        complete: stats.resolvedProblems,
        incomplete: stats.pendingProblems,
        inProgress: stats.inProgressProblems,
      },
      mp: {
        total: 0, // MP problems need separate endpoint if needed
        complete: 0,
        incomplete: 0,
        inProgress: 0,
      },
    };
  }, [stats]);

  // --- Department summary ---
  const departmentSummary: DepartmentSummary[] = useMemo(
    () => departmentData || [],
    [departmentData],
  );

  // --- Block summary ---
  const blockSummary: BlockSummary[] = useMemo(
    () => blockData || [],
    [blockData],
  );

  // --- Member Block Summary ---
  const memberBlockSummary: MemberBlockSummary[] = useMemo(
    () => memberBlockData || [],
    [memberBlockData],
  );

  // --- Chart data ---
  const problemsByDepartment = useMemo(
    () => chartData?.problemsByDepartment || [],
    [chartData],
  );

  const problemsByStatus = useMemo(
    () => chartData?.problemsByStatus || [],
    [chartData],
  );

  // --- Legacy compatibility: Empty arrays for unused data ---
  const rawData = useMemo(
    () => ({
      publicProblems: [],
      projects: [],
      assemblyIssues: [],
      events: [],
      departments: [],
      blocks: blocksData, // ✅ Include blocks for dropdown
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
    memberBlockSummary, // ✅ Exposed here
    problemsByDepartment,
    problemsByStatus,

    // Loading states
    loadingCharts,

    // Filters
    dateFilter,
    setDateFilter,
    deptFilter,
    setDeptFilter,

    // Legacy compatibility (empty for now)
    rawData,
    filteredProblems: [],
    filteredProjects: [],
    mpDepartmentSummary: [],
    mpBlockSummary: [],
    memberDistrictSummary: [],
  };
};
