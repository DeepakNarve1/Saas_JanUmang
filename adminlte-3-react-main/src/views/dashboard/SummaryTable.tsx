import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@app/components/ui/card";
import { Pagination } from "@app/components/common/Pagination";

interface Column {
  header: string;
  accessorKey: string;
  render?: (row: any) => React.ReactNode;
}

interface SummaryTableProps {
  title: string;
  data: any[];
  columns: Column[];
  isLoading?: boolean;
}

const SummaryTable: React.FC<SummaryTableProps> = React.memo(
  ({ title, data, columns, isLoading = false }) => {
    const [pageSize, setPageSize] = React.useState(10);
    const [currentPage, setCurrentPage] = React.useState(1);

    // Reset page when data length changes significantly or filter applied
    React.useEffect(() => {
      setCurrentPage(1);
    }, [data.length]);

    const totalPages = Math.ceil(data.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const paginatedData = data.slice(startIdx, startIdx + pageSize);

    return (
      <Card className="shadow-sm border border-gray-200 dark:border-gray-800 mt-6 bg-white dark:bg-card overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </CardTitle>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Show</span>
              <select
                className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={data.length}>All</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider text-xs border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3 w-16 text-center">Sr No.</th>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-6 py-3 text-center">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No records found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-3 text-center text-gray-500 dark:text-gray-400">
                        {startIdx + rowIdx + 1}
                      </td>
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="px-6 py-3 text-center">
                          {col.render
                            ? col.render(row)
                            : row?.[col.accessorKey]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isLoading && data.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIdx + 1} to{" "}
                {Math.min(startIdx + pageSize, data.length)} of {data.length}{" "}
                entries
              </div>
              <div className="flex gap-1">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  activeColor="bg-blue-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

SummaryTable.displayName = "SummaryTable";

export default SummaryTable;
