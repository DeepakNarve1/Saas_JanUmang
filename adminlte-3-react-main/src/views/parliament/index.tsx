"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { usePermissions } from "@app/hooks/usePermissions";
import { useDebounce } from "@app/hooks/useDebounce";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import { ConfirmDialog } from "@app/components/common/ConfirmDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Skeleton } from "@app/components/ui/skeleton";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Columns,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { Pagination } from "@app/components/common/Pagination";
import { IParliamentResponse } from "@app/types/parliament";
import { PERMISSIONS } from "@app/config/permissions";
const Parliament = () => {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    name: true,
    division: true,
    action: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IParliamentResponse>({
    queryKey: [
      "parliaments",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const res = await axios.get("/parliaments", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm,
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/parliaments/${id}`);
    },
    onSuccess: () => {
      toast.success("Parliament deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["parliaments"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete parliament");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const data = response?.data || [];

  return (
    <>
      <ContentHeader title="Parliament Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Actions Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search parliaments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  />
                </div>

                <div className="flex gap-2">
                  {isSuperAdmin() &&
                    hasPermission(PERMISSIONS.CREATE_PARLIAMENTS) && (
                      <Button
                        size="lg"
                        onClick={() => router.push("/parliaments/create")}
                        className="bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                      >
                        <Plus className="w-5 h-5 mr-2 font-bold" /> Add New
                        Parliament
                      </Button>
                    )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
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

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
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
                        .replace("srNo", "Sr. No.")
                        .replace("name", "Parliament Name")
                        .replace("division", "Division")
                        .replace("action", "Actions")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs w-24">
                        Sr. No.
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="text-left font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Parliament Name
                      </TableHead>
                    )}
                    {visibleColumns.division && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Division
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="text-right font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {visibleColumns.srNo && (
                          <TableCell>
                            <Skeleton className="h-12 w-16 dark:bg-gray-800" />
                          </TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell>
                            <Skeleton className="h-12 w-48 dark:bg-gray-800" />
                          </TableCell>
                        )}
                        {visibleColumns.division && (
                          <TableCell>
                            <Skeleton className="h-12 w-48 dark:bg-gray-800" />
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell>
                            <Skeleton className="h-10 w-10 ml-auto dark:bg-gray-800" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="h-24 text-center text-red-500"
                      >
                        Failed to load data.
                      </TableCell>
                    </TableRow>
                  ) : data && data.length > 0 ? (
                    data.map((parliament, index) => (
                      <TableRow
                        key={parliament._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="text-left">
                            <div className="flex items-center justify-start gap-4">
                              <div className=" w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-lg border border-blue-200 dark:border-blue-800">
                                {getInitials(parliament.name)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {parliament.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.division && (
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                              {typeof parliament.division === "object"
                                ? parliament.division?.name
                                : parliament.division || "N/A"}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {hasPermission(
                                  PERMISSIONS.VIEW_PARLIAMENTS,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/parliaments/${parliament._id}`,
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {isSuperAdmin() &&
                                  hasPermission(
                                    PERMISSIONS.EDIT_PARLIAMENTS,
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/parliaments/${parliament._id}/edit`,
                                        )
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                  )}
                                {isSuperAdmin() &&
                                  hasPermission(
                                    PERMISSIONS.DELETE_PARLIAMENTS,
                                  ) && (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() =>
                                        handleDelete(parliament._id)
                                      }
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No parliaments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && data && data.length > 0 && response && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  {pagination.limit !== -1 ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1}{" "}
                        to{" "}
                        {Math.min(
                          pagination.page * pagination.limit,
                          response.filteredCount || response.count || 0,
                        )}{" "}
                        of {response.filteredCount || response.count || 0}{" "}
                        parliaments
                      </p>
                      <div className="flex items-center gap-3">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={Math.ceil(
                            (response.filteredCount || response.count || 0) /
                              pagination.limit,
                          )}
                          onPageChange={(page) =>
                            setPagination((prev) => ({ ...prev, page }))
                          }
                          activeColor="bg-[#368F8B]"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing all {data.length} parliaments
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Parliament;
