import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import BoothForm from "./BoothForm";
import { Skeleton } from "@app/components/ui/skeleton";
import { IBoothFormValues } from "./booth.schema";

const EditBooth = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<IBoothFormValues>({
    name: "",
    code: "",
    state: "",
    division: "",
    district: "",
    parliament: "",
    assembly: "",
    block: "",
    year: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchBooth();
  }, [id]);

  const fetchBooth = async () => {
    try {
      const { data } = await axios.get(`/booths/${id}`);
      const booth = data.data;
      setInitialValues({
        name: booth.name,
        code: booth.code || "",
        state: booth.state?._id || booth.state || "",
        division: booth.division?._id || booth.division || "",
        district: booth.district?._id || booth.district || "",
        parliament: booth.parliament?._id || booth.parliament || "",
        assembly: booth.assembly?._id || booth.assembly || "",
        block: booth.block?._id || booth.block || "",
        year: booth.year || "",
      });
    } catch (error: unknown) {
      handleError(error, "Failed to fetch booth details");
      router.push("/booths");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: IBoothFormValues) => {
    try {
      setLoading(true);
      await axios.put(`/booths/${id}`, values);
      toast.success("Booth updated successfully");
      router.push("/booths");
    } catch (error: unknown) {
      handleError(error, "Failed to update booth");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <ContentHeader title="Edit Booth" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Booth" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Edit Booth
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <BoothForm
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

export default EditBooth;
