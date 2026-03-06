"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Skeleton } from "@app/components/ui/skeleton";
import DepartmentForm from "./DepartmentForm";

const EditDepartment = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<{
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await axios.get(`/departments/${id}`);
        const data = res.data?.data;
        if (data) {
          setInitialValues({
            name: data.name,
          });
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load Department data");
        router.push("/department");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDepartment();
  }, [id, router]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      setSaving(true);
      await axios.put(`/departments/${id}`, values);
      toast.success("Department updated successfully");
      router.push("/department");
    } catch (error: unknown) {
      handleError(error, "Failed to update Department");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="Edit Department" />
        <div className="p-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </>
    );
  }

  if (!initialValues) return null;

  return (
    <>
      <ContentHeader title="Edit Department" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Edit Department
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <DepartmentForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={saving}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditDepartment;
