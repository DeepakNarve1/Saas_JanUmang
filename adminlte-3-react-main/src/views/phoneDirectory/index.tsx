"use client";

import { useState, useRef } from "react";
import axios from "@app/utils/axios";
import { useDebounce } from "@app/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
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
import { Badge } from "@app/components/ui/badge";

import {
  Loader2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Columns,
  Copy,
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { Pagination } from "@app/components/common/Pagination";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { IPhoneDirectoryResponse } from "@app/types/phoneDirectory";
import { IDepartment } from "@app/types/department";
import { IParty } from "@app/types/party";
import { IBlock } from "@app/types/block";

const PhoneDirectoryList = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    name: true,
    post: true,
    department: true,
    block: true,
    number: true,
    email: true,
    party: true,
    status: true,
    createdOn: true,
    action: true,
  });

  // Filters
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterParty, setFilterParty] = useState("all");
  const [filterBlock, setFilterBlock] = useState("all");

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch Filters
  const { data: departments = [] } = useQuery<IDepartment[]>({
    queryKey: ["departments-list"],
    queryFn: async () => {
      const res = await axios.get("/departments?limit=-1");
      return res.data?.data || [];
    },
  });

  const { data: parties = [] } = useQuery<IParty[]>({
    queryKey: ["parties-list"],
    queryFn: async () => {
      const res = await axios.get("/party?limit=-1");
      return res.data?.data || [];
    },
  });

  const { data: blocks = [] } = useQuery<IBlock[]>({
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
  } = useQuery<IPhoneDirectoryResponse>({
    queryKey: [
      "phone-directory",
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
      filterDepartment,
      filterParty,
      filterBlock,
    ],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearchTerm || undefined,
        departmentName:
          filterDepartment === "all" ? undefined : filterDepartment,
        partyName: filterParty === "all" ? undefined : filterParty,
        blockName: filterBlock === "all" ? undefined : filterBlock,
      };

      const res = await axios.get("/phone-directory", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/phone-directory/${id}`);
    },
    onSuccess: () => {
      toast.success("Record deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["phone-directory"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete record");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleCopy = async () => {
    const data = response?.data || [];
    if (data.length === 0) return toast.warning("No data to copy");

    try {
      const exportData = data.map((item: any, index: number) => ({
        ID: index + 1,
        Name: item.name,
        Post: item.post || "-",
        Department: item.department?.name || "-",
        "VS Block": item.block?.name || "-",
        Number: item.number,
        Email: item.email || "-",
        Party: item.party?.name || "-",
        Status: item.status,
        "Created At": item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "-",
        Actions: "",
      }));
      const headers = Object.keys(exportData[0]);
      const rows = exportData.map((row: any) =>
        headers.map((header) => row[header]).join("\t"),
      );
      const text = [headers.join("\t"), ...rows].join("\n");

      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy data");
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = {
        limit: -1,
        search: debouncedSearchTerm || undefined,
        departmentName:
          filterDepartment === "all" ? undefined : filterDepartment,
        partyName: filterParty === "all" ? undefined : filterParty,
        blockName: filterBlock === "all" ? undefined : filterBlock,
      };
      const res = await axios.get("/phone-directory", { params });
      const allData = res.data?.data || [];

      if (allData.length === 0) return toast.warning("No data to export");

      const XLSX = await import("xlsx");
      const exportData = allData.map((item: any, index: number) => ({
        Sl: index + 1,
        Name: item.name,
        Post: item.post || "-",
        Department: item.department?.name || "-",
        "VS Block": item.block?.name || "-",
        Number: item.number,
        Email: item.email || "-",
        Party: item.party?.name || "-",
        Status: item.status,
        "Created On": item.createdAt
          ? new Date(item.createdAt)
              .toLocaleDateString("en-GB")
              .replace(/\//g, "-")
          : "-",
        Actions: "",
      }));

      const ws = XLSX.utils.aoa_to_sheet([["Phone Directory List"]]);
      XLSX.utils.sheet_add_json(ws, exportData, { origin: "A2" });

      const columnCount = Object.keys(exportData[0]).length;
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }];

      const wscols = Object.keys(exportData[0]).map((key) => ({
        wch: Math.max(key.length, 20),
      }));
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Phone Directory");
      XLSX.writeFile(wb, `phone_directory_${Date.now()}.xlsx`);
      toast.success("Excel exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {
        limit: -1,
        search: debouncedSearchTerm || undefined,
        departmentName:
          filterDepartment === "all" ? undefined : filterDepartment,
        partyName: filterParty === "all" ? undefined : filterParty,
        blockName: filterBlock === "all" ? undefined : filterBlock,
      };
      const res = await axios.get("/phone-directory", { params });
      const allData = res.data?.data || [];

      if (allData.length === 0) return toast.warning("No data to export");

      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("l", "mm", "a4");
      const exportData = allData.map((item: any, index: number) => ({
        Sl: index + 1,
        Name: item.name,
        Post: item.post || "-",
        Department: item.department?.name || "-",
        "VS Block": item.block?.name || "-",
        Number: item.number,
        Email: item.email || "-",
        Party: item.party?.name || "-",
        Status: item.status,
        "Created On": item.createdAt
          ? new Date(item.createdAt)
              .toLocaleDateString("en-GB")
              .replace(/\//g, "-")
          : "-",
      }));

      const headers = [Object.keys(exportData[0])];
      const body = exportData.map((row: any) => Object.values(row));

      autoTable(doc, {
        head: headers,
        body: body,
        theme: "grid",
        margin: { top: 25 },
        styles: { font: "helvetica", fontSize: 7, cellPadding: 2 },
        headStyles: {
          fillColor: [54, 143, 139],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        didDrawPage: (data) => {
          doc.setFontSize(18);
          doc.setTextColor(54, 143, 139);
          doc.text("Phone Directory List", data.settings.margin.left, 15);

          const str = "Page " + doc.getNumberOfPages();
          doc.setFontSize(10);
          doc.setTextColor(100);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        },
      });

      doc.save(`phone_directory_${Date.now()}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  const handlePrint = async () => {
    try {
      const params = {
        limit: -1,
        search: debouncedSearchTerm || undefined,
        departmentName:
          filterDepartment === "all" ? undefined : filterDepartment,
        partyName: filterParty === "all" ? undefined : filterParty,
        blockName: filterBlock === "all" ? undefined : filterBlock,
      };
      const res = await axios.get("/phone-directory", { params });
      const allData = res.data?.data || [];

      if (allData.length === 0) return toast.warning("No data to print");

      const exportData = allData.map((item: any, index: number) => ({
        Sl: index + 1,
        Name: item.name,
        Post: item.post || "-",
        Department: item.department?.name || "-",
        "VS Block": item.block?.name || "-",
        Number: item.number,
        Email: item.email || "-",
        Party: item.party?.name || "-",
        Status: item.status,
        "Created On": item.createdAt
          ? new Date(item.createdAt)
              .toLocaleDateString("en-GB")
              .replace(/\//g, "-")
          : "-",
      }));

      const headers = Object.keys(exportData[0]);
      const printWindow = window.open("", "_blank");
      if (!printWindow)
        return toast.error("Pop-up blocked. Please allow pop-ups.");

      const html = `
        <html>
          <head>
            <title>Phone Directory List</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #368F8B; color: white; }
              .header { text-align: center; margin-bottom: 20px; }
              h1 { color: #368F8B; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Phone Directory List</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            <table>
              <thead>
                <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
              </thead>
              <tbody>
                ${exportData
                  .map(
                    (row: any) =>
                      `<tr>${headers.map((h) => `<td>${row[h]}</td>`).join("")}</tr>`,
                  )
                  .join("")}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      toast.error("Failed to prepare print document");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import("xlsx");
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Get raw rows to find where the header actually is
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        if (rawRows.length === 0) {
          toast.warning("No data found in Excel file");
          return;
        }

        // Search for the header row index (looking for "Name", "Sl", etc.)
        const headerKeywords = [
          "name",
          "sl",
          "number",
          "email",
          "post",
          "department",
        ];
        let headerRowIndex = rawRows.findIndex((row) =>
          row.some(
            (cell) =>
              typeof cell === "string" &&
              headerKeywords.includes(cell.toLowerCase().trim()),
          ),
        );

        // Fallback to first row if not found
        if (headerRowIndex === -1) headerRowIndex = 0;

        // Parse starting from the header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: headerRowIndex,
        });

        if (jsonData.length === 0) {
          toast.warning("No data found in Excel file");
          return;
        }

        // Create mapping from name to ID
        const depMap = new Map(
          departments.map((d: IDepartment) => [
            d.name.toLowerCase().trim(),
            d._id,
          ]),
        );
        const blockMap = new Map(
          blocks.map((b: IBlock) => [b.name.toLowerCase().trim(), b._id]),
        );
        const partyMap = new Map(
          parties.map((p: IParty) => [p.name.toLowerCase().trim(), p._id]),
        );

        let successCount = 0;
        let failureCount = 0;

        for (const [index, row] of jsonData.entries()) {
          try {
            // Find keys regardless of case
            const findVal = (patterns: string[]) => {
              const key = Object.keys(row as any).find((k) =>
                patterns.includes(k.trim().toLowerCase()),
              );
              return key ? (row as any)[key] : null;
            };

            const deptName = String(findVal(["department", "dept"]) || "")
              .toLowerCase()
              .trim();

            const blockName = String(
              findVal(["vs block", "block", "vs_block"]) || "",
            )
              .toLowerCase()
              .trim();
            const partyName = String(
              findVal(["party", "political party"]) || "",
            )
              .toLowerCase()
              .trim();

            const payload = {
              name: findVal(["name", "full name", "full_name"]) || "",
              post: findVal(["post", "designation"]) || "",
              department: depMap.get(deptName) || undefined,
              block: blockMap.get(blockName) || undefined,
              number: String(findVal(["number", "phone", "mobile"]) || ""),
              email: findVal(["email", "mail id"]) || "",
              party: partyMap.get(partyName) || undefined,
              status: findVal(["status"]) || "Active",
            };

            if (!payload.name || !payload.number) {
              console.warn(`Row ${index + 2} skipped: Name or Number missing`);
              failureCount++;
              continue;
            }

            await axios.post("/phone-directory", payload);
            successCount++;
          } catch (error) {
            failureCount++;
          }
        }

        toast.success(
          `Import complete: ${successCount} added, ${failureCount} failed`,
        );
        queryClient.invalidateQueries({ queryKey: ["phone-directory"] });
      } catch (error) {
        toast.error("Failed to import file");
      } finally {
        if (event.target) event.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const data = response?.data || [];
  const totalCount =
    response?.filteredCount !== undefined
      ? response.filteredCount
      : response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title="Phone Directory" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                    placeholder="Search Entry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
                    onClick={handlePrint}
                    className="h-9 bg-white dark:bg-[#202123] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    title="Print report"
                  >
                    <FileText className="w-4 h-4 mr-2" /> PDF / Print
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
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
                {hasPermission(PERMISSIONS.CREATE_PHONE_DIRECTORY) && (
                  <Button
                    className="bg-[#368F8B] hover:bg-[#2d7a76] text-white rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    onClick={() => router.push("/phone-directory/create")}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New
                  </Button>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={filterDepartment}
                  onValueChange={(val) => {
                    setFilterDepartment(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Depts</SelectItem>
                    {departments.map((d: IDepartment) => (
                      <SelectItem key={d._id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterParty}
                  onValueChange={(val) => {
                    setFilterParty(val);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parties</SelectItem>
                    {parties.map((p: IParty) => (
                      <SelectItem key={p._id} value={p.name}>
                        {p.name}
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

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                    Show
                  </span>
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(v: string) =>
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
                    className="dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                  >
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[800px] max-w-[80vw]"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
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
                          .replace("name", "Name")
                          .replace("department", "Department")
                          .replace("createdOn", "Created On")
                          .replace("action", "Actions")}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.srNo && (
                      <TableHead className="w-[60px] font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Sr No
                      </TableHead>
                    )}
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Name
                      </TableHead>
                    )}
                    {visibleColumns.post && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Post
                      </TableHead>
                    )}
                    {visibleColumns.department && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Department
                      </TableHead>
                    )}

                    {visibleColumns.block && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        VS Block
                      </TableHead>
                    )}
                    {visibleColumns.number && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Number
                      </TableHead>
                    )}
                    {visibleColumns.email && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Email
                      </TableHead>
                    )}
                    {visibleColumns.party && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Party
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Status
                      </TableHead>
                    )}
                    {visibleColumns.createdOn && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Created On
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
                        Failed to fetch data
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
                        {visibleColumns.name && (
                          <TableCell className="text-gray-900 dark:text-gray-200 font-medium whitespace-nowrap">
                            {item.name}
                          </TableCell>
                        )}
                        {visibleColumns.post && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.post || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.department && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.department?.name || "-"}
                          </TableCell>
                        )}

                        {visibleColumns.block && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.block?.name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.number && (
                          <TableCell className="text-gray-900 dark:text-gray-200 whitespace-nowrap">
                            {item.number}
                          </TableCell>
                        )}
                        {visibleColumns.email && (
                          <TableCell className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                            {item.email || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.party && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.party?.name || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                item.status === "Active"
                                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.createdOn && (
                          <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "-"}
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
                                  PERMISSIONS.VIEW_PHONE_DIRECTORY,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/phone-directory/${item._id}/view`,
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.EDIT_PHONE_DIRECTORY,
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/phone-directory/${item._id}/edit`,
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                )}
                                {hasPermission(
                                  PERMISSIONS.DELETE_PHONE_DIRECTORY,
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
                  {pagination.limit !== -1 ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1}{" "}
                        to{" "}
                        {Math.min(
                          pagination.page * pagination.limit,
                          totalCount,
                        )}{" "}
                        of {totalCount} entries
                      </p>
                      <div className="flex items-center gap-3">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={Math.ceil(totalCount / pagination.limit)}
                          onPageChange={(page) =>
                            setPagination((prev) => ({ ...prev, page }))
                          }
                          activeColor="bg-[#00563B]"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing all {data.length} entries
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

export default PhoneDirectoryList;
