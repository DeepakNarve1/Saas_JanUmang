"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import UserForm from "./UserForm";
import { IUserFormValues } from "./user.schema";
import { handleError } from "@app/utils/errorHandler";

const CreateUser = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.MANAGE_ROLES, PERMISSIONS.CREATE_USERS]}>
      <CreateUserContent />
    </RouteGuard>
  );
};

const CreateUserContent = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: IUserFormValues) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
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

      await axios.post("/auth/register", payload);

      toast.success("User created successfully!");
      router.push("/users");
    } catch (error: unknown) {
      console.error("User Creation Error:", error);
      handleError(error, "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create User" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-4xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Enter User Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Fill in the information below to create a new user account.
              </p>
            </div>
            <UserForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateUser;
