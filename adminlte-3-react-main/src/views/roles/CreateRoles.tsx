"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { IRoleFormValues } from "./role.schema";
import RoleForm from "./roleForm";

const CreateRole = () => {
  return (
    <RouteGuard requiredPermissions={["manage_roles", "create_roles"]}>
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
        sidebarAccess: [], // Maintained for backend compatibility
      };

      console.log("Submitting role payload:", payload);
      await axios.post("/rbac/roles", payload);

      toast.success("Role created successfully!");
      router.push("/roles");
    } catch (err: any) {
      console.error("Create role error object:", err);

      let errorMsg = "Failed to create role. Please try again.";

      if (err.response) {
        console.error("Error Response Data:", err.response.data);
        console.error("Error Response Status:", err.response.status);

        // Try to extract message if JSON
        if (
          err.response.data &&
          typeof err.response.data === "object" &&
          err.response.data.message
        ) {
          errorMsg = err.response.data.message;
        } else if (err.response.status === 500) {
          errorMsg = `System Error: The role "${values.name}" likely exists in the archives (soft-deleted). Please choose a unique name.`;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      toast.error(errorMsg);
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
