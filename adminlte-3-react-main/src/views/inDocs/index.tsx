"use client";

import { useState, useRef } from "react";
import axios from "@app/utils/axios";
import { useDebounce } from "@app/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
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
  Loader2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Columns,
  Download,
  Upload,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { usePermissions } from "@app/hooks/usePermissions";
import { Pagination } from "@app/components/common/Pagination";
import { PERMISSIONS } from "@app/config/permissions";
import { IInDocsResponse } from "@app/types/inDocs";

const InDocsList = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRemark, setSelectedRemark] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    uniqueId: true,
    issueNo: true,
    date: true,
    nameAddress: true,
    place: true,
    subject: true,
    docsCount: true,
    refIssueNo: true,
    rcvdIssueNo: true,
    fileHeadNo: true,
    stamp: true,
    remarks: true,
    addedBy: true,
    action: true,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IInDocsResponse>({
    queryKey: [
      "inDocs",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const res = await axios.get("/in-docs", {
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

  const handleExport = async () => {
    const dataList = response?.data || [];
    if (dataList.length === 0) return toast.warning("No data to export");
    try {
      setLoading(true);
      const XLSX = await import("xlsx");
      const exportData = dataList.map((item: any, index: number) => ({
        "Sr No": index + 1,
        "Issue No": item.issueNo || "-",
        Date: item.date ? new Date(item.date).toLocaleDateString() : "-",
        "Name & Address": item.nameAddress || "-",
        Place: item.place || "-",
        Subject: item.subject || "-",
        "Documents Count": item.documentsCount || "-",
        "Reference Issue No": item.referenceIssueNo || "-",
        "Received Issue No": item.receivedIssueNo || "-",
        "File Head No": item.fileHeadNo || "-",
        "Stamp Received": item.stampReceived || "-",
        Remarks: item.remarks || "-",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "InDocs");
      XLSX.writeFile(wb, `InDocs_${Date.now()}.xlsx`);
      toast.success("Exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const XLSX = await import("xlsx");
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        if (rawRows.length === 0) {
          toast.warning("No data found in Excel file");
          setLoading(false);
          return;
        }

        const normalize = (s: any) =>
          String(s || "")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9\u0900-\u097f]/g, "");

        const keywords = ["issueno", "date", "subject", "nameaddress"];
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
          const row = rawRows[i];
          if (
            row.some((cell) => keywords.includes(normalize(cell))) ||
            row.some((cell) =>
              keywords.some((kw) => normalize(cell).includes(kw)),
            )
          ) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) headerRowIndex = 0;

        const headers = rawRows[headerRowIndex].map((h) => String(h || ""));
        const dataRows = rawRows.slice(headerRowIndex + 1);

        const getColIdx = (targets: string[]) => {
          const normTargets = targets.map(normalize);
          let idx = headers.findIndex((h) =>
            normTargets.includes(normalize(h)),
          );
          if (idx !== -1) return idx;
          idx = headers.findIndex((h) => {
            const nh = normalize(h);
            return (
              nh && normTargets.some((t) => nh.includes(t) || t.includes(nh))
            );
          });
          return idx;
        };

        const colMap: any = {
          issueNo: getColIdx(["Issue No", "IssueNo", "क्रमांक"]),
          date: getColIdx(["Date", "तारीख", "दिनांक"]),
          nameAddress: getColIdx([
            "Name & Address",
            "NameAddress",
            "नाम व पता",
          ]),
          place: getColIdx(["Place", "स्थान"]),
          subject: getColIdx(["Subject", "विषय"]),
          documentsCount: getColIdx(["Documents Count", "Count"]),
          referenceIssueNo: getColIdx(["Reference Issue No", "Ref No"]),
          receivedIssueNo: getColIdx(["Received Issue No", "Rcvd No"]),
          fileHeadNo: getColIdx(["File Head No", "FileNo", "फाइल नंबर"]),
          stampReceived: getColIdx(["Stamp Received", "Stamp", "पैसे"]),
          remarks: getColIdx(["Remarks", "टिप्पणी"]),
        };

        let successCount = 0;
        let failureCount = 0;
        let firstErrorMessage = "";

        for (const row of dataRows) {
          try {
            if (
              !row.some(
                (cell) =>
                  cell !== null &&
                  cell !== undefined &&
                  String(cell).trim() !== "",
              )
            )
              continue;

            const getVal = (colIdx: number) => {
              if (colIdx === -1 || colIdx === undefined) return "";
              const val = row[colIdx];
              return val !== null && val !== undefined
                ? String(val).trim()
                : "";
            };

            const payload: any = {
              issueNo: getVal(colMap.issueNo),
              date: getVal(colMap.date) || new Date().toISOString(),
              nameAddress: getVal(colMap.nameAddress),
              place: getVal(colMap.place),
              subject: getVal(colMap.subject),
              documentsCount: getVal(colMap.documentsCount),
              referenceIssueNo: getVal(colMap.referenceIssueNo),
              receivedIssueNo: getVal(colMap.receivedIssueNo),
              fileHeadNo: getVal(colMap.fileHeadNo),
              stampReceived: getVal(colMap.stampReceived),
              remarks: getVal(colMap.remarks),
            };

            if (!payload.issueNo || !payload.subject || !payload.nameAddress) {
              failureCount++;
              if (!firstErrorMessage) {
                firstErrorMessage = `Missing required fields (Issue No, Subject, or Name/Address) for row: ${JSON.stringify(row.slice(0, 3))}`;
              }
              continue;
            }

            await axios.post("/in-docs", payload);
            successCount++;
          } catch (error: any) {
            console.error("Row import error:", error);
            if (!firstErrorMessage) {
              firstErrorMessage =
                error.response?.data?.message || error.message;
            }
            failureCount++;
          }
        }

        if (failureCount > 0) {
          toast.error(
            `Import finished with ${failureCount} errors and ${successCount} successes. Error: ${firstErrorMessage}`,
          );
        } else {
          toast.success(`Successfully imported ${successCount} records`);
        }
        queryClient.invalidateQueries({ queryKey: ["inDocs"] });
      } catch (error: any) {
        console.error("Import error:", error);
        toast.error(
          "Failed to process file. Ensure it's a valid Excel format.",
        );
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/in-docs/${id}`);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["inDocs"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete record");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalPages = response ? Math.ceil(response.total / response.limit) : 0;
  const data = response?.data || [];

  return (
    <>
      <ContentHeader title="In Docs Management (जावक दस्तावेज़)" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleExport}
                  disabled={loading}
                  className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 mr-2 text-blue-500" />
                  )}{" "}
                  Export
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".xlsx, .xls"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2 text-orange-500" />
                  )}{" "}
                  Import
                </Button>

                {hasPermission(PERMISSIONS.CREATE_IN_DOCS) && (
                  <Button
                    size="lg"
                    onClick={() => router.push("/in-docs/create")}
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add Record
                  </Button>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
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
                        .replace("uniqueId", "Unique ID")
                        .replace("issueNo", "Issue No")
                        .replace("rcvdIssueNo", "Received Issue No")
                        .replace("refIssueNo", "Reference Issue No")
                        .replace("fileHeadNo", "File Head No")
                        .replace("docsCount", "Documents Count")
                        .replace("stamp", "Stamp Received (₹)")
                        .replace("nameAddress", "Name & Address")
                        .replace("addedBy", "Added By")
                        .replace("action", "Actions")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="w-[50px] font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Sr No
                      </TableHead>
                    )}
                    {visibleColumns.uniqueId && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Unique ID
                      </TableHead>
                    )}
                    {visibleColumns.issueNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Issue No
                      </TableHead>
                    )}
                    {visibleColumns.date && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Month/Date
                      </TableHead>
                    )}
                    {visibleColumns.nameAddress && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        Name & Address
                      </TableHead>
                    )}
                    {visibleColumns.place && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Place
                      </TableHead>
                    )}
                    {visibleColumns.subject && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        Subject
                      </TableHead>
                    )}
                    {visibleColumns.docsCount && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Documents Count
                      </TableHead>
                    )}
                    {visibleColumns.refIssueNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Reference Issue No
                      </TableHead>
                    )}
                    {visibleColumns.rcvdIssueNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Received Issue No
                      </TableHead>
                    )}
                    {visibleColumns.fileHeadNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        File Head No
                      </TableHead>
                    )}
                    {visibleColumns.stamp && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Stamp Received (₹)
                      </TableHead>
                    )}
                    {visibleColumns.remarks && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        Remarks
                      </TableHead>
                    )}
                    {visibleColumns.addedBy && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Added By
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs text-right whitespace-nowrap">
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
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="font-medium dark:text-gray-300">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </TableCell>
                        )}
                        {visibleColumns.uniqueId && (
                          <TableCell className="text-gray-500 dark:text-gray-400 text-xs">
                            {item._id.slice(-6).toUpperCase()}
                          </TableCell>
                        )}
                        {visibleColumns.issueNo && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap">
                            {item.issueNo}
                          </TableCell>
                        )}
                        {visibleColumns.date && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.date
                              ? new Date(item.date).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.nameAddress && (
                          <TableCell className="text-gray-900 dark:text-gray-200">
                            {item.nameAddress}
                          </TableCell>
                        )}
                        {visibleColumns.place && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.place || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.subject && (
                          <TableCell className="text-gray-900 dark:text-gray-200">
                            {item.subject}
                          </TableCell>
                        )}
                        {visibleColumns.docsCount && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap text-center">
                            {item.documentsCount || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.refIssueNo && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.referenceIssueNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.rcvdIssueNo && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.receivedIssueNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.fileHeadNo && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.fileHeadNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.stamp && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.stampReceived || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.remarks && (
                          <TableCell
                            className="text-gray-500 dark:text-gray-400 max-w-[200px] cursor-pointer hover:text-[#368F8B] dark:hover:text-[#368F8B] transition-colors"
                            onClick={() => {
                              if (item.remarks) setSelectedRemark(item.remarks);
                            }}
                            title="Click to view full remarks"
                          >
                            <div
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.remarks || "-"}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.addedBy && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.addedBy?.name || "System"}
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
                                {hasPermission(PERMISSIONS.VIEW_IN_DOCS) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/in-docs/${item._id}/view`)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.EDIT_IN_DOCS) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/in-docs/${item._id}/edit`)
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.DELETE_IN_DOCS) && (
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
                        No records found.
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      response.filteredCount || response.count || 0,
                    )}{" "}
                    of {response.filteredCount || response.count || 0} entries
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
                      activeColor="bg-[#00563B]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedRemark && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRemark(null)}
        >
          <div
            className="bg-white dark:bg-[#202123] dark:border dark:border-gray-700 rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                Full Remark
              </h3>
              <button
                onClick={() => setSelectedRemark(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {selectedRemark}
              </p>
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setSelectedRemark(null)}
                className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all px-8"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InDocsList;
