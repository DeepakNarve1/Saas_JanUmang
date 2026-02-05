import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { usePermissions } from "@app/hooks/usePermissions";

export interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalPublicProblems: number;
  pendingProblems: number;
  totalProjects: number;
  completedProjects: number;
  totalMembers: number;
  todayMembers: number;
  totalVisitors: number;
  totalInDocs: number;
  totalSamitis: number;
  totalVillages: number;
  totalPanchayats: number;
  totalBooths: number;
}

export const useDashboardData = () => {
  const { hasPermission } = usePermissions();

  // --- Data Fetching ---

  const { data: usersRaw = [], isLoading: usersLoading } = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: async () => {
      const res = await axios.get("/auth/users?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_users"),
  });

  const { data: rolesRaw = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["dashboard-roles"],
    queryFn: async () => {
      const res = await axios.get("/rbac/roles?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_roles"),
  });

  const { data: problemsRaw = [], isLoading: problemsLoading } = useQuery({
    queryKey: ["dashboard-problems"],
    queryFn: async () => {
      const res = await axios.get("/public-problems?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_mp_public_problems"),
  });

  const { data: projectsRaw = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["dashboard-projects"],
    queryFn: async () => {
      const res = await axios.get("/projects?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_projects"),
  });

  const { data: assemblyRaw = [], isLoading: assemblyLoading } = useQuery({
    queryKey: ["dashboard-assembly"],
    queryFn: async () => {
      const res = await axios.get("/assembly-issues?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_assembly_issues"),
  });

  const { data: eventsRaw = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: async () => {
      const res = await axios.get("/events?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_events"),
  });

  const { data: departmentsRaw = [], isLoading: departmentsLoading } = useQuery(
    {
      queryKey: ["dashboard-departments"],
      queryFn: async () => {
        const res = await axios.get("/departments?limit=-1");
        return res.data?.data || [];
      },
      enabled: hasPermission("view_department"),
    },
  );

  const { data: blocksRaw = [], isLoading: blocksLoading } = useQuery({
    queryKey: ["dashboard-blocks"],
    queryFn: async () => {
      const res = await axios.get("/blocks?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_blocks"),
  });

  const { data: visitorsRaw = [], isLoading: visitorsLoading } = useQuery({
    queryKey: ["dashboard-visitors"],
    queryFn: async () => {
      const res = await axios.get("/visitors?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_visitors"),
  });

  const { data: membersRaw = [], isLoading: membersLoading } = useQuery({
    queryKey: ["dashboard-members"],
    queryFn: async () => {
      const res = await axios.get("/members?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_members"),
  });

  const { data: inDocsRaw = [], isLoading: inDocsLoading } = useQuery({
    queryKey: ["dashboard-indocs"],
    queryFn: async () => {
      const res = await axios.get("/in-docs?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_in_docs"),
  });

  const { data: samitisRaw = [], isLoading: samitisLoading } = useQuery({
    queryKey: ["dashboard-samitis"],
    queryFn: async () => {
      const res = await axios.get("/samiti?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_samitis"),
  });

  const { data: villagesRaw = [], isLoading: villagesLoading } = useQuery({
    queryKey: ["dashboard-villages"],
    queryFn: async () => {
      const res = await axios.get("/village?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_villages"),
  });

  const { data: panchayatsRaw = [], isLoading: panchayatsLoading } = useQuery({
    queryKey: ["dashboard-panchayats"],
    queryFn: async () => {
      const res = await axios.get("/panchayat?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_panchayats"),
  });

  const { data: boothsRaw = [], isLoading: boothsLoading } = useQuery({
    queryKey: ["dashboard-booths"],
    queryFn: async () => {
      const res = await axios.get("/booth?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission("view_booths"),
  });

  const loadingCharts =
    departmentsLoading ||
    blocksLoading ||
    visitorsLoading ||
    membersLoading ||
    inDocsLoading ||
    samitisLoading ||
    villagesLoading ||
    panchayatsLoading ||
    boothsLoading;

  const rawData = useMemo(
    () => ({
      publicProblems: problemsRaw,
      projects: projectsRaw,
      assemblyIssues: assemblyRaw,
      events: eventsRaw,
      departments: departmentsRaw,
      blocks: blocksRaw,
      visitors: visitorsRaw,
      members: membersRaw,
      inDocs: inDocsRaw,
      samitis: samitisRaw,
      villages: villagesRaw,
      panchayats: panchayatsRaw,
      booths: boothsRaw,
      users: usersRaw,
      roles: rolesRaw,
    }),
    [
      problemsRaw,
      projectsRaw,
      assemblyRaw,
      eventsRaw,
      departmentsRaw,
      blocksRaw,
      visitorsRaw,
      membersRaw,
      inDocsRaw,
      samitisRaw,
      villagesRaw,
      panchayatsRaw,
      boothsRaw,
      usersRaw,
      rolesRaw,
    ],
  );

  // --- Filter State ---
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [deptFilter, setDeptFilter] = useState({
    block: "",
    start: "",
    end: "",
  });

  // --- Filtering Logic ---

  const filteredProblems = useMemo(() => {
    return rawData.publicProblems.filter((p: any) => {
      if (
        dateFilter.start &&
        p.submissionDate &&
        new Date(p.submissionDate) < new Date(dateFilter.start)
      )
        return false;
      if (
        dateFilter.end &&
        p.submissionDate &&
        new Date(p.submissionDate) > new Date(dateFilter.end)
      )
        return false;
      return true;
    });
  }, [rawData.publicProblems, dateFilter]);

  const filteredProjects = useMemo(() => {
    return rawData.projects.filter((p: any) => {
      const dateStr = p.createdAt || p.updatedAt;
      if (!dateStr) return true;
      if (dateFilter.start && new Date(dateStr) < new Date(dateFilter.start))
        return false;
      if (dateFilter.end && new Date(dateStr) > new Date(dateFilter.end))
        return false;
      return true;
    });
  }, [rawData.projects, dateFilter]);

  const filteredDeptProblems = useMemo(() => {
    return rawData.publicProblems.filter((p: any) => {
      if (deptFilter.block && p.block !== deptFilter.block) return false;
      if (
        deptFilter.start &&
        p.submissionDate &&
        new Date(p.submissionDate) < new Date(deptFilter.start)
      )
        return false;
      if (
        deptFilter.end &&
        p.submissionDate &&
        new Date(p.submissionDate) > new Date(deptFilter.end)
      )
        return false;
      return true;
    });
  }, [rawData.publicProblems, deptFilter]);

  const stats = useMemo(
    () => ({
      totalUsers: usersRaw.length,
      totalRoles: rolesRaw.length,
      totalPublicProblems: problemsRaw.length,
      pendingProblems: problemsRaw.filter((p: any) => p.status === "Pending")
        .length,
      totalProjects: projectsRaw.length,
      completedProjects: projectsRaw.filter(
        (p: any) => p.status === "Completed",
      ).length,
      totalMembers: membersRaw.length,
      todayMembers: membersRaw.filter(
        (m: any) =>
          m.createdAt &&
          new Date(m.createdAt).toDateString() === new Date().toDateString(),
      ).length,
      totalVisitors: visitorsRaw.length,
      totalInDocs: inDocsRaw.length,
      totalSamitis: samitisRaw.length,
      totalVillages: villagesRaw.length,
      totalPanchayats: panchayatsRaw.length,
      totalBooths: boothsRaw.length,
    }),
    [
      usersRaw,
      rolesRaw,
      problemsRaw,
      projectsRaw,
      membersRaw,
      visitorsRaw,
      inDocsRaw,
      samitisRaw,
      villagesRaw,
      panchayatsRaw,
      boothsRaw,
    ],
  );

  const mpProblems = useMemo(
    () =>
      filteredProblems.filter(
        (p: any) => p.recommendedLetterNo && p.recommendedLetterNo !== "N/A",
      ),
    [filteredProblems],
  );
  const filteredMpDeptProblems = useMemo(
    () =>
      filteredDeptProblems.filter(
        (p: any) => p.recommendedLetterNo && p.recommendedLetterNo !== "N/A",
      ),
    [filteredDeptProblems],
  );

  // --- Stats for Cards ---
  const cardStats = useMemo(() => {
    const countStatus = (list: any[], status: string) =>
      list.filter((p) => p.status === status).length;
    return {
      public: {
        total: filteredProblems.length,
        complete: countStatus(filteredProblems, "Resolved"),
        incomplete: countStatus(filteredProblems, "Pending"),
        inProgress: countStatus(filteredProblems, "In Progress"),
      },
      mp: {
        total: mpProblems.length,
        complete: countStatus(mpProblems, "Resolved"),
        incomplete: countStatus(mpProblems, "Pending"),
        inProgress: countStatus(mpProblems, "In Progress"),
      },
    };
  }, [filteredProblems, mpProblems]);

  // --- Summary Generation Logic ---

  const departmentSummary = useMemo(() => {
    const map: Record<string, any> = {};
    filteredDeptProblems.forEach((p: any) => {
      const d = p.department || "Unassigned";
      if (!map[d])
        map[d] = {
          name: d,
          total: 0,
          complete: 0,
          incomplete: 0,
          inProgress: 0,
        };
      map[d].total++;
      const status = p.status || "Pending";
      if (["Resolved", "Closed", "Completed"].includes(status))
        map[d].complete++;
      else if (["In Progress", "Processing"].includes(status))
        map[d].inProgress++;
      else map[d].incomplete++;
    });
    return Object.values(map);
  }, [filteredDeptProblems]);

  const mpDepartmentSummary = useMemo(() => {
    const map: Record<string, any> = {};
    filteredMpDeptProblems.forEach((p: any) => {
      const d = p.department || "Unassigned";
      if (!map[d])
        map[d] = {
          name: d,
          total: 0,
          complete: 0,
          incomplete: 0,
          inProgress: 0,
        };
      map[d].total++;
      const status = p.status || "Pending";
      if (["Resolved", "Closed", "Completed"].includes(status))
        map[d].complete++;
      else if (["In Progress", "Processing"].includes(status))
        map[d].inProgress++;
      else map[d].incomplete++;
    });
    return Object.values(map);
  }, [filteredMpDeptProblems]);

  const blockSummary = useMemo(() => {
    const map: Record<string, any> = {};
    const todayStr = new Date().toDateString();
    rawData.publicProblems.forEach((p: any) => {
      const block = p.block || "Unassigned";
      if (!map[block]) {
        map[block] = {
          name: block,
          total: 0,
          today: 0,
          complete: 0,
          incomplete: 0,
          inProgress: 0,
          stage1Incomplete: 0,
          stage1Complete: 0,
          stage1InProgress: 0,
          stage2Incomplete: 0,
          stage2Complete: 0,
        };
      }
      const entry = map[block];
      entry.total++;
      if (
        p.submissionDate &&
        new Date(p.submissionDate).toDateString() === todayStr
      )
        entry.today++;
      const status = p.status || "Pending";
      const isComplete = ["Resolved", "Closed", "Completed"].includes(status);
      const isInProgress = ["In Progress", "Processing"].includes(status);
      if (isComplete) entry.complete++;
      else if (isInProgress) entry.inProgress++;
      else entry.incomplete++;
      const stage = p.stage || 1;
      if (stage == 1) {
        if (isComplete) entry.stage1Complete++;
        else if (isInProgress) entry.stage1InProgress++;
        else entry.stage1Incomplete++;
      } else if (stage == 2) {
        if (isComplete) entry.stage2Complete++;
        else entry.stage2Incomplete++;
      }
    });
    return Object.values(map);
  }, [rawData.publicProblems]);

  const mpBlockSummary = useMemo(() => {
    const map: Record<string, any> = {};
    const todayStr = new Date().toDateString();
    mpProblems.forEach((p: any) => {
      const block = p.block || "Unassigned";
      if (!map[block]) {
        map[block] = {
          name: block,
          total: 0,
          today: 0,
          complete: 0,
          incomplete: 0,
          inProgress: 0,
        };
      }
      const entry = map[block];
      entry.total++;
      if (
        p.submissionDate &&
        new Date(p.submissionDate).toDateString() === todayStr
      )
        entry.today++;
      const status = p.status || "Pending";
      if (["Resolved", "Closed", "Completed"].includes(status))
        entry.complete++;
      else if (["In Progress", "Processing"].includes(status))
        entry.inProgress++;
      else entry.incomplete++;
    });
    return Object.values(map);
  }, [mpProblems]);

  const memberBlockSummary = useMemo(() => {
    const map: Record<string, any> = {};
    const getRoleName = (userRole: any) => {
      if (!userRole) return "";
      if (typeof userRole === "string") {
        const r = rolesRaw.find((rv: any) => rv._id === userRole);
        return r ? r.name : "";
      }
      return userRole.name || "";
    };
    const isDateInRange = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      if (dateFilter.start && date < new Date(dateFilter.start)) return false;
      if (dateFilter.end && date > new Date(dateFilter.end)) return false;
      return true;
    };
    rawData.users.forEach((u: any) => {
      if (u.createdAt && !isDateInRange(u.createdAt)) return;
      let blockName = "Unassigned";
      if (u.block) {
        if (typeof u.block === "string") {
          const b = (rawData.blocks as any[]).find(
            (bk: any) => bk._id === u.block,
          );
          blockName = b ? b.name : "Unknown Block ID";
        } else {
          blockName = u.block.name || "Unknown Block";
        }
      }
      if (!map[blockName]) {
        map[blockName] = {
          name: blockName,
          bc: 0,
          pp: 0,
          ip: 0,
          fh: 0,
          smm: 0,
          ms: 0,
          fp: 0,
          er: 0,
          ak: 0,
          fm: 0,
          varist: 0,
          yuva: 0,
        };
      }
      const roleName = getRoleName(u.role).toLowerCase();
      const entry = map[blockName];
      if (
        roleName.includes("bc") ||
        roleName.includes("booth") ||
        roleName.includes("block coord")
      )
        entry.bc++;
      if (
        roleName.includes("pp") ||
        roleName.includes("panchayat") ||
        roleName.includes("polling")
      )
        entry.pp++;
      if (
        roleName.includes("ip") ||
        roleName.includes("it cell") ||
        roleName.includes("in charge")
      )
        entry.ip++;
      if (roleName.includes("fh")) entry.fh++;
      if (roleName.includes("smm") || roleName.includes("social media"))
        entry.smm++;
      if (roleName.includes("ms") || roleName.includes("mandal")) entry.ms++;
      if (roleName.includes("fp")) entry.fp++;
      if (roleName.includes("er")) entry.er++;
      if (roleName.includes("ak")) entry.ak++;
      if (roleName.includes("fm")) entry.fm++;
      if (roleName.includes("varist") || roleName.includes("sen"))
        entry.varist++;
      if (roleName.includes("yuva") || roleName.includes("youth")) entry.yuva++;
    });
    return Object.values(map);
  }, [rawData.users, rawData.roles, rawData.blocks, dateFilter]);

  const memberDistrictSummary = useMemo(() => {
    const map: Record<string, any> = {};
    const getRoleName = (userRole: any) => {
      if (!userRole) return "";
      if (typeof userRole === "string") {
        const r = rolesRaw.find((rv: any) => rv._id === userRole);
        return r ? r.name : "";
      }
      return userRole.name || "";
    };
    const isDateInRange = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      if (dateFilter.start && date < new Date(dateFilter.start)) return false;
      if (dateFilter.end && date > new Date(dateFilter.end)) return false;
      return true;
    };
    rawData.users.forEach((u: any) => {
      if (u.createdAt && !isDateInRange(u.createdAt)) return;
      let districtName = "Unassigned";
      if (u.district) {
        if (typeof u.district === "string") districtName = u.district;
        else districtName = u.district.name || "Unknown District";
      }
      if (!map[districtName]) {
        map[districtName] = {
          name: districtName,
          bc: 0,
          pp: 0,
          ip: 0,
          fh: 0,
          smm: 0,
          ms: 0,
          fp: 0,
          er: 0,
          ak: 0,
          fm: 0,
          varist: 0,
          yuva: 0,
        };
      }
      const roleName = getRoleName(u.role).toLowerCase();
      const entry = map[districtName];
      if (
        roleName.includes("bc") ||
        roleName.includes("booth") ||
        roleName.includes("block coord")
      )
        entry.bc++;
      if (
        roleName.includes("pp") ||
        roleName.includes("panchayat") ||
        roleName.includes("polling")
      )
        entry.pp++;
      if (
        roleName.includes("ip") ||
        roleName.includes("it cell") ||
        roleName.includes("in charge")
      )
        entry.ip++;
      if (roleName.includes("fh")) entry.fh++;
      if (roleName.includes("smm") || roleName.includes("social media"))
        entry.smm++;
      if (roleName.includes("ms") || roleName.includes("mandal")) entry.ms++;
      if (roleName.includes("fp")) entry.fp++;
      if (roleName.includes("er")) entry.er++;
      if (roleName.includes("ak")) entry.ak++;
      if (roleName.includes("fm")) entry.fm++;
      if (roleName.includes("varist") || roleName.includes("sen"))
        entry.varist++;
      if (roleName.includes("yuva") || roleName.includes("youth")) entry.yuva++;
    });
    return Object.values(map);
  }, [rawData.users, rawData.roles, dateFilter]);

  return {
    rawData,
    loadingCharts,
    dateFilter,
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
  };
};
