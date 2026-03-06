"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { PERMISSIONS } from "@app/config/permissions";
import UserForm from "./UserForm";
import { IUserFormValues, userInitialValues } from "./user.schema";
import { handleError } from "@app/utils/errorHandler";

const EditUser = () => {
  return (
    <RouteGuard
      requiredPermissions={[PERMISSIONS.MANAGE_ROLES, PERMISSIONS.EDIT_USERS]}
    >
      <EditUserContent />
    </RouteGuard>
  );
};

const EditUserContent = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] =
    useState<IUserFormValues>(userInitialValues);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setPageLoading(true);
        const res = await axios.get(`/auth/users/${id}`);
        if (res.data?.data) {
          const user = res.data.data;

          // Extract role ID properly
          const roleId =
            user.role?._id || (typeof user.role === "string" ? user.role : "");
          const formValues = {
            name: user.name || "",
            email: user.email || "",
            password: "",
            confirmPassword: "",
            mobile: user.mobile || "",
            role: roleId,
            userType: user.userType || "",
            level: user.level || "superadmin",
            state:
              user.state?._id ||
              (typeof user.state === "string" ? user.state : "") ||
              "",
            division:
              user.division?._id ||
              (typeof user.division === "string" ? user.division : "") ||
              "",
            district:
              user.district?._id ||
              (typeof user.district === "string" ? user.district : "") ||
              "",
            assembly:
              user.assembly?._id ||
              (typeof user.assembly === "string" ? user.assembly : "") ||
              "",
            block:
              user.block?._id ||
              (typeof user.block === "string" ? user.block : "") ||
              "",
            panchayat:
              user.panchayat?._id ||
              (typeof user.panchayat === "string" ? user.panchayat : "") ||
              "",
            village:
              user.village?._id ||
              (typeof user.village === "string" ? user.village : "") ||
              "",
            booth:
              user.booth?._id ||
              (typeof user.booth === "string" ? user.booth : "") ||
              "",
            tenantId: user.tenantId || "",
          };
          setInitialValues(formValues);
        } else {
          throw new Error("No user data in response");
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load user");
        router.push("/users");
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, router]);

  const handleSubmit = async (values: IUserFormValues) => {
    try {
      setLoading(true);

      // The values are already sanitized by the UserForm component
      // Build the payload, excluding confirmPassword
      const payload: any = {
        name: values.name,
        email: values.email,
        role: values.role,
        mobile: values.mobile || "",
        userType: values.userType || "",
        level: values.level,
        state: values.state || null,
        division: values.division || null,
        district: values.district || null,
        assembly: values.assembly || null,
        block: values.block || null,
        panchayat: values.panchayat || null,
        village: values.village || null,
        booth: values.booth || null,
        tenantId: values.tenantId || null,
      };

      // Only include password if it's provided (edit mode allows empty password)
      if (values.password && values.password.trim() !== "") {
        payload.password = values.password;
      }

      const response = await axios.put(`/auth/users/${id}`, payload);
      toast.success("User updated successfully!");
      router.push("/users");
    } catch (error: unknown) {
      console.error("Update error:", error);
      handleError(error, "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading user data...
      </div>
    );

  return (
    <>
      <ContentHeader title="Edit User" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-4xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Edit User Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Modify user information below.
              </p>
            </div>
            <UserForm
              onSubmit={handleSubmit}
              loading={loading}
              initialValues={initialValues}
              isEdit={true}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default EditUser;
