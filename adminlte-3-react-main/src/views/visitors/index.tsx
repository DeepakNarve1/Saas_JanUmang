"use client";
import { useState, useRef } from "react";
import axios from "@app/utils/axios";
import { useDebounce } from "@app/hooks/useDebounce";
import { toast } from "react-toastify";
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
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Columns,
  Trash2,
  Loader2,
} from "lucide-react";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { usePermissions } from "@app/hooks/usePermissions";
import { Pagination } from "@app/components/common/Pagination";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IVisitorResponse } from "@app/types/visitor";
import { PERMISSIONS } from "@app/config/permissions";

const Visitors = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const canDelete = hasPermission(PERMISSIONS.DELETE_VISITORS);
  const canCreate = hasPermission(PERMISSIONS.CREATE_VISITORS);
  const canEdit = hasPermission(PERMISSIONS.EDIT_VISITORS);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // State for temporary filters
  const [tempDistrict, setTempDistrict] = useState("all");
  const [tempVidhansabha, setTempVidhansabha] = useState("all");
  const [tempBlock, setTempBlock] = useState("all");

  // State for applied filters
  const [appliedDistrict, setAppliedDistrict] = useState("all");
  const [appliedVidhansabha, setAppliedVidhansabha] = useState("all");
  const [appliedBlock, setAppliedBlock] = useState("all");

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    district: true,
    vidhansabha: true,
    block: true,
    date: true,
    time: true,
    name: true,
    category: true,
    post: true,
    place: true,
    mobile: true,
    incomingVisitor: true,
    message: true,
    visitorType: true,
    attendBy: true,
    remarks: true,
    bhaiyakanirdesh: true,
    addedBy: true,
    organization: isSuperAdmin(),
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch Filters
  const { data: districts = [] } = useQuery({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const res = await axios.get("/districts?limit=-1");
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
    isRefetching,
  } = useQuery<IVisitorResponse>({
    queryKey: [
      "visitors",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      appliedDistrict,
      appliedVidhansabha,
      appliedBlock,
    ],
    queryFn: async () => {
      const selectedDistrictObj = districts.find(
        (d: any) => d.name === appliedDistrict,
      );
      const selectedAssemblyObj = assemblies.find(
        (a: any) => a.name === appliedVidhansabha,
      );
      const selectedBlockObj = blocks.find((b: any) => b.name === appliedBlock);

      const params: any = {
        page: pagination.page,
        limit: pagination.limit === -1 ? 1000 : pagination.limit,
        search: debouncedSearchTerm || undefined,
        district: appliedDistrict === "all" ? undefined : appliedDistrict,
        districtName: appliedDistrict === "all" ? undefined : appliedDistrict,
        districtId:
          appliedDistrict === "all" ? undefined : selectedDistrictObj?._id,
        vidhansabha:
          appliedVidhansabha === "all" ? undefined : appliedVidhansabha,
        vidhansabhaName:
          appliedVidhansabha === "all" ? undefined : appliedVidhansabha,
        vidhansabhaId:
          appliedVidhansabha === "all" ? undefined : selectedAssemblyObj?._id,
        vidhanSabha:
          appliedVidhansabha === "all" ? undefined : appliedVidhansabha,
        vidhanSabhaName:
          appliedVidhansabha === "all" ? undefined : appliedVidhansabha,
        assembly: appliedVidhansabha === "all" ? undefined : appliedVidhansabha,
        assemblyName:
          appliedVidhansabha === "all" ? undefined : appliedVidhansabha,
        assemblyId:
          appliedVidhansabha === "all" ? undefined : selectedAssemblyObj?._id,
        block: appliedBlock === "all" ? undefined : appliedBlock,
        blockName: appliedBlock === "all" ? undefined : appliedBlock,
        blockId: appliedBlock === "all" ? undefined : selectedBlockObj?._id,
        blockname: appliedBlock === "all" ? undefined : appliedBlock,
        districtname: appliedDistrict === "all" ? undefined : appliedDistrict,
        vidhansabhaname:
          appliedVidhansabha === "all" ? undefined : appliedVidhansabha,
      };

      const res = await axios.get("/visitors", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/visitors/${id}`);
    },
    onSuccess: () => {
      toast.success("Visitor deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete visitor");
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
      const exportData = dataList.map((v, index) => ({
        "Sr No": index + 1,
        District: v.district || "-",
        Vidhansabha: v.vidhansabha || "-",
        Block: v.block || "-",
        Date: v.date || "-",
        Time: v.time || "-",
        Name: v.name || "-",
        Category: v.category || "-",
        Post: v.post || "-",
        Place: v.place || "-",
        "Mobile Number": v.mobileNumber || "-",
        "Incoming/Visitor": v.incomingVisitor || "-",
        Message: v.message || "-",
        "Visitor Type": v.visitorType || "-",
        "Attend By": v.attendBy || "-",
        Remarks: v.remarks || "-",
        "Bhaiya Ka Nirdesh": v.bhaiyakanirdesh || "-",
        "Added By": v.addedBy || "-",
        Organization: (v.tenantId && typeof v.tenantId === "object") ? v.tenantId.name : "Platform"
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Visitors");
      XLSX.writeFile(wb, `Visitors_${Date.now()}.xlsx`);
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

        const keywords = ["district", "vidhansabha", "block", "name", "mobile"];
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
          district: getColIdx(["District", "जिला"]),
          vidhansabha: getColIdx(["Vidhansabha", "विधानसभा"]),
          block: getColIdx(["Block", "ब्लॉक"]),
          date: getColIdx(["Date", "दिनांक"]),
          time: getColIdx(["Time", "समय"]),
          name: getColIdx(["Name", "नाम"]),
          category: getColIdx(["Category", "वर्ग", "श्रेणी"]),
          post: getColIdx(["Post", "पद"]),
          place: getColIdx(["Place", "स्थान"]),
          mobileNumber: getColIdx(["Mobile Number", "Mobile", "मोबाइल"]),
          incomingVisitor: getColIdx(["Incoming/Visitor", "In-coming/Visitor"]),
          message: getColIdx(["Message", "संदेश"]),
          visitorType: getColIdx(["Visitor Type"]),
          attendBy: getColIdx(["Attend By", "किसने अटेंड किया"]),
          remarks: getColIdx(["Remarks", "REMARK"]),
          bhaiyakanirdesh: getColIdx(["Bhaiya Ka Nirdesh", "भईया के निर्देश"]),
          addedBy: getColIdx(["Added By", "जोड़ने वाला"]),
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
              district: getVal(colMap.district),
              vidhansabha: getVal(colMap.vidhansabha),
              block: getVal(colMap.block),
              date: getVal(colMap.date) || new Date().toLocaleDateString(),
              time: getVal(colMap.time) || new Date().toLocaleTimeString(),
              name: getVal(colMap.name),
              category: getVal(colMap.category),
              post: getVal(colMap.post),
              place: getVal(colMap.place),
              mobileNumber: getVal(colMap.mobileNumber),
              incomingVisitor:
                getVal(colMap.incomingVisitor).toUpperCase() || "VISITOR",
              message: getVal(colMap.message),
              visitorType: getVal(colMap.visitorType),
              attendBy: getVal(colMap.attendBy),
              remarks: getVal(colMap.remarks),
              bhaiyakanirdesh: getVal(colMap.bhaiyakanirdesh),
              addedBy: getVal(colMap.addedBy) || "System Import",
            };

            // Basic validation for required fields
            if (!payload.name || !payload.district || !payload.block) {
              failureCount++;
              if (!firstErrorMessage) {
                firstErrorMessage = `Missing required fields (Name, District, or Block) for row: ${JSON.stringify(row.slice(0, 3))}`;
              }
              continue;
            }

            await axios.post("/visitors", payload);
            successCount++;
          } catch (error: unknown) {
            if (!firstErrorMessage) {
              firstErrorMessage = `Row ${successCount + failureCount + 1} import failed`;
            }
            handleError(
              error,
              `Import: Failed to add row ${successCount + failureCount + 1}`,
            );
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
        queryClient.invalidateQueries({ queryKey: ["visitors"] });
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

  const data = response?.data || [];
  const totalCount =
    response?.filteredCount !== undefined
      ? response.filteredCount
      : response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title="Visitors Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Action Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Name, Mobile, District..."
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

                  {canCreate && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/visitors/create")}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Visitor
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={tempDistrict}
                  onValueChange={(val) => setTempDistrict(val)}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {districts.map((d: any) => (
                      <SelectItem key={d._id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={tempVidhansabha}
                  onValueChange={(val) => setTempVidhansabha(val)}
                >
                  <SelectTrigger className="w-40 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Vidhansabha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vidhansabha</SelectItem>
                    {assemblies.map((a: any) => (
                      <SelectItem key={a._id} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={tempBlock}
                  onValueChange={(val) => setTempBlock(val)}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    {blocks.map((b: any) => (
                      <SelectItem key={b._id} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    setAppliedDistrict(tempDistrict);
                    setAppliedVidhansabha(tempVidhansabha);
                    setAppliedBlock(tempBlock);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="h-9 bg-[#368F8B] hover:bg-[#2d7a76] text-white px-4"
                >
                  Filter
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setTempDistrict("all");
                    setTempVidhansabha("all");
                    setTempBlock("all");
                    setAppliedDistrict("all");
                    setAppliedVidhansabha("all");
                    setAppliedBlock("all");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="h-9 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                >
                  Clear
                </Button>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                    Show
                  </span>
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(v) => {
                      setPagination((prev) => ({
                        ...prev,
                        limit: Number(v),
                        page: 1,
                      }));
                    }}
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

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start items-center gap-4">
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
                  className="w-64 max-h-96 overflow-y-auto"
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
                      {key.replace(/([A-Z])/g, " $1").trim()}
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
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Sr. No.
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.vidhansabha && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Vidhansabha
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.date && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Date
                      </TableHead>
                    )}
                    {visibleColumns.time && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Time
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Name
                      </TableHead>
                    )}
                    {visibleColumns.category && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Category
                      </TableHead>
                    )}
                    {visibleColumns.post && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Post
                      </TableHead>
                    )}
                    {visibleColumns.place && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Place
                      </TableHead>
                    )}
                    {visibleColumns.mobile && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Mobile No.
                      </TableHead>
                    )}
                    {visibleColumns.incomingVisitor && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        In-coming/Visitor
                      </TableHead>
                    )}
                    {visibleColumns.message && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Message
                      </TableHead>
                    )}
                    {visibleColumns.visitorType && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Visitor Type
                      </TableHead>
                    )}
                    {visibleColumns.attendBy && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Attend by
                      </TableHead>
                    )}
                    {visibleColumns.remarks && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        REMARK (क्या कारवाही की गई)
                      </TableHead>
                    )}
                    {visibleColumns.bhaiyakanirdesh && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        भईया के निर्देश
                      </TableHead>
                    )}
                    {visibleColumns.addedBy && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Added By
                      </TableHead>
                    )}
                    {visibleColumns.organization && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Organization
                      </TableHead>
                    )}
                    <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading || isRefetching ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell
                          colSpan={
                            Object.values(visibleColumns).filter(Boolean).length + 1
                          }
                        >
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length + 1
                        }
                        className="text-center py-20 text-red-500 font-medium"
                      >
                        Failed to fetch visitors. Please try again.
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length + 1
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No visitors found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row, idx) => (
                      <TableRow
                        key={row._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell>
                            {(pagination.page - 1) * pagination.limit + idx + 1}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell>{row.district}</TableCell>
                        )}
                        {visibleColumns.vidhansabha && (
                          <TableCell>{row.vidhansabha}</TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>{row.block}</TableCell>
                        )}
                        {visibleColumns.date && (
                          <TableCell>{row.date || "-"}</TableCell>
                        )}
                        {visibleColumns.time && (
                          <TableCell>{row.time || "-"}</TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="font-medium">
                            {row.name}
                          </TableCell>
                        )}
                        {visibleColumns.category && (
                          <TableCell>{row.category}</TableCell>
                        )}
                        {visibleColumns.post && (
                          <TableCell>{row.post || "-"}</TableCell>
                        )}
                        {visibleColumns.place && (
                          <TableCell>{row.place || "-"}</TableCell>
                        )}
                        {visibleColumns.mobile && (
                          <TableCell>{row.mobileNumber}</TableCell>
                        )}
                        {visibleColumns.incomingVisitor && (
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                row.incomingVisitor === "INCOMING"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {row.incomingVisitor}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.message && (
                          <TableCell
                            className="max-w-xs truncate"
                            title={row.message}
                          >
                            {row.message}
                          </TableCell>
                        )}
                        {visibleColumns.visitorType && (
                          <TableCell>{row.visitorType}</TableCell>
                        )}
                        {visibleColumns.attendBy && (
                          <TableCell>{row.attendBy}</TableCell>
                        )}
                        {visibleColumns.remarks && (
                          <TableCell
                            className="max-w-xs truncate"
                            title={row.remarks}
                          >
                            {row.remarks || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.bhaiyakanirdesh && (
                          <TableCell
                            className="max-w-xs truncate"
                            title={row.bhaiyakanirdesh}
                          >
                            {row.bhaiyakanirdesh || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.addedBy && (
                          <TableCell>{row.addedBy}</TableCell>
                        )}
                        {visibleColumns.organization && (
                          <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                            {row.tenantId && typeof row.tenantId === "object"
                              ? row.tenantId?.name
                              : "Platform"}
                          </TableCell>
                        )}

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/visitors/${row._id}/view`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              {canEdit && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/visitors/${row._id}/edit`)
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                                {canDelete && (
                                  <ConfirmDialog
                                    title="Delete Visitor"
                                    description="Are you sure you want to delete this visitor? This action cannot be undone."
                                    onConfirm={() => handleDelete(row._id)}
                                    trigger={
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    }
                                  />
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, totalCount)} of{" "}
                  {totalCount} visitors
                </p>
                <div className="order-1 sm:order-2">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={Math.ceil(
                      totalCount / (pagination.limit === -1 ? 1 : pagination.limit),
                    )}
                    onPageChange={(page) =>
                      setPagination((prev) => ({ ...prev, page }))
                    }
                    activeColor="bg-[#368F8B]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Visitors;
