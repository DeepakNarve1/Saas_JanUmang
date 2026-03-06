import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import ParliamentForm from "./ParliamentForm";
import { Skeleton } from "@app/components/ui/skeleton";

const EditParliament = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    state: "",
    division: "",
    district: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchParliament();
  }, [id]);

  const fetchParliament = async () => {
    try {
      const { data } = await axios.get(`/parliaments/${id}`);
      // Flatten or adjust if necessary. Backend returns { ..., division: { _id, name } } or just id if not populated?
      // Controller says .populate("division", "name").
      // So data.data.division is an object. Form expects ID string.
      const parliament = data.data;
      setInitialValues({
        name: parliament.name,
        state:
          parliament.division?.state?._id || parliament.division?.state || "",
        division: parliament.division?._id || parliament.division,
        district: parliament.district?._id || parliament.district || "",
      });
    } catch (error: unknown) {
      handleError(error, "Failed to fetch parliament details");
      router.push("/parliaments");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    division: string;
    district?: string;
    assemblies: string[];
  }) => {
    try {
      setLoading(true);
      await axios.put(`/parliaments/${id}`, values);
      toast.success("Parliament updated successfully");
      router.push("/parliaments");
    } catch (error: unknown) {
      handleError(error, "Failed to update parliament");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <ContentHeader title="Edit Parliament" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Parliament" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Edit Parliament
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <ParliamentForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditParliament;
