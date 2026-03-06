"use client";

import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Skeleton } from "@app/components/ui/skeleton";
import DispatchRegisterForm from "./DispatchRegisterForm";
import {
  IDispatchRegisterFormValues,
  dispatchRegisterInitialValues,
} from "./dispatchRegister.schema";

const EditDispatchRegister = () => {
  const router = useRouter();
  const { id } = useParams();

  const [initialValues, setInitialValues] =
    useState<IDispatchRegisterFormValues>(dispatchRegisterInitialValues);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/dispatch-register/${id}`);
        const data = res.data.data;

        setInitialValues({
          date: data.date || "",
          year: data.year || "",
          month: data.month || "",
          portalNo: data.portalNo || "",
          samitiNo: data.samitiNo || "",
          dispatchNo: data.dispatchNo || "",
          department: data.department?._id || data.department || "",
          particulars: data.particulars || "",
          reference: data.reference || "",
          district: data.district?._id || data.district || "",
          block: data.block?._id || data.block || "",
          panchayat: data.panchayat
            ? data.panchayat.map((p: any) => ({ label: p.name, value: p._id }))
            : [],
          village: data.village
            ? data.village.map((v: any) => ({ label: v.name, value: v._id }))
            : [],
          uploadLetter: data.uploadLetter || "",
        });
      } catch (err: unknown) {
        handleError(err, "Failed to load Dispatch Register data");
        router.push("/dispatch-register");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (values: IDispatchRegisterFormValues) => {
    try {
      setIsSubmitting(true);
      const submitData = { ...values };

      // Convert File to Base64 string if it exists (for new uploads)
      if (values.uploadLetter && typeof values.uploadLetter === "object") {
        const file = values.uploadLetter;
        const reader = new FileReader();

        const base64String = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        submitData.uploadLetter = base64String;
      }

      await axios.put(`/dispatch-register/${id}`, submitData);
      toast.success("Dispatch Register entry updated successfully");
      router.push("/dispatch-register");
    } catch (err: unknown) {
      handleError(err, "Failed to update Dispatch Register entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="Edit Dispatch Register" />
        <div className="p-6">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Dispatch Register" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Dispatch Register Form
              </h3>
            </div>
            <DispatchRegisterForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default EditDispatchRegister;
