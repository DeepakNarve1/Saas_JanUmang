"use client";

import { useState } from "react";
import axios from "@app/utils/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import InwardRegisterForm from "./InwardRegisterForm";
import {
  IInwardRegisterFormValues,
  inwardRegisterInitialValues,
} from "./inwardRegister.schema";

const CreateInwardRegister = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: IInwardRegisterFormValues) => {
    try {
      setIsLoading(true);
      await axios.post("/inward-register", values);
      toast.success("Inward Register entry created successfully");
      router.push("/inward-register");
    } catch (err: unknown) {
      handleError(err, "Failed to create Inward Register entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Inward Register" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Inward Register Form
              </h3>
            </div>
            <InwardRegisterForm
              initialValues={inwardRegisterInitialValues}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateInwardRegister;
