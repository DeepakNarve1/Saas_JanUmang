import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import BlockForm from "./BlockForm";
import { Skeleton } from "@app/components/ui/skeleton";
import { IBlockFormValues } from "./block.schema";

const EditBlock = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<IBlockFormValues>({
    name: "",
    state: "",
    division: "",
    district: "",
    parliament: "",
    assembly: "",
    year: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchBlock();
  }, [id]);

  const fetchBlock = async () => {
    try {
      const { data } = await axios.get(`/blocks/${id}`);
      const block = data.data;
      setInitialValues({
        name: block.name,
        state:
          block.assembly?.parliament?.division?.state?._id ||
          block.assembly?.parliament?.division?.state ||
          "",
        division:
          block.assembly?.parliament?.division?._id ||
          block.assembly?.parliament?.division ||
          "",
        district:
          block.assembly?.parliament?.district?._id ||
          block.assembly?.parliament?.district ||
          "",
        parliament:
          block.assembly?.parliament?._id || block.assembly?.parliament || "",
        assembly: block.assembly?._id || block.assembly,
        year: block.year || "",
      });
    } catch (error: unknown) {
      handleError(error, "Failed to fetch block details");
      router.push("/blocks");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: IBlockFormValues) => {
    try {
      setLoading(true);
      await axios.put(`/blocks/${id}`, values);
      toast.success("Block updated successfully");
      router.push("/blocks");
    } catch (error: unknown) {
      handleError(error, "Failed to update block");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <ContentHeader title="Edit Block" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <Skeleton className="h-6 w-32 dark:bg-gray-800" />
              </div>
              <div className="p-6 max-w-2xl space-y-4">
                <Skeleton className="h-10 w-full dark:bg-gray-800" />
                <Skeleton className="h-10 w-full dark:bg-gray-800" />
                <Skeleton className="h-10 w-full dark:bg-gray-800" />
                <div className="flex justify-end gap-3 pt-4">
                  <Skeleton className="h-10 w-24 dark:bg-gray-800" />
                  <Skeleton className="h-10 w-32 dark:bg-gray-800" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Block" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Edit Block Details
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <BlockForm
                initialValues={initialValues}
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

export default EditBlock;
