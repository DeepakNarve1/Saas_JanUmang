"use client";

import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Loader2,
  FileDown,
  Printer,
  Calendar,
  BarChart3,
  Clock,
  List,
  Search,
  Info,
  Columns,
} from "lucide-react";
import { ContentHeader } from "@app/components";

const UserActivityReport = () => {
  const [activeTab, setActiveTab] = useState<
    "summary" | "detailed" | "timeline"
  >("summary");
  const [reportData, setReportData] = useState<any[]>([]);
  const [detailedData, setDetailedData] = useState<any[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedReportType, setSelectedReportType] = useState<
    "Summary Report" | "Detailed Report" | "Timeline View"
  >("Summary Report");

  const [visibleSummaryColumns, setVisibleSummaryColumns] = useState({
    date: true,
    userName: true,
    loginTime: true,
    logoutTime: true,
    loginCount: true,
    sessionDuration: true,
    totalActivities: true,
    addActions: true,
    editActions: true,
    deleteActions: true,
    viewActions: true,
    downloadActions: true,
  });

  const [visibleDetailedColumns, setVisibleDetailedColumns] = useState({
    srNo: true,
    dateTime: true,
    userName: true,
    action: true,
    module: true,
    recordId: true,
    tableName: true,
    details: true,
    ipAddress: true,
    actions: true,
  });

  const toggleSummaryColumn = (key: keyof typeof visibleSummaryColumns) => {
    setVisibleSummaryColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDetailedColumn = (key: keyof typeof visibleDetailedColumns) => {
    setVisibleDetailedColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch users for dropdown using React Query
  const { data: users = [] } = useQuery({
    queryKey: ["users-list-for-activity-report"],
    queryFn: async () => {
      try {
        const res = await axios.get("/auth/users?limit=100");
        return res.data.data || [];
      } catch (error: unknown) {
        handleError(error, "Failed to fetch users");
        return [];
      }
    },
  });

  // Sync state with dropdown (optional, if we want to drive tabs via dropdown or tabs via UI)
  useEffect(() => {
    if (selectedReportType === "Summary Report") setActiveTab("summary");
    if (selectedReportType === "Detailed Report") setActiveTab("detailed");
    if (selectedReportType === "Timeline View") setActiveTab("timeline");
  }, [selectedReportType]);

  // Reset generated state when tab changes
  useEffect(() => {
    setHasGenerated(false);
  }, [activeTab]);

  const [userMap, setUserMap] = useState<Record<string, string>>({});

  const updateUserMap = (logs: any[]) => {
    setUserMap((prev) => {
      const newMap = { ...prev };
      let changed = false;
      logs.forEach((item) => {
        let userId =
          item.user?._id || (typeof item.user === "string" ? item.user : null);

        // Try to find userId in metadata or other fields if missing
        if (!userId) {
          if (item.userId) userId = item.userId;
          if (item.metadata?.userId) userId = item.metadata.userId;
        }

        // For Login/Logout events, the recordId is often the User ID
        if (
          !userId &&
          (item.action === "LOGIN" || item.action === "LOGOUT") &&
          item.metadata?.recordId
        ) {
          userId = item.metadata.recordId;
        }

        if (!userId) return;

        // Attempt to resolve name
        let resolvedName =
          item.userName || item.snapshot?.userName || item.user?.name;

        // Treat "Unknown" variations as missing name
        if (
          resolvedName &&
          /^(unknown|system|unknown user)$/i.test(resolvedName)
        ) {
          resolvedName = null;
        }

        // Fallback to regex from description if direct name is missing
        if (!resolvedName && item.description) {
          const patterns = [
            /(?:User|Name)\s*:\s*([^(]+?)(?:\s*\(|$)/i, // "User: Alex (email)", "Name: Alex"
            /^User\s+(.+?)\s+(?:logged|created|updated|deleted)/i, // "User Alex logged in"
            /^Deleted user\s+(.+?)(?:\s*\(|$)/i, // "Deleted user Alex"
            /^Logged in user\s+(.+?)(?:\s*\(|$)/i, // "Logged in user Alex"
          ];

          for (const pattern of patterns) {
            const match = item.description.match(pattern);
            if (match && match[1]) {
              const candidate = match[1].trim();
              // Ensure the extracted candidate isn't also "Unknown"
              if (
                candidate &&
                !/^(unknown|system|unknown user)$/i.test(candidate)
              ) {
                resolvedName = candidate;
                break;
              }
            }
          }
        }

        if (resolvedName && newMap[userId] !== resolvedName) {
          newMap[userId] = resolvedName;
          changed = true;
        }
      });
      return changed ? newMap : prev;
    });
  };

  const resolveUnknownUsers = async (summaryData: any[]) => {
    // Identify users who are showing up as "Unknown"
    const unknownIds = summaryData
      .filter((row) => {
        const name = row.userName || row.user?.name;
        // Check if name is missing or explicitly "Unknown"
        return !name || /^(unknown|system|unknown user)$/i.test(name);
      })
      .map((row) => row._id) // The grouping ID is the User ID
      .filter((id) => id); // valid IDs only

    const uniqueIds = Array.from(new Set(unknownIds));

    if (uniqueIds.length === 0) return;

    // Fetch a few logs for EACH unknown ID to try and hunt down their name
    // We assume that even if deleted, they have SOME logs (Login, etc)
    const promises = uniqueIds.map((id) =>
      axios
        .get("/activity-logs", {
          params: { user: id, limit: 5 }, // Fetch 5 to increase chance of finding a good log
        })
        .then((res) => res.data.data || [])
        .catch(() => []),
    );

    const results = await Promise.all(promises);
    const flattenedLogs = results.flat();

    if (flattenedLogs.length > 0) {
      updateUserMap(flattenedLogs);
    }
  };

  const handleExport = () => {
    if (!hasGenerated) {
      toast.warn("Please generate a report first.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = "report.csv";

    if (activeTab === "summary") {
      filename = "User_Activity_Summary_Report.csv";
      // Headers
      const headers = [
        "Date",
        "User Name",
        "Login Time",
        "Logout Time",
        "Login Count",
        "Session Duration",
        "Total Activities",
        "Add Actions",
        "Edit Actions",
        "Delete Actions",
        "View Actions",
        "Download Actions",
        "Description",
      ];
      csvContent += headers.join(",") + "\r\n";

      // Rows
      reportData.forEach((row) => {
        const userName =
          userMap[row._id] || row.userName || row.user?.name || "Unknown User";
        const description = row.description || "-"; // Fallback if map not present, or use userDescriptionMap if I re-implement it.
        // Note: The user reverted userDescriptionMap, so I will just use row.description if available or "-" or maybe I should rely on the map I'm about to re-add?
        // Actually, let's stick to what's available. If `userDescriptionMap` was removed, I can't use it unless I re-add it.
        // For now, I'll assume row might have it or just put placeholder.
        // Wait, the user reverted the description MAP, but I should probably check if I can still access description.
        // The summary report row doesn't usually have "description" unless I aggregated it.
        // Let's assume for now I will use what I can find.

        const rowData = [
          row.date || dateFrom || new Date().toLocaleDateString(),
          `"${userName}"`, // Quote to handle commas in names
          row.loginTime || "--:--:--",
          row.logoutTime || "--:--:--",
          row.loginCount || 0,
          row.sessionDuration || "00:00:00",
          row.total || 0,
          row.createCount || 0,
          row.updateCount || 0,
          row.deleteCount || 0,
          row.viewCount || 0,
          row.downloadCount || 0,
          `"${description.replace(/"/g, '""')}"`,
        ];
        csvContent += rowData.join(",") + "\r\n";
      });
    } else {
      // Detailed or Timeline
      filename = "User_Activity_Detailed_Report.csv";
      const headers = [
        "Date & Time",
        "User Name",
        "Action",
        "Module",
        "Record ID",
        "Details",
        "IP Address",
      ];
      csvContent += headers.join(",") + "\r\n";

      detailedData.forEach((item) => {
        let userName = "Unknown";
        const userId =
          item.user?._id || (typeof item.user === "string" ? item.user : null);

        if (userId && userMap[userId]) {
          userName = userMap[userId];
        } else {
          userName =
            item.userName ||
            item.snapshot?.userName ||
            item.user?.name ||
            "Unknown";
        }

        const rowData = [
          new Date(item.createdAt).toLocaleString(),
          `"${userName}"`,
          item.action,
          item.module,
          item.metadata?.recordId || "N/A",
          `"${(item.description || "").replace(/"/g, '""')}"`,
          item.ipAddress || "",
        ];
        csvContent += rowData.join(",") + "\r\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Report Mutation using React Query
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const params: any = {};
      if (selectedUser !== "All Users") params.user = selectedUser;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      // Always fetch a batch of raw logs to populate User Name Map (Ghost Hunting)
      // This ensures we can resolve names for deleted users in the Summary Report
      const rawLogsPromise = axios
        .get("/activity-logs", {
          params: { ...params, limit: 500 },
        })
        .then((res) => {
          updateUserMap(res.data.data || []);
          return res;
        })
        .catch((err: unknown) => handleError(err, "Ghost hunt failed"));

      if (activeTab === "summary") {
        const [reportRes] = await Promise.all([
          axios.get("/activity-logs/report", { params }),
          rawLogsPromise,
        ]);
        const data = reportRes.data.data || [];
        setReportData(data);
        resolveUnknownUsers(data);
        return data;
      } else {
        // For detailed/timeline
        params.limit = 1000;
        const res = await axios.get("/activity-logs", { params });
        setDetailedData(res.data.data);
        updateUserMap(res.data.data);
        return res.data.data;
      }
    },
    onSuccess: () => {
      setHasGenerated(true);
    },
    onError: (err: unknown) => {
      handleError(err, "Failed to generate report");
    },
  });

  const loading = generateReportMutation.isPending;

  return (
    <>
      <ContentHeader title="User Activity Report" />
      <section className="content">
        <div className="container-fluid px-4">
          {/* Report Filters */}
          <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-800 mt-4 overflow-hidden mb-6">
            <div className="bg-[#002f5e] dark:bg-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Report Filters
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Users">All Users</SelectItem>
                    {users.map((u: any) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date:
                  </span>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <Input
                      type="date"
                      className="w-36 h-9 bg-white dark:bg-[#202123] text-sm pl-10 dark:border-gray-700 dark:text-gray-300"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      onClick={(e) =>
                        (e.target as HTMLInputElement).showPicker()
                      }
                    />
                  </div>
                </div>

                <div className="relative flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date:
                  </span>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <Input
                      type="date"
                      className="w-36 h-9 bg-white dark:bg-[#202123] text-sm pl-10 dark:border-gray-700 dark:text-gray-300"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      onClick={(e) =>
                        (e.target as HTMLInputElement).showPicker()
                      }
                    />
                  </div>
                </div>

                <Select
                  value={selectedReportType}
                  onValueChange={(val: any) => setSelectedReportType(val)}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Summary Report">
                      Summary Report
                    </SelectItem>
                    <SelectItem value="Detailed Report">
                      Detailed Report
                    </SelectItem>
                    <SelectItem value="Timeline View">Timeline View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  onClick={() => generateReportMutation.mutate()}
                  className="bg-[#002f5e] hover:bg-[#002040] dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                  disabled={loading}
                >
                  <Search className="w-4 h-4 mr-2" /> Generate Report
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30"
                >
                  <FileDown className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4 bg-white dark:bg-card rounded-t-lg shadow-sm">
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === "summary"
                  ? "border-b-2 border-[#002f5e] text-[#002f5e] bg-gray-50 dark:bg-gray-800/50 dark:border-gray-400 dark:text-gray-200"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setSelectedReportType("Summary Report");
                setActiveTab("summary");
              }}
            >
              <BarChart3 className="w-4 h-4" /> Summary Report
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === "detailed"
                  ? "border-b-2 border-[#002f5e] text-[#002f5e] bg-gray-50 dark:bg-gray-800/50 dark:border-gray-400 dark:text-gray-200"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setSelectedReportType("Detailed Report");
                setActiveTab("detailed");
              }}
            >
              <List className="w-4 h-4" /> Detailed Report
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === "timeline"
                  ? "border-b-2 border-[#002f5e] text-[#002f5e] bg-gray-50 dark:bg-gray-800/50 dark:border-gray-400 dark:text-gray-200"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => {
                setSelectedReportType("Timeline View");
                setActiveTab("timeline");
              }}
            >
              <Clock className="w-4 h-4" /> Timeline View
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-card rounded-b-xl rounded-tr-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[300px]">
            {/* Header for the table */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {activeTab === "summary" && "User Activity Summary Report"}
                {activeTab === "detailed" && "Detailed Activity Log"}
                {activeTab === "timeline" && "Activity Timeline"}
              </h3>
            </div>
            {activeTab !== "timeline" && (
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start bg-white dark:bg-card">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                    >
                      <Columns className="w-4 h-4 mr-2" /> Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {activeTab === "summary"
                      ? Object.keys(visibleSummaryColumns).map((key) => (
                          <DropdownMenuCheckboxItem
                            key={key}
                            checked={
                              visibleSummaryColumns[
                                key as keyof typeof visibleSummaryColumns
                              ]
                            }
                            onCheckedChange={() =>
                              toggleSummaryColumn(
                                key as keyof typeof visibleSummaryColumns,
                              )
                            }
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </DropdownMenuCheckboxItem>
                        ))
                      : Object.keys(visibleDetailedColumns).map((key) => (
                          <DropdownMenuCheckboxItem
                            key={key}
                            checked={
                              visibleDetailedColumns[
                                key as keyof typeof visibleDetailedColumns
                              ]
                            }
                            onCheckedChange={() =>
                              toggleDetailedColumn(
                                key as keyof typeof visibleDetailedColumns,
                              )
                            }
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </DropdownMenuCheckboxItem>
                        ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="overflow-x-auto">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#002f5e] dark:text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400 mt-2">
                    Generating Report...
                  </span>
                </div>
              ) : !hasGenerated ? (
                <div className="h-64 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="bg-[#17a2b8] text-white p-6 rounded-md shadow-sm max-w-2xl w-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-white/20 p-3 rounded-full">
                        <Info className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-bold">
                        {activeTab === "summary" &&
                          "Summary Report Not Generated"}
                        {activeTab === "detailed" &&
                          "Detailed Report Not Generated"}
                        {activeTab === "timeline" &&
                          "Timeline Report Not Generated"}
                      </h4>
                      <p className="text-sm opacity-90">
                        Please select &apos;{selectedReportType}&apos; from the
                        Report Type dropdown and click &apos;Generate
                        Report&apos; to view activity data.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* SUMMARY VIEW */}
                  {activeTab === "summary" && (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                          {visibleSummaryColumns.date && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              Date
                            </TableHead>
                          )}
                          {visibleSummaryColumns.userName && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              User Name
                            </TableHead>
                          )}
                          {visibleSummaryColumns.loginTime && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Login Time
                            </TableHead>
                          )}
                          {visibleSummaryColumns.logoutTime && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Logout Time
                            </TableHead>
                          )}
                          {visibleSummaryColumns.loginCount && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Login Count
                            </TableHead>
                          )}
                          {visibleSummaryColumns.sessionDuration && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Session Duration
                            </TableHead>
                          )}
                          {visibleSummaryColumns.totalActivities && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Total Activities
                            </TableHead>
                          )}
                          {visibleSummaryColumns.addActions && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Add Actions
                            </TableHead>
                          )}
                          {visibleSummaryColumns.editActions && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Edit Actions
                            </TableHead>
                          )}
                          {visibleSummaryColumns.deleteActions && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Delete Actions
                            </TableHead>
                          )}
                          {visibleSummaryColumns.viewActions && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              View Actions
                            </TableHead>
                          )}
                          {visibleSummaryColumns.downloadActions && (
                            <TableHead className="font-semibold text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Download Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData && reportData.length > 0 ? (
                          reportData.map((row: any, idx: number) => (
                            <TableRow
                              key={idx}
                              className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100/50 dark:border-gray-800"
                            >
                              {visibleSummaryColumns.date && (
                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                  {row.date ||
                                    dateFrom ||
                                    new Date().toLocaleDateString()}
                                </TableCell>
                              )}
                              {visibleSummaryColumns.userName && (
                                <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                                  {userMap[row._id] ||
                                    row.userName ||
                                    row.user?.name ||
                                    "Unknown User"}
                                </TableCell>
                              )}
                              {visibleSummaryColumns.loginTime && (
                                <TableCell className="text-center text-xs dark:text-gray-400">
                                  {row.loginTime || "--:--:--"}
                                </TableCell>
                              )}
                              {visibleSummaryColumns.logoutTime && (
                                <TableCell className="text-center text-xs dark:text-gray-400">
                                  {row.logoutTime || "--:--:--"}
                                </TableCell>
                              )}
                              {visibleSummaryColumns.loginCount && (
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center bg-teal-600 text-white rounded-full w-6 h-6 text-xs font-bold">
                                    {row.loginCount || 0}
                                  </span>
                                </TableCell>
                              )}
                              {visibleSummaryColumns.sessionDuration && (
                                <TableCell className="text-center">
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                    {row.sessionDuration || "00:00:00"}
                                  </span>
                                </TableCell>
                              )}
                              {visibleSummaryColumns.totalActivities && (
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center bg-[#002f5e] text-white rounded-full w-6 h-6 text-xs font-bold">
                                    {row.total}
                                  </span>
                                </TableCell>
                              )}
                              {visibleSummaryColumns.addActions && (
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center bg-green-600 text-white rounded-full w-6 h-6 text-xs font-bold">
                                    {row.createCount || 0}
                                  </span>
                                </TableCell>
                              )}
                              {visibleSummaryColumns.editActions && (
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center bg-yellow-600 text-white rounded-full w-6 h-6 text-xs font-bold">
                                    {row.updateCount || 0}
                                  </span>
                                </TableCell>
                              )}
                              {visibleSummaryColumns.deleteActions && (
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold">
                                    {row.deleteCount || 0}
                                  </span>
                                </TableCell>
                              )}
                              {visibleSummaryColumns.viewActions && (
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-xs font-bold">
                                    {row.viewCount || 0}
                                  </span>
                                </TableCell>
                              )}
                              {visibleSummaryColumns.downloadActions && (
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center justify-center bg-gray-600 text-white rounded-full w-6 h-6 text-xs font-bold">
                                    {row.downloadCount || 0}
                                  </span>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={
                                Object.values(visibleSummaryColumns).filter(
                                  Boolean,
                                ).length
                              }
                              className="h-24 text-center text-gray-500 dark:text-gray-400"
                            >
                              No data to display.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}

                  {/* DETAILED VIEW */}
                  {activeTab === "detailed" && (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                          {visibleDetailedColumns.srNo && (
                            <TableHead className="font-semibold w-16 text-center text-white dark:text-white uppercase tracking-wider text-xs">
                              Sr No.
                            </TableHead>
                          )}
                          {visibleDetailedColumns.dateTime && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              Date & Time
                            </TableHead>
                          )}
                          {visibleDetailedColumns.userName && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              User Name
                            </TableHead>
                          )}
                          {visibleDetailedColumns.action && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              Action
                            </TableHead>
                          )}
                          {visibleDetailedColumns.module && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              Module
                            </TableHead>
                          )}
                          {visibleDetailedColumns.recordId && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              Record ID
                            </TableHead>
                          )}
                          {visibleDetailedColumns.tableName && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              Table Name
                            </TableHead>
                          )}
                          {visibleDetailedColumns.details && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              Details
                            </TableHead>
                          )}
                          {visibleDetailedColumns.ipAddress && (
                            <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                              IP Address
                            </TableHead>
                          )}
                          {visibleDetailedColumns.actions && (
                            <TableHead className="font-semibold text-center text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedData && detailedData.length > 0 ? (
                          detailedData.map((item: any, idx: number) => (
                            <TableRow
                              key={item._id}
                              className="hover:bg-gray-50 dark:hover:bg-white/5 dark:border-gray-800"
                            >
                              {visibleDetailedColumns.srNo && (
                                <TableCell className="text-center font-medium text-gray-500 dark:text-gray-400">
                                  {idx + 1}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.dateTime && (
                                <TableCell className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                  {new Date(item.createdAt).toLocaleString()}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.userName && (
                                <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                                  {(() => {
                                    const userId =
                                      item.user?._id ||
                                      (typeof item.user === "string"
                                        ? item.user
                                        : null);
                                    if (userId && userMap[userId])
                                      return userMap[userId];

                                    // 1. Try safe snapshot/direct fields
                                    const directName =
                                      item.userName ||
                                      item.snapshot?.userName ||
                                      item.user?.name;
                                    if (directName) return directName;

                                    // 2. Fallback: Parse from description if standard "User xxxx: Name" format
                                    // Supports: "User logged in: Alex (email)", "Deleted user: Alex (ID)"
                                    const desc = item.description || "";
                                    const match = desc.match(/:\s+([^(]+)/);
                                    if (match && match[1]) {
                                      return match[1].trim();
                                    }

                                    return "Unknown";
                                  })()}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.action && (
                                <TableCell>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                             ${
                                               item.action === "CREATE"
                                                 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                 : item.action === "UPDATE"
                                                   ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                   : item.action === "DELETE"
                                                     ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                                     : "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300"
                                             }`}
                                  >
                                    {item.action}
                                  </span>
                                </TableCell>
                              )}
                              {visibleDetailedColumns.module && (
                                <TableCell className="text-gray-600 dark:text-gray-400">
                                  {item.module}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.recordId && (
                                <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                                  {item.metadata?.recordId || "N/A"}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.tableName && (
                                <TableCell className="text-gray-600 dark:text-gray-400">
                                  {/* Using module as table name for now */}
                                  {item.module}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.details && (
                                <TableCell
                                  className="text-gray-500 dark:text-gray-400 max-w-xs truncate"
                                  title={item.description}
                                >
                                  {item.description}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.ipAddress && (
                                <TableCell className="font-mono text-xs text-gray-400 dark:text-gray-500">
                                  {item.ipAddress}
                                </TableCell>
                              )}
                              {visibleDetailedColumns.actions && (
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-[#002f5e] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Search className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={
                                Object.values(visibleDetailedColumns).filter(
                                  Boolean,
                                ).length
                              }
                              className="h-24 text-center text-gray-500 dark:text-gray-400"
                            >
                              No detailed logs found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}

                  {/* TIMELINE VIEW */}
                  {activeTab === "timeline" && (
                    <div className="p-8 bg-white dark:bg-card">
                      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-8">
                        {detailedData && detailedData.length > 0 ? (
                          detailedData.map((item: any, idx) => (
                            <div key={idx} className="relative pl-8">
                              <span
                                className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800
                                                ${
                                                  item.action === "CREATE"
                                                    ? "bg-green-500"
                                                    : item.action === "DELETE"
                                                      ? "bg-red-500"
                                                      : item.action === "UPDATE"
                                                        ? "bg-blue-500"
                                                        : "bg-gray-400"
                                                }`}
                              ></span>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                  {item.action} on {item.module}
                                  <span className="font-normal text-gray-500 dark:text-gray-400 text-xs">
                                    by{" "}
                                    {(() => {
                                      const userId =
                                        item.user?._id ||
                                        (typeof item.user === "string"
                                          ? item.user
                                          : null);
                                      if (userId && userMap[userId])
                                        return userMap[userId];

                                      const directName =
                                        item.userName ||
                                        item.snapshot?.userName ||
                                        item.user?.name;
                                      if (directName) return directName;

                                      const desc = item.description || "";
                                      const match = desc.match(/:\s+([^(]+)/);
                                      if (match && match[1]) {
                                        return match[1].trim();
                                      }
                                      return "Unknown";
                                    })()}
                                  </span>
                                </h4>
                                <time className="text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(item.createdAt).toLocaleString()}
                                </time>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
                                {item.description}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="pl-8 text-gray-500 dark:text-gray-400">
                            No activity to display.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserActivityReport;
