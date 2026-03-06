"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { flattenMenu } from "@app/utils/sidebarMenu";

import { Eye, Edit, ArrowLeft, Shield, Menu as MenuIcon } from "lucide-react";
import { ContentHeader } from "@app/components";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@app/components/ui/table";
import { Skeleton } from "@app/components/ui/skeleton";

interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

interface IRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: IPermission[];
  sidebarAccess: string[];
  isSystem?: boolean;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

const ViewRole = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [role, setRole] = useState<IRole | null>(null);
  const [loading, setLoading] = useState(true);
  const menuItems = flattenMenu();

  useEffect(() => {
    const fetchRole = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        const res = await axios.get(`/rbac/roles/${params.id}`);
        setRole(res.data.data);
      } catch (err: unknown) {
        handleError(err, "Failed to load role");
        router.push("/roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [params.id, router]);

  // Group permissions by category
  const groupedPermissions =
    role?.permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
      },
      {} as Record<string, IPermission[]>,
    ) || {};

  if (loading) {
    return (
      <>
        <ContentHeader title="View Role" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-6xl mx-auto p-8">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-96 mb-8" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </section>
      </>
    );
  }

  if (!role) {
    return null;
  }

  /* Define export data */
  const getExportData = () => {
    if (!role) return {};
    return {
      "Role Name": role.displayName,
      "System Name": role.name,
      Status: role.status,
      "Is System Role": role.isSystem ? "Yes" : "No",
      Description: role.description || "",
      "Created At": role.createdAt
        ? new Date(role.createdAt).toLocaleDateString()
        : "",
      "Total Permissions": role.permissions.length,
      "Sidebar Access Count": role.sidebarAccess.length,
    };
  };

  return (
    <>
      <ContentHeader title="View Role" />

      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {role.displayName}
                  </h2>
                  {role.isSystem && (
                    <Badge variant="secondary" className="text-xs">
                      System Role
                    </Badge>
                  )}
                  <Badge
                    variant={role.status === "active" ? "default" : "secondary"}
                    className={
                      role.status === "active"
                        ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                    }
                  >
                    {role.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  System Name:{" "}
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded dark:text-gray-300">
                    {role.name}
                  </code>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ViewPageActions
                  getExportData={getExportData}
                  fileName={`Role_${role.name || "Details"}`}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/roles")}
                  className="dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                {!role.isSystem && (
                  <Button
                    size="sm"
                    onClick={() => router.push(`/roles/${role._id}/edit`)}
                    className="bg-[#00563B] hover:bg-[#368F8B] text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Role
                  </Button>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Description */}
              {role.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">
                      {role.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {role.createdAt
                          ? new Date(role.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">
                        {role.updatedAt
                          ? new Date(role.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium capitalize">
                        {role.status || "active"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Permissions</p>
                      <p className="font-medium">{role.permissions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Sidebar Menu Items
                      </p>
                      <p className="font-medium">{role.sidebarAccess.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Assigned Permissions
                  </CardTitle>
                  <CardDescription>
                    Permissions granted to this role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {role.permissions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No permissions assigned to this role
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(
                        ([category, perms]) => (
                          <div key={category}>
                            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3 capitalize">
                              {category.replace(/_/g, " ")} Permissions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {perms.map((p) => (
                                <div
                                  key={p._id}
                                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                    {p.displayName}
                                  </p>
                                  {p.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {p.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewRole;
