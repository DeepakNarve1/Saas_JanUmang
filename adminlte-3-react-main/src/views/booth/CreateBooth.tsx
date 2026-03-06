import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import BoothForm from "./BoothForm";
import { IBoothFormValues } from "./booth.schema";

const CreateBooth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: IBoothFormValues) => {
    try {
      setLoading(true);
      await axios.post("/booths", values);
      toast.success("Booth created successfully");
      router.push("/booths");
    } catch (error: unknown) {
      handleError(error, "Failed to create booth");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Add New Booth" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Booth Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Select a block and enter the name/code for the new booth.
              </p>
            </div>
            <div className="p-6 max-w-2xl">
              <BoothForm
                onSubmit={handleSubmit}
                loading={loading}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateBooth;
