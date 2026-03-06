"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import { IRoleFormValues } from "./role.schema";
import RoleForm from "./roleForm";

const CreateRole = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.MANAGE_ROLES, PERMISSIONS.CREATE_ROLES]}>
      <CreateRoleContent />
    </RouteGuard>
  );
};

const CreateRoleContent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: IRoleFormValues) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name.trim(),
        displayName: values.displayName.trim(),
        description: values.description ? values.description.trim() : undefined,
        permissions: values.permissions,
        status: values.status,
        tenantId: values.tenantId,
        sidebarAccess: [], // Maintained for backend compatibility
      };
      await axios.post("/rbac/roles", payload);

      toast.success("Role created successfully!");
      router.push("/roles");
    } catch (err: unknown) {
      handleError(err, "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create Role" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 mt-6 max-w-4xl mx-auto overflow-hidden">
            <div
              className="p-6 border-b border-gray-200
            dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Create New Role
              </h2>
              <p className="text-gray-600 mt-1 dark:text-gray-400">
                Define role details and assign permissions.
              </p>
            </div>
            <RoleForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateRole;
