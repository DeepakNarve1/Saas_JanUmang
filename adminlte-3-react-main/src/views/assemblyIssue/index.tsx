"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { API_BASE_URL } from "@app/utils/api";
import { RouteGuard } from "@app/components/RouteGuard";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { handleError } from "@app/utils/errorHandler";

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
import { Badge } from "@app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@app/components/ui/dropdown-menu";
import { ConfirmDialog } from "@app/components/common/ConfirmDialog";


import { useDebounce } from "@app/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Columns,
  Loader2,
  Upload,
  FileImage,
} from "lucide-react";
import { Pagination } from "@app/components/common/Pagination";
import { TimerDisplay } from "@app/components/TimerDisplay";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  IAssemblyIssue,
  IAssemblyIssueResponse,
} from "@app/types/assemblyIssue";

interface IAssemblyIssueColumns {
  srNo: boolean;
  uniqueId: boolean;
  timer: boolean;
  sectorName: boolean;
  microSectorNo: boolean;
  microSectorName: boolean;
  year: boolean;
  month: boolean;
  date: boolean;
  district: boolean;
  assembly: boolean;
  block: boolean;
  recommendedLetterNo: boolean;
  boothNo: boolean;
  boothName: boolean;
  panchayatName: boolean;
  village: boolean;
  majraFaliya: boolean;
  workProblem: boolean;
  office: boolean;
  approximateCost: boolean;
  department: boolean;
  priority: boolean;
  tsNoDate: boolean;
  asNoDate: boolean;
  typeOfWork: boolean;
  subWorkType: boolean;
  middleMen: boolean;
  middleManContact: boolean;
  beneficiaryName: boolean;
  po: boolean;
  status: boolean;
  remarkGoshana: boolean;
  remarkTipUsd: boolean;
  addedBy: boolean;
  beneficiaryContact: boolean;
  latLng: boolean;
  registrationDate: boolean;
  avedanFile: boolean;
  actions: boolean;
  acMpNo: boolean;
}

interface AssemblyIssueListProps {
  issueType?: string;
  title?: string;
  basePath?: string;
}

const AssemblyIssueList = ({
  issueType = "assembly-issue",
  title = "Assembly Issues / Ganesh Samiti Locations",
  basePath = "/assembly-issue",
}: AssemblyIssueListProps) => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_ASSEMBLY_ISSUES]}>
      <AssemblyIssueListContent
        issueType={issueType}
        title={title}
        basePath={basePath}
      />
    </RouteGuard>
  );
};

