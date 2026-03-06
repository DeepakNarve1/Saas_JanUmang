"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
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
import { ConfirmDialog } from "@app/components/common/ConfirmDialog";

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
import { useDebounce } from "@app/hooks/useDebounce";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { Pagination } from "@app/components/common/Pagination";
import { ISamitiResponse } from "@app/types/samiti";
import { PERMISSIONS } from "@app/config/permissions";

const SamitiList = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    name: true,
    createdAt: true,
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
  } = useQuery<ISamitiResponse>({
    queryKey: [
      "samitis",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const res = await axios.get("/samiti", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm,
        },
      });
      // The API response structure might differ depending on backend implementation
      // for this module. The previous code accessed res.data.data and res.data.count
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/samiti/${id}`);
    },
    onSuccess: () => {
      toast.success("Samiti deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["samitis"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete Samiti");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const data = response?.data || [];
  const totalItems = response?.count || response?.total || 0; // Fallback based on API response structure flexibility

  // Export Functionality
  const handleExport = async () => {
    if (data.length === 0) return toast.warning("No data to export");
    try {
      const XLSX = await import("xlsx");
      const exportData = data.map((item) => ({
        Name: item.name,
        "Created At": item.createdAt
          ? new Date(item.createdAt).toLocaleString()
          : "-",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Samiti List");
      XLSX.writeFile(wb, `samiti_list_${Date.now()}.xlsx`);
      toast.success("Exported successfully");
    } catch (error) {
      toast.error("Failed to load export library");
    }
  };

  return (
    <>
      <ContentHeader title="Samiti List" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Header / Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Search samiti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                {hasPermission(PERMISSIONS.EXPORT_SAMITI) && (
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 mr-2 text-blue-500" /> Export
                  </Button>
                )}

                {hasPermission(PERMISSIONS.CREATE_SAMITI) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    onClick={() => router.push("/samiti/create")}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Samiti
                  </Button>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
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
                        .trim()
                        .replace("srNo", "Sr No")
                        .replace("name", "Name")
                        .replace("createdAt", "Created At")
                        .replace("action", "Action")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#368F8B] dark:bg-[#368F8B] hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="w-[100px] font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Sr No
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Name
                      </TableHead>
                    )}
                    {visibleColumns.createdAt && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Created At
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="text-right font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
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
                        Failed to load data.
                      </TableCell>
                    </TableRow>
                  ) : data && data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow
                        key={item._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="font-medium dark:text-gray-300">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="font-medium text-gray-900 dark:text-gray-200">
                            {item.name}
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell className="dark:text-gray-300">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuSeparator />
                                {hasPermission(PERMISSIONS.VIEW_SAMITI) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/samiti/${item._id}/view`)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.EDIT_SAMITI) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/samiti/${item._id}/edit`)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.DELETE_SAMITI) && (
                                  <ConfirmDialog
                                    onConfirm={() => handleDelete(item._id)}
                                    trigger={
                                      <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700 w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </div>
                                    }
                                  />
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
                        className="h-24 text-center text-gray-500 dark:text-gray-400"
                      >
                        No Samiti found.
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
                          totalItems,
                        )}{" "}
                        of {totalItems} entries
                      </p>
                      <div className="flex items-center gap-3">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={Math.ceil(totalItems / pagination.limit)}
                          onPageChange={(page) =>
                            setPagination((prev) => ({ ...prev, page }))
                          }
                          activeColor="bg-[#368F8B]"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing all {data.length} entries
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

export default SamitiList;
