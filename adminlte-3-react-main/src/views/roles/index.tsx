"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
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
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Columns,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useDebounce } from "@app/hooks/useDebounce";
import { Pagination } from "@app/components/common/Pagination";
import { IRoleResponse, IRole } from "@app/types/role";
import { Badge } from "@app/components/ui/badge";

const RoleList = () => {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const isGlobalAdmin = isSuperAdmin();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    displayName: true,
    description: true,
    status: true,
    createdOn: true,
    action: true,
  });

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch Data Query
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<IRoleResponse>({
    queryKey: ["roles", pagination.page, pagination.limit, debouncedSearchTerm],
    queryFn: async () => {
      // Assuming the API supports pagination and search
      // Note: The original code showed fetching all roles and client-side filtering.
      // If the backend doesn't support pagination, we might need to fetch all and slice client-side,
      // but typically we want server-side pagination. I'll stick to the pattern I've been using,
      // assuming the backend route /rbac/roles supports these params or I'll handle it if it returns everything.
      // Based on previous patterns, let's try passing params. If the backend ignores them, it returns all data.
      const res = await axios.get("/rbac/roles", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm,
        },
      });
      // If backend returns { data: [...] } without metadata, we might need to adjust.
      // Assuming standard response structure for now.
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/rbac/roles/${id}`);
    },
    onSuccess: () => {
      toast.success("Role deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Could not delete role");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  // 3. Process Roles (Filter by Search)
  const processedRoles = useMemo(() => {
    let roles = response?.data || [];

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      roles = roles.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.displayName?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term),
      );
    }
    return roles;
  }, [response, debouncedSearchTerm]);

  // 4. Client-side Pagination
  const paginatedRoles = useMemo(() => {
    if (pagination.limit === -1) return processedRoles;
    const start = (pagination.page - 1) * pagination.limit;
    return processedRoles.slice(start, start + pagination.limit);
  }, [processedRoles, pagination]);

  const totalItems = processedRoles.length;
  const totalPages = Math.ceil(
    totalItems / (pagination.limit === -1 ? totalItems || 1 : pagination.limit),
  );

  return (
    <>
      <ContentHeader title="Role Management" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            {/* Actions Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search roles by name or description..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 dark:focus:bg-[#202123]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {(hasPermission(PERMISSIONS.MANAGE_ROLES) ||
                    hasPermission(PERMISSIONS.CREATE_ROLES)) && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/roles/create")}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-[#368F8B]/20 border-0 transition-all font-medium"
                    >
                      <Plus className="w-5 h-5 mr-2 font-bold" /> Create New
                      Role
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
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

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
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
                        .replace("name", "Role Name")
                        .replace("displayName", "Display Name")
                        .replace("description", "Description")
                        .replace("status", "Status")
                        .replace("createdOn", "Created On")
                        .replace("action", "Actions")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#00563B] dark:bg-gray-800 hover:bg-transparent border-gray-200 dark:border-gray-800">
                    {visibleColumns.name && (
                      <TableHead className="font-semibold text-white dark:text-gray-200 uppercase tracking-wider text-xs">
                        Role Name
                      </TableHead>
                    )}
                    {visibleColumns.displayName && (
                      <TableHead className="font-semibold text-white dark:text-gray-200 uppercase tracking-wider text-xs">
                        Display Name
                      </TableHead>
                    )}
                    {visibleColumns.description && (
                      <TableHead className="font-semibold text-white dark:text-gray-200 uppercase tracking-wider text-xs">
                        Description
                      </TableHead>
                    )}
                    {visibleColumns.status && (
                      <TableHead className="font-semibold text-white dark:text-gray-200 uppercase tracking-wider text-xs">
                        Status
                      </TableHead>
                    )}
                    {visibleColumns.createdOn && (
                      <TableHead className="font-semibold text-white dark:text-gray-200 uppercase tracking-wider text-xs">
                        Created On
                      </TableHead>
                    )}
                    {visibleColumns.action && (
                      <TableHead className="text-right font-semibold text-white dark:text-gray-200 uppercase tracking-wider text-xs">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {visibleColumns.name && (
                          <TableCell>
                            <Skeleton className="h-10 w-40" />
                          </TableCell>
                        )}
                        {visibleColumns.displayName && (
                          <TableCell>
                            <Skeleton className="h-10 w-48" />
                          </TableCell>
                        )}
                        {visibleColumns.description && (
                          <TableCell>
                            <Skeleton className="h-10 w-64" />
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Skeleton className="h-10 w-24" />
                          </TableCell>
                        )}
                        {visibleColumns.createdOn && (
                          <TableCell>
                            <Skeleton className="h-10 w-32" />
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell>
                            <Skeleton className="h-10 w-10 ml-auto" />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-20 text-red-500"
                      >
                        Failed to load roles
                      </TableCell>
                    </TableRow>
                  ) : paginatedRoles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No roles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRoles.map((role) => (
                      <TableRow
                        key={role._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                      >
                        {visibleColumns.name && (
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-sm border border-blue-200 dark:border-blue-800">
                                {role.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="dark:text-gray-100">
                                {role.name}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.displayName && (
                          <TableCell className="dark:text-gray-300">
                            {role.displayName}
                          </TableCell>
                        )}
                        {visibleColumns.description && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {role.description || "-"}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <Badge
                              variant={
                                role.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                role.status === "active"
                                  ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                              }
                            >
                              {role.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.createdOn && (
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {role.createdAt
                              ? new Date(role.createdAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        )}
                        {visibleColumns.action && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(hasPermission(PERMISSIONS.MANAGE_ROLES) ||
                                  hasPermission(PERMISSIONS.VIEW_ROLES)) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/roles/${role._id}`)
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </DropdownMenuItem>
                                )}
                                {(hasPermission(PERMISSIONS.MANAGE_ROLES) ||
                                  hasPermission(PERMISSIONS.EDIT_ROLES)) &&
                                  (!role.isSystem || isGlobalAdmin) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(`/roles/${role._id}/edit`)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                  )}
                                {(hasPermission(PERMISSIONS.MANAGE_ROLES) ||
                                  hasPermission(PERMISSIONS.DELETE_ROLES)) &&
                                  (!role.isSystem || isGlobalAdmin) && (
                                    <ConfirmDialog
                                    onConfirm={() => handleDelete(role._id)}
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
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && processedRoles.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  {pagination.limit !== -1 ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(pagination.page - 1) * pagination.limit + 1}{" "}
                        to{" "}
                        {Math.min(
                          pagination.page * pagination.limit,
                          totalItems,
                        )}{" "}
                        of {totalItems} roles
                      </p>
                      <div className="flex items-center gap-3">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={totalPages}
                          onPageChange={(page) =>
                            setPagination((prev) => ({ ...prev, page }))
                          }
                          activeColor="bg-[#368F8B]"
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing all {totalItems} roles
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

export default RoleList;
