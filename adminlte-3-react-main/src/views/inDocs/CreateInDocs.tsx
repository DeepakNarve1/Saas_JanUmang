"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import InDocsForm from "./InDocsForm";
import { IInDocsFormValues } from "./inDocs.schema";

const CreateInDocs = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: IInDocsFormValues) => {
    try {
      setLoading(true);
      await axios.post("/in-docs", values);
      toast.success("In Docs entry created successfully");
      router.push("/in-docs");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to create In Docs entry"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New In Doc (जावक दस्तावेज़)" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                In Doc Information
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Register a new outgoing document.
              </p>
            </div>
            <div className="p-6 max-w-4xl">
              <InDocsForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateInDocs;
