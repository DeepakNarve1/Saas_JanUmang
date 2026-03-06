"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import VidhanSabhaForm from "./VidhanSabhaForm";

const CreateVidhanSabha = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { name: string; year?: number }) => {
    try {
      setLoading(true);
      await axios.post("/vidhan-sabha", values);
      toast.success("VidhanSabha created successfully");
      router.push("/vidhansabha");
    } catch (error: unknown) {
      handleError(error, "Failed to create VidhanSabha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create VidhanSabha" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Add New VidhanSabha
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create a new VidhanSabha record.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <VidhanSabhaForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateVidhanSabha;
