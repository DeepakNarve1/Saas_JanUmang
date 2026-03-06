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
import { Badge } from "@app/components/ui/badge";
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
  Eye,
  Edit,
  Columns,
  MoreVertical,
  Trash2,
  Loader2,
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
import { IProjectResponse } from "@app/types/projectSummary";

const ProjectSummary = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canDelete = hasPermission(PERMISSIONS.DELETE_PROJECTS);
  const canCreate = hasPermission(PERMISSIONS.CREATE_PROJECTS);
  const canEdit = hasPermission(PERMISSIONS.EDIT_PROJECTS);

  // State
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [textModal, setTextModal] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // Filters
  const [filterBlock, setFilterBlock] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    srNo: true,
    workName: true,
    district: true,
    block: true,
    department: true,
    projectCost: true,
    proposalEstimate: true,
    status: true,
    officerName: true,
    contactNumber: true,
    view: true,
    action: true,
    remarks: true,
    currentProgress: true,
    createdAt: true,
  });

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

  // Fetch Projects query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IProjectResponse>({
    queryKey: [
      "projects",
      currentPage,
      entriesPerPage,
      debouncedSearchTerm,
      filterBlock,
      filterDepartment,
      filterStatus,
    ],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit: entriesPerPage,
        block: filterBlock === "all" ? undefined : filterBlock,
        department: filterDepartment === "all" ? undefined : filterDepartment,
        status: filterStatus === "all" ? undefined : filterStatus,
        search: debouncedSearchTerm || undefined,
      };

      const res = await axios.get("/projects", { params });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete project");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleExport = async () => {
    const dataToExport = response?.data || [];
    if (dataToExport.length === 0) return toast.warning("No data to export");
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Projects");
      XLSX.writeFile(wb, "ProjectSummary.xlsx");
      toast.success("Exported successfully");
    } catch (error) {
      toast.error("Failed to load export library");
    }
  };

  const handleImport = () => {
    toast.info("Import feature coming soon");
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "default";
      case "in progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const data = response?.data || [];
  const totalCount =
    response?.filteredCount !== undefined
      ? response.filteredCount
      : response?.total || response?.count || 0;

  return (
    <>
      <ContentHeader title="Project Summary" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Row 1: Search Bar and Action Buttons */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search Bar - Left */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  />
                </div>

                {/* Action Buttons - Right */}
                <div className="flex flex-wrap items-center gap-4">
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
                      onClick={() => router.push("/project-summary/create")}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2 font-bold" /> Add Project
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Filters */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-3">
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
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    {blocks.map((b: any) => (
                      <SelectItem key={b._id} value={b.name}>
                        {b.name}
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
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d: any) => (
                      <SelectItem key={d._id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterStatus}
                  onValueChange={(val) => {
                    setFilterStatus(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-[#202123] text-sm dark:border-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
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

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />

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
                        .trim()
                        .replace("srNo", "Sr No")}
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
                    {visibleColumns.workName && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Work Name
                      </TableHead>
                    )}
                    {visibleColumns.district && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        District
                      </TableHead>
                    )}
                    {visibleColumns.block && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Block
                      </TableHead>
                    )}
                    {visibleColumns.department && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Department
                      </TableHead>
                    )}

                    {visibleColumns.projectCost && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Project Cost (₹)
                      </TableHead>
                    )}
                    {visibleColumns.proposalEstimate && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Proposal Estimate (₹)
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Status
                      </TableHead>
                    )}
                    {visibleColumns.officerName && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Officer Name
                      </TableHead>
                    )}
                    {visibleColumns.contactNumber && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Contact Number
                      </TableHead>
                    )}
                    {visibleColumns.remarks && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Remarks
                      </TableHead>
                    )}
                    {visibleColumns.currentProgress && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Current Progress
                      </TableHead>
                    )}
                    {visibleColumns.createdAt && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Created On
                      </TableHead>
                    )}
                    <TableHead className="text-right font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={16} className="text-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={16}
                        className="text-center py-20 text-red-500"
                      >
                        Failed to fetch projects
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={16}
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No projects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((project, idx) => (
                      <TableRow
                        key={project._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.srNo && (
                          <TableCell className="dark:text-gray-300">
                            {entriesPerPage === -1
                              ? idx + 1
                              : (currentPage - 1) * entriesPerPage + idx + 1}
                          </TableCell>
                        )}
                        {visibleColumns.workName && (
                          <TableCell className="dark:text-gray-300">
                            {project.workName}
                          </TableCell>
                        )}
                        {visibleColumns.district && (
                          <TableCell className="dark:text-gray-300">
                            {project.district}
                          </TableCell>
                        )}
                        {visibleColumns.block && (
                          <TableCell className="dark:text-gray-300">
                            {project.block}
                          </TableCell>
                        )}
                        {visibleColumns.department && (
                          <TableCell className="dark:text-gray-300">
                            {project.department}
                          </TableCell>
                        )}

                        {visibleColumns.projectCost && (
                          <TableCell className="dark:text-gray-300">
                            ₹{project.projectCost.toLocaleString()}
                          </TableCell>
                        )}
                        {visibleColumns.proposalEstimate && (
                          <TableCell className="dark:text-gray-300">
                            ₹{project.proposalEstimate.toLocaleString()}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge variant={getStatusVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.officerName && (
                          <TableCell className="dark:text-gray-300">
                            {project.officerName || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.contactNumber && (
                          <TableCell className="dark:text-gray-300">
                            {project.contactNumber || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.remarks && (
                          <TableCell
                            className="max-w-[150px] truncate cursor-pointer hover:text-[#368F8B] transition-colors dark:text-gray-300"
                            onClick={() =>
                              setTextModal({
                                title: "Project Remarks",
                                content: project.remarks || "No remarks",
                              })
                            }
                            title="Click to view full remarks"
                          >
                            {project.remarks || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.currentProgress && (
                          <TableCell
                            className="max-w-[150px] truncate cursor-pointer hover:text-[#368F8B] transition-colors dark:text-gray-300"
                            onClick={() =>
                              setTextModal({
                                title: "Current Progress",
                                content:
                                  project.currentProgress || "No progress data",
                              })
                            }
                            title="Click to view full progress"
                          >
                            {project.currentProgress || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell className="dark:text-gray-300 whitespace-nowrap">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
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
                                  router.push(`/project-summary/${project._id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              {canEdit && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/project-summary/${project._id}/edit`,
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit Project
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(project._id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  Project
                                </DropdownMenuItem>
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
            {!isLoading && data.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing{" "}
                    {entriesPerPage === -1
                      ? 1
                      : (currentPage - 1) * entriesPerPage + 1}{" "}
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
                      activeColor="bg-[#368F8B]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generic Text Modal */}
        {textModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-2000 flex items-center justify-center p-4"
            onClick={() => setTextModal(null)}
          >
            <div
              className="bg-white dark:bg-card rounded-xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  {textModal.title}
                </h3>
                <button
                  onClick={() => setTextModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {textModal.content}
                </p>
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setTextModal(null)}
                  className="bg-[#368F8B] hover:bg-[#2d7a76] px-8"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ProjectSummary;
