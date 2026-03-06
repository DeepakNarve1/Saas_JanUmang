"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import SamitiForm from "./SamitiForm";
import { Skeleton } from "@app/components/ui/skeleton";

const EditSamiti = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<{
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSamiti = async () => {
      try {
        const res = await axios.get(`/samiti/${id}`);
        const data = res.data?.data;
        if (data) {
          setInitialValues({
            name: data.name,
          });
        }
      } catch (err: unknown) {
        handleError(err, "Failed to load Samiti");
        router.push("/samiti");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSamiti();
  }, [id, router]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      setSaving(true);
      await axios.put(`/samiti/${id}`, values);
      toast.success("Samiti updated successfully");
      router.push("/samiti");
    } catch (err: unknown) {
      handleError(err, "Failed to update Samiti");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ContentHeader title="Edit Samiti" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Update Samiti Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Modify the name for this Samiti.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              {loading ? (
                <div className="space-y-6">
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
                  <SamitiForm
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

export default EditSamiti;
