"use client";

import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Skeleton } from "@app/components/ui/skeleton";
import InwardRegisterForm from "./InwardRegisterForm";
import {
  IInwardRegisterFormValues,
  inwardRegisterInitialValues,
} from "./inwardRegister.schema";

const EditInwardRegister = () => {
  const router = useRouter();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<IInwardRegisterFormValues>(
    inwardRegisterInitialValues,
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/inward-register/${id}`);
        const data = res.data.data;

        setInitialValues({
          issueNo: data.issueNo || "",
          issueDate: data.issueDate || "",
          letterName: data.letterName || "",
          letterReceivedDate: data.letterReceivedDate || "",
          fromWhomReceived: data.fromWhomReceived || "",
          letterDescription: data.letterDescription || "",
          subject: data.subject || "",
          fileNo: data.fileNo || "",
          receivedLetterNumber: data.receivedLetterNumber || "",
          receivedLetterDate: data.receivedLetterDate || "",
          attachment: data.attachment || "",
          replyToNumber: data.replyToNumber || "",
          replyToDate: data.replyToDate || "",
          ourReplyNumber: data.ourReplyNumber || "",
          ourReplyDate: data.ourReplyDate || "",
          forwardedLetterNumber: data.forwardedLetterNumber || "",
          forwardedLetterDate: data.forwardedLetterDate || "",
          section: data.section || "",
          signedDate: data.signedDate || "",
          sentTo: data.sentTo || "",
          remarks: data.remarks || "",
        });
      } catch (err: unknown) {
        handleError(err, "Failed to load Inward Register data");
        router.push("/inward-register");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (values: IInwardRegisterFormValues) => {
    try {
      setIsSubmitting(true);
      await axios.put(`/inward-register/${id}`, values);
      toast.success("Inward Register entry updated successfully");
      router.push("/inward-register");
    } catch (err: unknown) {
      handleError(err, "Failed to update Inward Register entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="Edit Inward Register" />
        <div className="p-6">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Inward Register" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Edit Inward Register Form
              </h3>
            </div>
            <InwardRegisterForm
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

export default EditInwardRegister;
