"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import StateForm from "./StateForm";
import { Skeleton } from "@app/components/ui/skeleton";

const EditState = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<{
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await axios.get(`/states/${id}`);
        const data = res.data?.data;
        if (data) {
          setInitialValues({
            name: data.name,
          });
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load state");
        router.push("/states");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchState();
  }, [id, router]);

  const handleSubmit = async (values: { name: string }) => {
    try {
      setSaving(true);
      await axios.put(`/states/${id}`, values);
      toast.success("State updated successfully");
      router.push("/states");
    } catch (error: unknown) {
      handleError(error, "Failed to update state");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ContentHeader title="Edit State" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Update State Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Modify the name for this state.
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
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-10 w-24 dark:bg-gray-800" />
                    <Skeleton className="h-10 w-32 dark:bg-gray-800" />
                  </div>
                </div>
              ) : (
                initialValues && (
                  <StateForm
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

export default EditState;
