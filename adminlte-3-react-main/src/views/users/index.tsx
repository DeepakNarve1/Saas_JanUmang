"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useRef } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { IUserResponse, IUserRow, IRole } from "@app/types/user";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { Avatar, AvatarFallback } from "@app/components/ui/avatar";
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
import { ResetPasswordDialog } from "@app/components/ResetPasswordDialog";

import {
  Search,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  Eye,
  Edit,
  Trash2,
  Columns,
  History,
  KeyRound,
} from "lucide-react";
import { ContentHeader } from "@app/components";
import { Pagination } from "@app/components/common/Pagination";
import { useDebounce } from "@app/hooks/useDebounce";

interface IUserColumns {
  srNo: boolean;
  name: boolean;
  email: boolean;
  mobile: boolean;
  role: boolean;
  createdOn: boolean;
  action: boolean;
  organization?: boolean;
}

const Users = () => {
  const {
    hasPermission,
    isSuperAdmin,
    isTenantAdmin,
    user: loggedInUser,
  } = usePermissions();
  const isGlobalAdmin = isSuperAdmin();
  const isOrgAdmin = isTenantAdmin();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Password Reset Dialog State
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    userEmail: string;
  }>({
    open: false,
    userId: "",
    userName: "",
    userEmail: "",
  });

  const [visibleColumns, setVisibleColumns] = useState<IUserColumns>({
    srNo: true,
    name: true,
    email: true,
    mobile: true,
    role: true,
    createdOn: true,
    action: true,
    organization: isGlobalAdmin,
  });

  const toggleColumn = (key: keyof IUserColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 1. Fetch Roles
  const { data: rolesResponse } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await axios.get("/rbac/roles?limit=-1");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const allRoles: IRole[] = rolesResponse?.data || [];

  // 2. Fetch Users
  const { data: usersResponse, isLoading: loadingUsers } =
    useQuery<IUserResponse>({
      queryKey: ["users"],
      queryFn: async () => {
        const res = await axios.get("/auth/users?limit=-1");
        return res.data;
      },
      staleTime: 1 * 60 * 1000,
    });

  // 3. Populate and Filter Users
  const processedUsers = useMemo(() => {
    let data = usersResponse?.data || [];

    // Client-side population fallback
    if (data.length > 0 && allRoles.length > 0) {
      if (typeof data[0].role === "string") {
        const roleMap = new Map();
        allRoles.forEach((role) => roleMap.set(role._id, role));

        data = data.map((user) => ({
          ...user,
          role:
            typeof user.role === "string" && roleMap.has(user.role)
              ? roleMap.get(user.role)
              : user.role,
        }));
      }
    }

    // Filter by Role
    if (selectedRole !== "all") {
      data = data.filter((u) => {
        const roleName = typeof u.role === "object" ? u.role.name : u.role;
        return roleName === selectedRole;
      });
    }

    // Filter by Search Term
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.mobile && u.mobile.includes(term)),
      );
    }

    return data;
  }, [usersResponse, allRoles, selectedRole, debouncedSearchTerm]);

  // 4. Pagination (Client-side)
  const paginatedUsers = useMemo(() => {
    if (entriesPerPage === -1) return processedUsers;
    const start = (currentPage - 1) * entriesPerPage;
    return processedUsers.slice(start, start + entriesPerPage);
  }, [processedUsers, currentPage, entriesPerPage]);

  const totalPages = Math.ceil(
    processedUsers.length /
      (entriesPerPage === -1 ? processedUsers.length || 1 : entriesPerPage),
  );

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/auth/users/${id}`);
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Could not delete user");
    },
  });

  const handleDelete = (id: string) => {
    
    deleteMutation.mutate(id);
  };

  const handleExport = async () => {
    if (processedUsers.length === 0) return toast.warning("No users to export");
    try {
      const XLSX = await import("xlsx");
      const data = processedUsers.map((user) => ({
        Name: user.name,
        Email: user.email,
        Mobile: user.mobile || "-",
        Role:
          typeof user.role === "object"
            ? user.role.displayName || user.role.name
            : user.role || "-",
        "Created On": user.createdAt
          ? new Date(user.createdAt).toLocaleString()
          : "-",
        Organization: user.tenant?.name || "Platform"
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, `users_${Date.now()}.xlsx`);
      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to load export library");
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Placeholder as originally implementation was empty/commented out or manual
    toast.info("Import feature coming soon");
  };

  const getRoleVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "superadmin":
        return "default";
      case "admin":
        return "destructive";
      case "manager":
        return "secondary";
      case "editor":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <section className="content">
        <div className="container-fluid px-4">
          <ContentHeader title="Users Management" />
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, email or mobile..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
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

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white dark:bg-[#202123] rounded-lg text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
                  >
                    <Upload className="w-5 h-5 mr-2 text-orange-500" /> Import
                  </Button>

                  {hasPermission(PERMISSIONS.CREATE_USERS) && (
                    <Button
                      size="lg"
                      onClick={() => router.push("/users/create")}
                      className="bg-[#368F8B] hover:bg-[#2d7a76] text-white dark:bg-[#368F8B] dark:hover:bg-[#2d7a76] rounded-lg shadow-lg shadow-green-500/20 dark:shadow-[#368F8B]/30 border-0 transition-all"
                    >
                      <Plus className="w-5 h-5 mr-2 font-bold" /> Add User
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedRole}
                  onValueChange={(v) => {
                    setSelectedRole(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-36 h-9 bg-white dark:bg-gray-800 text-sm dark:border-gray-700">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {allRoles.map((role) => (
                      <SelectItem key={role._id} value={role.name}>
                        {role.displayName || role.name}
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
                    onValueChange={(v: string) =>
                      setEntriesPerPage(v === "-1" ? -1 : Number(v))
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
                    className="bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300"
                  >
                    <Columns className="w-4 h-4 mr-2" /> Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {(Object.keys(visibleColumns) as (keyof IUserColumns)[]).map(
                    (key) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={visibleColumns[key]}
                        onCheckedChange={() => toggleColumn(key)}
                      >
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .trim()
                          .replace("srNo", "Sr. No.")
                          .replace("name", "Name")
                          .replace("email", "Email")
                          .replace("mobile", "Mobile")
                          .replace("role", "Role")
                          .replace("createdOn", "Created On")
                          .replace("action", "Actions")
                          .replace("organization", "Organization")}
                      </DropdownMenuCheckboxItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />

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
                    {visibleColumns.email && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Email
                      </TableHead>
                    )}
                    {visibleColumns.mobile && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Mobile
                      </TableHead>
                    )}
                    {visibleColumns.role && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Role
                      </TableHead>
                    )}
                    {visibleColumns.createdOn && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Created On
                      </TableHead>
                    )}
                    {visibleColumns.organization && (
                      <TableHead className="font-semibold text-white dark:text-white uppercase tracking-wider text-xs">
                        Organization
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
                  {loadingUsers ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell
                          colSpan={
                            Object.values(visibleColumns).filter(Boolean)
                              .length
                          }
                        >
                           <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="text-center py-20 text-gray-500 dark:text-gray-400"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user, idx) => {
                      const roleName =
                        typeof user.role === "object"
                          ? user.role.displayName || user.role.name
                          : user.role || "User";
                      return (
                        <TableRow
                          key={user._id}
                          className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-100 dark:border-gray-800 transition-colors"
                        >
                          {visibleColumns.srNo && (
                            <TableCell className="text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                              {(currentPage - 1) * entriesPerPage + idx + 1}
                            </TableCell>
                          )}
                          {visibleColumns.name && (
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm dark:text-gray-100">
                                  {user.name}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.email && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm dark:text-gray-300">
                                  {user.email}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.mobile && (
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">
                                  {user.mobile || "-"}
                                </span>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.role && (
                            <TableCell>
                              <Badge
                                variant={getRoleVariant(roleName)}
                                className="text-sm px-3 py-1"
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                {roleName}
                              </Badge>
                            </TableCell>
                          )}
                          {visibleColumns.createdOn && (
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          )}
                          {visibleColumns.organization && (
                            <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                              {user.tenant?.name || "Platform"}
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
                                  {hasPermission(PERMISSIONS.VIEW_USERS) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(`/users/${user._id}/view`)
                                      }
                                    >
                                      <Eye className="mr-2 h-4 w-4" /> View
                                    </DropdownMenuItem>
                                  )}
                                  {hasPermission(PERMISSIONS.EDIT_USERS) &&
                                    (user.level !== "tenant_admin" ||
                                      isGlobalAdmin) && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          router.push(`/users/${user._id}/edit`)
                                        }
                                      >
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                    )}
                                  {/* Reset Password — visible to: global admins for anyone,
                                       tenant admins for non-admin employees in their org only */}
                                  {(isSuperAdmin() ||
                                    (isOrgAdmin &&
                                      user.level !== "tenant_admin" &&
                                      user.level !== "system_admin" &&
                                      user.level !== "superadmin")) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setResetPasswordDialog({
                                          open: true,
                                          userId: user._id,
                                          userName: user.name,
                                          userEmail: user.email,
                                        })
                                      }
                                    >
                                      <KeyRound className="mr-2 h-4 w-4" />{" "}
                                      Reset Password
                                    </DropdownMenuItem>
                                  )}
                                  {hasPermission(PERMISSIONS.DELETE_USERS) &&
                                    (user.level !== "tenant_admin" ||
                                      isGlobalAdmin) && (
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDelete(user._id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />{" "}
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                  {hasPermission(
                                    PERMISSIONS.VIEW_ACTIVITY_LOGS,
                                  ) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/users/${user._id}/login-history`,
                                        )
                                      }
                                    >
                                      <History className="mr-2 h-4 w-4" /> Login
                                      History
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-800/30">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * entriesPerPage,
                    processedUsers.length,
                  )}{" "}
                  of {processedUsers.length} users
                </p>
                <div className="flex items-center gap-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    activeColor="bg-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) =>
          setResetPasswordDialog((prev) => ({ ...prev, open }))
        }
        userId={resetPasswordDialog.userId}
        userName={resetPasswordDialog.userName}
        userEmail={resetPasswordDialog.userEmail}
      />
    </>
  );
};

export default Users;
