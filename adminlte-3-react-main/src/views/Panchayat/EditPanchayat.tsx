"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import PanchayatForm from "./PanchayatForm";
import { Skeleton } from "@app/components/ui/skeleton";
import { IPanchayatFormValues } from "./panchayat.schema";

const EditPanchayat = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<IPanchayatFormValues | null>(
    null,
  );

  useEffect(() => {
    const fetchPanchayat = async () => {
      try {
        const { data } = await axios.get(`/panchayat/${id}`);

        if (data.success) {
          const result = data.data;
          let formData = {
            name: result.name,
            state: result.state?._id || result.state,
            division: result.division?._id || result.division,
            district: result.district?._id || result.district || "",
            parliament: result.parliament?._id || result.parliament,
            assembly: result.assembly?._id || result.assembly,
            block: result.block?._id || result.block,
            booth: result.booth?._id || result.booth,
            year: result.year || "",
          };

          const boothId = result.booth?._id || result.booth;
          if (boothId && (!formData.state || !formData.block)) {
            try {
              const boothRes = await axios.get(`/booths/${boothId}`);
              if (boothRes.data.success) {
                const bData = boothRes.data.data;
                formData.state =
                  bData.state?._id || bData.state || formData.state;
                formData.division =
                  bData.division?._id || bData.division || formData.division;
                formData.district =
                  bData.district?._id || bData.district || formData.district;
                formData.parliament =
                  bData.parliament?._id ||
                  bData.parliament ||
                  formData.parliament;
                formData.assembly =
                  bData.assembly?._id || bData.assembly || formData.assembly;
                formData.block =
                  bData.block?._id || bData.block || formData.block;
                formData.booth = bData._id;
              }
            } catch (error: unknown) {
              handleError(
                error,
                "Failed to fetch booth details for hierarchy population",
              );
            }
          }

          setInitialData(formData);
        }
      } catch (error: unknown) {
        handleError(error, "Failed to fetch panchayat details");
        router.push("/panchayat");
      }
    };

    if (id) {
      fetchPanchayat();
    }
  }, [id, router]);

  const handleSubmit = async (values: IPanchayatFormValues) => {
    try {
      setLoading(true);
      await axios.put(`/panchayat/${id}`, values);
      toast.success("Panchayat updated successfully");
      router.push("/panchayat");
    } catch (error: unknown) {
      handleError(error, "Failed to update panchayat");
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return (
      <>
        <ContentHeader title="Edit Panchayat" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Panchayat" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Edit Panchayat Details
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <PanchayatForm
                initialValues={initialData}
                onSubmit={handleSubmit}
                loading={loading}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditPanchayat;
