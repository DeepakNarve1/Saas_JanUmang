"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import DivisionForm from "./DivisionForm";
import { Skeleton } from "@app/components/ui/skeleton";

const EditDivision = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<{
    name: string;
    state: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDivision = async () => {
      try {
        const res = await axios.get(`/divisions/${id}`);
        const data = res.data?.data;
        if (data) {
          const stateId = data.state?._id || data.state || "";
          setInitialValues({
            name: data.name,
            state: stateId,
          });
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load division");
        router.push("/divisions");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDivision();
  }, [id, router]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      setSaving(true);
      await axios.put(`/divisions/${id}`, values);
      toast.success("Division updated successfully");
      router.push("/divisions");
    } catch (error: unknown) {
      handleError(error, "Failed to update division");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ContentHeader title="Edit Division" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Update Division Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Modify the name for this division.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              {loading ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-full dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-full dark:bg-gray-800" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Skeleton className="h-10 w-24 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-32 dark:bg-gray-800" />
                  </div>
                </div>
              ) : (
                initialValues && (
                  <DivisionForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    loading={saving}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditDivision;
