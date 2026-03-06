"use client";

import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { useState, useRef } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { usePermissions } from "@app/hooks/usePermissions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@app/components/ui/dialog";
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
  Download,
  Trash2,
  Upload,
  X,
  Loader2,
  Edit,
  Eye,
  Columns,
} from "lucide-react";
import { Pagination } from "@app/components/common/Pagination";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { ISamitiResponse } from "@app/types/vidhasabhaSamiti";

interface SamitiListProps {
  title: string;
  apiEndpoint: string;
  resourceName: string;
  basePath: string;
}

const SamitiList = ({
  title,
  apiEndpoint,
  resourceName,
  basePath,
}: SamitiListProps) => {
  return (
    <RouteGuard requiredPermissions={[`view_${resourceName}`]}>
      <SamitiListContent
        title={title}
        apiEndpoint={apiEndpoint}
        resourceName={resourceName}
        basePath={basePath}
      />
    </RouteGuard>
  );
};

const SamitiListContent = ({
  title,
  apiEndpoint,
  resourceName,
  basePath,
}: SamitiListProps) => {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isBhagoria = resourceName === "bhagoria_samiti";

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    uniqueId: true,
    block: true,
    year: !isBhagoria,
    acMpNo: !isBhagoria,
    sector: !isBhagoria,
    microSector: !isBhagoria,
    booth: !isBhagoria,
    gramPanchayat: !isBhagoria,
    village: !isBhagoria,
    faliya: !isBhagoria,
    totalMembers: !isBhagoria,
    image: !isBhagoria,
    date: isBhagoria,
    day: isBhagoria,
    bhagoriaHat: isBhagoria,
    numberOfDol: isBhagoria,
    inChargeName: isBhagoria,
    mobileNumber: isBhagoria,
    remark: isBhagoria,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Blocks
  const { data: blocksMap = {} } = useQuery({
    queryKey: ["blocks-map"],
    queryFn: async () => {
      const { data } = await axios.get("/blocks?limit=-1");
      const map: { [key: string]: string } = {};
      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((block: any) => {
          map[block._id] = block.name;
        });
      }
      return map;
    },
  });

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<ISamitiResponse>({
    queryKey: [apiEndpoint, currentPage, entriesPerPage, debouncedSearchTerm],
    queryFn: async () => {
      const url = `/${apiEndpoint}`;
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
        search: debouncedSearchTerm || undefined,
      };
      const { data } = await axios.get(url, { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/${apiEndpoint}/${id}`);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete record");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      // Fetch all records without pagination for export
      const { data: allDataResponse } = await axios.get(`/${apiEndpoint}`, {
        params: { limit: -1 },
      });

      const dataList = allDataResponse?.data || [];
      if (dataList.length === 0) {
        setLoading(false);
        return toast.warning("No data to export");
      }

      const XLSX = await import("xlsx");

      // Format data for export based on visibility and type
      const exportData = dataList.map((item: any, index: number) => {
        const row: any = { "Sr No": index + 1 };

        if (isBhagoria) {
          if (visibleColumns.uniqueId) row["Serial No"] = item.uniqueId || "-";
          if (visibleColumns.block)
            row["Block"] = blocksMap[item.block] || item.block || "-";
          if (visibleColumns.date)
            row["Date"] = item.date
              ? new Date(item.date).toLocaleDateString()
              : "-";
          if (visibleColumns.day) row["Day"] = item.day || "-";
          if (visibleColumns.bhagoriaHat)
            row["Bhagoria Hat"] = item.bhagoriaHat || "-";
          if (visibleColumns.numberOfDol)
            row["Number of Dol"] = item.numberOfDol || "-";
          if (visibleColumns.inChargeName)
            row["In-charge Name"] = item.inChargeName || "-";
          if (visibleColumns.mobileNumber)
            row["Mobile Number"] = item.mobileNumber || "-";
          if (visibleColumns.remark) row["Remark"] = item.remark || "-";
        } else {
          if (visibleColumns.uniqueId) row["Unique ID"] = item.uniqueId || "-";
          if (visibleColumns.year) row["वर्ष (Year)"] = item.year || "-";
          if (visibleColumns.acMpNo) row["AC/MP No."] = item.acMpNo || "-";
          if (visibleColumns.block)
            row["ब्लॉक (Block)"] = blocksMap[item.block] || item.block || "-";
          if (visibleColumns.sector)
            row["सेक्टर (Sector)"] = item.sector || "-";
          if (visibleColumns.microSector) {
            row["माइक्रो सेक्टर नं (Micro Sector No)"] =
              item.microSectorNo || "-";
            row["माइक्रो सेक्टर नाम (Micro Sector Name)"] =
              item.microSectorName || "-";
          }
          if (visibleColumns.booth) {
            row["बूथ का नाम (Booth Name)"] = item.boothName || "-";
            row["बूथ नं (Booth No)"] = item.boothNo || "-";
          }
          if (visibleColumns.gramPanchayat)
            row["ग्राम पंचायत (Gram Panchayat)"] = item.gramPanchayat || "-";
          if (visibleColumns.village)
            row["गाँव का नाम (Village)"] = item.village || "-";
          if (visibleColumns.faliya) row["फलिया (Faliya)"] = item.faliya || "-";
          if (visibleColumns.totalMembers)
            row["कुल सदस्य (Total Members)"] = item.totalMembers || "0";
        }

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title);
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

        // Get raw data as 2D array
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        if (rawRows.length === 0) {
          toast.warning("No data found in Excel file");
          setLoading(false);
          return;
        }

        // Helper to normalize strings for matching
        const normalize = (s: any) =>
          String(s || "")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9\u0900-\u097f]/g, "");

        // Find the header row by searching for keywords
        const keywords = [
          "block",
          "uniqueid",
          "boothname",
          "year",
          "ब्लॉक",
          "बूथ",
          "वर्ष",
        ];
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

        // Fallback to row 0 if no header row found
        if (headerRowIndex === -1) headerRowIndex = 0;

        const headers = rawRows[headerRowIndex].map((h) => String(h || ""));
        const dataRows = rawRows.slice(headerRowIndex + 1);

        // Map column indices to our target fields
        const getColIdx = (targets: string[]) => {
          const normTargets = targets.map(normalize);
          // 1. Exact normalized match
          let idx = headers.findIndex((h) =>
            normTargets.includes(normalize(h)),
          );
          if (idx !== -1) return idx;

          // 2. Partial match
          idx = headers.findIndex((h) => {
            const nh = normalize(h);
            return (
              nh && normTargets.some((t) => nh.includes(t) || t.includes(nh))
            );
          });
          return idx;
        };

        // Pre-detect column mapping
        const colMap: any = {};
        if (isBhagoria) {
          colMap.uniqueId = getColIdx([
            "Serial No",
            "Sr No",
            "क्र.",
            "uniqueId",
            "Unique ID",
          ]);
          colMap.block = getColIdx(["Block", "ब्लॉक", "ब्लॉक (Block)"]);
          colMap.date = getColIdx(["Date", "दिनांक", "दिनांक (Date)"]);
          colMap.day = getColIdx(["Day", "वार", "वार (Day)"]);
          colMap.bhagoriaHat = getColIdx([
            "Bhagoria Hat",
            "भगोरिया हाट",
            "भगोरिया हाट (Bhagoria Hat)",
            "Hat",
          ]);
          colMap.numberOfDol = getColIdx([
            "Number of Dol",
            "डोल की संख्या",
            "डोल की संख्या (Number of Dol)",
            "Dol",
          ]);
          colMap.inChargeName = getColIdx([
            "In-charge Name",
            "प्रभारी का नाम",
            "प्रभारी का नाम (In-charge Name)",
            "Incharge",
          ]);
          colMap.mobileNumber = getColIdx([
            "Mobile Number",
            "मोबाइल नम्बर",
            "मोबाइल नम्बर (Mobile Number)",
            "Mobile",
          ]);
          colMap.remark = getColIdx(["Remark", "रिमार्क", "रिमार्क (Remark)"]);
        } else {
          colMap.uniqueId = getColIdx([
            "Unique ID",
            "uniqueId",
            "यूनिक आईडी",
            "SrNo",
          ]);
          colMap.year = getColIdx(["Year", "वर्ष", "वर्ष (Year)"]);
          colMap.acMpNo = getColIdx(["AC/MP No.", "acMpNo", "AC/MP"]);
          colMap.block = getColIdx(["Block", "ब्लॉक", "ब्लॉक (Block)"]);
          colMap.sector = getColIdx(["Sector", "सेक्टर", "सेक्टर (Sector)"]);
          colMap.msNo = getColIdx([
            "Micro Sector No.",
            "माइक्रो सेक्टर नं",
            "माइक्रो सेक्टर नं (Micro Sector No)",
          ]);
          colMap.msName = getColIdx([
            "Micro Sector Name",
            "माइक्रो सेक्टर नाम",
            "माइक्रो सेक्टर नाम (Micro Sector Name)",
          ]);
          colMap.boothName = getColIdx([
            "Booth Name",
            "बूथ का नाम",
            "बूथ का नाम (Booth Name)",
            "BoothName",
          ]);
          colMap.boothNo = getColIdx([
            "Booth No.",
            "बूथ नं",
            "बूथ नं (Booth No)",
          ]);
          colMap.gramPanchayat = getColIdx([
            "Gram Panchayat",
            "ग्राम पंचायत",
            "ग्राम पंचायत (Gram Panchayat)",
          ]);
          colMap.village = getColIdx([
            "Village",
            "गाँव का नाम",
            "गाँव का नाम (Village)",
          ]);
          colMap.faliya = getColIdx(["Faliya", "फलिया", "फलिया (Faliya)"]);
          colMap.totalMembers = getColIdx([
            "Total Members",
            "कुल सदस्य",
            "कुल सदस्य (Total Members)",
          ]);

          // Support for combined columns if specific ones not found
          colMap.boothCombined = getColIdx([
            "Booth (Name / No)",
            "Booth (Name/No)",
          ]);
          colMap.msCombined = getColIdx([
            "Micro Sector (No / Name)",
            "Micro Sector (No/Name)",
          ]);
        }

        // Reverse block map for resolution
        const reverseBlocksMap: { [key: string]: string } = {};
        Object.entries(blocksMap).forEach(([id, name]) => {
          reverseBlocksMap[name.toLowerCase().trim()] = id;
        });

        let successCount = 0;
        let failureCount = 0;
        let firstErrorMessage = "";

        for (const row of dataRows) {
          try {
            // Skip empty rows
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
              if (colIdx === -1) return "";
              const val = row[colIdx];
              return val !== null && val !== undefined
                ? String(val).trim()
                : "";
            };

            let payload: any = {};
            const blockValRaw = getVal(colMap.block);
            const blockId =
              reverseBlocksMap[blockValRaw.toLowerCase()] || blockValRaw;

            if (isBhagoria) {
              const rawSerial = getVal(colMap.uniqueId);
              const cleanUniqueId =
                ["", "n/a", "none", "-", "null"].includes(
                  rawSerial.toLowerCase(),
                ) || !isNaN(Number(rawSerial))
                  ? undefined
                  : rawSerial;

              payload = {
                uniqueId: cleanUniqueId,
                block: blockId,
                date: getVal(colMap.date),
                day: getVal(colMap.day),
                bhagoriaHat: getVal(colMap.bhagoriaHat),
                numberOfDol: getVal(colMap.numberOfDol),
                inChargeName: getVal(colMap.inChargeName),
                mobileNumber: getVal(colMap.mobileNumber),
                remark: getVal(colMap.remark),
              };
            } else {
              let boothName = getVal(colMap.boothName);
              let boothNo = getVal(colMap.boothNo);
              const boothCombined = getVal(colMap.boothCombined);

              if (!boothName && boothCombined) {
                const parts = boothCombined.split("/");
                boothName = parts[0]?.trim() || "";
                boothNo = parts[1]?.trim() || "";
              }

              let msNo = getVal(colMap.msNo);
              let msName = getVal(colMap.msName);
              const msCombined = getVal(colMap.msCombined);

              if (!msNo && msCombined) {
                const parts = msCombined.split("/");
                msNo = parts[0]?.trim() || "";
                msName = parts[1]?.trim() || "";
              }

              const rawId = getVal(colMap.uniqueId);
              // If ID is a simple number < 10000, it's likely a row index, ignore it for auto-gen
              const cleanUniqueId =
                ["", "n/a", "none", "-", "null"].includes(
                  rawId.toLowerCase(),
                ) ||
                (!isNaN(Number(rawId)) && Number(rawId) < 10000)
                  ? undefined
                  : rawId;

              payload = {
                uniqueId: cleanUniqueId,
                year: getVal(colMap.year),
                acMpNo: getVal(colMap.acMpNo),
                block: blockId,
                sector: getVal(colMap.sector),
                microSectorNo: msNo,
                microSectorName: msName,
                boothName: boothName,
                boothNo: boothNo,
                gramPanchayat: getVal(colMap.gramPanchayat),
                village: getVal(colMap.village),
                faliya: getVal(colMap.faliya),
                totalMembers: getVal(colMap.totalMembers),
              };

              // Basic validation
              if (!payload.block && !payload.boothName) {
                failureCount++;
                if (!firstErrorMessage) {
                  const detected = Object.entries(colMap)
                    .filter(([k, v]) => (v as number) !== -1)
                    .map(([k]) => k)
                    .join(", ");
                  firstErrorMessage = `Missing Block/Booth. Columns mapped: [${detected}]. Raw row: ${JSON.stringify(row.slice(0, 5))}`;
                }
                continue;
              }
            }

            await axios.post(`/${apiEndpoint}`, payload);
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
        queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
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

  const dataList = response?.data || [];
  // Handle filteredCount if present, otherwise explicit fallbacks
  const totalCount =
    response?.filteredCount !== undefined
      ? response.filteredCount
      : response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title={`${title} List`} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Block, Code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  />
                </div>

                <div className="flex items-center gap-3">
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
                      <Upload className="w-5 h-5 mr-2" />
                    )}{" "}
                    Import
                  </Button>
                  {hasPermission(`create_${resourceName}`) && (
                    <Button
                      size="lg"
                      onClick={() => router.push(`${basePath}/create`)}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add New Record
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination/Filter Controls */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="-1">All</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  entries
                </span>
              </div>
            </div>

            {/* Column Visibility */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start bg-white dark:bg-card">
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
                        .replace(/^./, (str) => str.toUpperCase())
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
                  <TableRow className="bg-[#368F8B] dark:bg-[#368F8B] hover:bg-transparent border-gray-200 dark:border-gray-800">
                    <TableHead className="text-white font-semibold whitespace-nowrap w-12 uppercase tracking-wider text-xs">
                      Sr No
                    </TableHead>
                    {visibleColumns.uniqueId && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Unique ID
                      </TableHead>
                    )}
                    {visibleColumns.year && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Year
                      </TableHead>
                    )}
                    {visibleColumns.image && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Image
                      </TableHead>
                    )}
                    {visibleColumns.acMpNo && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        AC/MP No.
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.sector && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Sector
                      </TableHead>
                    )}
                    {visibleColumns.microSector && (
                      <TableHead className="text-white font-semibold whitespace-nowrap text-center uppercase tracking-wider text-xs">
                        <div>Micro Sector</div>
                        <div className="text-[10px] opacity-75">
                          (No / Name)
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.booth && (
                      <TableHead className="text-white font-semibold whitespace-nowrap text-center uppercase tracking-wider text-xs">
                        <div>Booth</div>
                        <div className="text-[10px] opacity-75">
                          (Name / No)
                        </div>
                      </TableHead>
                    )}
                    {visibleColumns.gramPanchayat && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Gram Panchayat
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.faliya && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Faliya
                      </TableHead>
                    )}
                    {visibleColumns.totalMembers && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Total Members
                      </TableHead>
                    )}

                    {/* Bhagoria Specific Headers */}
                    {visibleColumns.date && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Date
                      </TableHead>
                    )}
                    {visibleColumns.day && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Day
                      </TableHead>
                    )}
                    {visibleColumns.bhagoriaHat && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Bhagoria Hat
                      </TableHead>
                    )}
                    {visibleColumns.numberOfDol && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        No of Dol
                      </TableHead>
                    )}
                    {visibleColumns.inChargeName && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        In-Charge
                      </TableHead>
                    )}
                    {visibleColumns.mobileNumber && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Mobile
                      </TableHead>
                    )}
                    {visibleColumns.remark && (
                      <TableHead className="text-white font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                        Remark
                      </TableHead>
                    )}

                    <TableHead className="text-white dark:text-gray-400 text-center font-semibold whitespace-nowrap uppercase tracking-wider text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-10">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-20 text-red-500"
                      >
                        Failed to fetch data
                      </TableCell>
                    </TableRow>
                  ) : dataList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={13}
                        className="text-center py-20 text-gray-500"
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataList.map((item, index) => {
                      // Find block name
                      let blockName = item.block;
                      if (item.block && typeof item.block === "object") {
                        blockName = (item.block as any).name || "N/A";
                      } else if (blocksMap[item.block]) {
                        blockName = blocksMap[item.block];
                      }

                      return (
                        <TableRow
                          key={item._id}
                          className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800"
                        >
                          <TableCell className="text-center font-medium text-gray-900 dark:text-gray-100">
                            {(currentPage - 1) *
                              (entriesPerPage === -1 ? 0 : entriesPerPage) +
                              index +
                              1}
                          </TableCell>
                          {visibleColumns.uniqueId && (
                            <TableCell className="text-center font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">
                              {item.uniqueId || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.year && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.year || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.image && (
                            <TableCell className="whitespace-nowrap">
                              {item.image ? (
                                <NextImage
                                  src={item.image}
                                  alt="Thumbnail"
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 object-cover rounded cursor-pointer border border-gray-200"
                                  onClick={() => setSelectedImage(item.image!)}
                                />
                              ) : (
                                <span className="text-xs text-gray-400">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                          )}
                          {visibleColumns.acMpNo && (
                            <TableCell className="text-center whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.acMpNo || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.block && (
                            <TableCell className="text-center whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {blockName || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.sector && (
                            <TableCell className="text-center whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.sector || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.microSector && (
                            <TableCell className="whitespace-nowrap text-center">
                              <div className="font-medium text-gray-900 dark:text-gray-200">
                                {item.microSectorNo || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.microSectorName || "N/A"}
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.booth && (
                            <TableCell className="whitespace-nowrap text-center">
                              <div className="font-medium text-gray-900 dark:text-gray-200">
                                {item.boothName || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.boothNo || "N/A"}
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.gramPanchayat && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.gramPanchayat || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.village && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.village || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.faliya && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.faliya || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.totalMembers && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.totalMembers || "N/A"}
                            </TableCell>
                          )}

                          {/* Bhagoria Specific Cells */}
                          {visibleColumns.date && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.date || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.day && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.day || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.bhagoriaHat && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.bhagoriaHat || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.numberOfDol && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.numberOfDol || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.inChargeName && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.inChargeName || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.mobileNumber && (
                            <TableCell className="whitespace-nowrap text-gray-600 dark:text-gray-400">
                              {item.mobileNumber || "N/A"}
                            </TableCell>
                          )}
                          {visibleColumns.remark && (
                            <TableCell className="whitespace-nowrap max-w-xs truncate text-gray-600 dark:text-gray-400">
                              {item.remark || "N/A"}
                            </TableCell>
                          )}

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
                                    router.push(`${basePath}/${item._id}/view`)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </DropdownMenuItem>
                                {hasPermission(`edit_${resourceName}`) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `${basePath}/${item._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(`delete_${resourceName}`) && (
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
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
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
                    activeColor="bg-[#00563B]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Preview Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {selectedImage && (
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={selectedImage}
                alt="Full Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-md"
              />
              <button
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                onClick={() => setSelectedImage(null)}
              >
                <span className="sr-only">Close</span>
                {/* Close Icon SVG */}
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

export default SamitiList;
