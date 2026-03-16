"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
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

import { Dialog, DialogContent, DialogTitle } from "@app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import {
  Eye,
  Edit,
  Trash2,
  X,
  Plus,
  MoreVertical,
  Search,
  Download,
  Columns,
} from "lucide-react";
import { useDebounce } from "@app/hooks/useDebounce";
import { Skeleton } from "@app/components/ui/skeleton";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { Pagination } from "@app/components/common/Pagination";
import { IMember, IMemberResponse } from "@app/types/member";
import { IBlock } from "@app/types/block";
import { ISamiti } from "@app/types/samiti";
import { PERMISSIONS } from "@app/config/permissions";
import { AxiosError } from "axios";

const MemberList = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_MEMBERS]}>
      <MemberListContent />
    </RouteGuard>
  );
};

const MemberListContent = () => {
  const router = useRouter();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [visibleColumns, setVisibleColumns] = useState({
    addedBy: true,
    name: true,
    voterId: true,
    mobile: true,
    fatherName: true,
    dob: true,
    dom: true,
    block: true,
    boothName: true,
    boothNumber: true,
    grampanchayat: true,
    village: true,
    samiti: true,
    toll: true,
    jaati: true,
    age: true,
    education: true,
    address: true,
    gender: true,
    vehicle: true,
    group: true,
    govtEmployee: true,
    party: true,
    postYear: true,
    code: true,
    nariSammanYojna: true,
    farmerLoanWaiver: true,
    facebook: true,
    instagram: true,
    twitter: true,
    startLat: true,
    startLong: true,
    startDate: true,
    endLat: true,
    endLong: true,
    endDate: true,
    image: true,
    district: true,
    reference: true,
    remark: true,
    createdAt: true,
    updatedAt: true,
    organization: isSuperAdmin(),
    action: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filters
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterPostYear, setFilterPostYear] = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterSamiti, setFilterSamiti] = useState("all");
  const [filterCode, setFilterCode] = useState("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Filters
  const { data: districts = [] } = useQuery<any[]>({
    queryKey: ["districts-list"],
    queryFn: async () => {
      const res = await axios.get("/districts?limit=-1");
      return res.data?.data || [];
    },
  });

  const { data: blocks = [] } = useQuery<IBlock[]>({
    queryKey: ["blocks-list", filterDistrict],
    queryFn: async () => {
      if (filterDistrict === "all") {
        const res = await axios.get("/blocks?limit=-1");
        return res.data?.data || [];
      }
      const distId = districts.find((d: any) => d.name === filterDistrict)?._id;
      if (!distId) return [];
      const res = await axios.get(`/blocks?limit=-1&district=${distId}`);
      return res.data?.data || [];
    },
    enabled: districts.length > 0 || filterDistrict === "all",
  });

  const { data: samitis = [] } = useQuery<ISamiti[]>({
    queryKey: ["samitis-list"],
    queryFn: async () => {
      const res = await axios.get("/samiti?limit=-1");
      return res.data?.data || res.data || [];
    },
  });

  // Fetch Members Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IMemberResponse>({
    queryKey: [
      "members",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      filterDistrict,
      filterBlock,
      filterPostYear,
      filterVehicle,
      filterSamiti,
      filterCode,
    ],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm || undefined,
        district: filterDistrict === "all" ? undefined : filterDistrict,
        block: filterBlock === "all" ? undefined : filterBlock,
        postYear: filterPostYear === "all" ? undefined : filterPostYear,
        vehicle: filterVehicle === "all" ? undefined : filterVehicle,
        samiti: filterSamiti === "all" ? undefined : filterSamiti,
        code: filterCode === "all" ? undefined : filterCode,
      };

      const { data } = await axios.get<IMemberResponse>("/members", {
        params,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/members/${id}`);
    },
    onSuccess: () => {
      toast.success("Member deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete member");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleExport = async () => {
    try {
      const XLSX = await import("xlsx");
      const params: Record<string, string | number | undefined> = {
        limit: -1,
        search: debouncedSearchTerm || undefined,
        block: filterBlock === "all" ? undefined : filterBlock,
        postYear: filterPostYear === "all" ? undefined : filterPostYear,
        vehicle: filterVehicle === "all" ? undefined : filterVehicle,
        samiti: filterSamiti === "all" ? undefined : filterSamiti,
        code: filterCode === "all" ? undefined : filterCode,
      };

      const { data } = await axios.get<IMemberResponse>("/members", {
        params,
      });

      const allMembers = data.data || [];
      if (allMembers.length === 0) return toast.warning("No data to export");

      // Format data to match table labels and order, respecting visibility
      const exportData = allMembers.map((member, index) => {
        const row: Record<string, any> = {};
        row["Sr No."] = index + 1;

        if (visibleColumns.addedBy) row["Created By"] = member.addedBy || "-";
        if (visibleColumns.name) row["Name"] = member.name || "-";
        if (visibleColumns.voterId) row["Voter ID"] = member.voterId || "-";
        if (visibleColumns.mobile) row["Mobile"] = member.mobile || "-";
        if (visibleColumns.fatherName)
          row["Father Name"] = member.fatherName || "-";
        if (visibleColumns.dob)
          row["Date Of Birth"] = member.dob
            ? new Date(member.dob).toLocaleDateString()
            : "-";
        if (visibleColumns.dom)
          row["Date Of Marriage"] = member.dom
            ? new Date(member.dom).toLocaleDateString()
            : "-";
        if (visibleColumns.block) row["Block Name"] = member.block || "-";
        if (visibleColumns.boothName)
          row["Booth Name"] = member.boothName || "-";
        if (visibleColumns.boothNumber)
          row["Booth Number"] = member.boothNumber || "-";
        if (visibleColumns.grampanchayat)
          row["Grampanchayat"] = member.grampanchayat || "-";
        if (visibleColumns.village) row["Village"] = member.village || "-";
        if (visibleColumns.samiti) row["Samiti"] = member.samiti || "-";
        if (visibleColumns.toll) row["Toll"] = member.toll || "-";
        if (visibleColumns.jaati) row["Jaati"] = member.jaati || "-";
        if (visibleColumns.age) row["Age"] = member.age || "0";
        if (visibleColumns.education)
          row["Education"] = member.education || "-";
        if (visibleColumns.address) row["Address"] = member.address || "-";
        if (visibleColumns.gender) row["Gender"] = member.gender || "-";
        if (visibleColumns.vehicle) row["Vehicle"] = member.vehicle || "-";
        if (visibleColumns.group) row["Group"] = member.group || "-";
        if (visibleColumns.govtEmployee)
          row["Government Employee"] = member.govtEmployee || "-";
        if (visibleColumns.party) row["Party"] = member.party || "-";
        if (visibleColumns.postYear) row["पद वर्ष"] = member.postYear || "-";
        if (visibleColumns.code) row["Code"] = member.code || "-";
        if (visibleColumns.nariSammanYojna)
          row["Nari Samman Yojna"] = member.nariSammanYojna || "-";
        if (visibleColumns.farmerLoanWaiver)
          row["Farmer Loan Waiver"] = member.farmerLoanWaiver || "-";
        if (visibleColumns.facebook) row["Facebook"] = member.facebook || "-";
        if (visibleColumns.instagram)
          row["Instagram"] = member.instagram || "-";
        if (visibleColumns.twitter) row["Twitter"] = member.twitter || "-";
        if (visibleColumns.startLat) row["Start Lat"] = member.startLat || "0";
        if (visibleColumns.startLong)
          row["Start Long"] = member.startLong || "0";
        if (visibleColumns.startDate) {
          const d = new Date(member.startDate || member.createdAt);
          row["Start Date"] =
            member.startDate || member.createdAt
              ? `${d.toLocaleDateString("en-GB")} ${d.toTimeString().split(" (")[0]}`
              : "-";
        }
        if (visibleColumns.endLat) row["End Lat"] = member.endLat || "0";
        if (visibleColumns.endLong) row["End Long"] = member.endLong || "0";
        if (visibleColumns.endDate) {
          const d = new Date(member.endDate || member.createdAt);
          row["End Date"] =
            member.endDate || member.createdAt
              ? `${d.toLocaleDateString("en-GB")} ${d.toTimeString().split(" (")[0]}`
              : "-";
        }
        if (visibleColumns.district) row["District"] = member.district || "-";
        if (visibleColumns.reference)
          row["Reference"] = member.reference || "-";
        if (visibleColumns.remark) row["Remark"] = member.remark || "-";
        if (visibleColumns.createdAt) {
          const d = new Date(member.createdAt);
          row["Created On"] = `${d.toLocaleDateString("en-GB")} ${
            d.toTimeString().split(" (")[0]
          }`;
        }
        if (visibleColumns.updatedAt) {
          if (member.updatedAt) {
            const d = new Date(member.updatedAt);
            row["Update Date"] = `${d.toLocaleDateString("en-GB")} ${
              d.toTimeString().split(" (")[0]
            }`;
          } else {
            row["Update Date"] = "-";
          }
        }
        if (visibleColumns.organization) {
          row["Organization"] = (member.tenantId && typeof member.tenantId === "object") ? member.tenantId.name : "Platform";
        }

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Members");
      XLSX.writeFile(wb, "Members.xlsx");
      toast.success("Exported successfully");
    } catch (error: unknown) {
      toast.error("Failed to export data");
    }
  };

  const clearFilters = () => {
    setFilterDistrict("all");
    setFilterBlock("all");
    setFilterPostYear("all");
    setFilterVehicle("all");
    setFilterSamiti("all");
    setFilterCode("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const members = response?.data || [];
  const totalCount =
    response?.filteredCount || response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title="Member Management" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Header / Search / Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by Block, Samiti, Code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:focus:bg-[#202123] dark:text-gray-200"
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
                  {hasPermission(PERMISSIONS.CREATE_MEMBERS) && (
                    <Button
                      size="lg"
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                      onClick={() => router.push("/member-list/create")}
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add New
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={filterDistrict}
                  onValueChange={(val) => {
                    setFilterDistrict(val);
                    setFilterBlock("all");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
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
                  value={filterBlock}
                  onValueChange={(val) => {
                    setFilterBlock(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Block" />
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
                  value={filterPostYear}
                  onValueChange={(val) => {
                    setFilterPostYear(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Post Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Post Years</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterVehicle}
                  onValueChange={(val) => {
                    setFilterVehicle(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterSamiti}
                  onValueChange={(val) => {
                    setFilterSamiti(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Samiti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Samitis</SelectItem>
                    {samitis.map((s: ISamiti) => (
                      <SelectItem key={s._id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterCode}
                  onValueChange={(val) => {
                    setFilterCode(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Codes</SelectItem>
                    <SelectItem value="BC">BC (बूथ कमेटी)</SelectItem>
                    <SelectItem value="PP">PP (पेज प्रभारी)</SelectItem>
                    <SelectItem value="IP">IP (प्रभावशाली व्यक्ति)</SelectItem>
                    <SelectItem value="FH">FH (परिवार का मुखिया)</SelectItem>
                    <SelectItem value="SMM">SMM (सोशल मीडिया मित्र)</SelectItem>
                    <SelectItem value="MS">MS (महिला समिति)</SelectItem>
                    <SelectItem value="FP">FP (फलिया प्रभारी)</SelectItem>
                    <SelectItem value="ER">ER (चुनाव प्रभारी)</SelectItem>
                    <SelectItem value="वरिष्ठ">वरिष्ठ</SelectItem>
                    <SelectItem value="युवा">युवा</SelectItem>
                    <SelectItem value="BLA">BLA (बूथ लेवल एजेंट)</SelectItem>
                    <SelectItem value="FM">FM (दानदाता)</SelectItem>
                    <SelectItem value="AK">
                      AK (नवीन सदस्य को सक्रिय करना)
                    </SelectItem>
                    <SelectItem value="वोटर प्रभारी">
                      वोटर प्रभारी (10 घर)
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  title="Clear Filters"
                  className="h-9 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4 mr-2" /> Clear
                </Button>

                <div className="ml-auto">
                  <div className="flex items-center gap-2">
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
                        <SelectItem value="-1">All</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                      entries
                    </span>
                  </div>
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
                      className="dark:text-gray-300 dark:focus:bg-gray-800"
                    >
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())
                        .replace("Added By", "Created By")
                        .replace("Voter Id", "Voter ID")
                        .replace("Father Name", "Father Name")
                        .replace("Dob", "Date Of Birth")
                        .replace("Dom", "Date Of Marriage")
                        .replace("Booth Name", "Booth Name")
                        .replace("Booth Number", "Booth Number")
                        .replace("Grampanchayat", "Grampanchayat")
                        .replace("Jaati", "Jaati")
                        .replace("Govt Employee", "Government Employee")
                        .replace("Post Year", "पद वर्ष")
                        .replace("Nari Samman Yojna", "Nari Samman Yojna")
                        .replace("Farmer Loan Waiver", "Farmer Loan Waiver")
                        .replace("Start Lat", "Start Lat")
                        .replace("Start Long", "Start Long")
                        .replace("End Lat", "End Lat")
                        .replace("End Long", "End Long")
                        .replace("Created At", "Created On")
                        .replace("Updated At", "Update Date")}
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
                    {visibleColumns.addedBy && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Created By
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Name
                      </TableHead>
                    )}
                    {visibleColumns.voterId && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Voter ID
                      </TableHead>
                    )}
                    {visibleColumns.mobile && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Mobile
                      </TableHead>
                    )}
                    {visibleColumns.fatherName && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Father Name
                      </TableHead>
                    )}
                    {visibleColumns.dob && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Date Of Birth
                      </TableHead>
                    )}
                    {visibleColumns.dom && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Date Of Marriage
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Block Name
                      </TableHead>
                    )}
                    {visibleColumns.boothName && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Booth Name
                      </TableHead>
                    )}
                    {visibleColumns.boothNumber && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Booth Number
                      </TableHead>
                    )}
                    {visibleColumns.grampanchayat && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Grampanchayat
                      </TableHead>
                    )}
                    {visibleColumns.village && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Village
                      </TableHead>
                    )}
                    {visibleColumns.samiti && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Samiti
                      </TableHead>
                    )}
                    {visibleColumns.toll && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Toll
                      </TableHead>
                    )}
                    {visibleColumns.jaati && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Jaati
                      </TableHead>
                    )}
                    {visibleColumns.age && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Age
                      </TableHead>
                    )}
                    {visibleColumns.education && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Education
                      </TableHead>
                    )}
                    {visibleColumns.address && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Address
                      </TableHead>
                    )}
                    {visibleColumns.gender && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Gender
                      </TableHead>
                    )}
                    {visibleColumns.vehicle && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Vehicle
                      </TableHead>
                    )}
                    {visibleColumns.group && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Group
                      </TableHead>
                    )}
                    {visibleColumns.govtEmployee && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Government Employee
                      </TableHead>
                    )}
                    {visibleColumns.party && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Party
                      </TableHead>
                    )}
                    {visibleColumns.postYear && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        पद वर्ष
                      </TableHead>
                    )}
                    {visibleColumns.code && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Code
                      </TableHead>
                    )}
                    {visibleColumns.nariSammanYojna && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Nari Samman Yojna
                      </TableHead>
                    )}
                    {visibleColumns.farmerLoanWaiver && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Farmer Loan Waiver
                      </TableHead>
                    )}
                    {visibleColumns.facebook && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Facebook
                      </TableHead>
                    )}
                    {visibleColumns.instagram && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Instagram
                      </TableHead>
                    )}
                    {visibleColumns.twitter && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Twitter
                      </TableHead>
                    )}
                    {visibleColumns.startLat && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Start Lat
                      </TableHead>
                    )}
                    {visibleColumns.startLong && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Start Long
                      </TableHead>
                    )}
                    {visibleColumns.startDate && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Start Date
                      </TableHead>
                    )}
                    {visibleColumns.endLat && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        End Lat
                      </TableHead>
                    )}
                    {visibleColumns.endLong && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        End Long
                      </TableHead>
                    )}
                    {visibleColumns.endDate && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        End Date
                      </TableHead>
                    )}
                    {visibleColumns.image && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Image
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.reference && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Reference
                      </TableHead>
                    )}
                    {visibleColumns.remark && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Remark
                      </TableHead>
                    )}
                    {visibleColumns.createdAt && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Created On
                      </TableHead>
                    )}
                    {visibleColumns.updatedAt && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Update Date
                      </TableHead>
                    )}
                    {visibleColumns.organization && (
                      <TableHead className="font-semibold text-white uppercase tracking-wider text-xs whitespace-nowrap">
                        Organization
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="font-semibold text-white dark:text-gray-200 uppercase tracking-wider text-xs whitespace-nowrap text-right min-w-[100px]">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-6 w-8" />
                        </TableCell>
                        {Object.entries(visibleColumns).map(
                          ([key, visible]) =>
                            visible &&
                            key !== "action" && (
                              <TableCell key={key}>
                                <Skeleton className="h-6 w-24" />
                              </TableCell>
                            ),
                        )}
                        {visibleColumns.action && (
                          <TableCell>
                            <Skeleton className="h-8 w-10 ml-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="text-center py-20 text-red-500 dark:text-red-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-lg font-bold">
                            Failed to fetch members
                          </p>
                          <p className="text-sm opacity-70 mb-4">
                            The server might be busy or unreachable. Please
                            check your connection.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() =>
                              queryClient.invalidateQueries({
                                queryKey: ["members"],
                              })
                            }
                            className="bg-white dark:bg-gray-800"
                          >
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No members found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member, idx) => (
                      <TableRow
                        key={member._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {(pagination.page - 1) * pagination.limit + idx + 1}
                        </TableCell>
                        {visibleColumns.addedBy && (
                          <TableCell>{member.addedBy || "-"}</TableCell>
                        )}
                        {visibleColumns.name && (
                          <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                            {member.name}
                          </TableCell>
                        )}
                        {visibleColumns.voterId && (
                          <TableCell>{member.voterId || "-"}</TableCell>
                        )}
                        {visibleColumns.mobile && (
                          <TableCell>{member.mobile || "-"}</TableCell>
                        )}
                        {visibleColumns.fatherName && (
                          <TableCell>{member.fatherName || "-"}</TableCell>
                        )}
                        {visibleColumns.dob && (
                          <TableCell>
                            {member.dob
                              ? new Date(member.dob).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.dom && (
                          <TableCell>
                            {member.dom
                              ? new Date(member.dom).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell>{member.block || "-"}</TableCell>
                        )}
                        {visibleColumns.boothName && (
                          <TableCell>{member.boothName || "-"}</TableCell>
                        )}
                        {visibleColumns.boothNumber && (
                          <TableCell>{member.boothNumber || "-"}</TableCell>
                        )}
                        {visibleColumns.grampanchayat && (
                          <TableCell>{member.grampanchayat || "-"}</TableCell>
                        )}
                        {visibleColumns.village && (
                          <TableCell>{member.village || "-"}</TableCell>
                        )}
                        {visibleColumns.samiti && (
                          <TableCell>{member.samiti || "-"}</TableCell>
                        )}
                        {visibleColumns.toll && (
                          <TableCell>{member.toll || "-"}</TableCell>
                        )}
                        {visibleColumns.jaati && (
                          <TableCell>{member.jaati || "-"}</TableCell>
                        )}
                        {visibleColumns.age && (
                          <TableCell>{member.age || "0"}</TableCell>
                        )}
                        {visibleColumns.education && (
                          <TableCell>{member.education || "-"}</TableCell>
                        )}
                        {visibleColumns.address && (
                          <TableCell className="max-w-[200px] truncate">
                            {member.address || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.gender && (
                          <TableCell>{member.gender || "-"}</TableCell>
                        )}
                        {visibleColumns.vehicle && (
                          <TableCell>{member.vehicle || "-"}</TableCell>
                        )}
                        {visibleColumns.group && (
                          <TableCell>{member.group || "-"}</TableCell>
                        )}
                        {visibleColumns.govtEmployee && (
                          <TableCell>{member.govtEmployee || "-"}</TableCell>
                        )}
                        {visibleColumns.party && (
                          <TableCell>{member.party || "-"}</TableCell>
                        )}
                        {visibleColumns.postYear && (
                          <TableCell>{member.postYear || "-"}</TableCell>
                        )}
                        {visibleColumns.code && (
                          <TableCell>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {member.code}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.nariSammanYojna && (
                          <TableCell>{member.nariSammanYojna || "-"}</TableCell>
                        )}
                        {visibleColumns.farmerLoanWaiver && (
                          <TableCell>
                            {member.farmerLoanWaiver || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.facebook && (
                          <TableCell>{member.facebook || "-"}</TableCell>
                        )}
                        {visibleColumns.instagram && (
                          <TableCell>{member.instagram || "-"}</TableCell>
                        )}
                        {visibleColumns.twitter && (
                          <TableCell>{member.twitter || "-"}</TableCell>
                        )}
                        {visibleColumns.startLat && (
                          <TableCell>{member.startLat || "0"}</TableCell>
                        )}
                        {visibleColumns.startLong && (
                          <TableCell className="dark:text-gray-300">
                            {member.startLong || "0"}
                          </TableCell>
                        )}
                        {visibleColumns.startDate && (
                          <TableCell className="text-sm">
                            {member.startDate || member.createdAt ? (
                              <div className="flex flex-col min-w-[150px]">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {new Date(
                                    member.startDate || member.createdAt,
                                  ).toLocaleDateString("en-GB")}
                                </span>
                                <span className="text-xs text-gray-500 opacity-80 whitespace-nowrap">
                                  {
                                    new Date(
                                      member.startDate || member.createdAt,
                                    )
                                      .toTimeString()
                                      .split(" (")[0]
                                  }
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.endLat && (
                          <TableCell>{member.endLat || "0"}</TableCell>
                        )}
                        {visibleColumns.endLong && (
                          <TableCell className="dark:text-gray-300">
                            {member.endLong || "0"}
                          </TableCell>
                        )}
                        {visibleColumns.endDate && (
                          <TableCell className="text-sm">
                            {member.endDate || member.createdAt ? (
                              <div className="flex flex-col min-w-[150px]">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {new Date(
                                    member.endDate || member.createdAt,
                                  ).toLocaleDateString("en-GB")}
                                </span>
                                <span className="text-xs text-gray-500 opacity-80 whitespace-nowrap">
                                  {
                                    new Date(member.endDate || member.createdAt)
                                      .toTimeString()
                                      .split(" (")[0]
                                  }
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.image && (
                          <TableCell>
                            {member.image ? (
                              <img
                                src={member.image}
                                alt="Thumbnail"
                                className="h-10 w-10 object-cover rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                                onClick={() => setSelectedImage(member.image)}
                              />
                            ) : (
                              <span className="text-gray-400 text-sm italic">
                                No Image
                              </span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell className="text-sm">
                            {member.district || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.reference && (
                          <TableCell className="text-sm">
                            {member.reference || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.remark && (
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {member.remark || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell className="text-sm">
                            <div className="flex flex-col min-w-[150px]">
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {new Date(member.createdAt).toLocaleDateString(
                                  "en-GB",
                                )}
                              </span>
                              <span className="text-xs text-gray-500 opacity-80 whitespace-nowrap">
                                {
                                  new Date(member.createdAt)
                                    .toTimeString()
                                    .split(" (")[0]
                                }
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.updatedAt && (
                          <TableCell className="text-sm">
                            {member.updatedAt ? (
                              <div className="flex flex-col min-w-[150px]">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {new Date(
                                    member.updatedAt,
                                  ).toLocaleDateString("en-GB")}
                                </span>
                                <span className="text-xs text-gray-500 opacity-80 whitespace-nowrap">
                                  {
                                    new Date(member.updatedAt)
                                      .toTimeString()
                                      .split(" (")[0]
                                  }
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.organization && (
                          <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                            {member.tenantId && typeof member.tenantId === "object"
                              ? member.tenantId.name
                              : "Platform"}
                          </TableCell>
                        )}

                        {visibleColumns.action && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full dark:hover:bg-gray-800"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/member-list/${member._id}/view`,
                                    )
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                {hasPermission(PERMISSIONS.EDIT_MEMBERS) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/member-list/${member._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(PERMISSIONS.DELETE_MEMBERS) && (
                                  <ConfirmDialog
                                    title="Delete Member"
                                    description="Are you sure you want to delete this member? This action cannot be undone."
                                    onConfirm={() => handleDelete(member._id)}
                                    trigger={
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-red-600 focus:text-red-500"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />{" "}
                                        Delete
                                      </DropdownMenuItem>
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

            {/* Pagination Controls */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, totalCount)} of{" "}
                  {totalCount} members
                </p>
                <div className="order-1 sm:order-2">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={Math.ceil(
                      totalCount /
                        (pagination.limit === -1 ? 1 : pagination.limit),
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

      {/* Image Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none">
          <DialogTitle className="sr-only">Member Photo</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Member Full View"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemberList;
