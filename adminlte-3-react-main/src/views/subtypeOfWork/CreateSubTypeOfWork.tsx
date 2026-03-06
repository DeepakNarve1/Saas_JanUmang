"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import SubTypeOfWorkForm from "./SubTypeOfWorkForm";

const CreateSubTypeOfWork = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    typeOfWork: string;
    subTypeOfWork: string;
  }) => {
    try {
      setLoading(true);
      await axios.post("/sub-type-of-work", values);
      toast.success("Sub Type of Work created successfully");
      router.push("/sub-type-of-work");
    } catch (error: unknown) {
      handleError(error, "Failed to create Sub Type of Work");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create Sub Type of Work" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Add New Sub Type of Work
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create a new Sub Type of Work record.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <SubTypeOfWorkForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateSubTypeOfWork;
