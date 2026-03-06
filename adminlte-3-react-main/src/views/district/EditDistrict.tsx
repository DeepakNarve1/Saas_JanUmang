"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import DistrictForm from "./DistrictForm";
import { Skeleton } from "@app/components/ui/skeleton";

const EditDistrict = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<{
    name: string;
    division: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        const res = await axios.get(`/districts/${id}`);
        const data = res.data?.data;
        if (data) {
          setInitialValues({
            name: data.name,
            division: data.division || "",
          });
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load district");
        router.push("/districts");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDistrict();
  }, [id, router]);

  const handleSubmit = async (values: { name: string; division: string }) => {
    try {
      setSaving(true);
      await axios.put(`/districts/${id}`, values);
      toast.success("District updated successfully");
      router.push("/districts");
    } catch (error: unknown) {
      handleError(error, "Failed to update district");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ContentHeader title="Edit District" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Update District Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Modify the name for this district.
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
                  <DistrictForm
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

export default EditDistrict;
