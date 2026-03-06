"use client";

import { useState, useRef } from "react";
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
  Copy,
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { Pagination } from "@app/components/common/Pagination";
import { IPanchayat, IPanchayatResponse } from "@app/types/panchayat";
import { PERMISSIONS } from "@app/config/permissions";
interface IPanchayatColumns {
  srNo: boolean;
  name: boolean;
  block: boolean;
  booth: boolean;
  action: boolean;
}

const Panchayat = () => {
  const { hasPermission } = usePermissions();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [visibleColumns, setVisibleColumns] = useState<IPanchayatColumns>({
    srNo: true,
    name: true,
    block: true,
    booth: true,
    action: true,
  });

  const toggleColumn = (key: keyof IPanchayatColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter
  const [filterBlock, setFilterBlock] = useState("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Blocks for Filter
  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks-list"],
    queryFn: async () => {
      const res = await axios.get("/blocks?limit=-1");
      return res.data?.data || [];
    },
  });

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IPanchayatResponse>({
    queryKey: [
      "panchayat",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      filterBlock,
    ],
    queryFn: async () => {
      const res = await axios.get("/panchayat", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm,
          ...(filterBlock !== "all" && { blockName: filterBlock }),
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/panchayat/${id}`);
    },
    onSuccess: () => {
      toast.success("Panchayat deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["panchayat"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete panchayat");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleCopy = async () => {
    if (data.length === 0) return toast.warning("No data to copy");
    try {
      const headers = [
        "ID",
        "Panchayat Name",
        "Block",
        "Booth",
        "CreatedAt",
        "Actions",
      ];
      const rows = data.map((item: IPanchayat, index: number) => [
        index + 1,
        item.name,
        typeof item.block === "object" ? item.block?.name : item.block || "-",
        typeof item.booth === "object" ? item.booth?.name : item.booth || "-",
        item.createdAt
          ? new Date(item.createdAt)
              .toISOString()
              .replace("T", " ")
              .split(".")[0]
          : "-",
        "",
      ]);
      const text = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join(
        "\n",
      );
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error: unknown) {
      handleError(error, "Failed to copy data");
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) return toast.warning("No data to export");
    try {
      const XLSX = await import("xlsx");
      const exportData = data.map((item: IPanchayat, index: number) => ({
        ID: index + 1,
        "Panchayat Name": item.name,
        Block:
          typeof item.block === "object" ? item.block?.name : item.block || "-",
        Booth:
          typeof item.booth === "object" ? item.booth?.name : item.booth || "-",
        CreatedAt: item.createdAt
          ? new Date(item.createdAt)
              .toISOString()
              .replace("T", " ")
              .split(".")[0]
          : "-",
        Actions: "",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Panchayats");
      XLSX.writeFile(wb, `panchayats_${Date.now()}.xlsx`);
      toast.success("Excel exported successfully");
    } catch (error: unknown) {
      handleError(error, "Failed to export Excel");
    }
  };

  const handleExportPDF = async () => {
    if (data.length === 0) return toast.warning("No data to export");
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      const headers = [
        ["ID", "Panchayat Name", "Block", "Booth", "CreatedAt", "Actions"],
      ];
      const body = data.map((item: IPanchayat, index: number) => [
        index + 1,
        item.name,
        typeof item.block === "object" ? item.block?.name : item.block || "-",
        typeof item.booth === "object" ? item.booth?.name : item.booth || "-",
        item.createdAt
          ? new Date(item.createdAt)
              .toISOString()
              .replace("T", " ")
              .split(".")[0]
          : "-",
        "",
      ]);
      autoTable(doc, {
        head: headers,
        body: body,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [54, 143, 139], textColor: [255, 255, 255] },
      });
      doc.save(`panchayats_${Date.now()}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error: unknown) {
      handleError(error, "Failed to export PDF");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import("xlsx");
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.warning("No data found in Excel file");
          return;
        }

        let successCount = 0;
        let failureCount = 0;

        for (const row of jsonData as Record<string, string | number>[]) {
          try {
            const payload = {
              name: row["Panchayat Name"] || row["name"] || "",
              block: row["Block"] || row["block"] || "",
              booth: row["Booth"] || row["booth"] || "",
            };
            await axios.post("/panchayat", payload);
            successCount++;
          } catch (error) {
            failureCount++;
          }
        }

        toast.success(
          `Import complete: ${successCount} added, ${failureCount} failed`,
        );
        queryClient.invalidateQueries({ queryKey: ["panchayat"] });
      } catch (error: unknown) {
        handleError(error, "Failed to import file");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
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
      <ContentHeader title="Panchayat Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Actions Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search panchayat by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
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
                      onClick={handleExportPDF}
                      className="h-9 bg-white dark:bg-[#202123] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      title="Export to PDF"
                    >
                      <FileText className="w-4 h-4 mr-2" /> PDF
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {hasPermission(PERMISSIONS.CREATE_PANCHAYATS) && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/panchayat/create")}
                        className="h-9 bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add New
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filterBlock}
                  onValueChange={(val) => {
                    setFilterBlock(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-48 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Filter by Block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    {blocks.map((b: { _id: string; name: string }) => (
                      <SelectItem key={b._id} value={b.name}>
                        {b.name}
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
                    size="sm"
                    className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                  >
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {(
                    Object.keys(visibleColumns) as (keyof IPanchayatColumns)[]
                  ).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={visibleColumns[key]}
                      onCheckedChange={() => toggleColumn(key)}
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .trim()
                        .replace("srNo", "Sr. No.")
                        .replace("name", "Panchayat Name")
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
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Panchayat Name
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.booth && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Booth
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
                            <Skeleton className="h-12 w-64 dark:bg-gray-800" />
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>
                            <Skeleton className="h-12 w-32 dark:bg-gray-800" />
                          </TableCell>
                        )}
                        {visibleColumns.booth && (
                          <TableCell>
                            <Skeleton className="h-12 w-32 dark:bg-gray-800" />
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
                    data.map((panchayat, index) => (
                      <TableRow
                        key={panchayat._id}
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
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-lg border border-blue-200 dark:border-blue-800">
                                {getInitials(panchayat.name)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {panchayat.name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>
                            <span className="text-gray-700 dark:text-gray-300">
                              {typeof panchayat.block === "object"
                                ? (panchayat.block as { name?: string })?.name
                                : panchayat.block || "-"}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.booth && (
                          <TableCell>
                            <span className="text-gray-700 dark:text-gray-300">
                              {typeof panchayat.booth === "object"
                                ? (panchayat.booth as { name?: string })?.name
                                : panchayat.booth || "-"}
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
                                {hasPermission(PERMISSIONS.VIEW_PANCHAYATS) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/panchayat/${panchayat._id}`)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.EDIT_PANCHAYATS) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/panchayat/${panchayat._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.DELETE_PANCHAYATS,
                                ) && (
                                  <ConfirmDialog
                                    onConfirm={() => handleDelete(panchayat._id)}
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
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No panchayat found
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
                        panchayat
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
                      Showing all {data.length} panchayat
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

export default Panchayat;
