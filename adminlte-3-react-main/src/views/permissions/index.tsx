"use client";

import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Skeleton } from "@app/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import {
  Shield,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { IPermission } from "@app/types/role";

interface ModulePermissions {
  module: string;
  moduleName: string;
  moduleDescription: string;
  permissions: IPermission[];
}

interface PermissionsData {
  enabledModules: string[];
  permissions: ModulePermissions[];
}

const moduleIcons: Record<string, string> = {
  dashboard: "fas fa-tachometer-alt",
  users: "fas fa-wrench",
  roles: "fas fa-user-shield",
  user_count: "fas fa-chart-pie",
  activity_management: "fas fa-history",
  mp_public_problems: "fas fa-exclamation-circle",
  assembly_issues: "fas fa-university",
  projects: "fas fa-user-friends",
  visitors: "fas fa-id-badge",
  events: "fas fa-calendar-alt",
  members: "fas fa-users",
  voters: "fas fa-id-card",
  phone_directory: "fas fa-address-book",
  departments: "fas fa-building",
  blocks: "fas fa-cubes",
  booths: "fas fa-person-booth",
  panchayats: "fas fa-users",
  villages: "fas fa-home",
  states: "fas fa-map-marker-alt",
  divisions: "fas fa-map-signs",
  districts: "fas fa-map",
  parliaments: "fas fa-landmark",
  assemblies: "fas fa-university",
  samiti: "fas fa-users-cog",
  parties: "fas fa-flag",
  work_types: "fas fa-briefcase",
  sub_work_types: "fas fa-tasks",
  call_management: "fas fa-phone-volume",
  inward_register: "fas fa-file-import",
  dispatch_register: "fas fa-file-export",
};

const PERMISSION_TYPES = ["view", "create", "edit", "delete", "other"] as const;

type PermissionType = (typeof PERMISSION_TYPES)[number];

const hasType = (permissions: IPermission[], type: PermissionType): boolean => {
  return permissions.some((p) => {
    if (type === "other") {
      const name = p.name.toLowerCase();
      return (
        !name.includes("view") &&
        !name.includes("list") &&
        !name.includes("create") &&
        !name.includes("edit") &&
        !name.includes("delete")
      );
    }
    if (type === "view")
      return p.name.includes("view") || p.name.includes("list");
    return p.name.includes(type);
  });
};

const PermissionCell = ({ has }: { has: boolean }) =>
  has ? (
    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
  ) : (
    <XCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />
  );

const PermissionsView = () => {
  const [data, setData] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/rbac/permissions/available");
        setData(res.data.data || { enabledModules: [], permissions: [] });
      } catch (err) {
        console.error("Failed to load permissions", err);
        toast.error("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!data || data.permissions.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-10">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="h-14 w-14 text-yellow-500" />
              <h3 className="text-lg font-semibold">
                No Permissions Available
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                No modules are enabled for your organisation. Please contact
                your administrator to enable modules.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPermissions = data.permissions.reduce(
    (acc, m) => acc + m.permissions.length,
    0,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00563B]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#00563B]" />
              </div>
              <div>
                <CardTitle className="text-xl">System Permissions</CardTitle>
                <CardDescription>
                  All permissions available in the system, grouped by module.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Package className="w-3.5 h-3.5 mr-1.5" />
                {data.enabledModules.length} Modules Enabled
              </Badge>
              <Badge className="text-sm px-3 py-1 bg-[#00563B] text-white">
                {totalPermissions} Total Permissions
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar rounded-lg">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-[#00563B] dark:bg-gray-800">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-white h-10 pl-6 w-1/4">
                    Module
                  </TableHead>
                  <TableHead className="font-bold text-white text-center h-10">
                    Total
                  </TableHead>
                  <TableHead className="font-bold text-white text-center h-10">
                    View
                  </TableHead>
                  <TableHead className="font-bold text-white text-center h-10">
                    Create
                  </TableHead>
                  <TableHead className="font-bold text-white text-center h-10">
                    Edit
                  </TableHead>
                  <TableHead className="font-bold text-white text-center h-10">
                    Delete
                  </TableHead>
                  <TableHead className="font-bold text-white text-center h-10">
                    Others
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.permissions.map((mp) => (
                  <TableRow
                    key={mp.module}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Module name */}
                    <TableCell className="py-3 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                          {moduleIcons[mp.module] ? (
                            <i className={moduleIcons[mp.module]} />
                          ) : (
                            <i className="fas fa-layer-group" />
                          )}
                        </div>
                        <div>
                          <span className="block font-semibold text-gray-800 dark:text-gray-200">
                            {mp.moduleName}
                          </span>
                          {mp.moduleDescription && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {mp.moduleDescription}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Total count */}
                    <TableCell className="text-center py-3">
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold"
                      >
                        {mp.permissions.length}
                      </Badge>
                    </TableCell>

                    {/* Permission type columns */}
                    {PERMISSION_TYPES.map((type) => (
                      <TableCell key={type} className="text-center py-3">
                        <PermissionCell has={hasType(mp.permissions, type)} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsView;
