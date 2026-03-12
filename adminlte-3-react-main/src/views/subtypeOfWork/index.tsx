"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Columns,
  Copy,
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { ContentHeader } from "@app/components";
import { usePermissions } from "@app/hooks/usePermissions";
import { Pagination } from "@app/components/common/Pagination";
import { ISubTypeOfWorkResponse } from "@app/types/subtypeOfWork";
import { useListManagement } from "@app/hooks/useListManagement";
import { PERMISSIONS } from "@app/config/permissions";

const SubTypeOfWorkList = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    handleCopy,
    handleExportExcel,
    handlePrint,
    handleImport,
  } = useListManagement<any, ISubTypeOfWorkResponse>({
    queryKey: "sub-type-of-work",
    endpoint: "/sub-type-of-work",
    initialVisibleColumns: {
      srNo: true,
      typeOfWork: true,
      subTypeOfWork: true,
      action: true,
    },
    exportConfig: {
      filename: "subtype_of_work_list",
      sheetName: "Subtype Of Work List",
      mapRow: (item: any, index: number) => ({
        ID: index + 1,
        "Type Of Work": item.typeOfWork,
        "Sub Type Of Work": item.subTypeOfWork,
        Actions: "",
      }),
    },
    importConfig: {
      mapRow: (row: any) => {
        const findKey = (patterns: string[]) => {
          const key = Object.keys(row).find((k) =>
            patterns.includes(k.trim().toLowerCase()),
          );
          return key ? row[key] : null;
        };

        const typeOfWork =
          findKey(["type of work", "typeofwork", "type"]) || "";
        const subTypeOfWork =
          findKey(["sub type of work", "subtype", "subtypework"]) || "";

        return {
          typeOfWork: String(typeOfWork).trim(),
          subTypeOfWork: String(subTypeOfWork).trim(),
        };
      },
    },
  });

  const data = response?.data || [];
  const totalItems =
    response?.total || response?.filteredCount || response?.count || 0;

  return (
    <>
      <ContentHeader title="Sub Type of Work" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                    placeholder="Search Sub Type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-9 bg-white dark:bg-[#202123] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExcel}
                    className="h-9 bg-white dark:bg-[#202123] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    title="Export to Excel"
                  >
                    <Download className="w-4 h-4 mr-2 text-blue-500" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="h-9 bg-white dark:bg-[#202123] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    title="Print report"
                  >
                    <FileText className="w-4 h-4 mr-2" /> PDF / Print
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white dark:bg-[#202123] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2 text-orange-500" /> Import
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
                {hasPermission(PERMISSIONS.CREATE_SUB_WORK_TYPES) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium h-9"
                    onClick={() => router.push("/sub-type-of-work/create")}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New
                  </Button>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                    Show
                  </span>
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(v: string) =>
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(v),
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-20 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300 font-medium">
                      <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="-1">Show All</SelectItem>
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
                      className="h-9 bg-white dark:bg-[#202123] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                    >
                      <Columns className="w-4 h-4 mr-2 text-[#368F8B]" />{" "}
                      Columns
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
                          .replace("srNo", "Sr No")
                          .replace("typeOfWork", "Type of Work")
                          .replace("subTypeOfWork", "Sub Type of Work")
                          .replace("action", "Actions")}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#368F8B] hover:bg-[#368F8B] border-none">
                    {visibleColumns.srNo && (
                      <TableHead className="w-[80px] text-white font-bold uppercase tracking-wider text-xs">
                        Sr No
                      </TableHead>
                    )}
                    {visibleColumns.typeOfWork && (
                      <TableHead className="text-white font-bold uppercase tracking-wider text-xs">
                        Type of Work
                      </TableHead>
                    )}
                    {visibleColumns.subTypeOfWork && (
                      <TableHead className="text-white font-bold uppercase tracking-wider text-xs">
                        Sub Type of Work
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="text-right text-white font-bold uppercase tracking-wider text-xs">
                        Action
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
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center gap-2 text-gray-400 font-medium">
                          <Loader2 className="w-8 h-8 animate-spin text-[#368F8B]" />
                          Loading records...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="h-32 text-center text-red-500 font-medium"
                      >
                        Failed to fetch data from server.
                      </TableCell>
                    </TableRow>
                  ) : data && data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow
                        key={item._id}
                        className="hover:bg-gray-50/80 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="font-medium text-gray-500">
                            {pagination.limit === -1
                              ? index + 1
                              : (pagination.page - 1) * pagination.limit +
                                index +
                                1}
                          </TableCell>
                        )}
                        {visibleColumns.typeOfWork && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium">
                            {item.typeOfWork}
                          </TableCell>
                        )}
                        {visibleColumns.subTypeOfWork && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {item.subTypeOfWork}
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuSeparator />
                                {hasPermission(
                                  PERMISSIONS.VIEW_SUB_WORK_TYPES,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/sub-type-of-work/${item._id}/view`,
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.EDIT_SUB_WORK_TYPES,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/sub-type-of-work/${item._id}/edit`,
                                      )
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.DELETE_SUB_WORK_TYPES,
                                ) && (
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-700 cursor-pointer"
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
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="h-32 text-center text-gray-500"
                      >
                        No subtype of work records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && data && data.length > 0 && response && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {pagination.limit !== -1 ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Showing{" "}
                        <span className="text-gray-900 dark:text-white">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="text-gray-900 dark:text-white">
                          {Math.min(
                            pagination.page * pagination.limit,
                            totalItems,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="text-gray-900 dark:text-white">
                          {totalItems}
                        </span>{" "}
                        entries
                      </p>
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={Math.ceil(totalItems / pagination.limit)}
                        onPageChange={(page) =>
                          setPagination((prev) => ({ ...prev, page }))
                        }
                        activeColor="bg-[#368F8B]"
                      />
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Showing all{" "}
                      <span className="text-gray-900 dark:text-white">
                        {data.length}
                      </span>{" "}
                      entries
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

export default SubTypeOfWorkList;
