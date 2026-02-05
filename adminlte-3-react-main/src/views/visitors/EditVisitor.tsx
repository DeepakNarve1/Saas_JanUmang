"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import VisitorForm from "./VisitorForm";
import { IVisitorFormValues } from "./visitor.schema";

const EditVisitor = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialValues, setInitialValues] = useState<IVisitorFormValues | null>(
    null,
  );

  useEffect(() => {
    const fetchVisitor = async () => {
      try {
        const res = await axios.get(`/visitors/${id}`);
        const data = res.data.data;
        setInitialValues({
          district: data.district || "",
          vidhansabha: data.vidhansabha || "",
          block: data.block || "",
          date: data.date || "",
          time: data.time || "",
          name: data.name || "",
          category: data.category || "",
          post: data.post || "",
          place: data.place || "",
          mobileNumber: data.mobileNumber || "",
          incomingVisitor: data.incomingVisitor || "VISITOR",
          message: data.message || "",
          visitorType: data.visitorType || "",
          attendBy: data.attendBy || "",
          remarks: data.remarks || "",
          bhaiyakanirdesh: data.bhaiyakanirdesh || "",
          addedBy: data.addedBy || "",
        });
      } catch (error: unknown) {
        toast.error("Failed to fetch visitor details");
        router.push("/visitors");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchVisitor();
    }
  }, [id, router]);

  const handleSubmit = async (values: IVisitorFormValues) => {
    try {
      setLoading(true);
      await axios.put(`/visitors/${id}`, values);
      toast.success("Visitor updated successfully");
      router.push("/visitors");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update visitor");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <>
      <ContentHeader title="Edit Visitor" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit Visitor Details
              </h2>
            </div>
            {initialValues && (
              <VisitorForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default EditVisitor;
