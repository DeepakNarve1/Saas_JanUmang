"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Skeleton } from "@app/components/ui/skeleton";
import InDocsForm from "./InDocsForm";
import { IInDocsFormValues, inDocsInitialValues } from "./inDocs.schema";

const EditInDocs = () => {
  const router = useRouter();
  const { id } = useParams();

  const [initialValues, setInitialValues] =
    useState<IInDocsFormValues>(inDocsInitialValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/in-docs/${id}`);
        const data = res.data?.data;
        if (data) {
          setInitialValues({
            issueNo: data.issueNo || "",
            date: data.date || "",
            nameAddress: data.nameAddress || "",
            place: data.place || "",
            subject: data.subject || "",
            documentsCount: data.documentsCount || "",
            referenceIssueNo: data.referenceIssueNo || "",
            receivedIssueNo: data.receivedIssueNo || "",
            fileHeadNo: data.fileHeadNo || "",
            stampReceived: data.stampReceived || "",
            remarks: data.remarks || "",
          });
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load In Docs data"
        );
        router.push("/in-docs");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (values: IInDocsFormValues) => {
    try {
      setSaving(true);
      await axios.put(`/in-docs/${id}`, values);
      toast.success("In Docs entry updated successfully");
      router.push("/in-docs");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to update In Docs entry"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="Edit In Doc" />
        <div className="p-6">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit In Doc (जावक दस्तावेज़)" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit In Doc Information
              </h2>
            </div>
            <div className="p-6 max-w-4xl">
              <InDocsForm
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

export default EditInDocs;
