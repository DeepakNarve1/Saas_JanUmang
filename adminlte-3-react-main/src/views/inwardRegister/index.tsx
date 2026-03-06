"use client";

import { useState, useRef } from "react";
import axios from "@app/utils/axios";
import { useDebounce } from "@app/hooks/useDebounce";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import { ConfirmDialog } from "@app/components/common/ConfirmDialog";

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
import { IInwardRegisterResponse } from "@app/types/inwardRegister";
import { PERMISSIONS } from "@app/config/permissions";

const InwardRegisterList = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
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
    issueDate: true,
    letterName: true,
    letterReceivedDate: true,
    fromWhomReceived: true,
    letterDescription: true,
    replyToNumber: true,
    ourReplyNumber: true,
    forwardedLetterNumber: true,
    subject: true,
    fileNo: true,
    section: true,
    sentTo: true,
    remarks: true,
    addedBy: true,
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
  } = useQuery<IInwardRegisterResponse>({
    queryKey: [
      "inwardRegister",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      try {
        const res = await axios.get("/inward-register", {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearchTerm,
          },
        });
        return res.data;
      } catch (error: unknown) {
        handleError(error, "Failed to fetch inward register data");
        throw error;
      }
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
        "Issue Date": item.issueDate
          ? new Date(item.issueDate).toLocaleDateString()
          : "-",
        "Letter Name": item.letterName || "-",
        "Letter Received Date": item.letterReceivedDate
          ? new Date(item.letterReceivedDate).toLocaleDateString()
          : "-",
        "From Whom Received": item.fromWhomReceived || "-",
        "Letter Description": item.letterDescription || "-",
        Subject: item.subject || "-",
        "File No": item.fileNo || "-",
        "Received Letter No": item.receivedLetterNumber || "-",
        "Received Letter Date": item.receivedLetterDate
          ? new Date(item.receivedLetterDate).toLocaleDateString()
          : "-",
        "Reply To Number": item.replyToNumber || "-",
        "Our Reply Number": item.ourReplyNumber || "-",
        "Forwarded Letter Number": item.forwardedLetterNumber || "-",
        Section: item.section || "-",
        "Sent To": item.sentTo || "-",
        Remarks: item.remarks || "-",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "InwardRegister");
      XLSX.writeFile(wb, `InwardRegister_${Date.now()}.xlsx`);
      toast.success("Exported successfully");
    } catch (error: unknown) {
      handleError(error, "Failed to export inward register data");
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

        const keywords = ["issueno", "issuedate", "lettername", "fromwhom"];
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
          issueDate: getColIdx(["Issue Date", "IssueDate", "दिनांक"]),
          letterName: getColIdx(["Letter Name", "नाम"]),
          letterReceivedDate: getColIdx([
            "Letter Received Date",
            "Received Date",
          ]),
          fromWhomReceived: getColIdx(["From Whom Received", "From Whom"]),
          letterDescription: getColIdx(["Letter Description", "विवरण"]),
          subject: getColIdx(["Subject", "विषय"]),
          fileNo: getColIdx(["File No", "फाइल नं"]),
          receivedLetterNumber: getColIdx(["Received Letter No"]),
          receivedLetterDate: getColIdx(["Received Letter Date"]),
          replyToNumber: getColIdx(["Reply To Number"]),
          ourReplyNumber: getColIdx(["Our Reply Number"]),
          forwardedLetterNumber: getColIdx(["Forwarded Letter Number"]),
          section: getColIdx(["Section", "अनुभाग"]),
          sentTo: getColIdx(["Sent To", "किसे भेजा"]),
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
              issueDate: getVal(colMap.issueDate) || new Date().toISOString(),
              letterName: getVal(colMap.letterName),
              letterReceivedDate:
                getVal(colMap.letterReceivedDate) || new Date().toISOString(),
              fromWhomReceived: getVal(colMap.fromWhomReceived),
              letterDescription: getVal(colMap.letterDescription),
              subject: getVal(colMap.subject),
              fileNo: getVal(colMap.fileNo),
              receivedLetterNumber: getVal(colMap.receivedLetterNumber),
              receivedLetterDate:
                getVal(colMap.receivedLetterDate) || undefined,
              replyToNumber: getVal(colMap.replyToNumber),
              ourReplyNumber: getVal(colMap.ourReplyNumber),
              forwardedLetterNumber: getVal(colMap.forwardedLetterNumber),
              section: getVal(colMap.section),
              sentTo: getVal(colMap.sentTo),
              remarks: getVal(colMap.remarks),
            };

            if (
              !payload.issueNo ||
              !payload.letterName ||
              !payload.fromWhomReceived
            ) {
              failureCount++;
              if (!firstErrorMessage) {
                firstErrorMessage = `Missing required fields (Issue No, Letter Name, or From Whom) for row: ${JSON.stringify(row.slice(0, 3))}`;
              }
              continue;
            }

            await axios.post("/inward-register", payload);
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
        queryClient.invalidateQueries({ queryKey: ["inwardRegister"] });
      } catch (error: unknown) {
        handleError(error, "Failed to process inward register import file");
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
      await axios.delete(`/inward-register/${id}`);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["inwardRegister"] });
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
      <ContentHeader title="Inward Register (आवक पंजी)" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-none mt-6 overflow-hidden">
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
              <div className="flex flex-wrap items-center gap-2">
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

                {hasPermission(PERMISSIONS.CREATE_INWARD_REGISTER) && (
                  <Button
                    size="lg"
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    onClick={() => router.push("/inward-register/create")}
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New Inward
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
                          .replace("srNo", "Sr No")
                          .replace("uniqueId", "Unique ID")
                          .replace("issueNo", "Issue No")
                          .replace("issueDate", "Issue Date")
                          .replace("letterName", "Letter Name")
                          .replace("letterReceivedDate", "Letter Received Date")
                          .replace("fromWhomReceived", "From Whom Received")
                          .replace("letterDescription", "Letter Description")
                          .replace("replyToNumber", "Reply To Number")
                          .replace("ourReplyNumber", "Our Reply Number")
                          .replace(
                            "forwardedLetterNumber",
                            "Forwarded Letter No",
                          )
                          .replace("subject", "Subject")
                          .replace("fileNo", "File Number")
                          .replace("section", "Section")
                          .replace("sentTo", "Sent To")
                          .replace("remarks", "Remarks")
                          .replace("addedBy", "Added By")
                          .replace("action", "Actions")}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
              <Table className="border border-gray-200 dark:border-none">
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="w-[50px] font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
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
                    {visibleColumns.issueDate && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Issue Date
                      </TableHead>
                    )}
                    {visibleColumns.letterName && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Letter Name
                      </TableHead>
                    )}
                    {visibleColumns.letterReceivedDate && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Letter Received Date
                      </TableHead>
                    )}
                    {visibleColumns.fromWhomReceived && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        From Whom Received
                      </TableHead>
                    )}
                    {visibleColumns.letterDescription && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        Letter Description
                      </TableHead>
                    )}
                    {visibleColumns.replyToNumber && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Reply To Number
                      </TableHead>
                    )}
                    {visibleColumns.ourReplyNumber && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Our Reply Number
                      </TableHead>
                    )}
                    {visibleColumns.forwardedLetterNumber && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Forwarded Letter No
                      </TableHead>
                    )}
                    {visibleColumns.subject && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs min-w-[200px]">
                        Subject
                      </TableHead>
                    )}
                    {visibleColumns.fileNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        File Number
                      </TableHead>
                    )}
                    {visibleColumns.section && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Section
                      </TableHead>
                    )}
                    {visibleColumns.sentTo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Sent To
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
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs whitespace-nowrap">
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
                        className="h-24 text-center border-gray-200 dark:border-gray-800 text-gray-400"
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
                        className="h-24 text-center text-red-500 dark:text-red-400 border-gray-200 dark:border-gray-800"
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
                          <TableCell className="text-gray-500 dark:text-gray-400 text-xs ">
                            {item._id.slice(-6).toUpperCase()}
                          </TableCell>
                        )}
                        {visibleColumns.issueNo && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap ">
                            {item.issueNo}
                          </TableCell>
                        )}
                        {visibleColumns.issueDate && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.issueDate
                              ? new Date(item.issueDate).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.letterName && (
                          <TableCell className="text-gray-900 dark:text-gray-200">
                            {item.letterName}
                          </TableCell>
                        )}
                        {visibleColumns.letterReceivedDate && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.letterReceivedDate
                              ? new Date(
                                  item.letterReceivedDate,
                                ).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.fromWhomReceived && (
                          <TableCell className="text-gray-900 dark:text-gray-200">
                            {item.fromWhomReceived}
                          </TableCell>
                        )}
                        {visibleColumns.letterDescription && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.letterDescription || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.replyToNumber && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.replyToNumber || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.ourReplyNumber && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.ourReplyNumber || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.forwardedLetterNumber && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.forwardedLetterNumber || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.subject && (
                          <TableCell className="text-gray-900 dark:text-gray-200">
                            {item.subject || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.fileNo && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.fileNo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.section && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.section || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.sentTo && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.sentTo || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.remarks && (
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {item.remarks || "-"}
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
                                {hasPermission(
                                  PERMISSIONS.VIEW_INWARD_REGISTER,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/inward-register/${item._id}/view`,
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.EDIT_INWARD_REGISTER,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/inward-register/${item._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.DELETE_INWARD_REGISTER,
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
                        className="h-24 text-center text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-800"
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
    </>
  );
};

export default InwardRegisterList;
