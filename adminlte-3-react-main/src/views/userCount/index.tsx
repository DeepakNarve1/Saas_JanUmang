"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation"; // Added
import { usePermissions } from "@app/hooks/usePermissions"; // Added
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import { Columns, Download } from "lucide-react";
import { Skeleton } from "@app/components/ui/skeleton";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { IUserRow, IRole } from "@app/types/user";
import { PERMISSIONS } from "@app/config/permissions";

interface IUserCountRow {
  _id: string;
  name: string;
  count: number;
}

const UserCount = () => {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  // State for filtering/pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    count: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Fetch Users
  const { data: usersRaw = [], isLoading: usersLoading } = useQuery<IUserRow[]>(
    {
      queryKey: ["users-list-all"],
      queryFn: async () => {
        const res = await axios.get("/auth/users?limit=-1");
        return res.data?.data || [];
      },
      enabled: hasPermission(PERMISSIONS.VIEW_USER_COUNT),
    },
  );

  // 2. Fetch Roles
  const { data: rolesRaw = [], isLoading: rolesLoading } = useQuery<IRole[]>({
    queryKey: ["roles-list-all"],
    queryFn: async () => {
      const res = await axios.get("/rbac/roles?limit=-1");
      return res.data?.data || [];
    },
    enabled: hasPermission(PERMISSIONS.VIEW_USER_COUNT),
  });

  const loading = usersLoading || rolesLoading;

  // Process Data
  const users = useMemo<IUserCountRow[]>(() => {
    if (loading) return [];

    // Calculate counts per role
    const counts: Record<string, number> = {};
    usersRaw.forEach((user: IUserRow) => {
      const role = user.role;
      const roleId =
        typeof role === "object" && role !== null ? (role as IRole)._id : role;
      if (roleId) {
        counts[roleId as string] = (counts[roleId as string] || 0) + 1;
      }
    });

    // Transform data
    return rolesRaw.map((role: IRole) => ({
      _id: role._id,
      name: role.displayName || role.name,
      count: counts[role._id] || 0,
    }));
  }, [usersRaw, rolesRaw, loading]);

  const totalUserCount = usersRaw.length;

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_USER_COUNT)) {
      router.push("/");
    }
  }, [hasPermission, router]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    let result = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((u: IUserCountRow) =>
        u.name.toLowerCase().includes(term),
      );
    }

    // Reset page when filter changes (handled by useEffect or just let it be)
    return result;
  }, [users, searchTerm]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination Logic
  const paginatedUsers = useMemo(() => {
    if (entriesPerPage === -1) return filteredUsers;
    const start = (currentPage - 1) * entriesPerPage;
    return filteredUsers.slice(start, start + entriesPerPage);
  }, [filteredUsers, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(
    filteredUsers.length /
      (entriesPerPage === -1 ? filteredUsers.length || 1 : entriesPerPage),
  );

  const handleExport = async () => {
    if (filteredUsers.length === 0) {
      return toast.warning("No data to export");
    }

    try {
      const XLSX = await import("xlsx");
      const dataToExport = filteredUsers.map((u: IUserCountRow) => ({
        Name: u.name,
        "Total Count": u.count,
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "UserCounts");
      XLSX.writeFile(wb, `User_Counts_${Date.now()}.xlsx`);
      toast.success("Exported successfully");
    } catch (error) {
      console.error("XLSX import failed:", error);
      toast.error("Export failed. Please try again later.");
    }
  };

  if (!hasPermission(PERMISSIONS.VIEW_USER_COUNT)) {
    return null;
  }

  return (
    <>
      <div className="content-wrapper">
        <ContentHeader title="Survey Management" />{" "}
        {/* Corrected spelling from 'Servey' */}
        <section className="content">
          <div className="container-fluid">
            {/* Filter Section */}
            <div className="card shadow-none border border-gray-200 dark:border-gray-800 rounded-lg mb-4 bg-white dark:bg-card">
              <div className="card-header bg-transparent borderwhiteer-gray-100 dark:border-gray-800 p-4">
                <h3 className="card-title text-lg font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <i className="fas fa-users text-gray-500 dark:text-gray-400"></i>{" "}
                  Survey Management
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-64">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-10 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                      onClick={(e) =>
                        (e.target as HTMLInputElement).showPicker()
                      }
                    />
                  </div>
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white px-6 h-10 rounded-lg shadow-lg shadow-[#368F8B]/20"
                    onClick={() => {
                      // Trigger filter or refresh if needed
                    }}
                  >
                    Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="card shadow-lg border-0 rounded-lg bg-white dark:bg-card">
              <div className="card-header bg-white dark:bg-card border-b border-gray-200 dark:border-gray-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  Role Distribution
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                  Total Users: {totalUserCount}
                </div>
              </div>

              <div className="p-0">
                {/* Controls: Entries, Export, Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                        Show
                      </span>
                      <Select
                        value={entriesPerPage.toString()}
                        onValueChange={(v) => {
                          setEntriesPerPage(v === "-1" ? -1 : Number(v));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-20 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                          <SelectValue placeholder="Limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="-1">All</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                        entries
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleExport}
                      className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                    >
                      <Download className="w-5 h-5 mr-2 text-blue-500" /> Export
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Search:
                    </span>
                    <Input
                      placeholder=""
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-9 w-full md:w-64 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                    />
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
                            .trim()
                            .replace("name", "Name")
                            .replace("count", "Total Count")}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="p-4">
                  {/* Table */}
                  <div className="overflow-x-auto rounded-t-lg border border-gray-200 dark:border-gray-800">
                    <Table>
                      <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                        <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-800">
                          {visibleColumns.name && (
                            <TableHead className="text-white font-semibold uppercase tracking-wider text-xs border-gray-200 dark:text-white text-center w-1/2">
                              Role Name
                            </TableHead>
                          )}
                          {visibleColumns.count && (
                            <TableHead className="text-white font-semibold uppercase tracking-wider text-xs text-center w-1/2">
                              Total Count
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              {visibleColumns.name && (
                                <TableCell className="border-gray-100">
                                  <Skeleton className="h-6 w-3/4 mx-auto" />
                                </TableCell>
                              )}
                              {visibleColumns.count && (
                                <TableCell>
                                  <Skeleton className="h-6 w-12 mx-auto" />
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : paginatedUsers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={
                                Object.values(visibleColumns).filter(Boolean)
                                  .length
                              }
                              className="text-center py-8 text-gray-500 dark:text-gray-400"
                            >
                              No data available in table
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedUsers.map((user, idx) => (
                            <TableRow
                              key={user._id}
                              className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                            >
                              {visibleColumns.name && (
                                <TableCell className="text-center border-gray-100 dark:border-gray-700 py-3 text-gray dark:text-gray-300 font-medium">
                                  {user.name}
                                </TableCell>
                              )}
                              {visibleColumns.count && (
                                <TableCell className="text-center py-3 text-gray-700 dark:text-gray-300">
                                  {user.count}
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing{" "}
                      {filteredUsers.length === 0
                        ? 0
                        : (currentPage - 1) * entriesPerPage + 1}{" "}
                      to{" "}
                      {entriesPerPage === -1
                        ? filteredUsers.length
                        : Math.min(
                            currentPage * entriesPerPage,
                            filteredUsers.length,
                          )}{" "}
                      of {filteredUsers.length} entries
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="h-8 px-3"
                      >
                        Previous
                      </Button>
                      <span className="h-8 w-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm font-semibold dark:text-gray-300">
                        {currentPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="h-8 px-3"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default UserCount;
