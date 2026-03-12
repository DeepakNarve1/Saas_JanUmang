"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Download,
  MoreVertical,
  Eye,
  Columns,
} from "lucide-react";
import { Input } from "@app/components/ui/input";
import { usePermissions } from "@app/hooks/usePermissions";
import { Pagination } from "@app/components/common/Pagination";
import { IVidhanSabhaResponse, IVidhanSabha } from "@app/types/vidhanSabha";
import { useListManagement } from "@app/hooks/useListManagement";
import { PERMISSIONS } from "@app/config/permissions";

interface IVidhanSabhaColumns {
  id: boolean;
  name: boolean;
  year: boolean;
  createdBy: boolean;
  addedBy: boolean;
  createdAt: boolean;
  updatedAt: boolean;
  action: boolean;
}

const VidhanSabhaList = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const {
    pagination,
    setPagination,
    searchTerm,
    setSearchTerm,
    visibleColumns,
    toggleColumn,
    response,
    isLoading,
    isError,
    handleDelete,
    handleExport,
  } = useListManagement<
    IVidhanSabha,
    IVidhanSabhaResponse,
    IVidhanSabhaColumns
  >({
    queryKey: "vidhan-sabha",
    endpoint: "/vidhan-sabha",
    initialVisibleColumns: {
      id: true,
      name: true,
      year: true,
      createdBy: true,
      addedBy: true,
      createdAt: true,
      updatedAt: true,
      action: true,
    },
    exportConfig: {
      filename: "vidhanSabha_list",
      sheetName: "VidhanSabha List",
      mapRow: (item) => ({
        Name: item.name,
        Year: item.year || "-",
        "Created At": item.createdAt
          ? new Date(item.createdAt).toLocaleString()
          : "-",
      }),
    },
  });

  const data = response?.data || [];
  const totalItems = response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title="VidhanSabha List" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Search VidhanSabha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                {hasPermission(PERMISSIONS.VIEW_ASSEMBLIES) && (
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="bg-white dark:bg-[#202123] text-[#2e7875] dark:text-[#368F8B] border-[#2e7875] dark:border-[#368F8B] hover:bg-[#2e7875] hover:text-white dark:hover:bg-[#368F8B] dark:hover:text-white transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 mr-2 text-blue-500" /> Export
                  </Button>
                )}
                {hasPermission(PERMISSIONS.CREATE_ASSEMBLIES) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                    onClick={() => router.push("/vidhansabha/create")}
                  >
                    <Plus className="w-4 h-4 mr-2 font-bold" /> Add VidhanSabha
                  </Button>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                  Show
                </span>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={(v) =>
                    setPagination({ page: 1, limit: Number(v) })
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
                    <SelectItem value="-1">All</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                  entries
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
                  >
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {(
                    Object.keys(visibleColumns) as (keyof IVidhanSabhaColumns)[]
                  ).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={visibleColumns[key]}
                      onCheckedChange={() => toggleColumn(key)}
                    >
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/([A-Z])/g, " $1")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.id && (
                      <TableHead className="w-[100px] text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        ID
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        Vidhan Sabha Name
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.createdBy && (
                      <TableHead className="text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        Created By
                      </TableHead>
                    )}
                    {visibleColumns.addedBy && (
                      <TableHead className="text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        Added By
                      </TableHead>
                    )}
                    {visibleColumns.createdAt && (
                      <TableHead className="text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        Created Time
                      </TableHead>
                    )}
                    {visibleColumns.updatedAt && (
                      <TableHead className="text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        Updated Time
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="text-right text-white dark:text-white font-semibold uppercase tracking-wider text-xs">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="h-24 text-center text-red-500"
                      >
                        Failed to load data.
                      </TableCell>
                    </TableRow>
                  ) : data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow
                        key={item._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.id && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {item.year || "-"}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.createdBy && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {item.createdBy || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.addedBy && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {item.addedBy || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.updatedAt && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {item.updatedAt
                              ? new Date(item.updatedAt).toLocaleString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuSeparator />
                                {hasPermission(PERMISSIONS.VIEW_ASSEMBLIES) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/vidhansabha/${item._id}/view`,
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.EDIT_ASSEMBLIES) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/vidhansabha/${item._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.DELETE_ASSEMBLIES,
                                ) && (
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleDelete(item._id)}
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
                      <TableCell colSpan={10} className="h-24 text-center">
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {!isLoading && data.length > 0 && pagination.limit !== -1 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, totalItems)} of{" "}
                  {totalItems} entries
                </p>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={Math.ceil(totalItems / pagination.limit)}
                  onPageChange={(page) =>
                    setPagination({ ...pagination, page })
                  }
                  activeColor="bg-[#368F8B]"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default VidhanSabhaList;
