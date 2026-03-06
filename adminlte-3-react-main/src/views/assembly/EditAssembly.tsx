import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import AssemblyForm from "./AssemblyForm";
import { Skeleton } from "@app/components/ui/skeleton";

const EditAssembly = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    state: "",
    division: "",
    district: "",
    parliament: "",
  });
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) fetchAssembly();
  }, [id]);

  const fetchAssembly = async () => {
    try {
      const { data } = await axios.get(`/assemblies/${id}`);
      const assembly = data.data;
      setInitialValues({
        name: assembly.name,
        state: assembly.state?._id || assembly.state || "",
        division: assembly.division?._id || assembly.division || "",
        district: assembly.district?._id || assembly.district || "",
        parliament: assembly.parliament?._id || assembly.parliament || "",
      });
    } catch (error: unknown) {
      handleError(error, "Failed to fetch assembly details");
      router.push("/assemblies");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (values: {
    name: string;
    parliament: string;
    blocks: string[];
  }) => {
    try {
      setLoading(true);
      await axios.put(`/assemblies/${id}`, values);
      toast.success("Assembly updated successfully");
      router.push("/assemblies");
    } catch (error: unknown) {
      handleError(error, "Failed to update assembly");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <ContentHeader title="Edit Assembly" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl dark:bg-gray-800" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Assembly" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Edit Assembly
              </h2>
            </div>
            <div className="p-6 max-w-2xl">
              <AssemblyForm
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

export default EditAssembly;
