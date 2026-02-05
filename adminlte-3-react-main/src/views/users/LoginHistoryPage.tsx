"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Search, RotateCcw, History, Loader2, Calendar } from "lucide-react";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { ContentHeader } from "@app/components";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axios from "@app/utils/axios";
import { IActivityLogResponse } from "@app/types/activityLog";
import { Pagination } from "@app/components/common/Pagination";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

interface LoginHistoryPageProps {
  userId: string;
}

export const LoginHistoryPage = ({ userId }: LoginHistoryPageProps) => {
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    search: "",
  });
  const [tempFilters, setTempFilters] = useState({
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const { data: response, isLoading } = useQuery<IActivityLogResponse>({
    queryKey: [
      "user-activity",
      userId,
      pagination.page,
      pagination.limit,
      filters,
    ],
    queryFn: async () => {
      const { data } = await axios.get("/activity-logs", {
        params: {
          user: userId,
          page: pagination.page,
          limit: pagination.limit,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          search: filters.search || undefined,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const handleSearch = () => {
    setFilters(tempFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    const defaultFilters = { dateFrom: "", dateTo: "", search: "" };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const logs = response?.data || [];
  const totalCount = response?.total || 0;

  return (
    <>
      <section className="content">
        <div className="container-fluid px-4">
          <ContentHeader title="Login History" />
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Header with Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Activity Logs
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:flex-initial lg:w-48">
                    <Input
                      type="date"
                      placeholder="From Date"
                      className="pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                      value={tempFilters.dateFrom}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          dateFrom: e.target.value,
                        }))
                      }
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 lg:flex-initial lg:w-48">
                    <Input
                      type="date"
                      placeholder="To Date"
                      className="pr-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                      value={tempFilters.dateTo}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          dateTo: e.target.value,
                        }))
                      }
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 lg:flex-initial lg:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                      value={tempFilters.search}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-green-500/20 dark:shadow-[#368F8B]/30 border-0 transition-all"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
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
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                  entries
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                      Action
                    </TableHead>
                    <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                      Module
                    </TableHead>
                    <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                      IP Address
                    </TableHead>
                    <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                      Date & Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-[#368F8B]" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Loading activity logs...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-48 text-center text-gray-500 dark:text-gray-400"
                      >
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log, index) => (
                      <TableRow
                        key={log._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-200">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">
                          {log.module}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 max-w-md">
                          <div className="line-clamp-2">{log.description}</div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                          {log.ipAddress || "-"}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {format(
                            new Date(log.createdAt),
                            "MMM dd, yyyy HH:mm",
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {!isLoading && totalCount > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, totalCount)}{" "}
                    of {totalCount} entries
                  </p>
                  <div className="flex items-center gap-3">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={Math.ceil(totalCount / pagination.limit)}
                      onPageChange={(page) =>
                        setPagination((prev) => ({ ...prev, page }))
                      }
                      activeColor="bg-[#00563B]"
                    />
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
