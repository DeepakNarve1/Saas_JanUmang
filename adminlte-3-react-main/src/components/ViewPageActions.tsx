import { Button } from "@app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ViewPageActionsProps {
  getExportData: () => Record<string, any>; // Returns flat object for export
  fileName: string;
  visibleSections?: Record<string, boolean>;
  onToggleSection?: (key: string) => void;
  sectionLabels?: Record<string, string>; // Map keys to human readable labels
  className?: string;
}

export const ViewPageActions = ({
  getExportData,
  fileName,
  visibleSections,
  onToggleSection,
  sectionLabels,
  className = "",
}: ViewPageActionsProps) => {
  const handleCopy = () => {
    // ...
  };
  const handleExcel = async () => {
    // ...
  };
  const handlePDF = () => {
    // ...
  };

  // NOTE: I am not copying the entire logical blocks for brevity in this instruction,
  // but tool will need valid replacement.
  /* Redefining full component to be safe */

  const handleCopyAction = () => {
    const data = getExportData();
    const text = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    // @ts-ignore
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast.success("Copied to clipboard"));
    } else {
      toast.warn("Clipboard not supported");
    }
  };

  const handleExcelAction = async () => {
    const data = getExportData();
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet([data]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Details");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success("Excel exported");
    } catch (e) {
      toast.error("Failed to export Excel");
    }
  };

  const handlePDFAction = () => {
    // @ts-ignore
    const doc = new jsPDF();
    const data = getExportData();

    doc.setFontSize(16);
    doc.text(fileName.replace(/_/g, " "), 14, 15);

    const tableBody = Object.entries(data).map(([k, v]) => [k, v]);

    autoTable(doc, {
      startY: 20,
      head: [["Field", "Value"]],
      body: tableBody as any[],
      theme: "striped",
    });

    doc.save(`${fileName}.pdf`);
    toast.success("PDF exported");
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyAction}
        className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExcelAction}
        className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePDFAction}
        className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        PDF
      </Button>

      {visibleSections && onToggleSection && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Column visibility
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dark:bg-gray-900 dark:border-gray-700">
            {Object.keys(visibleSections).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={visibleSections[key]}
                onCheckedChange={() => onToggleSection(key)}
                className="dark:text-gray-300 dark:focus:bg-gray-800"
              >
                {sectionLabels?.[key] ||
                  key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
