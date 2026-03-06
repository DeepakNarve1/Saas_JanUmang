import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebounce } from "@app/hooks/useDebounce";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { getErrorMessage, handleError } from "@app/utils/errorHandler";

interface ListManagementOptions<TData, TResponse, TVisibleColumns> {
  queryKey: string;
  endpoint: string;
  initialVisibleColumns: TVisibleColumns;
  exportConfig?: {
    filename: string;
    sheetName: string;
    mapRow: (row: TData, index: number) => Record<string, any>;
  };
  importConfig?: {
    mapRow: (row: any) => any;
  };
}

export const useListManagement = <
  TData,
  TResponse extends {
    data: TData[];
    total?: number;
    count?: number;
    filteredCount?: number;
  },
  TVisibleColumns = Record<string, boolean>,
>({
  queryKey,
  endpoint,
  initialVisibleColumns,
  exportConfig,
  importConfig,
}: ListManagementOptions<TData, TResponse, TVisibleColumns>) => {
  const queryClient = useQueryClient();

  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);

  const toggleColumn = (key: keyof TVisibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<TResponse>({
    queryKey: [
      queryKey,
      pagination.page,
      pagination.limit,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      try {
        const res = await axios.get(endpoint, {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearchTerm,
          },
        });
        return res.data;
      } catch (error: unknown) {
        handleError(error, `Failed to fetch data from ${endpoint}`);
        throw error;
      }
    },
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error: unknown) => {
      handleError(error, "Failed to delete");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleCopy = async () => {
    const data = response?.data || [];
    if (data.length === 0) return toast.warning("No data to copy");
    if (!exportConfig) return;

    try {
      const exportData = data.map((row, index) =>
        exportConfig.mapRow(row, index),
      );
      const headers = Object.keys(exportData[0]);
      const rows = exportData.map((row: any) =>
        headers.map((header) => row[header]).join("\t"),
      );
      const text = [headers.join("\t"), ...rows].join("\n");

      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error: unknown) {
      handleError(error, "Failed to copy data");
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await axios.get(endpoint, {
        params: { limit: -1, search: debouncedSearchTerm },
      });
      const allData = res.data?.data || [];

      if (allData.length === 0) return toast.warning("No data to export");
      if (!exportConfig) return;

      const XLSX = await import("xlsx");
      const exportData = allData.map((row: any, index: number) =>
        exportConfig.mapRow(row, index),
      );

      // Create an empty worksheet with the title
      const ws = XLSX.utils.aoa_to_sheet([["Jan Umang"]]);

      // Add the data starting from cell A2
      XLSX.utils.sheet_add_json(ws, exportData, { origin: "A2" });

      // Merge the title row across the columns
      const columnCount = Object.keys(exportData[0]).length;
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }];

      // Set column widths
      const wscols = Object.keys(exportData[0]).map((key) => ({
        wch: Math.max(key.length, 20),
      }));
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, exportConfig.sheetName);
      XLSX.writeFile(wb, `${exportConfig.filename}_${Date.now()}.xlsx`);
      toast.success("Excel exported successfully");
    } catch (error: unknown) {
      handleError(error, "Failed to load Excel library");
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await axios.get(endpoint, {
        params: { limit: -1, search: debouncedSearchTerm },
      });
      const allData = res.data?.data || [];

      if (allData.length === 0) return toast.warning("No data to export");
      if (!exportConfig) return;

      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("l", "mm", "a4");
      const exportData = allData.map((row: any, index: number) =>
        exportConfig.mapRow(row, index),
      );
      const headers = [Object.keys(exportData[0])];
      const body = exportData.map((row: any) => Object.values(row));

      autoTable(doc, {
        head: headers,
        body: body,
        theme: "grid",
        margin: { top: 25 },
        styles: { font: "helvetica", fontSize: 8, cellPadding: 3 },
        headStyles: {
          fillColor: [54, 143, 139],
          textColor: [255, 255, 255],
          font: "helvetica",
          fontStyle: "bold",
        },
        didDrawPage: (data) => {
          // Page Header
          doc.setFontSize(18);
          doc.setTextColor(54, 143, 139);
          doc.text("Jan Umang", data.settings.margin.left, 15);

          // Footer with Page Number
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

      doc.save(`${exportConfig.filename}_${Date.now()}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error: unknown) {
      handleError(error, "Failed to generate PDF");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!importConfig) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import("xlsx");
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Get raw data as an array of arrays to find the header row
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        if (rawRows.length === 0) {
          toast.warning("No data found in Excel file");
          return;
        }

        // Find the index of the header row (first row that contains common keywords)
        const headerKeywords = [
          "name",
          "id",
          "createdat",
          "department",
          "booth",
          "panchayat",
        ];
        let headerRowIndex = rawRows.findIndex((row) =>
          row.some(
            (cell) =>
              typeof cell === "string" &&
              headerKeywords.includes(cell.toLowerCase().trim()),
          ),
        );

        // If no header found, assume it's the first row, otherwise start from the header row
        if (headerRowIndex === -1) headerRowIndex = 0;

        // Re-parse the sheet starting from the detected header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          range: headerRowIndex,
        });

        if (jsonData.length === 0) {
          toast.warning("No data found in Excel file");
          return;
        }

        let successCount = 0;
        let failureCount = 0;

        for (const [index, row] of jsonData.entries()) {
          try {
            const payload = importConfig.mapRow(row);

            // Basic validation: skip if name is empty (assuming name is the primary field)
            if (!payload || Object.values(payload).every((v) => !v)) {
              console.warn(
                `Import: Skipping row ${index + 1} due to empty payload`,
                row,
              );
              failureCount++;
              continue;
            }

            await axios.post(endpoint, payload);
            successCount++;
          } catch (error: unknown) {
            failureCount++;
            handleError(error, `Import: Failed to add row ${index + 1}`);
          }
        }

        toast.success(
          `Import complete: ${successCount} added, ${failureCount} failed`,
        );
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      } catch (error: unknown) {
        handleError(error, "Failed to import file");
      } finally {
        if (event.target) event.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePrint = async () => {
    try {
      const res = await axios.get(endpoint, {
        params: { limit: -1, search: debouncedSearchTerm },
      });
      const allData = res.data?.data || [];

      if (allData.length === 0) return toast.warning("No data to print");
      if (!exportConfig) return;

      const exportData = allData.map((row: any, index: number) =>
        exportConfig.mapRow(row, index),
      );
      const headers = Object.keys(exportData[0]);

      const printWindow = window.open("", "_blank");
      if (!printWindow)
        return toast.error("Pop-up blocked. Please allow pop-ups.");

      const html = `
        <html>
          <head>
            <title>Jan Umang - ${exportConfig.sheetName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Hind:wght@400;700&display=swap');
              body { 
                font-family: 'Hind', Arial, sans-serif; 
                padding: 40px; 
                color: #333;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #368F8B;
                margin-bottom: 30px;
                padding-bottom: 20px;
              }
              .header h1 { 
                margin: 0; 
                color: #368F8B; 
                font-size: 28px;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .header p { margin: 5px 0 0; color: #666; font-size: 14px; }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px; 
                font-size: 12px;
              }
              th, td { 
                border: 1px solid #e2e8f0; 
                padding: 12px 10px; 
                text-align: left; 
              }
              th { 
                background-color: #368F8B; 
                color: white; 
                font-weight: 700;
                text-transform: uppercase;
              }
              tr:nth-child(even) { background-color: #f8fafc; }
              .footer {
                margin-top: 30px;
                font-size: 10px;
                color: #94a3b8;
                text-align: right;
              }
              @media print {
                @page { margin: 1.5cm; size: landscape; }
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Jan Umang</h1>
              <p>${exportConfig.sheetName} - Internal Report</p>
              <p style="font-size: 12px; margin-top: 10px;">Generated on: ${new Date().toLocaleString()}</p>
            </div>
            <table>
              <thead>
                <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
              </thead>
              <tbody>
                ${exportData
                  .map(
                    (row: any) =>
                      `<tr>${headers.map((h) => `<td>${row[h] || "-"}</td>`).join("")}</tr>`,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              Generated by Jan Umang Admin System
            </div>
            <script>
              window.onload = function() {
                setTimeout(() => {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error: unknown) {
      handleError(error, "Failed to prepare print document");
    }
  };

  return {
    pagination,
    setPagination,
    searchTerm,
    setSearchTerm,
    visibleColumns,
    toggleColumn,
    response,
    isLoading,
    isError,
    handleDelete,
    handleCopy,
    handleExportExcel,
    handleExportPDF,
    handlePrint,
    handleImport,
    handleExport: handleExportExcel,
  };
};
