"use client";

import { useState } from "react";
import axios from "@app/utils/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { AxiosError } from "axios";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import { ConfirmDialog } from "@app/components/common/ConfirmDialog";

import { Dialog, DialogContent, DialogTitle } from "@app/components/ui/dialog";
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
  FileText,
  Columns,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { Pagination } from "@app/components/common/Pagination";
import { IDispatchRegisterResponse } from "@app/types/dispatchRegister";
import { IDistrict } from "@app/types/district";
import { useDebounce } from "@app/hooks/useDebounce";

const DispatchRegisterList = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    date: true,
    year: true,
    month: true,
    portalNo: true,
    samitiNo: true,
    dispatchNo: true,
    department: true,
    particulars: true,
    reference: true,
    district: true,
    block: true,
    panchayat: true,
    village: true,
    file: true,
    action: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const months = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Districts Query
  const { data: districtData } = useQuery<IDistrict[]>({
    queryKey: ["districts-list"],
    queryFn: async () => {
      try {
        const res = await axios.get("/districts?limit=100");
        return res.data.data;
      } catch (error: unknown) {
        handleError(error, "Failed to fetch districts");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const districts = districtData || [];

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IDispatchRegisterResponse>({
    queryKey: [
      "dispatchRegister",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      selectedMonth,
      selectedDistrict,
    ],
    queryFn: async () => {
      try {
        const res = await axios.get("/dispatch-register", {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearchTerm,
            month: selectedMonth,
            district: selectedDistrict,
          },
        });
        return res.data;
      } catch (error: unknown) {
        handleError(error, "Failed to fetch dispatch register data");
        throw error;
      }
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/dispatch-register/${id}`);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["dispatchRegister"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete record");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const data = response?.data || [];

  return (
    <>
      <ContentHeader title="Dispatch Register (जावक पंजी)" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
                <div className="flex gap-2 w-full sm:w-auto">
                  {hasPermission(PERMISSIONS.CREATE_DISPATCH_REGISTER) && (
                    <Button
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all w-full sm:w-auto"
                      onClick={() => router.push("/dispatch-register/create")}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add New Entry
                    </Button>
                  )}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedMonth}
                  onValueChange={(v) => {
                    setSelectedMonth(v);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedDistrict}
                  onValueChange={(v) => {
                    setSelectedDistrict(v);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Districts">All Districts</SelectItem>
                    {districts.map((d: IDistrict) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
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
                <DropdownMenuContent
                  align="start"
                  className="w-[800px] max-w-[80vw]"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2">
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
                          .replace("srNo", "S.NO")
                          .replace("date", "Date")
                          .replace("year", "Year")
                          .replace("month", "Month")
                          .replace("portalNo", "Portal No.")
                          .replace("samitiNo", "Samiti No.")
                          .replace("dispatchNo", "Dispatch No.")
                          .replace("department", "Department")
                          .replace("particulars", "Particular (subject)")
                          .replace("reference", "Reference")
                          .replace("district", "District")
                          .replace("block", "Block")
                          .replace("panchayat", "Panchayat")
                          .replace("village", "Village")
                          .replace("file", "File")
                          .replace("action", "Actions")}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
              <Table className="border border-gray-200 dark:border-gray-800">
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="w-[50px] font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        S.NO
                      </TableHead>
                    )}

                    {visibleColumns.date && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Date
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.month && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Month
                      </TableHead>
                    )}
                    {visibleColumns.portalNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Portal No.
                      </TableHead>
                    )}
                    {visibleColumns.samitiNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Samiti No.
                      </TableHead>
                    )}
                    {visibleColumns.dispatchNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Dispatch No.
                      </TableHead>
                    )}
                    {visibleColumns.department && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Department
                      </TableHead>
                    )}
                    {visibleColumns.particulars && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px] ">
                        Particular (subject)
                      </TableHead>
                    )}
                    {visibleColumns.reference && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px] ">
                        Reference
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap ">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.panchayat && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px] ">
                        Panchayat
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px] ">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.file && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[150px] ">
                        File
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="text-center font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px] ">
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
                        Failed to load data.
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
                        {visibleColumns.date && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap ">
                            {item.date
                              ? new Date(item.date).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap ">
                            {item.year || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.month && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap ">
                            {item.month || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.portalNo && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap ">
                            {item.portalNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.samitiNo && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap ">
                            {item.samitiNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.dispatchNo && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap ">
                            {item.dispatchNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.department && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap ">
                            {item.department?.name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.particulars && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.particulars || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.reference && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.reference || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap ">
                            {item.district?.name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap ">
                            {item.block?.name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.panchayat && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.panchayat && item.panchayat.length > 0
                              ? item.panchayat.map((p) => p.name).join(", ")
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.village && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.village && item.village.length > 0
                              ? item.village.map((v) => v.name).join(", ")
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.file && (
                          <TableCell className="text-center">
                            {item.uploadLetter ? (
                              <div
                                className="flex justify-center items-center cursor-pointer"
                                onClick={() =>
                                  setSelectedFile(item.uploadLetter as string)
                                }
                              >
                                {item.uploadLetter.startsWith(
                                  "data:application/pdf",
                                ) ? (
                                  <div className="h-14 w-14 min-w-[80px] bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <FileText className="h-8 w-8" />
                                  </div>
                                ) : (
                                  <img
                                    src={item.uploadLetter}
                                    alt="File"
                                    className="h-14 w-14 min-w-[80px] object-cover rounded-md border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity"
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuSeparator />
                                {hasPermission(
                                  PERMISSIONS.VIEW_DISPATCH_REGISTER,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/dispatch-register/${item._id}/view`,
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.EDIT_DISPATCH_REGISTER,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/dispatch-register/${item._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.DELETE_DISPATCH_REGISTER,
                                ) && (
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
                        className="h-24 text-center text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                      >
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination Controls ... */}
            {!isLoading && data && data.length > 0 && response && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      response.filteredCount ||
                        response.total ||
                        response.count ||
                        0,
                    )}{" "}
                    of{" "}
                    {response.filteredCount ||
                      response.total ||
                      response.count ||
                      0}{" "}
                    entries
                  </p>
                  <div className="flex items-center gap-3">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={Math.ceil(
                        (response.filteredCount ||
                          response.total ||
                          response.count ||
                          0) / pagination.limit,
                      )}
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

      {/* File Preview Modal */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">File Preview</DialogTitle>
          {selectedFile && (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Basic Image Preview, for PDF we might need object/embed if data uri is pdf */}
              {selectedFile.startsWith("data:application/pdf") ? (
                <iframe
                  src={selectedFile}
                  className="w-full h-[80vh] bg-white rounded-md"
                  title="PDF Preview"
                ></iframe>
              ) : (
                <img
                  src={selectedFile}
                  alt="Full Preview"
                  className="max-w-full max-h-[90vh] object-contain rounded-md"
                />
              )}
              <button
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                onClick={() => setSelectedFile(null)}
              >
                <span className="sr-only">Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DispatchRegisterList;
