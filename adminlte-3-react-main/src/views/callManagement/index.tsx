"use client";

import { useState } from "react";
import axios from "@app/utils/axios";
import { useDebounce } from "@app/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
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
  Loader2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Columns,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { usePermissions } from "@app/hooks/usePermissions";
import { handleError } from "@app/utils/errorHandler";
import { Pagination } from "@app/components/common/Pagination";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { ICallResponse } from "@app/types/call";

const CallManagementList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    dateTime: true,
    category: true,
    name: true,
    mobile: true,
    address: true,
    subject: true,
    description: true,
    assignDateTime: true,
    remark: true,
    addedBy: true,
    actions: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = ["All Categories", "Appointment", "Samsya", "General"];

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<ICallResponse>({
    queryKey: [
      "call-management",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      selectedCategory,
    ],
    queryFn: async () => {
      try {
        const res = await axios.get("/call-management", {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearchTerm,
            category:
              selectedCategory === "All Categories" ? "" : selectedCategory,
          },
        });
        return res.data;
      } catch (error: unknown) {
        handleError(error, "Failed to fetch call management data");
        throw error;
      }
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/call-management/${id}`);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["call-management"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete record");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const data = response?.data || [];
  const totalCount = response?.total || response?.count || 0;
  const totalPages = Math.ceil(
    totalCount / (pagination.limit === -1 ? totalCount : pagination.limit),
  );

  return (
    <>
      <ContentHeader title="Call Management" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 h-10 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                  onClick={() => router.push("/call-management/create")}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add New Call
                </Button>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    setSelectedCategory(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-[#202123]"
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
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace("Sr No", "Sr No")
                        .replace("Date Time", "Date & Time")
                        .replace("Assign Date Time", "Assign Date & Time")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
              <Table className="border border-gray-200 dark:border-gray-800">
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="w-[50px] font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Sr No
                      </TableHead>
                    )}
                    {visibleColumns.dateTime && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Date & Time
                      </TableHead>
                    )}
                    {visibleColumns.category && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Category
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Name
                      </TableHead>
                    )}
                    {visibleColumns.mobile && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Mobile No
                      </TableHead>
                    )}
                    {visibleColumns.address && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        Address
                      </TableHead>
                    )}
                    {visibleColumns.subject && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[150px]">
                        Subject
                      </TableHead>
                    )}
                    {visibleColumns.description && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        Description
                      </TableHead>
                    )}
                    {visibleColumns.assignDateTime && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Assign Date & Time
                      </TableHead>
                    )}
                    {visibleColumns.remark && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[150px]">
                        Remark
                      </TableHead>
                    )}
                    {visibleColumns.addedBy && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Added By
                      </TableHead>
                    )}
                    {visibleColumns.actions && (
                      <TableHead className="text-center font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[100px]">
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
                        Failed to fetch data
                      </TableCell>
                    </TableRow>
                  ) : data && data.length > 0 ? (
                    data.map((item, index) => (
                      <TableRow
                        key={item._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-200 dark:border-gray-800"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="font-medium dark:text-gray-300">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                        )}
                        {visibleColumns.dateTime && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap">
                            {item.createdAt // Assuming created_at or date field in response maps to createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.category && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${item.category === "Samsya" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300"}`}
                            >
                              {item.category || "-"}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap">
                            {item.name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.mobile && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.mobile || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.address && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.address || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.subject && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.subject || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.description && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.description || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.assignDateTime && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.assignDate
                              ? new Date(item.assignDate).toLocaleString()
                              : "Not Assigned"}
                          </TableCell>
                        )}
                        {visibleColumns.remark && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.remark || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.addedBy && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.addedBy?.name || "System Administrator"}
                          </TableCell>
                        )}

                        {visibleColumns.actions && (
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
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/call-management/${item._id}/view`,
                                    )
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/call-management/${item._id}/edit`,
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <ConfirmDialog
                                    onConfirm={() => handleDelete(item._id)}
                                    trigger={
                                      <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700 w-full">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </div>
                                    }
                                  />
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
                        className="h-24 text-center text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                      >
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination Controls */}
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
                          totalCount,
                        )}{" "}
                        of {totalCount} entries
                      </p>
                      <div className="flex items-center gap-3">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={totalPages}
                          onPageChange={(page: number) =>
                            setPagination((prev) => ({
                              ...prev,
                              page: page,
                            }))
                          }
                          activeColor="bg-[#00563B]"
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

export default CallManagementList;
