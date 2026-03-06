"use client";

import { useState } from "react";
import axios from "@app/utils/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import CallForm from "./CallForm";

const CreateCall = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Set default date to current datetime in local ISO format (slice to match datetime-local input)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const defaultDate = now.toISOString().slice(0, 16);

  const initialValues = {
    date: defaultDate,
    category: "",
    name: "",
    mobile: "",
    subject: "",
    assignDate: "",
    address: "",
    description: "",
    remark: "",
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      await axios.post("/call-management", values);
      toast.success("Call record created successfully");
      router.push("/call-management");
    } catch (error: unknown) {
      handleError(error, "Failed to create call record");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Call" />
      <section className="content">
        <div className="container-fluid px-4">
          {/* Breadcrumb/Subtitle could go here if needed matching the design "Register a new call or inquiry" */}
          <p className="text-sm text-gray-500 mb-4 px-1">
            Register a new call or inquiry
          </p>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Design tweak: Header inside the card isn't strictly necessary if we have ContentHeader, but matching previous style */}
            {/* <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Call Information
              </h3>
            </div> */}

            <CallForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateCall;
