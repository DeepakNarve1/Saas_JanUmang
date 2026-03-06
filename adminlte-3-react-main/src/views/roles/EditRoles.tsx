"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import { IRoleFormValues, roleInitialValues } from "./role.schema";
import RoleForm from "./roleForm";

const EditRole = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.MANAGE_ROLES, PERMISSIONS.EDIT_ROLES]}>
      <EditRoleContent />
    </RouteGuard>
  );
};

const EditRoleContent = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] =
    useState<IRoleFormValues>(roleInitialValues);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setPageLoading(true);
        const res = await axios.get(`/rbac/roles/${id}`);
        if (res.data?.data) {
          const roleData = res.data.data;
          setInitialValues({
            name: roleData.name || "",
            displayName: roleData.displayName || "",
            description: roleData.description || "",
            status: roleData.status || "active",
            permissions:
              roleData.permissions?.map((p: any) =>
                typeof p === "string" ? p : p._id,
              ) || [],
            tenantId: roleData.tenantId || "",
          });
        }
      } catch (err: unknown) {
        handleError(err, "Failed to load role data");
        router.push("/roles");
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      fetchRole();
    }
  }, [id, router]);

  const handleSubmit = async (values: IRoleFormValues) => {
    try {
      setLoading(true);
      await axios.put(`/rbac/roles/${id}`, {
        ...values,
        sidebarAccess: [], // Maintained for compatibility
      });
      toast.success("Role updated successfully!");
      router.push("/roles");
    } catch (err: unknown) {
      handleError(err, "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className="p-8 text-center text-gray-500">Loading role data...</div>
    );

  return (
    <>
      <ContentHeader title="Edit Role" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mt-6 max-w-4xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Update Role
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Modify role details and assign permissions.
              </p>
            </div>
            <RoleForm
              onSubmit={handleSubmit}
              loading={loading}
              initialValues={initialValues}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default EditRole;
