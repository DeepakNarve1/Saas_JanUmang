"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "@app/utils/axios";
import { useDebounce } from "@app/hooks/useDebounce";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { useRouter } from "next/navigation";
import { IBlock } from "@app/types/block";
import { IPanchayat } from "@app/types/panchayat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { Dialog, DialogContent } from "@app/components/ui/dialog";
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
import { IVoter } from "@app/types/voter";
import { AxiosError } from "axios";

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
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { usePermissions } from "@app/hooks/usePermissions";
import { Pagination } from "@app/components/common/Pagination";
import { PERMISSIONS } from "@app/config/permissions";

interface IVoterColumns {
  srNo: boolean;
  name: boolean;
  fatherName: boolean;
  mobile: boolean;
  age: boolean;
  cast: boolean;
  subcast: boolean;
  address: boolean;
  block: boolean;
  booth: boolean;
  boothNo: boolean;
  panchayat: boolean;
  village: boolean;
  fallaMarjra: boolean;
  voterId: boolean;
  image: boolean;
  organization?: boolean;
}

const Voter = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const isGlobalAdmin = isSuperAdmin();

  // Filters
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterPanchayat, setFilterPanchayat] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- Queries ---

  // 1. Fetch Blocks
  const { data: blocks = [] } = useQuery<IBlock[]>({
    queryKey: ["blocks-list"],
    queryFn: async () => {
      const res = await axios.get("/blocks?limit=-1");
      return res.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // 2. Fetch Panchayats (Cascading)
  const { data: panchayats = [] } = useQuery<IPanchayat[]>({
    queryKey: ["panchayats-list", filterBlock],
    queryFn: async () => {
      if (filterBlock === "all") return [];
      const selectedBlockObj = blocks.find(
        (b: IBlock) => b.name === filterBlock,
      );
      if (!selectedBlockObj) return [];
      const res = await axios.get(
        `/panchayat?limit=-1&block=${selectedBlockObj._id}`,
      );
      return res.data?.data || [];
    },
    enabled: filterBlock !== "all" && blocks.length > 0,
  });

  // 3. Fetch Voters (Main Data)
  const {
    data: response,
    isLoading: loading,
    isRefetching,
  } = useQuery({
    queryKey: [
      "voters",
      currentPage,
      entriesPerPage,
      filterBlock,
      filterPanchayat,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        page: currentPage,
        limit: entriesPerPage,
        blockname: filterBlock === "all" ? undefined : filterBlock,
        panchayat: filterPanchayat === "all" ? undefined : filterPanchayat,
        search: debouncedSearchTerm || undefined,
      };
      const res = await axios.get("/voters", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const data = response?.data || [];
  const totalCount = response?.filteredCount || response?.total || 0;

  const [visibleColumns, setVisibleColumns] = useState<IVoterColumns>({
    srNo: true,
    name: true,
    fatherName: true,
    mobile: true,
    age: true,
    cast: true,
    subcast: true,
    address: true,
    block: true,
    booth: true,
    boothNo: true,
    panchayat: true,
    village: true,
    fallaMarjra: true,
    voterId: true,
    image: true,
    organization: isGlobalAdmin,
  });

  const canDelete = hasPermission(PERMISSIONS.DELETE_VOTERS);
  const canCreate = hasPermission(PERMISSIONS.CREATE_VOTERS);
  const canEdit = hasPermission(PERMISSIONS.EDIT_VOTERS);

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/voters/${id}`);
    },
    onSuccess: () => {
      toast.success("Voter deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete voter");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleExport = async () => {
    if (data.length === 0) return toast.warning("No data to export");
    try {
      const XLSX = await import("xlsx");
      const dataToExport = data.map((v: IVoter) => {
        const block =
          typeof v.blockname === "object" ? v.blockname?.name : v.blockname;
        const booth =
          typeof v.boothname === "object" ? v.boothname?.name : v.boothname;
        const panchayat =
          typeof v.panchayat === "object" ? v.panchayat?.name : v.panchayat;
        const village =
          typeof v.village === "object" ? v.village?.name : v.village;

        return {
          Name: v.name,
          "Father Name": v.fatherName,
          Mobile: v.mobileNumber,
          Age: v.age,
          Cast: v.cast,
          "Sub Cast": v.subcast,
          Address: v.fulladdress,
          Block: block,
          Booth: booth,
          "Booth No": v.boothno,
          Panchayat: panchayat,
          Village: village,
          "Falia/Majra": v.fallaMarjra,
          "Voter ID": v.voterId,
          Organization: typeof v.tenantId === "object" ? v.tenantId?.name : "Platform"
        };
      });
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Voters");
      XLSX.writeFile(wb, `Voters_${Date.now()}.xlsx`);
      toast.success("Exported successfully");
    } catch (error: unknown) {
      handleError(error, "Failed to load export library");
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
              name: String(row["Name"] || row["name"] || ""),
              fatherName: String(
                row["Father Name"] ||
                  row["FatherName"] ||
                  row["fatherName"] ||
                  "",
              ),
              mobileNumber: String(row["Mobile"] || row["mobileNumber"] || ""),
              age: row["Age"] || row["age"],
              cast: String(row["Cast"] || row["cast"] || ""),
              subcast: String(
                row["Sub Cast"] || row["SubCast"] || row["subcast"] || "",
              ),
              fulladdress: String(row["Address"] || row["fulladdress"] || ""),
              blockname: String(row["Block"] || row["blockname"] || ""),
              boothname: String(row["Booth"] || row["boothname"] || ""),
              boothno: String(row["Booth No"] || row["boothno"] || ""),
              panchayat: String(row["Panchayat"] || row["panchayat"] || ""),
              village: String(row["Village"] || row["village"] || ""),
              fallaMarjra: String(
                row["Falia/Majra"] ||
                  row["Falla/Marjra"] ||
                  row["fallaMarjra"] ||
                  "",
              ),
              voterId: String(row["Voter ID"] || row["voterId"] || ""),
              image: String(row["Image"] || row["image"] || ""),
            };

            if (!payload.name || !payload.voterId) {
              failureCount++;
              continue;
            }

            await axios.post("/voters", payload);
            successCount++;
          } catch (error: unknown) {
            failureCount++;
          }
        }

        toast.success(
          `Import complete: ${successCount} added, ${failureCount} failed`,
        );
        queryClient.invalidateQueries({ queryKey: ["voters"] });
      } catch (error: unknown) {
        handleError(error, "Failed to import file");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleColumn = (key: keyof IVoterColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <ContentHeader title="Voter Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Action Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Name, Voter ID, Mobile..."
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
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    <Download className="w-5 h-5 mr-2 text-blue-500" /> Export
                  </Button>

                  {canCreate && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/voter/create")}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Voter
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filterBlock}
                  onValueChange={(val) => {
                    setFilterBlock(val);
                    setFilterPanchayat("all"); // Reset panchayat on block change
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Blocks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    {blocks.map((b: IBlock) => (
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
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Panchayats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Panchayats</SelectItem>
                    {panchayats.map((p: IPanchayat) => (
                      <SelectItem key={p._id} value={p.name}>
                        {p.name}
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
                    onValueChange={(v) => {
                      setEntriesPerPage(v === "-1" ? -1 : Number(v));
                      setCurrentPage(1);
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

            {/* Column Visibility Toggle */}
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
                  className="w-64 max-h-96 overflow-y-auto"
                >
                  {(Object.keys(visibleColumns) as (keyof IVoterColumns)[]).map(
                    (key) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={visibleColumns[key]}
                        onCheckedChange={() => toggleColumn(key)}
                      >
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </DropdownMenuCheckboxItem>
                    ),
                  )}
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
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Name
                      </TableHead>
                    )}
                    {visibleColumns.fatherName && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Father Name
                      </TableHead>
                    )}
                    {visibleColumns.mobile && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Mobile No
                      </TableHead>
                    )}
                    {visibleColumns.age && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Age
                      </TableHead>
                    )}
                    {visibleColumns.cast && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Cast
                      </TableHead>
                    )}
                    {visibleColumns.subcast && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Sub-Cast
                      </TableHead>
                    )}
                    {visibleColumns.address && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Full Address
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Block Name
                      </TableHead>
                    )}
                    {visibleColumns.booth && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Booth Name
                      </TableHead>
                    )}
                    {visibleColumns.boothNo && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Booth No
                      </TableHead>
                    )}
                    {visibleColumns.panchayat && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Panchayat
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.fallaMarjra && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Falia/Majra
                      </TableHead>
                    )}
                    {visibleColumns.voterId && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Voter ID (Epic)
                      </TableHead>
                    )}
                    {visibleColumns.image && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Image
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
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell
                          colSpan={
                            Object.values(visibleColumns).filter(Boolean)
                              .length + 1
                          }
                        >
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No voters found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row: IVoter, idx: number) => (
                      <TableRow
                        key={row._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell>
                            {(currentPage - 1) * entriesPerPage + idx + 1}
                          </TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="font-medium">
                            {row.name}
                          </TableCell>
                        )}
                        {visibleColumns.fatherName && (
                          <TableCell>{row.fatherName}</TableCell>
                        )}
                        {visibleColumns.mobile && (
                          <TableCell>{row.mobileNumber}</TableCell>
                        )}
                        {visibleColumns.age && <TableCell>{row.age}</TableCell>}
                        {visibleColumns.cast && (
                          <TableCell>{row.cast}</TableCell>
                        )}
                        {visibleColumns.subcast && (
                          <TableCell>{row.subcast}</TableCell>
                        )}
                        {visibleColumns.address && (
                          <TableCell>{row.fulladdress}</TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>
                            {(() => {
                              const val = row.block || row.blockname;
                              return typeof val === "object" ? val?.name : val;
                            })()}
                          </TableCell>
                        )}
                        {visibleColumns.booth && (
                          <TableCell>
                            {(() => {
                              const val = row.booth || row.boothname;
                              return typeof val === "object" ? val?.name : val;
                            })()}
                          </TableCell>
                        )}
                        {visibleColumns.boothNo && (
                          <TableCell>
                            {(() => {
                              const val = row.boothNo || row.boothno;
                              if (val) return val;
                              // Fallback: Check if it's inside the booth object as 'code'
                              const boothObj = row.booth || row.boothname;
                              if (typeof boothObj === "object" && boothObj) {
                                const bObj = boothObj as {
                                  code?: string;
                                  boothNo?: string;
                                };
                                return bObj.code || bObj.boothNo;
                              }
                              return "";
                            })()}
                          </TableCell>
                        )}
                        {visibleColumns.panchayat && (
                          <TableCell>
                            {typeof row.panchayat === "object"
                              ? row.panchayat?.name
                              : row.panchayat}
                          </TableCell>
                        )}
                        {visibleColumns.village && (
                          <TableCell>
                            {typeof row.village === "object"
                              ? row.village?.name
                              : row.village}
                          </TableCell>
                        )}
                        {visibleColumns.fallaMarjra && (
                          <TableCell>{row.fallaMarjra}</TableCell>
                        )}
                        {visibleColumns.voterId && (
                          <TableCell>
                            <span className="font-mono px-2 py-1 rounded">
                              {row.voterId}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.image && (
                          <TableCell>
                            {row.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={row.image}
                                alt="Voter"
                                className="h-10 w-10 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() =>
                                  setSelectedImage(row.image || null)
                                }
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.organization && (
                          <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                            {typeof row.tenantId === "object"
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
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/voter/${row._id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              {canEdit && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/voter/${row._id}/edit`)
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
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </div>
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
            <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                  {entriesPerPage === -1
                    ? `Showing all ${totalCount} entries`
                    : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalCount)} to ${Math.min(currentPage * entriesPerPage, totalCount)} of ${totalCount}`}
                </div>
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

        {/* Image Modal */}
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center">
            {selectedImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedImage}
                alt="Selected Voter"
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl bg-white"
              />
            )}
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
};

export default Voter;
