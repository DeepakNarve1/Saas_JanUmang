"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import VisitorForm from "./VisitorForm";
import { IVisitorFormValues } from "./visitor.schema";

const CreateVisitor = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: IVisitorFormValues) => {
    try {
      setLoading(true);
      await axios.post("/visitors", values);
      toast.success("Visitor added successfully");
      router.push("/visitors");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to add visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add Visitor" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                New Visitor Details
              </h2>
            </div>
            <VisitorForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateVisitor;
