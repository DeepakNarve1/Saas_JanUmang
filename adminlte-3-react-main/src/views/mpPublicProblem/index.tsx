"use client";
import { useState, useRef, useEffect } from "react";
import axios from "@app/utils/axios";
import { useDebounce } from "@app/hooks/useDebounce";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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
  Download,
  MoreVertical,
  Eye,
  Edit,
  Columns,
  Trash2,
  FileImage,
  Upload,
  Loader2,
  XCircle,
} from "lucide-react";
import { API_BASE_URL } from "@app/utils/api";
import { ContentHeader } from "@app/components";
import { TimerDisplay } from "@app/components/TimerDisplay";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { Pagination } from "@app/components/common/Pagination";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IPublicProblemResponse } from "@app/types/mpPublicProblem";

const MpPublicProblem = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  // Permissions
  const canDelete = hasPermission(PERMISSIONS.DELETE_MP_PUBLIC_PROBLEMS);
  const canCreate = hasPermission(PERMISSIONS.CREATE_MP_PUBLIC_PROBLEMS);
  const canEdit = hasPermission(PERMISSIONS.EDIT_MP_PUBLIC_PROBLEMS);

  // State
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Filters state
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterAssembly, setFilterAssembly] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    regNo: true,
    timer: true,
    year: true,
    month: true,
    date: true,
    district: true,
    assembly: true,
    block: true,
    recLetterNo: true,
    boothNo: true,
    boothName: true,
    panchayatName: true,
    village: true,
    majraFaliya: true,
    workProblem: true,
    office: true,
    approxCost: true,
    department: true,
    priority: true,
    typeOfWork: true,
    middleMen: true,
    middleMenContact: true,
    beneficial: true,
    // beneficialContact removed
    status: true,
    remark: true,
    remarkTipUsd: true,
    addedBy: true,
    beneficialMobile: true,
    latLong: true,
    registrationDate: true,
    avedan: true,
    action: true,
  });

  // Live timer state
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Filters
  const { data: blocks = [] } = useQuery({
    queryKey: ["blocks-list"],
    queryFn: async () => {
      const res = await axios.get("/blocks?limit=-1");
      return res.data?.data || [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments-list"],
    queryFn: async () => {
      const res = await axios.get("/departments?limit=-1");
      return res.data?.data || [];
    },
  });

  const { data: assemblies = [] } = useQuery({
    queryKey: ["assemblies-list"],
    queryFn: async () => {
      const res = await axios.get("/assemblies?limit=-1");
      return res.data?.data || [];
    },
  });

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isRefetching,
  } = useQuery<IPublicProblemResponse>({
    queryKey: [
      "mp-public-problems",
      currentPage,
      entriesPerPage,
      debouncedSearchTerm,
      filterBlock,
      filterAssembly,
      filterYear,
      filterMonth,
      filterDepartment,
      filterStatus,
    ],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
        block: filterBlock === "all" ? undefined : filterBlock,
        assembly: filterAssembly === "all" ? undefined : filterAssembly,
        year: filterYear === "all" ? undefined : filterYear,
        month: filterMonth === "all" ? undefined : filterMonth,
        department: filterDepartment === "all" ? undefined : filterDepartment,
        status: filterStatus === "all" ? undefined : filterStatus,
        search: debouncedSearchTerm || undefined,
      };

      const res = await axios.get("/public-problems", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/public-problems/${id}`);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["mp-public-problems"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete record");
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

      const exportData = dataList.map((item: any, index: number) => {
        const row: any = { "Sr No": index + 1 };

        if (visibleColumns.regNo) row["Regi. No."] = item.regNo || "-";
        if (visibleColumns.year) row["Year"] = item.year || "-";
        if (visibleColumns.month) row["Month"] = item.month || "-";
        if (visibleColumns.date) row["Date"] = item.dateString || "-";
        if (visibleColumns.district) row["District"] = item.district || "-";
        if (visibleColumns.assembly) row["Assembly"] = item.assembly || "-";
        if (visibleColumns.block) row["Block"] = item.block || "-";
        if (visibleColumns.recLetterNo)
          row["Recommended Letter No"] = item.recommendedLetterNo || "-";
        if (visibleColumns.boothNo) row["Booth No"] = item.boothNo || "-";
        if (visibleColumns.boothName) row["Booth Name"] = item.boothName || "-";
        if (visibleColumns.panchayatName)
          row["Gram Panchayat"] = item.panchayatName || "-";
        if (visibleColumns.village) row["Village"] = item.village || "-";
        if (visibleColumns.majraFaliya) row["Faliya"] = item.majraFaliya || "-";
        if (visibleColumns.workProblem)
          row["Work/Problem"] = item.workProblem || "-";
        if (visibleColumns.office) row["Office"] = item.office || "-";
        if (visibleColumns.approxCost)
          row["Approximate Cost"] = item.approxCost || "0";
        if (visibleColumns.department)
          row["Department"] = item.department || "-";
        if (visibleColumns.priority) row["Priority"] = item.priority || "-";
        if (visibleColumns.typeOfWork)
          row["Type Of Work"] = item.typeOfWork || "-";
        if (visibleColumns.status) row["Status"] = item.status || "-";
        if (visibleColumns.remark) row["Remark"] = item.remark || "-";
        if (visibleColumns.remarkTipUsd)
          row["Remark/Tip"] = item.remarkTipUsd || "-";

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "MPPublicProblem");
      XLSX.writeFile(wb, `MPPublicProblem_${Date.now()}.xlsx`);
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

        const keywords = ["regno", "block", "problem", "village", "district"];
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
          regNo: getColIdx(["Regi. No.", "RegNo", "Serial"]),
          year: getColIdx(["Year", "वर्ष"]),
          month: getColIdx(["Month", "महीना"]),
          dateString: getColIdx(["Date", "दिनांक"]),
          district: getColIdx(["District", "जिला"]),
          assembly: getColIdx(["Assembly", "विधानसभा"]),
          block: getColIdx(["Block", "ब्लॉक"]),
          recommendedLetterNo: getColIdx(["Recommended Letter No"]),
          boothNo: getColIdx(["Booth No"]),
          boothName: getColIdx(["Booth Name"]),
          panchayatName: getColIdx(["Gram Panchayat", "Panchayat"]),
          village: getColIdx(["Village", "गाँव"]),
          majraFaliya: getColIdx(["Faliya"]),
          workProblem: getColIdx(["Work/Problem", "Problem"]),
          office: getColIdx(["Office"]),
          approxCost: getColIdx(["Approximate Cost", "Cost"]),
          department: getColIdx(["Department", "विभाग"]),
          priority: getColIdx(["Priority"]),
          typeOfWork: getColIdx(["Type Of Work"]),
          status: getColIdx(["Status"]),
          remark: getColIdx(["Remark"]),
          remarkTipUsd: getColIdx(["Remark/Tip"]),
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
              regNo: getVal(colMap.regNo),
              year: getVal(colMap.year) || new Date().getFullYear().toString(),
              month: getVal(colMap.month),
              dateString: getVal(colMap.dateString),
              district: getVal(colMap.district),
              assembly: getVal(colMap.assembly),
              block: getVal(colMap.block),
              recommendedLetterNo: getVal(colMap.recommendedLetterNo),
              boothNo: getVal(colMap.boothNo),
              boothName: getVal(colMap.boothName),
              panchayatName: getVal(colMap.panchayatName),
              village: getVal(colMap.village),
              majraFaliya: getVal(colMap.majraFaliya),
              workProblem: getVal(colMap.workProblem),
              office: getVal(colMap.office),
              approxCost: getVal(colMap.approxCost),
              department: getVal(colMap.department),
              priority: getVal(colMap.priority),
              typeOfWork: getVal(colMap.typeOfWork),
              status: getVal(colMap.status) || "Pending",
              remark: getVal(colMap.remark),
              remarkTipUsd: getVal(colMap.remarkTipUsd),
            };

            if (!payload.regNo || !payload.district || !payload.block) {
              failureCount++;
              if (!firstErrorMessage) {
                firstErrorMessage = `Missing required fields (Reg No, District, or Block) for row: ${JSON.stringify(row.slice(0, 3))}`;
              }
              continue;
            }

            await axios.post("/public-problems", payload);
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
        queryClient.invalidateQueries({ queryKey: ["mp-public-problems"] });
      } catch (error: unknown) {
        handleError(
          error,
          "Failed to process file. Ensure it's a valid Excel format.",
        );
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setFilterBlock("all");
    setFilterAssembly("all");
    setFilterYear("all");
    setFilterMonth("all");
    setFilterDepartment("all");
    setFilterStatus("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) =>
    (currentYear - 5 + i).toString(),
  );
  const months = [
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

  const data = response?.data || [];
  const totalCount =
    response?.filteredCount !== undefined
      ? response.filteredCount
      : response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title="MP Public Problems Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Reg No, district, block..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
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

                  {canCreate && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/mp-public-problem/create")}
                      disabled={loading}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Entry
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filterBlock}
                  onValueChange={(val) => {
                    setFilterBlock(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Blocks" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                    <SelectItem value="all">All Blocks</SelectItem>
                    {blocks.map((b: any) => (
                      <SelectItem key={b._id} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterAssembly}
                  onValueChange={(val) => {
                    setFilterAssembly(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Assemblies" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                    <SelectItem value="all">All Assemblies</SelectItem>
                    {assemblies.map((a: any) => (
                      <SelectItem key={a._id} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterYear}
                  onValueChange={(val) => {
                    setFilterYear(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                    <SelectItem value="all">All Years</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterMonth}
                  onValueChange={(val) => {
                    setFilterMonth(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterDepartment}
                  onValueChange={(val) => {
                    setFilterDepartment(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d: any) => (
                      <SelectItem key={d._id} value={d.name}>
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
                    value={entriesPerPage.toString()}
                    onValueChange={(v: string) => {
                      setEntriesPerPage(v === "-1" ? -1 : Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                      <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-gray-800">
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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-9 px-3 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />

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
                  className="w-64 max-h-96 overflow-y-auto dark:bg-slate-900 dark:border-gray-800"
                >
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
                        .replace(/^./, (str) => str.toUpperCase())}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/80 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Sr. No.
                      </TableHead>
                    )}
                    {visibleColumns.regNo && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Regi. No.
                      </TableHead>
                    )}
                    {visibleColumns.timer && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Timer
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.month && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Month
                      </TableHead>
                    )}
                    {visibleColumns.date && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Date
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.assembly && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Assembly
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.recLetterNo && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Rec. Letter No
                      </TableHead>
                    )}
                    {visibleColumns.boothNo && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Booth No
                      </TableHead>
                    )}
                    {visibleColumns.boothName && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Booth Name
                      </TableHead>
                    )}
                    {visibleColumns.panchayatName && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Panchayat Name
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.majraFaliya && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Majra/Faliya
                      </TableHead>
                    )}
                    {visibleColumns.workProblem && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Work/Problem
                      </TableHead>
                    )}
                    {visibleColumns.office && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Office
                      </TableHead>
                    )}
                    {visibleColumns.approxCost && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Approx. Cost
                      </TableHead>
                    )}
                    {visibleColumns.department && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Department
                      </TableHead>
                    )}
                    {visibleColumns.priority && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Priority
                      </TableHead>
                    )}
                    {visibleColumns.typeOfWork && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Type of Work
                      </TableHead>
                    )}
                    {visibleColumns.middleMen && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Middle Men
                      </TableHead>
                    )}
                    {visibleColumns.middleMenContact && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Cont No.
                      </TableHead>
                    )}
                    {visibleColumns.beneficial && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Beneficial
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Status
                      </TableHead>
                    )}
                    {visibleColumns.remark && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Remark/Goshana
                      </TableHead>
                    )}
                    {(visibleColumns as any).remarkTipUsd && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Remark/Tip/USD
                      </TableHead>
                    )}
                    {visibleColumns.addedBy && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Added By
                      </TableHead>
                    )}
                    {(visibleColumns as any).beneficialMobile && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Beneficially Mobile
                      </TableHead>
                    )}
                    {(visibleColumns as any).latLong && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Lat-Long
                      </TableHead>
                    )}
                    {(visibleColumns as any).registrationDate && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Registration Date
                      </TableHead>
                    )}
                    {visibleColumns.avedan && (
                      <TableHead className="whitespace-nowrap font-semibold dark:text-gray-200">
                        Avedan
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="whitespace-nowrap font-semibold text-right">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={Object.keys(visibleColumns).length}
                        className="text-center py-10 dark:text-gray-300"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No records match the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, idx) => (
                      <TableRow
                        key={row._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="dark:text-gray-300">
                            {(currentPage - 1) * entriesPerPage + idx + 1}
                          </TableCell>
                        )}
                        {visibleColumns.regNo && (
                          <TableCell className="font-semibold text-gray-900 dark:text-gray-100 italic">
                            {row.regNo}
                          </TableCell>
                        )}
                        {visibleColumns.timer && (
                          <TableCell className="dark:text-gray-300">
                            <TimerDisplay
                              submissionDate={row.submissionDate}
                              now={now}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.year && (
                          <TableCell>{row.year}</TableCell>
                        )}
                        {visibleColumns.month && (
                          <TableCell>{row.month}</TableCell>
                        )}
                        {visibleColumns.date && (
                          <TableCell>{row.dateString}</TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell>{row.district}</TableCell>
                        )}
                        {visibleColumns.assembly && (
                          <TableCell>{row.assembly}</TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>{row.block}</TableCell>
                        )}
                        {visibleColumns.recLetterNo && (
                          <TableCell>{row.recommendedLetterNo}</TableCell>
                        )}
                        {visibleColumns.boothNo && (
                          <TableCell>{row.boothNo}</TableCell>
                        )}
                        {visibleColumns.boothName && (
                          <TableCell>{row.boothName}</TableCell>
                        )}
                        {visibleColumns.panchayatName && (
                          <TableCell>{row.panchayatName}</TableCell>
                        )}
                        {visibleColumns.village && (
                          <TableCell>{row.village}</TableCell>
                        )}
                        {visibleColumns.majraFaliya && (
                          <TableCell>{row.majraFaliya}</TableCell>
                        )}
                        {visibleColumns.workProblem && (
                          <TableCell>{row.workProblem}</TableCell>
                        )}
                        {visibleColumns.office && (
                          <TableCell>{row.office}</TableCell>
                        )}
                        {visibleColumns.approxCost && (
                          <TableCell>{row.approximateCost}</TableCell>
                        )}
                        {visibleColumns.department && (
                          <TableCell>{row.department}</TableCell>
                        )}
                        {visibleColumns.priority && (
                          <TableCell>{row.priority}</TableCell>
                        )}
                        {visibleColumns.typeOfWork && (
                          <TableCell>{row.typeOfWork}</TableCell>
                        )}
                        {visibleColumns.middleMen && (
                          <TableCell>{row.middleMen}</TableCell>
                        )}
                        {visibleColumns.middleMenContact && (
                          <TableCell>{row.middleMenContactNo}</TableCell>
                        )}
                        {visibleColumns.beneficial && (
                          <TableCell>{row.beneficialName}</TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell className="dark:text-gray-300">
                            <span
                              className={`whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                row.status === "Resolved"
                                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                  : row.status === "Rejected"
                                    ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.remark && (
                          <TableCell>{row.remarkGoshana}</TableCell>
                        )}
                        {(visibleColumns as any).remarkTipUsd && (
                          <TableCell>{(row as any).remarkTipUsd}</TableCell>
                        )}
                        {visibleColumns.addedBy && (
                          <TableCell>{row.addedBy}</TableCell>
                        )}
                        {(visibleColumns as any).beneficialMobile && (
                          <TableCell>{row.beneficialMobile}</TableCell>
                        )}
                        {(visibleColumns as any).latLong && (
                          <TableCell className="dark:text-gray-300">
                            {(row as any).startLat && (row as any).startLong
                              ? `${(row as any).startLat}, ${(row as any).startLong}`
                              : ""}
                          </TableCell>
                        )}
                        {(visibleColumns as any).registrationDate && (
                          <TableCell className="dark:text-gray-300">
                            {(row as any).savedAt
                              ? new Date(
                                  (row as any).savedAt,
                                ).toLocaleDateString()
                              : ""}
                          </TableCell>
                        )}
                        {visibleColumns.avedan && (
                          <TableCell className="dark:text-gray-300">
                            {row.avedan ? (
                              <a
                                href={
                                  row.avedan.startsWith("/")
                                    ? `${API_BASE_URL.replace("/api", "")}${row.avedan}`
                                    : row.avedan
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                title="View Image"
                              >
                                <FileImage className="w-5 h-5" />
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="dark:bg-slate-900 dark:border-gray-800"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/mp-public-problem/${row._id}`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                {canEdit && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/mp-public-problem/${row._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {canDelete && (
                                  <ConfirmDialog
                                    onConfirm={() => handleDelete(row._id)}
                                    trigger={
                                      <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-red-50 focus:bg-red-50 text-red-600 hover:text-red-700 w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />{" "}
                                        Delete
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

            {/* Pagination */}
            {!isLoading && data.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing{" "}
                    {entriesPerPage === -1
                      ? 1
                      : Math.min(
                          (currentPage - 1) * entriesPerPage + 1,
                          totalCount,
                        )}{" "}
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

export default MpPublicProblem;
