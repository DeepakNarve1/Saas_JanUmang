"use client";

import { useMemo, useState } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
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
import { Loader2, Search, RotateCcw, Columns, Eye } from "lucide-react";
import { ContentHeader } from "@app/components";
import { IActivityLogResponse, IActivityLog } from "@app/types/activityLog";
import { IUserRow, IRole } from "@app/types/user";
import { useDebounce } from "@app/hooks/useDebounce";
import { handleError } from "@app/utils/errorHandler";

const ActivityLogs = () => {
  const router = useRouter();
  // State
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedModule, setSelectedModule] = useState("All Modules");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    dateTime: true,
    user: true,
    action: true,
    module: true,
    description: true,
    ipAddress: true,
    actions: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const STATIC_MODULES = [
    "Auth",
    "UserManagement",
    "Role",
    "Permission",
    "SidebarAccess",
    "Department",
    "Worktype",
    "Project",
    "Event",
    "Member",
    "Visitor",
    "Voter",
    "District",
    "Division",
    "State",
    "Parliament",
    "Assembly",
    "Block",
    "Panchayat",
    "Village",
    "Booth",
    "Samiti",
    "SamitiList",
    "VidhanSabha",
    "PublicProblem",
    "AssemblyIssue",
    "CallManagement",
    "DispatchRegister",
    "InwardRegister",
    "InDocs",
    "PhoneDirectory",
    "SubTypeOfWork",
    "Party",
  ];

  const actions = [
    "All Actions",
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "VIEW",
  ];

  const debouncedSearchTerm = useDebounce(search, 500);

  // 1. Fetch Users
  const { data: usersData } = useQuery<IUserRow[]>({
    queryKey: ["users-dropdown"],
    queryFn: async () => {
      try {
        const usersRes = await axios.get("/auth/users?limit=1000&showAll=true");
        return usersRes.data.data;
      } catch (error: unknown) {
        handleError(error, "Failed to fetch users for dropdown");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const users = usersData || [];

  // Extract roles from users
  const roles = useMemo(() => {
    const uniqueRolesMap = new Map<string, IRole>();
    users.forEach((u: IUserRow) => {
      const role = u.role as IRole | undefined;
      if (role && role._id) {
        if (!uniqueRolesMap.has(role._id)) {
          uniqueRolesMap.set(role._id, role);
        }
      }
    });
    return Array.from(uniqueRolesMap.values());
  }, [users]);

  // 2. Fetch Module Filters
  const { data: filterData } = useQuery({
    queryKey: ["activity-filters"],
    queryFn: async () => {
      try {
        const filtersRes = await axios.get("/activity-logs/filters");
        return filtersRes.data.data;
      } catch (error: unknown) {
        handleError(error, "Failed to fetch activity filters");
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const modules = useMemo(() => {
    const dbModules = filterData?.modules || [];
    const merged = Array.from(
      new Set([...STATIC_MODULES, ...dbModules]),
    ).sort();
    return ["All Modules", ...merged];
  }, [filterData]);

  // 3. Fetch Activity Logs
  const queryFilters = useMemo(() => {
    const f: Record<string, string | number | undefined> = {};
    if (debouncedSearchTerm) f.search = debouncedSearchTerm;
    if (selectedUser !== "All Users") f.user = selectedUser;
    if (selectedRole !== "All Roles") f.role = selectedRole;
    if (selectedModule !== "All Modules") f.module = selectedModule;
    if (selectedAction !== "All Actions") f.action = selectedAction;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    return f;
  }, [
    debouncedSearchTerm,
    selectedUser,
    selectedRole,
    selectedModule,
    selectedAction,
    dateFrom,
    dateTo,
  ]);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IActivityLogResponse>({
    queryKey: ["activityLogs", pagination.page, pagination.limit, queryFilters],
    queryFn: async () => {
      try {
        const res = await axios.get("/activity-logs", {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            ...queryFilters,
          },
        });
        return res.data;
      } catch (error: unknown) {
        handleError(error, "Failed to fetch activity logs");
        throw error;
      }
    },
    placeholderData: keepPreviousData,
  });

  const handleReset = () => {
    setSearch("");
    setSelectedUser("All Users");
    setSelectedRole("All Roles");
    setSelectedModule("All Modules");
    setSelectedAction("All Actions");
    setDateFrom("");
    setDateTo("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const data = response?.data || [];
  const totalPages = Math.ceil(
    (response?.filteredCount || response?.count || 0) / pagination.limit,
  );

  return (
    <>
      <ContentHeader title="User Activity Logs" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Header / Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedRole}
                  onValueChange={(v) => {
                    setSelectedRole(v);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Roles">All Roles</SelectItem>
                    {roles.map((r: IRole) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.displayName || r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedUser}
                  onValueChange={(v) => {
                    setSelectedUser(v);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Users">All Users</SelectItem>
                    {users.map((u: IUserRow) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedModule}
                  onValueChange={(v) => {
                    setSelectedModule(v);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Modules" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedAction}
                  onValueChange={(v) => {
                    setSelectedAction(v);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    Start Date:
                  </span>
                  <Input
                    type="date"
                    className="w-36 h-9 bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 text-sm"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    placeholder="From Date"
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    End Date:
                  </span>
                  <Input
                    type="date"
                    className="w-36 h-9 bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 text-sm"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    placeholder="To Date"
                    onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                    Show
                  </span>
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(v) =>
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(v),
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-20 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                      <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="1000">1000</SelectItem>
                      <SelectItem value="-1">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                    entries
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                  >
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {Object.keys(visibleColumns).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={
                        visibleColumns[key as keyof typeof visibleColumns]
                      }
                      onCheckedChange={() =>
                        toggleColumn(key as keyof typeof visibleColumns)
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

            <div className="overflow-x-auto">
              <Table className="border-collapse w-full border border-gray-200 dark:border-gray-800">
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="font-semibold w-[50px] text-white dark:text-white uppercase tracking-wider text-xs">
                        Sr No
                      </TableHead>
                    )}
                    {visibleColumns.dateTime && (
                      <TableHead className="font-semibold min-w-[150px] text-white dark:text-white uppercase tracking-wider text-xs">
                        Date & Time
                      </TableHead>
                    )}
                    {visibleColumns.user && (
                      <TableHead className="font-semibold min-w-[150px] text-white dark:text-white uppercase tracking-wider text-xs">
                        User
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="font-semibold text-center w-[100px] text-white dark:text-white uppercase tracking-wider text-xs">
                        Action
                      </TableHead>
                    )}
                    {visibleColumns.module && (
                      <TableHead className="font-semibold min-w-[150px] text-white dark:text-white uppercase tracking-wider text-xs">
                        Module
                      </TableHead>
                    )}
                    {visibleColumns.description && (
                      <TableHead className="font-semibold min-w-[150px] text-white dark:text-white uppercase tracking-wider text-xs">
                        Description
                      </TableHead>
                    )}
                    {visibleColumns.ipAddress && (
                      <TableHead className="font-semibold min-w-[120px] text-white dark:text-white uppercase tracking-wider text-xs">
                        IP Address
                      </TableHead>
                    )}
                    {visibleColumns.actions && (
                      <TableHead className="font-semibold text-right w-[100px] text-white dark:text-white uppercase tracking-wider text-xs">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="h-24 text-center text-gray-400"
                      >
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="h-24 text-center text-red-500 dark:text-red-400"
                      >
                        Failed to load activity logs.
                      </TableCell>
                    </TableRow>
                  ) : data && data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow
                        key={item._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="font-medium text-gray-500 dark:text-gray-400">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                        )}
                        {visibleColumns.dateTime && (
                          <TableCell className="text-gray-900 dark:text-gray-200 text-sm">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.user && (
                          <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                            <div className="flex flex-col">
                              <span>
                                {(() => {
                                  // 1. Try safe snapshot/direct fields
                                  const directName =
                                    item.userName ||
                                    item.snapshot?.userName ||
                                    item.user?.name;
                                  if (directName) return directName;

                                  // 2. Fallback: Parse from description if standard "User xxxx: Name" format
                                  const desc = item.description || "";
                                  const match = desc.match(/:\s+([^(]+)/);
                                  if (match && match[1]) {
                                    return match[1].trim();
                                  }

                                  return "Unknown User";
                                })()}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {item.user?.role?.displayName ||
                                  item.user?.role?.name ||
                                  item.snapshot?.roleName ||
                                  ""}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                             ${
                               item.action === "CREATE"
                                 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                 : item.action === "UPDATE"
                                   ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                   : item.action === "DELETE"
                                     ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                     : item.action === "LOGIN"
                                       ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                       : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                             }`}
                            >
                              {item.action || "-"}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.module && (
                          <TableCell className="text-gray-600 dark:text-gray-400 font-medium">
                            {item.module || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.description && (
                          <TableCell
                            className="text-gray-500 dark:text-gray-400 text-sm max-w-[300px] truncate"
                            title={item.description}
                          >
                            {item.description || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.ipAddress && (
                          <TableCell className="text-gray-500 dark:text-gray-400 font-mono text-xs">
                            {item.ipAddress || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.actions && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-[#368F8B] hover:text-[#2d7a76] hover:bg-[#368F8B]/10"
                              onClick={() =>
                                router.push(
                                  `/activity-management/activity-logs/${item._id}/view`,
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="h-24 text-center text-gray-500 dark:text-gray-400"
                      >
                        No logs found matching criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && data.length > 0 && response && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      response?.filteredCount || response?.count || 0,
                    )}{" "}
                    of {response?.filteredCount || response?.count || 0} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        handlePageChange(Math.max(1, pagination.page - 1))
                      }
                      className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= totalPages}
                      onClick={() =>
                        handlePageChange(
                          Math.min(totalPages, pagination.page + 1),
                        )
                      }
                      className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ActivityLogs;
