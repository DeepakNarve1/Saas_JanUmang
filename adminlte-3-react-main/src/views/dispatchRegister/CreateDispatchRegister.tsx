"use client";

import { useState } from "react";
import axios from "@app/utils/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import DispatchRegisterForm from "./DispatchRegisterForm";
import {
  IDispatchRegisterFormValues,
  dispatchRegisterInitialValues,
} from "./dispatchRegister.schema";

const CreateDispatchRegister = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: IDispatchRegisterFormValues) => {
    try {
      setIsLoading(true);
      const submitData = { ...values };

      // Convert File to Base64 string if it exists
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

      await axios.post("/dispatch-register", submitData);
      toast.success("Dispatch Register entry created successfully");
      router.push("/dispatch-register");
    } catch (err: unknown) {
      handleError(err, "Failed to create Dispatch Register entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Dispatch Register" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Create Dispatch Register Form
              </h3>
            </div>
            <DispatchRegisterForm
              initialValues={dispatchRegisterInitialValues}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateDispatchRegister;