const AssemblyIssueListContent = ({
  issueType,
  title,
  basePath,
}: {
  issueType: string;
  title: string;
  basePath: string;
}) => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterPanchayat, setFilterPanchayat] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<IAssemblyIssueColumns>({
    srNo: true,
    uniqueId: true,
    timer: true,
    sectorName: true,
    microSectorNo: true,
    microSectorName: true,
    year: true,
    month: true,
    date: true,
    district: true,
    assembly: true,
    block: true,
    recommendedLetterNo: true,
    boothNo: true,
    boothName: true,
    panchayatName: true,
    village: true,
    majraFaliya: true,
    workProblem: true,
    office: true,
    approximateCost: true,
    department: true,
    priority: true,
    tsNoDate: true,
    asNoDate: true,
    typeOfWork: true,
    subWorkType: true,
    middleMen: true,
    middleManContact: true,
    beneficiaryName: true,
    po: true,
    status: true,
    remarkGoshana: true,
    remarkTipUsd: true,
    addedBy: true,
    beneficiaryContact: true,
    latLng: true,
    registrationDate: true,
    avedanFile: true,
    actions: true,
    acMpNo: false,
  });

  // Live timer state
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Filters
  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks-list"],
    queryFn: async () => {
      const res = await axios.get("/blocks?limit=-1");
      return res.data?.data || [];
    },
  });

  const { data: panchayats = [] } = useQuery({
    queryKey: ["panchayat-list"],
    queryFn: async () => {
      const res = await axios.get("/panchayat?limit=-1");
      return res.data?.data || [];
    },
  });

  // Fetch Issues Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IAssemblyIssueResponse>({
    queryKey: [
      "assembly-issues",
      issueType,
      currentPage,
      entriesPerPage,
      debouncedSearchTerm,
      filterBlock,
      filterPanchayat,
    ],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearchTerm || undefined,
        block: filterBlock === "all" ? undefined : filterBlock,
        gramPanchayat: filterPanchayat === "all" ? undefined : filterPanchayat,
        issueType,
      };

      const { data } = await axios.get("/assembly-issues", { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/assembly-issues/${id}`);
    },
    onSuccess: () => {
      toast.success("Issue deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assembly-issues"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete issue");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleExport = async () => {
    const dataList = response?.data || [];
    if (dataList.length === 0) return toast.warning("No data to export");
    try {
      setLoading(true);
      const XLSX = await import("xlsx");

      const exportData = dataList.map((item: IAssemblyIssue, index: number) => {
        const row: Record<string, string | number> = { "Sr No": index + 1 };

        if (visibleColumns.uniqueId) row["Regi. No."] = item.uniqueId || "-";
        if (visibleColumns.year) row["Year"] = item.year || "-";
        if (visibleColumns.month) row["Month"] = item.month || "-";
        if (visibleColumns.date) row["Date"] = item.date || "-";
        if (visibleColumns.district) row["District"] = item.district || "-";
        if (visibleColumns.assembly) row["Assembly"] = item.assembly || "-";
        if (visibleColumns.block) row["Block"] = item.block || "-";
        if (visibleColumns.sectorName) row["Sector"] = item.sectorName || "-";
        if (visibleColumns.microSectorNo)
          row["Micro Sector No."] = item.microSectorNo || "-";
        if (visibleColumns.microSectorName)
          row["Micro Sector Name"] = item.microSectorName || "-";
        if (visibleColumns.panchayatName)
          row["Gram Panchayat"] = item.panchayatName || "-";
        if (visibleColumns.village) row["Village"] = item.village || "-";
        if (visibleColumns.majraFaliya) row["Faliya"] = item.majraFaliya || "-";
        if (visibleColumns.boothName) row["Booth Name"] = item.boothName || "-";
        if (visibleColumns.boothNo) row["Booth No."] = item.boothNo || "-";
        if (visibleColumns.workProblem)
          row["Work/Problem"] = item.workProblem || "-";
        if (visibleColumns.department)
          row["Department"] = item.department || "-";
        if (visibleColumns.approximateCost)
          row["Approximate Cost"] = item.approximateCost || "0";
        if (visibleColumns.priority) row["Priority"] = item.priority || "-";
        if (visibleColumns.status) row["Status"] = item.status || "-";
        if (visibleColumns.beneficiaryName)
          row["Beneficiary"] = item.beneficiaryName || "-";
        if (visibleColumns.beneficiaryContact)
          row["Beneficiary Mobile"] = item.beneficiaryContact || "-";
        if (visibleColumns.remarkGoshana)
          row["Remark/Goshana"] = item.remarkGoshana || "-";
        if (visibleColumns.remarkTipUsd)
          row["Remark/Tip"] = item.remarkTipUsd || "-";

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 30));
      XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
      toast.success("Exported successfully");
    } catch (error: unknown) {
      handleError(error, "Failed to export data");
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
        }) as unknown[][];

        if (rawRows.length === 0) {
          toast.warning("No data found in Excel file");
          setLoading(false);
          return;
        }

        const normalize = (s: unknown) =>
          String(s || "")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9\u0900-\u097f]/g, "");

        const keywords = ["block", "year", "problem", "village", "panchayat"];
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

        const colMap: Record<string, number> = {
          uniqueId: getColIdx(["Regi. No.", "Unique ID", "RegNo", "Serial"]),
          year: getColIdx(["Year", "वर्ष"]),
          month: getColIdx(["Month", "महीना"]),
          date: getColIdx(["Date", "दिनांक"]),
          district: getColIdx(["District", "जिला"]),
          assembly: getColIdx(["Assembly", "विधानसभा"]),
          block: getColIdx(["Block", "ब्लॉक"]),
          sectorName: getColIdx(["Sector", "सेक्टर"]),
          microSectorNo: getColIdx(["Micro Sector No", "MS No"]),
          microSectorName: getColIdx(["Micro Sector Name", "MS Name"]),
          panchayatName: getColIdx(["Gram Panchayat", "Panchayat", "पंचायत"]),
          village: getColIdx(["Village", "गाँव"]),
          majraFaliya: getColIdx(["Faliya", "फलिया"]),
          boothName: getColIdx(["Booth Name", "बूथ"]),
          boothNo: getColIdx(["Booth No", "बूथ नं"]),
          workProblem: getColIdx(["Work/Problem", "Problem", "समस्या"]),
          department: getColIdx(["Department", "विभाग"]),
          approximateCost: getColIdx(["Approximate Cost", "Cost", "लागत"]),
          priority: getColIdx(["Priority", "प्राथमिकता"]),
          status: getColIdx(["Status", "स्थिति"]),
          beneficiaryName: getColIdx(["Beneficiary", "हितग्राही"]),
          beneficiaryContact: getColIdx(["Beneficiary Mobile", "Mobile"]),
          remarkGoshana: getColIdx(["Remark/Goshana", "Goshana"]),
          remarkTipUsd: getColIdx(["Remark/Tip", "REMARK"]),
        };

        let successCount = 0;
        let failureCount = 0;
        let firstErrorMessage = "";

        for (const [index, row] of dataRows.entries()) {
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

            const rawId = getVal(colMap.uniqueId);
            const cleanUniqueId =
              ["", "n/a", "none", "-", "null"].includes(rawId.toLowerCase()) ||
              (!isNaN(Number(rawId)) && Number(rawId) < 10000)
                ? undefined
                : rawId;

            const payload: Partial<IAssemblyIssue> = {
              uniqueId: cleanUniqueId,
              year: getVal(colMap.year) || new Date().getFullYear().toString(),
              month: getVal(colMap.month),
              date: getVal(colMap.date),
              district: getVal(colMap.district),
              assembly: getVal(colMap.assembly),
              block: getVal(colMap.block),
              sectorName: getVal(colMap.sectorName),
              microSectorNo: getVal(colMap.microSectorNo),
              microSectorName: getVal(colMap.microSectorName),
              panchayatName: getVal(colMap.panchayatName),
              village: getVal(colMap.village),
              majraFaliya: getVal(colMap.majraFaliya),
              boothName: getVal(colMap.boothName),
              boothNo: getVal(colMap.boothNo),
              workProblem: getVal(colMap.workProblem),
              department: getVal(colMap.department),
              approximateCost: Number(getVal(colMap.approximateCost)) || 0,
              priority: getVal(colMap.priority),
              status: getVal(colMap.status) || "Pending",
              beneficiaryName: getVal(colMap.beneficiaryName),
              beneficiaryContact: getVal(colMap.beneficiaryContact),
              remarkGoshana: getVal(colMap.remarkGoshana),
              remarkTipUsd: getVal(colMap.remarkTipUsd),
              issueType: issueType,
            };

            if (!payload.block || !payload.workProblem) {
              failureCount++;
              if (!firstErrorMessage) {
                firstErrorMessage = `Missing required fields (Block or Problem). Block: ${payload.block}, Problem: ${payload.workProblem}`;
              }
              continue;
            }

            await axios.post("/assembly-issues", payload);
            successCount++;
          } catch (error: unknown) {
            failureCount++;
            handleError(error, `Import: Failed to add row ${index + 1}`);
            if (!firstErrorMessage) {
              const err = error as {
                response?: { data?: { message?: string } };
                message?: string;
              };
              firstErrorMessage =
                err.response?.data?.message || err.message || "Unknown error";
            }
          }
        }

        if (failureCount > 0) {
          toast.error(
            `Import finished with ${failureCount} errors and ${successCount} successes. Error: ${firstErrorMessage}`,
          );
        } else {
          toast.success(`Successfully imported ${successCount} records`);
        }
        queryClient.invalidateQueries({ queryKey: ["assembly-issues"] });
      } catch (error: unknown) {
        handleError(error, "Failed to process import file");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const toggleColumn = (key: keyof IAssemblyIssueColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const issues = response?.data || [];
  const totalCount =
    response?.filteredCount !== undefined
      ? response.filteredCount
      : response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title={title} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Header Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by ID, Block, Panchayat, Village..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
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

                  {hasPermission(PERMISSIONS.CREATE_ASSEMBLY_ISSUES) && (
                    <Button
                      size="lg"
                      onClick={() => router.push(`${basePath}/create`)}
                      disabled={loading}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" /> New Issue
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination/Filter Controls */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Show
                </span>
                <Select
                  value={entriesPerPage.toString()}
                  onValueChange={(v: string) => {
                    setEntriesPerPage(v === "-1" ? -1 : Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-24 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  entries
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={filterBlock}
                  onValueChange={(val) => {
                    setFilterBlock(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
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

                <Select
                  value={filterPanchayat}
                  onValueChange={(val) => {
                    setFilterPanchayat(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-40 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Filter by Panchayat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Panchayats</SelectItem>
                    {panchayats.map((p: { _id: string; name: string }) => (
                      <SelectItem key={p._id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column Visibility */}
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
                  className="w-56 max-h-[400px] overflow-y-auto"
                >
                  {(
                    Object.keys(
                      visibleColumns,
                    ) as (keyof IAssemblyIssueColumns)[]
                  ).map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={visibleColumns[key]}
                      onCheckedChange={() => toggleColumn(key)}
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace("Unique Id", "Regi. No.")
                        .replace("Ac Mp No", "AC/MP No.")
                        .replace("Sector Name", "Sector")
                        .replace("Panchayat Name", "Gram Panchayat")
                        .replace("Majra Faliya", "Faliya")
                        .replace("Beneficiary Name", "Beneficial")
                        .replace("Beneficiary Contact", "Beneficially Mobile")
                        .replace("Avedan File", "Avedan")
                        .trim()}
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
                      <TableHead className="text-center font-bold whitespace-nowrap sticky left-0 z-20 bg-[#368F8B] text-white dark:bg-[#368F8B] border-r border-gray-200 dark:border-gray-800">
                        Sr.No.
                      </TableHead>
                    )}
                    {visibleColumns.uniqueId && (
                      <TableHead className="text-center whitespace-nowrap">
                        Regi. No.
                      </TableHead>
                    )}
                    {visibleColumns.timer && (
                      <TableHead className="text-center whitespace-nowrap">
                        Timer
                      </TableHead>
                    )}
                    {visibleColumns.sectorName && (
                      <TableHead className="text-center whitespace-nowrap">
                        Sector Name
                      </TableHead>
                    )}
                    {visibleColumns.microSectorNo && (
                      <TableHead className="text-center whitespace-nowrap">
                        Micro Sector No.
                      </TableHead>
                    )}
                    {visibleColumns.microSectorName && (
                      <TableHead className="text-center whitespace-nowrap">
                        Micro Sector Name
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="text-center whitespace-nowrap">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.month && (
                      <TableHead className="text-center whitespace-nowrap">
                        Month
                      </TableHead>
                    )}
                    {visibleColumns.date && (
                      <TableHead className="text-center whitespace-nowrap">
                        Date
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="text-center whitespace-nowrap">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.assembly && (
                      <TableHead className="text-center whitespace-nowrap">
                        Assembly
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="text-center whitespace-nowrap">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.recommendedLetterNo && (
                      <TableHead className="text-center whitespace-nowrap">
                        Recommended Letter No
                      </TableHead>
                    )}
                    {visibleColumns.boothNo && (
                      <TableHead className="text-center whitespace-nowrap">
                        Booth No
                      </TableHead>
                    )}
                    {visibleColumns.boothName && (
                      <TableHead className="text-center whitespace-nowrap">
                        Booth Name
                      </TableHead>
                    )}
                    {visibleColumns.panchayatName && (
                      <TableHead className="text-center whitespace-nowrap">
                        Panchayat Name
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="text-center whitespace-nowrap">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.majraFaliya && (
                      <TableHead className="text-center whitespace-nowrap">
                        Majra/Faliya
                      </TableHead>
                    )}
                    {visibleColumns.workProblem && (
                      <TableHead className="text-center min-w-[300px]">
                        Work/Problem
                      </TableHead>
                    )}
                    {visibleColumns.office && (
                      <TableHead className="text-center whitespace-nowrap">
                        Office
                      </TableHead>
                    )}
                    {visibleColumns.approximateCost && (
                      <TableHead className="text-center whitespace-nowrap">
                        Approximate Cost
                      </TableHead>
                    )}
                    {visibleColumns.department && (
                      <TableHead className="text-center whitespace-nowrap">
                        Department
                      </TableHead>
                    )}
                    {visibleColumns.priority && (
                      <TableHead className="text-center whitespace-nowrap">
                        Priority
                      </TableHead>
                    )}
                    {visibleColumns.tsNoDate && (
                      <TableHead className="text-center whitespace-nowrap">
                        TS No/ Date
                      </TableHead>
                    )}
                    {visibleColumns.asNoDate && (
                      <TableHead className="text-center whitespace-nowrap">
                        AS No/ date
                      </TableHead>
                    )}
                    {visibleColumns.typeOfWork && (
                      <TableHead className="text-center whitespace-nowrap">
                        Type of work
                      </TableHead>
                    )}
                    {visibleColumns.subWorkType && (
                      <TableHead className="text-center whitespace-nowrap">
                        Sub Work Type
                      </TableHead>
                    )}
                    {visibleColumns.middleMen && (
                      <TableHead className="text-center whitespace-nowrap">
                        Middle Men
                      </TableHead>
                    )}
                    {visibleColumns.middleManContact && (
                      <TableHead className="text-center whitespace-nowrap">
                        Contact No
                      </TableHead>
                    )}
                    {visibleColumns.beneficiaryName && (
                      <TableHead className="text-center whitespace-nowrap">
                        Beneficial
                      </TableHead>
                    )}
                    {visibleColumns.po && (
                      <TableHead className="text-center whitespace-nowrap">
                        PO
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="text-center whitespace-nowrap">
                        Status
                      </TableHead>
                    )}
                    {visibleColumns.remarkGoshana && (
                      <TableHead className="text-center min-w-[300px]">
                        Remark/ GOSHANA
                        <br />( भईया द्वारा दिए गए निर्देश )
                      </TableHead>
                    )}
                    {visibleColumns.remarkTipUsd && (
                      <TableHead className="text-center min-w-[250px]">
                        REMARK / TIP/ USD
                      </TableHead>
                    )}
                    {visibleColumns.addedBy && (
                      <TableHead className="text-center whitespace-nowrap">
                        Added By
                      </TableHead>
                    )}
                    {visibleColumns.beneficiaryContact && (
                      <TableHead className="text-center whitespace-nowrap">
                        Beneficially Mobile
                      </TableHead>
                    )}
                    {visibleColumns.latLng && (
                      <TableHead className="text-center whitespace-nowrap">
                        lat-lng
                      </TableHead>
                    )}
                    {visibleColumns.registrationDate && (
                      <TableHead className="text-center whitespace-nowrap">
                        Registration Date
                      </TableHead>
                    )}
                    {visibleColumns.avedanFile && (
                      <TableHead className="text-center whitespace-nowrap">
                        Avedan
                      </TableHead>
                    )}
                    {visibleColumns.actions && (
                      <TableHead className="text-center whitespace-nowrap">
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
                        className="text-center py-10"
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
                        className="text-center py-20 text-red-500"
                      >
                        Failed to fetch assembly issues
                      </TableCell>
                    </TableRow>
                  ) : issues.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No issues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    issues.map((issue, index) => (
                      <TableRow
                        key={issue._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="text-center whitespace-nowrap bg-white dark:bg-[#202123] sticky left-0 z-10 font-bold border-r border-gray-200 dark:border-gray-800 text-[#368F8B]">
                            {(currentPage - 1) * entriesPerPage + index + 1}
                          </TableCell>
                        )}
                        {visibleColumns.uniqueId && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.uniqueId}
                          </TableCell>
                        )}
                        {visibleColumns.timer && (
                          <TableCell className="text-center whitespace-nowrap w-[120px]">
                            <TimerDisplay
                              submissionDate={
                                issue.registrationDate || issue.createdAt
                              }
                              now={now}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.sectorName && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.sectorName}
                          </TableCell>
                        )}
                        {visibleColumns.microSectorNo && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.microSectorNo}
                          </TableCell>
                        )}
                        {visibleColumns.microSectorName && (
                          <TableCell className="text-center wrap-break-word max-w-[200px]">
                            {issue.microSectorName}
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.year}
                          </TableCell>
                        )}
                        {visibleColumns.month && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.month}
                          </TableCell>
                        )}
                        {visibleColumns.date && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.date}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.district}
                          </TableCell>
                        )}
                        {visibleColumns.assembly && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.assembly}
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.block}
                          </TableCell>
                        )}
                        {visibleColumns.recommendedLetterNo && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.recommendedLetterNo}
                          </TableCell>
                        )}
                        {visibleColumns.boothNo && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.boothNo}
                          </TableCell>
                        )}
                        {visibleColumns.boothName && (
                          <TableCell className="text-center wrap-break-word max-w-[200px]">
                            {issue.boothName}
                          </TableCell>
                        )}
                        {visibleColumns.panchayatName && (
                          <TableCell className="text-center wrap-break-word max-w-[200px]">
                            {issue.panchayatName}
                          </TableCell>
                        )}
                        {visibleColumns.village && (
                          <TableCell className="text-center wrap-break-word max-w-[200px]">
                            {issue.village}
                          </TableCell>
                        )}
                        {visibleColumns.majraFaliya && (
                          <TableCell className="text-center wrap-break-word max-w-[200px]">
                            {issue.majraFaliya}
                          </TableCell>
                        )}
                        {visibleColumns.workProblem && (
                          <TableCell className="text-center wrap-break-word max-w-[400px]">
                            {issue.workProblem}
                          </TableCell>
                        )}
                        {visibleColumns.office && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.office}
                          </TableCell>
                        )}
                        {visibleColumns.approximateCost && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.approximateCost}
                          </TableCell>
                        )}
                        {visibleColumns.department && (
                          <TableCell className="text-center wrap-break-word max-w-[200px]">
                            {issue.department}
                          </TableCell>
                        )}
                        {visibleColumns.priority && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.priority}
                          </TableCell>
                        )}
                        {visibleColumns.tsNoDate && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.tsNoDate}
                          </TableCell>
                        )}
                        {visibleColumns.asNoDate && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.asNoDate}
                          </TableCell>
                        )}
                        {visibleColumns.typeOfWork && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.typeOfWork}
                          </TableCell>
                        )}
                        {visibleColumns.subWorkType && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.subWorkType}
                          </TableCell>
                        )}
                        {visibleColumns.middleMen && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.middleMen}
                          </TableCell>
                        )}
                        {visibleColumns.middleManContact && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.middleManContact}
                          </TableCell>
                        )}
                        {visibleColumns.beneficiaryName && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.beneficiaryName}
                          </TableCell>
                        )}
                        {visibleColumns.po && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.po}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell className="text-center w-[120px]">
                            <span
                              className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                                issue.status === "Resolved" ||
                                issue.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : issue.status === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {issue.status || "Pending"}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.remarkGoshana && (
                          <TableCell className="text-center wrap-break-word max-w-[400px]">
                            {issue.remarkGoshana}
                          </TableCell>
                        )}
                        {visibleColumns.remarkTipUsd && (
                          <TableCell className="text-center wrap-break-word max-w-[400px]">
                            {issue.remarkTipUsd}
                          </TableCell>
                        )}
                        {visibleColumns.addedBy && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.addedBy || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.beneficiaryContact && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.beneficiaryContact}
                          </TableCell>
                        )}
                        {visibleColumns.latLng && (
                          <TableCell className="text-center text-[10px] text-gray-500 leading-tight">
                            {(() => {
                              const parts = (
                                issue.latLng || "0.00000000, 0.00000000"
                              ).split(",");
                              return (
                                <div className="flex flex-col items-center">
                                  <span>{parts[0]?.trim()}</span>
                                  <span>{parts[1]?.trim()}</span>
                                </div>
                              );
                            })()}
                          </TableCell>
                        )}
                        {visibleColumns.registrationDate && (
                          <TableCell className="text-center whitespace-nowrap">
                            {issue.registrationDate
                              ? new Date(
                                  issue.registrationDate,
                                ).toLocaleDateString()
                              : issue.createdAt
                                ? new Date(issue.createdAt).toLocaleDateString()
                                : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.avedanFile && (
                          <TableCell className="text-center whitespace-nowrap lowercase">
                            {issue.avedanFile ? (
                              <a
                                href={
                                  issue.avedanFile.startsWith("/")
                                    ? `${API_BASE_URL.replace("/api", "")}${issue.avedanFile}`
                                    : issue.avedanFile
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                title="View Avedan"
                              >
                                <FileImage className="w-5 h-5" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.actions && (
                          <TableCell className="text-center whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`${basePath}/${issue._id}/view`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                {hasPermission(
                                  PERMISSIONS.EDIT_ASSEMBLY_ISSUES,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `${basePath}/${issue._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.DELETE_ASSEMBLY_ISSUES,
                                ) && (
                                  <ConfirmDialog
                                    onConfirm={() => handleDelete(issue._id)}
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
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {!isLoading && issues.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing{" "}
                    {(currentPage - 1) *
                      (entriesPerPage === -1 ? totalCount : entriesPerPage) +
                      1}{" "}
                    to{" "}
                    {entriesPerPage === -1
                      ? totalCount
                      : Math.min(currentPage * entriesPerPage, totalCount)}{" "}
                    of {totalCount} entries
                  </p>
                  <div className="flex items-center gap-3">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(
                        totalCount /
                          (entriesPerPage === -1
                            ? totalCount || 1
                            : entriesPerPage),
                      )}
                      onPageChange={setCurrentPage}
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

export default AssemblyIssueList;
